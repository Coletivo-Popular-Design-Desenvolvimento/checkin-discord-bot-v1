import { AudioEventEntity } from "../../entities/AudioEvent";

export interface AudioEventListAllInput {
  limit?: number;
  statusId?: string;
  channelId?: string;
  creatorId?: string;
}

export interface IAudioEventRepository {
  create(
    eventData: Omit<AudioEventEntity, "id" | "createdAt">,
  ): Promise<AudioEventEntity | null>;

  createMany(
    eventsData: Omit<AudioEventEntity, "id" | "createdAt">[],
  ): Promise<number | null>;

  findById(id: number): Promise<AudioEventEntity | null>;

  findByPlatformId(platformId: string): Promise<AudioEventEntity | null>;

  listAll(params?: AudioEventListAllInput): Promise<AudioEventEntity[]>;

  findByChannelId(channelId: string): Promise<AudioEventEntity[]>;

  findByCreatorId(creatorId: string): Promise<AudioEventEntity[]>;

  findByStatusId(statusId: string): Promise<AudioEventEntity[]>;

  updateById(
    id: number,
    eventData: Partial<
      Omit<AudioEventEntity, "id" | "createdAt" | "channelId" | "creatorId">
    >,
  ): Promise<AudioEventEntity | null>;

  deleteById(id: number): Promise<boolean>;
}
