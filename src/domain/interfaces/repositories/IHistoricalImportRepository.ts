import { ChannelEntity } from "@entities/Channel";
import { UserEntity } from "@entities/User";
import { MessageEntity } from "@entities/Message";
import { AudioEventEntity } from "@entities/AudioEvent";
import { RoleEntity } from "@entities/Role";

export interface SaveMessagesBatchInput {
  channels: Omit<ChannelEntity, "id">[];
  users: Omit<UserEntity, "id">[];
  messages: Omit<MessageEntity, "id">[];
}

export interface SaveMessagesBatchOutput {
  channelsUpserted: number;
  usersUpserted: number;
  messagesCreated: number;
}

export interface SaveAudioEventsBatchInput {
  channels: Omit<ChannelEntity, "id">[];
  users: Omit<UserEntity, "id">[];
  audioEvents: Omit<AudioEventEntity, "id" | "createdAt">[];
}

export interface SaveAudioEventsBatchOutput {
  channelsUpserted: number;
  usersUpserted: number;
  audioEventsCreated: number;
}

export interface SaveUsersBatchOutput {
  usersUpserted: number;
}

export interface SaveChannelsBatchOutput {
  channelsUpserted: number;
}

export interface RawMessageReactionAssignment {
  userPlatformId: string;
  messagePlatformId: string;
  channelPlatformId: string;
  reactionEmoji: string;
  reactedAt: Date;
}

export interface SaveMessageReactionsBatchInput {
  channels: Omit<ChannelEntity, "id">[];
  users: Omit<UserEntity, "id">[];
  reactions: RawMessageReactionAssignment[];
}

export interface SaveMessageReactionsBatchOutput {
  channelsUpserted: number;
  usersUpserted: number;
  reactionsCreated: number;
}

export interface RawUserRoleAssignment {
  userPlatformId: string;
  rolePlatformId: string;
}

export interface SaveUserRolesBatchInput {
  users: Omit<UserEntity, "id">[];
  roles: Omit<RoleEntity, "id" | "createdAt" | "user">[];
  assignments: RawUserRoleAssignment[];
}

export interface SaveUserRolesBatchOutput {
  usersUpserted: number;
  rolesUpserted: number;
  assignmentsCreated: number;
}

export interface IHistoricalImportRepository {
  saveMessagesBatch(
    input: SaveMessagesBatchInput,
  ): Promise<SaveMessagesBatchOutput>;

  saveAudioEventsBatch(
    input: SaveAudioEventsBatchInput,
  ): Promise<SaveAudioEventsBatchOutput>;

  saveUsersBatch(users: Omit<UserEntity, "id">[]): Promise<SaveUsersBatchOutput>;

  saveChannelsBatch(
    channels: Omit<ChannelEntity, "id">[],
  ): Promise<SaveChannelsBatchOutput>;

  saveMessageReactionsBatch(
    input: SaveMessageReactionsBatchInput,
  ): Promise<SaveMessageReactionsBatchOutput>;

  saveUserRolesBatch(
    input: SaveUserRolesBatchInput,
  ): Promise<SaveUserRolesBatchOutput>;
}
