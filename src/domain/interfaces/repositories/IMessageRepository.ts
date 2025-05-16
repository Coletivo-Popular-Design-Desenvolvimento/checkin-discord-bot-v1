import { MessageEntity } from "../../entities/Message";

export interface IMessageRepository {
  create(message: Omit<MessageEntity, "id">): Promise<MessageEntity>;
  createMany(messages: Omit<MessageEntity, "id">[]): Promise<number>;
  
  findById(id: number): Promise<MessageEntity | null>;
  findByChannelId(
    channelId: number,
    includeDeleted?: boolean
  ): Promise<MessageEntity[]>;
  findByDiscordId(
    discordId: string,
    includeDeleted?: boolean
  ): Promise<MessageEntity[]>;
  findByUserId(
    userId: number,
    includeDeleted?: boolean
  ): Promise<MessageEntity[]>;
  
  listAll(limit?: number, includeDeleted?: boolean): Promise<MessageEntity[]>;
  
  updateById(id: number, message: Partial<MessageEntity>): Promise<MessageEntity | null>;
  
  deleteById(id: number): Promise<boolean>;
}
