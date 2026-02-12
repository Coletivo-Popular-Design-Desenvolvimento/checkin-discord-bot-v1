import { MessageEntity } from "@entities/Message";
import { GenericOutputDto } from "@dtos/GenericOutputDto";

export interface RegisterMessageInput {
  platformId: string;
  platformCreatedAt: Date;
  channelId: string;
  userId: string;
  channelName?: string;
  channelUrl?: string;
  username?: string;
  userGlobalName?: string | null;
  userBot?: boolean;
  userPlatformCreatedAt?: Date;
  userJoinedAt?: Date | null;
}

export interface IRegisterMessage {
  execute(
    input: RegisterMessageInput,
  ): Promise<GenericOutputDto<MessageEntity>>;
}
