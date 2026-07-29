export interface RawHistoricalMessage {
  platformId: string;
  platformCreatedAt: Date;
  channelId: string;
  channelName: string;
  channelUrl: string;
  userId: string;
  username: string;
  userGlobalName: string | null;
  userBot: boolean;
  userPlatformCreatedAt?: Date;
  userJoinedAt?: Date | null;
}

export interface RawHistoricalAudioEvent {
  platformId: string;
  name: string;
  statusId: string;
  startAt: Date;
  endAt: Date | null;
  userCount: number;
  description?: string | null;
  image?: string | null;
  channelId: string;
  channelName: string;
  channelUrl: string;
  creatorId: string;
  creatorUsername: string;
}

export interface MessageHistoryCursor {
  channelIndex: number;
  before?: string;
}

export interface FetchNextMessageBatchInput {
  startDate: Date;
  endDate: Date;
  batchSize: number;
  cursor?: MessageHistoryCursor;
}

export interface FetchNextMessageBatchOutput {
  messages: RawHistoricalMessage[];
  cursor: MessageHistoryCursor;
  done: boolean;
}

export interface FetchAudioEventsInRangeInput {
  startDate: Date;
  endDate: Date;
}

export interface RawHistoricalUser {
  platformId: string;
  username: string;
  globalName: string | null;
  bot: boolean;
  platformCreatedAt?: Date;
  joinedAt?: Date | null;
}

export interface RawHistoricalChannel {
  platformId: string;
  name: string;
  url: string;
}

export interface RawHistoricalMessageReaction {
  messageId: string;
  channelId: string;
  channelName: string;
  channelUrl: string;
  messagePlatformCreatedAt: Date;
  userId: string;
  username: string;
  userGlobalName: string | null;
  userBot: boolean;
  userPlatformCreatedAt?: Date;
  userJoinedAt?: Date | null;
  reactionEmoji: string;
}

export interface RawHistoricalUserRoleAssignment {
  userId: string;
  username: string;
  userGlobalName: string | null;
  userBot: boolean;
  roleId: string;
  roleName: string;
  rolePlatformCreatedAt: Date;
}

export interface FetchNextMessageReactionsBatchInput {
  startDate: Date;
  endDate: Date;
  batchSize: number;
  cursor?: MessageHistoryCursor;
}

export interface FetchNextMessageReactionsBatchOutput {
  reactions: RawHistoricalMessageReaction[];
  cursor: MessageHistoryCursor;
  done: boolean;
}

export interface IDiscordHistoryFetcher {
  fetchNextMessageBatch(
    input: FetchNextMessageBatchInput,
  ): Promise<FetchNextMessageBatchOutput>;

  fetchAudioEventsInRange(
    input: FetchAudioEventsInRangeInput,
  ): Promise<RawHistoricalAudioEvent[]>;

  fetchGuildMembers(): Promise<RawHistoricalUser[]>;

  fetchGuildChannels(): Promise<RawHistoricalChannel[]>;

  fetchGuildMemberRoles(): Promise<RawHistoricalUserRoleAssignment[]>;

  fetchNextMessageReactionsBatch(
    input: FetchNextMessageReactionsBatchInput,
  ): Promise<FetchNextMessageReactionsBatchOutput>;
}
