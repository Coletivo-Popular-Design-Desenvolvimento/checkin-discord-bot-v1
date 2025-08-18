import { EventType } from "@prisma/client";
import { UserEventEntity } from "../../entities/UserEvent";

export interface UserEventListAllInput {
  limit?: number;
  eventType?: EventType;
  eventId?: string;
  userId?: string;
}

export interface IUserEventRepository {
  create(
    eventData: Omit<UserEventEntity, "id">,
  ): Promise<UserEventEntity | null>;
  createMany(eventsData: Omit<UserEventEntity, "id">[]): Promise<number | null>;
  findById(id: number): Promise<UserEventEntity | null>;
  listAll(params?: UserEventListAllInput): Promise<UserEventEntity[]>;
  findByEventId(eventId: string): Promise<UserEventEntity[]>;
  findByUserId(userId: string): Promise<UserEventEntity[]>;
  findByEventType(eventType: EventType): Promise<UserEventEntity[]>;
  deleteById(id: number): Promise<boolean>;
}
