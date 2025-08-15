import { AudioEvent, EventType, User, UserEvent } from "@prisma/client";
import { UserEntity } from "./User";
import { AudioEventEntity } from "./AudioEvent";

export class UserEventEntity {
  constructor(
    public readonly id: number,
    public readonly type: EventType,
    public readonly at: Date,
    public readonly user: UserEntity,
    public readonly event: AudioEventEntity,
  ) {}

  public static fromPersistence(
    userEvent: UserEvent,
    user: User,
    audioEvent: AudioEvent,
  ): UserEventEntity {
    return new UserEventEntity(
      userEvent.id,
      userEvent.type,
      userEvent.at,
      UserEntity.fromPersistence(user),
      AudioEventEntity.fromPersistence(audioEvent),
    );
  }
}
