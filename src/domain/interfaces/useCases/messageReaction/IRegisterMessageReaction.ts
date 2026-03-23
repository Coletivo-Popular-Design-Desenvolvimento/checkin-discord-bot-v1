import { MessageReactionEntity } from "@entities/MessageReaction";
import { GenericOutputDto } from "@dtos/GenericOutputDto";

export interface RegisterMessageReactionInput {
  userId: string;
  messageId: string;
  channelId: string;
  reactionEmoji?: string;
  reactedAt?: Date;
  username?: string;
  userGlobalName?: string | null;
  userBot?: boolean;
  userPlatformCreatedAt?: Date;
  userJoinedAt?: Date | null;
  channelName?: string;
  channelUrl?: string;
  messagePlatformCreatedAt?: Date;
}

export interface IRegisterMessageReaction {
  execute(
    input: RegisterMessageReactionInput,
  ): Promise<GenericOutputDto<MessageReactionEntity>>;
}
