import * as prisma from "@prisma/client";
import { AudioEventEntity } from "@entities/AudioEvent";
import { ChannelEntity } from "@entities/Channel";
import { MessageEntity } from "@entities/Message";
import { MessageReactionEntity } from "@entities/MessageReaction";
import { RoleEntity } from "@entities/Role";
import { UserEntity } from "@entities/User";
import { UserEventEntity } from "@entities/UserEvent";
import { EventType } from "@type/EventTypeEnum";

export class PrismaMapper {
  private static toUsersFromRelation(
    users?: Array<
      | prisma.User
      | (prisma.UserChannel & { user: prisma.User })
      | (prisma.UserRole & { user: prisma.User })
    >,
  ): UserEntity[] {
    return (
      users?.map((entry) =>
        "user" in entry
          ? PrismaMapper.toUserEntity(entry.user)
          : PrismaMapper.toUserEntity(entry),
      ) || []
    );
  }

  private static toChannelsFromRelation(
    channels?: Array<
      prisma.Channel | (prisma.UserChannel & { channel: prisma.Channel })
    >,
  ): ChannelEntity[] {
    return (
      channels?.map((entry) =>
        "channel" in entry
          ? PrismaMapper.toChannelEntity(entry.channel)
          : PrismaMapper.toChannelEntity(entry),
      ) || []
    );
  }

  private static toRolesFromRelation(
    roles?: Array<prisma.Role | (prisma.UserRole & { role: prisma.Role })>,
  ): RoleEntity[] {
    return (
      roles?.map((entry) =>
        "role" in entry
          ? PrismaMapper.toRoleEntity(entry.role)
          : PrismaMapper.toRoleEntity(entry),
      ) || []
    );
  }

  static toAudioEventEntity(
    prismaEvent: prisma.AudioEvent,
    channel?: prisma.Channel,
    user?: prisma.User,
  ): AudioEventEntity {
    return new AudioEventEntity(
      prismaEvent.id,
      prismaEvent.platform_id,
      prismaEvent.name,
      prismaEvent.status_id,
      prismaEvent.start_at,
      prismaEvent.end_at,
      prismaEvent.user_count,
      prismaEvent.created_at,
      prismaEvent.description,
      prismaEvent.image,
      channel && PrismaMapper.toChannelEntity(channel),
      user && PrismaMapper.toUserEntity(user),
    );
  }

  static toUserEntity(
    user: prisma.User,
    messages?: prisma.Message[],
    reactions?: prisma.MessageReaction[],
    channels?: Array<
      prisma.Channel | (prisma.UserChannel & { channel: prisma.Channel })
    >,
    roles?: Array<prisma.Role | (prisma.UserRole & { role: prisma.Role })>,
    audioEvents?: prisma.AudioEvent[],
  ): UserEntity {
    return new UserEntity(
      user.id,
      user.platform_id,
      user.username,
      user.bot,
      user.status,
      user.global_name,
      user.joined_at,
      user.platform_created_at,
      user.create_at,
      user.update_at,
      user.last_active,
      user.email,
      messages?.map((message) => PrismaMapper.toMessageEntity(message)),
      reactions?.map((reaction) =>
        PrismaMapper.toMessageReactionEntity(reaction),
      ),
      PrismaMapper.toChannelsFromRelation(channels),
      PrismaMapper.toRolesFromRelation(roles),
      audioEvents?.map((event) => PrismaMapper.toAudioEventEntity(event)),
    );
  }

  static toChannelEntity(
    channel: prisma.Channel,
    userChannel?: Array<
      prisma.User | (prisma.UserChannel & { user: prisma.User })
    >,
    message?: prisma.Message[],
    messageReaction?: prisma.MessageReaction[],
  ): ChannelEntity {
    return new ChannelEntity(
      channel.id,
      channel.platform_id,
      channel.name,
      channel.url,
      channel.created_at,
      PrismaMapper.toUsersFromRelation(userChannel),
      message?.map((message) =>
        PrismaMapper.toMessageEntity(message, undefined, channel),
      ),
      messageReaction?.map((messageReaction) =>
        PrismaMapper.toMessageReactionEntity(messageReaction),
      ),
    );
  }

  static toMessageEntity(
    message: prisma.Message,
    user?: prisma.User,
    channel?: prisma.Channel,
    messageReactions?: prisma.MessageReaction[],
  ): MessageEntity {
    return new MessageEntity(
      channel && PrismaMapper.toChannelEntity(channel),
      user && PrismaMapper.toUserEntity(user),
      (messageReactions || []).map((mr) =>
        PrismaMapper.toMessageReactionEntity(mr),
      ),
      message.platform_id,
      message.platform_created_at,
      message.is_deleted,
      message.id,
      message.created_at,
    );
  }

  static toMessageReactionEntity(
    messageReact: prisma.MessageReaction,
    user?: prisma.User,
    message?: prisma.Message,
    channel?: prisma.Channel,
  ): MessageReactionEntity {
    return new MessageReactionEntity(
      messageReact.id,
      user && PrismaMapper.toUserEntity(user),
      message && PrismaMapper.toMessageEntity(message),
      channel && PrismaMapper.toChannelEntity(channel),
      messageReact.reaction_emoji ?? undefined,
      messageReact.reacted_at ?? undefined,
    );
  }

  static toRoleEntity(
    role: prisma.Role,
    users?: Array<prisma.User | (prisma.UserRole & { user: prisma.User })>,
  ): RoleEntity {
    return new RoleEntity(
      role.id,
      role.platform_id,
      role.name,
      role.created_at,
      role.platform_created_at,
      PrismaMapper.toUsersFromRelation(users),
    );
  }

  static toUserEventEntity(
    userEvent: prisma.UserEvent,
    user: prisma.User,
    event: prisma.AudioEvent,
  ): UserEventEntity {
    return new UserEventEntity(
      userEvent.id,
      userEvent.event_type as EventType,
      userEvent.created_at,
      PrismaMapper.toUserEntity(user),
      PrismaMapper.toAudioEventEntity(event),
    );
  }
}
