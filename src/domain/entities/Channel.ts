/*model Channel {
  id               Int               @id @default(autoincrement())
  discord_id       String
  name             String
  url              String
  message          Message[]
  audio_event      AudioEvent[]
  message_reaction MessageReaction[]
  created_at       DateTime          @default(now())

  @@map("channel")
} */
export class ChannelEntity {
    constructor(
        public readonly id: number,
        public readonly discordId: string,
        public readonly name: string,
        public readonly url: string,
        public readonly createdAt: Date
    ) { }
}