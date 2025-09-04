import { AudioEvent, EventType, User, UserEvent } from "@prisma/client";
import { UserEntity } from "./User";
import { AudioEventEntity } from "./AudioEvent";

export class UserEventEntity {
  constructor(
    public readonly id: number,
    public readonly eventType: EventType,
    public readonly createdAt: Date,
    public readonly user: UserEntity,
    public readonly event: AudioEventEntity,
  ) {}

  public static fromPersistence(
    userEvent: UserEvent,
    user: User,
    event: AudioEvent,
  ): UserEventEntity {
    return new UserEventEntity(
      userEvent.id,
      userEvent.event_type,
      userEvent.created_at,
      UserEntity.fromPersistence(user),
      AudioEventEntity.fromPersistence(event),
    );
  }
}
