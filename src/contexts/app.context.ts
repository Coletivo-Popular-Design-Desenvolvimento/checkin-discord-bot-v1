import { initializeDatabase } from "./database.context";
import { initializeUserUseCases } from "./useUserCases.context";
import { initializeDiscord } from "./discord.context";
import { initializeVoiceEventUseCases } from "./useVoiceEventCases.context";
import { initializeMessageUseCases } from "./useMessageCases.context";
import { UserCommand } from "@application/command/userCommand";
import { VoiceEventCommand } from "@application/command/voiceEventCommand";
import { MessageCommand } from "@application/command/messageCommand";
import { Logger } from "@application/services/Logger";
import {
  LoggerContextStatus,
  LoggerContext,
  LoggerContextEntity,
} from "@type/LoggerContextEnum";
import { ErrorMessages } from "@type/ErrorMessages";

export function initializeApp() {
  // Aqui vao as dependencias externas
  const logger = new Logger();
  const {
    userRepository,
    audioEventRepository,
    messageRepository,
    channelRepository,
  } = initializeDatabase(logger);
  const { discordService } = initializeDiscord();
  const { TOKEN_BOT } = process.env;

  if (!TOKEN_BOT) {
    logger.logToConsole(
      LoggerContextStatus.ERROR,
      LoggerContext.APP_CONTEXT,
      LoggerContextEntity.USER,
      ErrorMessages.MISSING_SECRET,
    );
  }

  // Daqui para baixo, vao as dependencias internas
  const userUseCases = initializeUserUseCases(userRepository, logger);
  const { registerVoiceEvent, finalizeVoiceEvent } =
    initializeVoiceEventUseCases(audioEventRepository, logger);
  const { registerMessage } = initializeMessageUseCases(
    messageRepository,
    userRepository,
    channelRepository,
    userUseCases.createUserCase,
    logger,
  );

  // E finalmente as inicializacoes da aplicacao
  new UserCommand(
    discordService,
    logger,
    userUseCases.createUserCase,
    userUseCases.updateUserCase,
  );

  new VoiceEventCommand(
    discordService,
    logger,
    registerVoiceEvent,
    finalizeVoiceEvent,
  );

  new MessageCommand(discordService, logger, registerMessage);

  // Isso deve ser executado depois que o user command for iniciado
  discordService.registerEvents();
  discordService.client.login(TOKEN_BOT);
}
