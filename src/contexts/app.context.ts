import { initializeDatabase } from "./database.context";
import { initializeUserUseCases } from "./useUserCases.context";
import { initializeDiscord } from "./discord.context";
import { UserCommand } from "../application/command/userCommand";
import { Logger } from "../application/services/Logger";
import {
  LoggerContextStatus,
  LoggerContext,
  LoggerContextEntity,
} from "../domain/types/LoggerContextEnum";
import { ErrorMessages } from "../domain/types/ErrorMessages";

export function initializeApp() {
  // Aqui vao as dependencias externas
  const logger = new Logger();
  const { userRepository } = initializeDatabase(logger);
  const { discordService } = initializeDiscord();
  const { SECRET_KEY } = process.env;

  if (!SECRET_KEY) {
    logger.logToConsole(
      LoggerContextStatus.ERROR,
      LoggerContext.APP_CONTEXT,
      LoggerContextEntity.USER,
      ErrorMessages.MISSING_SECRET
    );
  }

  // Daqui para baixo, vao as dependencias internas
  const userUseCases = initializeUserUseCases(userRepository, logger);

  // E finalmente as inicializacoes da aplicacao
  new UserCommand(
    discordService,
    logger,
    userUseCases.createUserCase,
    userUseCases.updateUserCase
  );
  // Isso deve ser executado depois que o user command for iniciado
  discordService.registerEvents();
  discordService.client.login(SECRET_KEY);
}
