import { EventType } from "@type/EventTypeEnum";
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
}
