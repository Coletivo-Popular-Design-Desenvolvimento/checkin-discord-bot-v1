import { IMessageReactionRepository } from "@repositories/IMessageReactionRepository";
import { IUserRepository } from "@repositories/IUserRepository";
import { IChannelRepository } from "@repositories/IChannelRepository";
import { IMessageRepository } from "@repositories/IMessageRepository";
import { ICreateUser } from "@interfaces/useCases/user/ICreateUser";
import { ILoggerService } from "@services/ILogger";
import { RegisterMessageReaction } from "@domain/useCases/messageReaction/RegisterMessageReaction";

export function initializeMessageReactionUseCases(
  messageReactionRepository: IMessageReactionRepository,
  userRepository: IUserRepository,
  channelRepository: IChannelRepository,
  messageRepository: IMessageRepository,
  createUser: ICreateUser,
  logger: ILoggerService,
): {
  registerMessageReaction: RegisterMessageReaction;
} {
  const registerMessageReaction = new RegisterMessageReaction(
    messageReactionRepository,
    userRepository,
    channelRepository,
    messageRepository,
    createUser,
    logger,
  );

  return { registerMessageReaction };
}
