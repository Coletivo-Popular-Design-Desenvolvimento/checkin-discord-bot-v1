import { AudioEventEntity } from "../../entities/AudioEvent";

export interface AudioEventListAllInput {
  limit?: number;
  statusId?: number;
  channelId?: number;
  creatorId?: number;
}

export interface IAudioEventRepository {
  create(
    eventData: Omit<AudioEventEntity, "id" | "createdAt">,
  ): Promise<AudioEventEntity | null>;

  createMany(
    eventsData: Omit<AudioEventEntity, "id" | "createdAt">[],
  ): Promise<number | null>;

  findById(id: number): Promise<AudioEventEntity | null>;

  listAll(params?: AudioEventListAllInput): Promise<AudioEventEntity[]>;

  findByChannelId(channelId: number): Promise<AudioEventEntity[]>;

  findByCreatorId(creatorId: number): Promise<AudioEventEntity[]>;

  findByStatusId(statusId: number): Promise<AudioEventEntity[]>;

  updateById(
    id: number,
    eventData: Partial<
      Omit<AudioEventEntity, "id" | "createdAt" | "channelId" | "creatorId">
    >,
  ): Promise<AudioEventEntity | null>;

  deleteById(id: number): Promise<boolean>;
}
