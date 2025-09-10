import { initializeDatabase } from "./database.context";
import { initializeUserUseCases } from "./useUserCases.context";
import { initializeDiscord } from "./discord.context";
import { UserCommand } from "@application/command/userCommand";
import { Logger } from "@application/services/Logger";
import {
  LoggerContextStatus,
  LoggerContext,
  LoggerContextEntity,
} from "@type/LoggerContextEnum";
import { ErrorMessages } from "@type/ErrorMessages";
import { initializeUserEventUseCases } from "@contexts/userEventUseCases.context";
import { UserEventCommand } from "@application/command/userEventCommand";

export function initializeApp() {
  // Aqui vao as dependencias externas
  const logger = new Logger();
  const { userRepository, userEventRepository, audioEventRepository } =
    initializeDatabase(logger);
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
  const userEventUseCases = initializeUserEventUseCases(
    userEventRepository,
    userRepository,
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
  new UserEventCommand(
    discordService,
    logger,
    userEventUseCases.createUserEventCase,
  );
  // Isso deve ser executado depois que o user command for iniciado
  discordService.registerEvents();
  discordService.client.login(TOKEN_BOT);
}
