import {
  ChannelType,
  Client,
  Collection,
  Guild,
  GuildMember,
  Message,
  TextChannel,
} from "discord.js";
import {
  FetchAudioEventsInRangeInput,
  FetchNextMessageBatchInput,
  FetchNextMessageBatchOutput,
  FetchNextMessageReactionsBatchInput,
  FetchNextMessageReactionsBatchOutput,
  IDiscordHistoryFetcher,
  MessageHistoryCursor,
  RawHistoricalAudioEvent,
  RawHistoricalChannel,
  RawHistoricalMessage,
  RawHistoricalMessageReaction,
  RawHistoricalUser,
  RawHistoricalUserRoleAssignment,
} from "@domain/interfaces/services/IDiscordHistoryFetcher";
import {
  mapDiscordScheduledEventStatus,
  mapEventStatusToPlatformId,
} from "@type/DiscordEventTypes";
import { ILoggerService } from "@services/ILogger";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "@type/LoggerContextEnum";

const MAX_PAGE_SIZE = 100;
const MISSING_ACCESS_ERROR_CODE = 50001;

export class DiscordHistoryFetcher implements IDiscordHistoryFetcher {
  private guildMembersPromise?: Promise<{
    guild: Guild;
    members: Collection<string, GuildMember>;
  }>;

  constructor(
    private readonly client: Client,
    private readonly logger?: ILoggerService,
  ) {}

  async fetchNextMessageBatch(
    input: FetchNextMessageBatchInput,
  ): Promise<FetchNextMessageBatchOutput> {
    const { startDate, endDate, batchSize, cursor } = input;
    const guild = await this.resolveGuild();
    const channels = this.listTextChannels(guild);
    const messages: RawHistoricalMessage[] = [];

    const { cursor: nextCursor, done } = await this.walkMessagesInRange(
      channels,
      { startDate, endDate, cursor },
      () => messages.length < batchSize,
      (message, channel) => {
        messages.push({
          platformId: message.id,
          platformCreatedAt: new Date(message.createdTimestamp),
          channelId: channel.id,
          channelName: channel.name,
          channelUrl: channel.url,
          userId: message.author.id,
          username: message.author.username,
          userGlobalName: message.author.globalName,
          userBot: message.author.bot,
          userPlatformCreatedAt: message.author.createdTimestamp
            ? new Date(message.author.createdTimestamp)
            : undefined,
          userJoinedAt: message.member?.joinedAt ?? null,
        });
      },
    );

    return { messages, cursor: nextCursor, done };
  }

  async fetchNextMessageReactionsBatch(
    input: FetchNextMessageReactionsBatchInput,
  ): Promise<FetchNextMessageReactionsBatchOutput> {
    const { startDate, endDate, batchSize, cursor } = input;
    const guild = await this.resolveGuild();
    const channels = this.listTextChannels(guild);
    const reactions: RawHistoricalMessageReaction[] = [];

    const { cursor: nextCursor, done } = await this.walkMessagesInRange(
      channels,
      { startDate, endDate, cursor },
      () => reactions.length < batchSize,
      async (message, channel) => {
        for (const reaction of message.reactions.cache.values()) {
          const reactionEmoji =
            reaction.emoji.identifier ??
            reaction.emoji.name ??
            reaction.emoji.id ??
            "";
          const reactedUsers = await reaction.users.fetch();

          for (const user of reactedUsers.values()) {
            if (user.bot) {
              continue;
            }

            reactions.push({
              messageId: message.id,
              channelId: channel.id,
              channelName: channel.name,
              channelUrl: channel.url,
              messagePlatformCreatedAt: new Date(message.createdTimestamp),
              userId: user.id,
              username: user.username,
              userGlobalName: user.globalName,
              userBot: user.bot,
              userPlatformCreatedAt: user.createdTimestamp
                ? new Date(user.createdTimestamp)
                : undefined,
              userJoinedAt: undefined,
              reactionEmoji,
            });
          }
        }
      },
    );

    return { reactions, cursor: nextCursor, done };
  }

  async fetchAudioEventsInRange(
    input: FetchAudioEventsInRangeInput,
  ): Promise<RawHistoricalAudioEvent[]> {
    const guild = await this.resolveGuild();
    const events = await guild.scheduledEvents.fetch({ withUserCount: true });

    const raw: RawHistoricalAudioEvent[] = [];
    for (const event of events.values()) {
      if (
        !event.scheduledStartAt ||
        event.scheduledStartAt < input.startDate ||
        event.scheduledStartAt > input.endDate
      ) {
        continue;
      }

      const channel = event.channel;
      const creator = event.creator;
      const status = mapDiscordScheduledEventStatus(event.status);

      raw.push({
        platformId: event.id,
        name: event.name,
        statusId: mapEventStatusToPlatformId(status),
        startAt: event.scheduledStartAt,
        endAt: event.scheduledEndAt,
        userCount: event.userCount ?? 0,
        description: event.description,
        image: event.coverImageURL ? event.coverImageURL() : undefined,
        channelId: event.channelId ?? "",
        channelName: channel?.name ?? "Unknown Channel",
        channelUrl: channel?.url ?? "",
        creatorId: event.creatorId ?? "",
        creatorUsername: creator?.username ?? "Unknown User",
      });
    }

    return raw;
  }

