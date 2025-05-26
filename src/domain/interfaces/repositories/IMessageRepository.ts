import { MessageEntity } from "../../entities/Message";
import { MessageRepositoryListAllInput } from "../../types/MessageListAllInput";

export interface IMessageRepository {
  create(message: Omit<MessageEntity, "id">): Promise<MessageEntity>;
  createMany(messages: Omit<MessageEntity, "id">[]): Promise<number>;

  findById(id: number): Promise<MessageEntity | null>;
  findByChannelId(
    channelId: number,
    includeDeleted?: boolean,
  ): Promise<MessageEntity[]>;
  findByDiscordId(discordId: string): Promise<MessageEntity>;
  findByUserId(
    userId: number,
    includeDeleted?: boolean,
  ): Promise<MessageEntity[]>;

  listAll(params?: MessageRepositoryListAllInput): Promise<MessageEntity[]>;

  updateById(
    id: number,
    message: Partial<MessageEntity>,
  ): Promise<MessageEntity | null>;

  deleteById(id: number): Promise<boolean>;
}
