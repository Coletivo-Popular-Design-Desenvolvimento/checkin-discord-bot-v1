import { ChannelEntity } from "@entities/Channel";
import { UserEntity } from "@entities/User";
import { MessageEntity } from "@entities/Message";
import { AudioEventEntity } from "@entities/AudioEvent";

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

export interface IHistoricalImportRepository {
  saveMessagesBatch(
    input: SaveMessagesBatchInput,
  ): Promise<SaveMessagesBatchOutput>;

  saveAudioEventsBatch(
    input: SaveAudioEventsBatchInput,
  ): Promise<SaveAudioEventsBatchOutput>;
}
