import { initializeDatabase } from "./database.context";
import { initializeUserUseCases } from "./useUserCases.context";
import { initializeDiscord } from "./discord.context";
import { initializeVoiceEventUseCases } from "./useVoiceEventCases.context";
import { UserCommand } from "@application/command/userCommand";
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
  const { userRepository, audioEventRepository } = initializeDatabase(logger);
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
  const { voiceEventService } = initializeVoiceEventUseCases(
    audioEventRepository,
    logger,
  );

  // E finalmente as inicializacoes da aplicacao
  new UserCommand(
    discordService,
    logger,
    userUseCases.createUserCase,
    userUseCases.updateUserCase,
  );

  // Registrar o handler para eventos de voz
  discordService.onVoiceEvent((event) => {
    voiceEventService.processVoiceEvent(event);
  });

  // Isso deve ser executado depois que o user command for iniciado
  discordService.registerEvents();
  discordService.client.login(TOKEN_BOT);
}
