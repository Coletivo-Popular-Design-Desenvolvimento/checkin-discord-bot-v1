import { GenericOutputDto } from "@dtos/GenericOutputDto";

export interface RemoveMessageReactionInput {
  userId: string;
  messageId: string;
  reactionEmoji?: string;
}

export interface IRemoveMessageReaction {
  execute(
    input: RemoveMessageReactionInput,
  ): Promise<GenericOutputDto<boolean>>;
}
