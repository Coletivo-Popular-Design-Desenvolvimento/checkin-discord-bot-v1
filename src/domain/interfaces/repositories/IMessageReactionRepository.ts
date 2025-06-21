import { MessageReactionEntity } from "../../entities/MessageReaction";
import { CreateMessageReactionData } from "../../dtos/CreateMessageReactionData";

export type UpdateMessageReactionData = Partial<CreateMessageReactionData>;

export interface IMessageReactionRepository {
  create(
    data: CreateMessageReactionData,
  ): Promise<MessageReactionEntity | null>;

  createMany(data: CreateMessageReactionData[]): Promise<number>;

  getMessageReactionById(
    userId: string,
    messageId: string,
  ): Promise<MessageReactionEntity | null>;

  getMessageReactionByUserId(userId: string): Promise<MessageReactionEntity[]>;

  getMessageReactionByUserPlatformId(
    userId: string,
  ): Promise<MessageReactionEntity[]>;

  getMessageReactionByPlatformId(
    userId: string,
    messageId: string,
  ): Promise<MessageReactionEntity | null>;

  updateMessageReaction(
    userId: string,
    messageId: string,
    data: UpdateMessageReactionData,
  ): Promise<MessageReactionEntity | null>;

  deleteMessageReaction(
    userId: string,
    messageId: string,
  ): Promise<MessageReactionEntity | null>;
}
