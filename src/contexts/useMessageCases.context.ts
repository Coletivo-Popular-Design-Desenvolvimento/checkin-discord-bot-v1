import { IMessageRepository } from "@repositories/IMessageRepository";
import { IUserRepository } from "@repositories/IUserRepository";
import { IChannelRepository } from "@repositories/IChannelRepository";
import { ICreateUser } from "@interfaces/useCases/user/ICreateUser";
import { ILoggerService } from "@services/ILogger";
import { RegisterMessage } from "@domain/useCases/message/RegisterMessage";

export function initializeMessageUseCases(
  messageRepository: IMessageRepository,
  userRepository: IUserRepository,
  channelRepository: IChannelRepository,
  createUser: ICreateUser,
  logger: ILoggerService,
): {
  registerMessage: RegisterMessage;
} {
  const registerMessage = new RegisterMessage(
    messageRepository,
    userRepository,
    channelRepository,
    createUser,
    logger,
  );

  return { registerMessage };
}
