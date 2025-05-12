import { MessageEntity } from "../../entities/Message";

export interface IMessageRepository {
  create(message: Omit<MessageEntity, "id">): Promise<MessageEntity>;
  createMany(messages: Omit<MessageEntity, "id">[]): Promise<number>;
  
  findById(id: number): Promise<MessageEntity | null>;
  findByChannelId(
    channelId: string
  ): Promise<MessageEntity[] | null>;
  findByDiscordId(
    discordId: string
  ): Promise<MessageEntity[] | null>;
  findByUserId(
    userId: number
  ): Promise<MessageEntity[] | null>;
  
  listAll(limit?: number): Promise<MessageEntity[]>;
  
  updateById(id: number, message: Partial<MessageEntity>): Promise<MessageEntity | null>;
  
  deleteById(id: number): Promise<boolean>;
}
