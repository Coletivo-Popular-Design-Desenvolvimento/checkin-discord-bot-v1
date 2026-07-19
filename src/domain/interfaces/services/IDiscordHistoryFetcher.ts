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

export interface IDiscordHistoryFetcher {
  fetchNextMessageBatch(
    input: FetchNextMessageBatchInput,
  ): Promise<FetchNextMessageBatchOutput>;

  fetchAudioEventsInRange(
    input: FetchAudioEventsInRangeInput,
  ): Promise<RawHistoricalAudioEvent[]>;
}