  async fetchGuildMembers(): Promise<RawHistoricalUser[]> {
    const { members } = await this.resolveGuildMembers();

    return [...members.values()]
      .filter((member) => !member.user.bot)
      .map((member) => ({
        platformId: member.user.id,
        username: member.user.username,
        globalName: member.user.globalName,
        bot: member.user.bot,
        platformCreatedAt: new Date(member.user.createdTimestamp),
        joinedAt: member.joinedAt,
      }));
  }

  async fetchGuildChannels(): Promise<RawHistoricalChannel[]> {
    const guild = await this.resolveGuild();
    const channels = this.listTextChannels(guild);

    return channels.map((channel) => ({
      platformId: channel.id,
      name: channel.name,
      url: channel.url,
    }));
  }

  async fetchGuildMemberRoles(): Promise<RawHistoricalUserRoleAssignment[]> {
    const { guild, members } = await this.resolveGuildMembers();

    const assignments: RawHistoricalUserRoleAssignment[] = [];
    for (const member of members.values()) {
      if (member.user.bot) {
        continue;
      }

      for (const role of member.roles.cache.values()) {
        if (role.id === guild.id) {
          continue;
        }

        assignments.push({
          userId: member.user.id,
          username: member.user.username,
          userGlobalName: member.user.globalName,
          userBot: member.user.bot,
          roleId: role.id,
          roleName: role.name,
          rolePlatformCreatedAt: role.createdAt,
        });
      }
    }

    return assignments;
  }

  private async resolveGuild(): Promise<Guild> {
    const guildId = [...this.client.guilds.cache.values()][0]?.id;
    if (!guildId) {
      throw new Error("No guild found in client cache");
    }
    return this.client.guilds.fetch(guildId);
  }

  private async resolveGuildMembers(): Promise<{
    guild: Guild;
    members: Collection<string, GuildMember>;
  }> {
    if (!this.guildMembersPromise) {
      this.guildMembersPromise = (async () => {
        const guild = await this.resolveGuild();
        const members = await guild.members.fetch();
        return { guild, members };
      })().catch((error) => {
        this.guildMembersPromise = undefined;
        throw error;
      });
    }
    return this.guildMembersPromise;
  }

  private async walkMessagesInRange(
    channels: TextChannel[],
    range: { startDate: Date; endDate: Date; cursor?: MessageHistoryCursor },
    hasCapacity: () => boolean,
    onMessage: (message: Message, channel: TextChannel) => Promise<void> | void,
  ): Promise<{ cursor: MessageHistoryCursor; done: boolean }> {
    const { startDate, endDate, cursor } = range;
    let channelIndex = cursor?.channelIndex ?? 0;
    let before = cursor?.before;

    while (channelIndex < channels.length && hasCapacity()) {
      const channel = channels[channelIndex];
      let page: Collection<string, Message>;
      try {
        page = await channel.messages.fetch({
          limit: MAX_PAGE_SIZE,
          ...(before ? { before } : {}),
        });
      } catch (error) {
        if (this.isMissingAccessError(error)) {
          this.logger?.logToConsole(
            LoggerContextStatus.ERROR,
            LoggerContext.USECASE,
            LoggerContextEntity.HISTORICAL_SYNC,
            `DiscordHistoryFetcher.walkMessagesInRange | no access to channel #${channel.name} (${channel.id}), skipping`,
          );
          channelIndex += 1;
          before = undefined;
          continue;
        }
        throw error;
      }

      if (page.size === 0) {
        channelIndex += 1;
        before = undefined;
        continue;
      }

      const sortedPage = [...page.values()].sort(
        (a, b) => b.createdTimestamp - a.createdTimestamp,
      );
      before = sortedPage[sortedPage.length - 1].id;

      let reachedStartDate = false;
      for (const message of sortedPage) {
        const platformCreatedAt = new Date(message.createdTimestamp);

        if (platformCreatedAt < startDate) {
          reachedStartDate = true;
          break;
        }
        if (platformCreatedAt > endDate || message.author.bot) {
          continue;
        }

        await onMessage(message, channel);
      }

      if (reachedStartDate || page.size < MAX_PAGE_SIZE) {
        channelIndex += 1;
        before = undefined;
      }
    }

    const done = channelIndex >= channels.length;
    return { cursor: { channelIndex, before }, done };
  }

  private isMissingAccessError(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: unknown }).code === MISSING_ACCESS_ERROR_CODE
    );
  }

  private listTextChannels(guild: Guild): TextChannel[] {
    return [...guild.channels.cache.values()]
      .filter(
        (channel): channel is TextChannel =>
          channel.type === ChannelType.GuildText,
      )
      .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  }
}
