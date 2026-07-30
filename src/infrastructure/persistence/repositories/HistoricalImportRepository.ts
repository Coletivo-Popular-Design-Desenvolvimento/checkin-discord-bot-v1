import { Prisma, PrismaClient } from "@prisma/client";
import { UserEntity } from "@entities/User";
import { ChannelEntity } from "@entities/Channel";
import {
  IHistoricalImportRepository,
  SaveAudioEventsBatchInput,
  SaveAudioEventsBatchOutput,
  SaveChannelsBatchOutput,
  SaveMessageReactionsBatchInput,
  SaveMessageReactionsBatchOutput,
  SaveMessagesBatchInput,
  SaveMessagesBatchOutput,
  SaveUserRolesBatchInput,
  SaveUserRolesBatchOutput,
  SaveUsersBatchOutput,
} from "@domain/interfaces/repositories/IHistoricalImportRepository";
import { ILoggerService } from "@domain/interfaces/services/ILogger";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "@domain/types/LoggerContextEnum";
import { PrismaService } from "../prisma/prismaService";

type TransactionClient = Prisma.TransactionClient;

export class HistoricalImportRepository implements IHistoricalImportRepository {
  private client: PrismaClient;

  constructor(
    private prisma: PrismaService,
    private logger: ILoggerService,
  ) {
    this.client = this.prisma.getClient();
  }

