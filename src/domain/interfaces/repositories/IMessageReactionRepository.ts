import { MessageReactionEntity } from "../../entities/MessageReaction";
import { CreateMessageReactionData } from "../../dtos/CreateMessageReactionData";

export type UpdateMessageReactionData = Partial<CreateMessageReactionData>;

export interface IMessageReactionRepository {
  create(
    data: CreateMessageReactionData,
  ): Promise<MessageReactionEntity | null>;

  createMany(data: CreateMessageReactionData[]): Promise<number>;

  getMessageReactionById(id: number): Promise<MessageReactionEntity | null>;

  getMessageReactionByUserId(userId: string): Promise<MessageReactionEntity[]>;

  getMessageReactionByUserPlatformId(
    userPlatformId: string,
  ): Promise<MessageReactionEntity[]>;

  updateMessageReaction(
    id: number,
    data: UpdateMessageReactionData,
  ): Promise<MessageReactionEntity | null>;

  deleteMessageReaction(id: number): Promise<boolean>;
}
