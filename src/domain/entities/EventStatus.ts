import { AudioEventEntity } from "./AudioEvent";

export class EventStatusEntity {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly createdAt: Date,
    public readonly audioEvent: AudioEventEntity,
  ) {}
}