  async saveMessagesBatch(
    input: SaveMessagesBatchInput,
  ): Promise<SaveMessagesBatchOutput> {
    try {
      return await this.client.$transaction(async (tx) => {
        const channelsUpserted = await this.upsertChannels(tx, input.channels);
        const usersUpserted = await this.upsertUsers(tx, input.users);

        const result = await tx.message.createMany({
          data: input.messages.map((message) => ({
            platform_id: message.platformId,
            channel_id: message.channel?.platformId ?? "",
            user_id: message.user?.platformId ?? "",
            platform_created_at: message.platformCreatedAt,
            is_deleted: message.isDeleted,
          })),
          skipDuplicates: true,
        });

        return {
          channelsUpserted,
          usersUpserted,
          messagesCreated: result.count,
        };
      });
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.HISTORICAL_SYNC,
        `saveMessagesBatch | ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async saveAudioEventsBatch(
    input: SaveAudioEventsBatchInput,
  ): Promise<SaveAudioEventsBatchOutput> {
    try {
      return await this.client.$transaction(async (tx) => {
        const channelsUpserted = await this.upsertChannels(tx, input.channels);
        const usersUpserted = await this.upsertUsers(tx, input.users);

        let audioEventsCreated = 0;
        for (const event of input.audioEvents) {
          const eventStatus = await this.findOrCreateEventStatus(
            tx,
            event.statusId,
          );

          await tx.audioEvent.upsert({
            where: { platform_id: event.platformId },
            update: {
              name: event.name,
              start_at: event.startAt,
              end_at: event.endAt,
              user_count: event.userCount,
              description: event.description,
              image: event.image,
              status: { connect: { platform_id: eventStatus.platform_id } },
            },
            create: {
              platform_id: event.platformId,
              name: event.name,
              start_at: event.startAt,
              end_at: event.endAt,
              user_count: event.userCount,
              description: event.description,
              image: event.image,
              channel: {
                connect: { platform_id: event.channel?.platformId },
              },
              creator: {
                connect: { platform_id: event.creator?.platformId },
              },
              status: { connect: { platform_id: eventStatus.platform_id } },
            },
          });
          audioEventsCreated += 1;
        }

        return { channelsUpserted, usersUpserted, audioEventsCreated };
      });
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.HISTORICAL_SYNC,
        `saveAudioEventsBatch | ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async saveUsersBatch(
    users: Omit<UserEntity, "id">[],
  ): Promise<SaveUsersBatchOutput> {
    try {
      return await this.client.$transaction(async (tx) => {
        const usersUpserted = await this.upsertUsers(tx, users);
        return { usersUpserted };
      });
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.HISTORICAL_SYNC,
        `saveUsersBatch | ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async saveChannelsBatch(
    channels: Omit<ChannelEntity, "id">[],
  ): Promise<SaveChannelsBatchOutput> {
    try {
      return await this.client.$transaction(async (tx) => {
        const channelsUpserted = await this.upsertChannels(tx, channels);
        return { channelsUpserted };
      });
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.HISTORICAL_SYNC,
        `saveChannelsBatch | ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async saveUserRolesBatch(
    input: SaveUserRolesBatchInput,
  ): Promise<SaveUserRolesBatchOutput> {
    try {
      return await this.client.$transaction(async (tx) => {
        const usersUpserted = await this.upsertUsers(tx, input.users);
        const rolesUpserted = await this.upsertRoles(tx, input.roles);

        const result = await tx.userRole.createMany({
          data: input.assignments.map((assignment) => ({
            user_platform_id: assignment.userPlatformId,
            role_platform_id: assignment.rolePlatformId,
          })),
          skipDuplicates: true,
        });

        return {
          usersUpserted,
          rolesUpserted,
          assignmentsCreated: result.count,
        };
      });
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.HISTORICAL_SYNC,
        `saveUserRolesBatch | ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async saveMessageReactionsBatch(
    input: SaveMessageReactionsBatchInput,
  ): Promise<SaveMessageReactionsBatchOutput> {
    try {
      return await this.client.$transaction(async (tx) => {
        const channelsUpserted = await this.upsertChannels(tx, input.channels);
        const usersUpserted = await this.upsertUsers(tx, input.users);

        const messageIds = [
          ...new Set(
            input.reactions.map((reaction) => reaction.messagePlatformId),
          ),
        ];
        const existingMessages = await tx.message.findMany({
          where: { platform_id: { in: messageIds } },
          select: { platform_id: true },
        });
        if (existingMessages.length !== messageIds.length) {
          const foundIds = new Set(
            existingMessages.map((message) => message.platform_id),
          );
          const missingIds = messageIds.filter((id) => !foundIds.has(id));
          throw new Error(
            `referenced message(s) not found: ${missingIds.join(", ")}`,
          );
        }

        const result = await tx.messageReaction.createMany({
          data: input.reactions.map((reaction) => ({
            user_id: reaction.userPlatformId,
            message_id: reaction.messagePlatformId,
            channel_id: reaction.channelPlatformId,
            reaction_emoji: reaction.reactionEmoji,
            reacted_at: reaction.reactedAt,
          })),
          skipDuplicates: true,
        });

        return {
          channelsUpserted,
          usersUpserted,
          reactionsCreated: result.count,
        };
      });
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.HISTORICAL_SYNC,
        `saveMessageReactionsBatch | ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  private async upsertChannels(
    tx: TransactionClient,
    channels: SaveMessagesBatchInput["channels"],
  ): Promise<number> {
    for (const channel of channels) {
      await tx.channel.upsert({
        where: { platform_id: channel.platformId },
        update: { name: channel.name, url: channel.url },
        create: {
          platform_id: channel.platformId,
          name: channel.name,
          url: channel.url,
          created_at: channel.createdAt,
        },
      });
    }
    return channels.length;
  }

  private async upsertUsers(
    tx: TransactionClient,
    users: SaveMessagesBatchInput["users"],
  ): Promise<number> {
    for (const user of users) {
      await tx.user.upsert({
        where: { platform_id: user.platformId },
        update: {
          username: user.username,
          global_name: user.globalName,
          bot: user.bot,
          status: user.status,
        },
        create: {
          platform_id: user.platformId,
          username: user.username,
          global_name: user.globalName,
          bot: user.bot,
          status: user.status,
          platform_created_at: user.platformCreatedAt,
          joined_at: user.joinedAt,
        },
      });
    }
    return users.length;
  }

  private async upsertRoles(
    tx: TransactionClient,
    roles: SaveUserRolesBatchInput["roles"],
  ): Promise<number> {
    for (const role of roles) {
      await tx.role.upsert({
        where: { platform_id: role.platformId },
        update: { name: role.name },
        create: {
          platform_id: role.platformId,
          name: role.name,
          platform_created_at: role.platformCreatedAt,
        },
      });
    }
    return roles.length;
  }

  private async findOrCreateEventStatus(
    tx: TransactionClient,
    statusName: string,
  ): Promise<{ platform_id: string }> {
    let eventStatus = await tx.eventStatus.findUnique({
      where: { platform_id: statusName },
    });

    if (!eventStatus) {
      eventStatus = await tx.eventStatus.create({
        data: {
          name: statusName.toUpperCase(),
          platform_id: statusName,
        },
      });
    }

    return { platform_id: eventStatus.platform_id };
  }
}
