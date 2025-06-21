import { MessageReactionEntity } from "../../entities/MessageReaction";

export interface IMessageReactionRepository {
  create(
    reaction: MessageReactionEntity,
  ): Promise<MessageReactionEntity | null>;
  createMany(reactions: MessageReactionEntity[]): Promise<number>;

  getMessageReactionById(
    userId: string,
    messageId: string,
  ): Promise<MessageReactionEntity | null>;

  getMessageReactionByUserId(userId: string): Promise<MessageReactionEntity[]>;

  getMessageReactionByUserDiscordId(
    userId: string,
  ): Promise<MessageReactionEntity[]>;

  getMessageReactionByDiscordId(
    userId: string,
    messageId: string,
  ): Promise<MessageReactionEntity | null>;

  updateMessageReaction(
    userId: string,
    messageId: string,
    data: Partial<MessageReactionEntity>,
  ): Promise<MessageReactionEntity | null>;

  deleteMessageReaction(
    userId: string,
    messageId: string,
  ): Promise<MessageReactionEntity | null>;
}
