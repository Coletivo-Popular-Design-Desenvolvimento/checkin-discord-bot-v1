import { initializeDatabase } from "./database.context";
import { initializeUserUseCases } from "./useUserCases.context";
import { UserCommand } from "../application/command/userCommand";
import { Logger } from "../application/services/Logger";
import { LoggerContextStatus, LoggerContext, LoggerContextEntity } from "../domain/types/LoggerContextEnum";
import { ErrorMessages } from "../domain/types/ErrorMessages";
import { initializeChannelUseCases } from "./channelUseCases.context";
import { ChannelCommand } from "../application/command/channelCommand";
import { DiscordModule } from "./DiscordModule";

export async function initializeApp() {
// DI -> LOG
  const logger = new Logger();
  
// DI -> BANCO DE DADOS
  const { userRepository, channelRepository } = initializeDatabase(logger);

// DI -> DISCORD
  const discordService = DiscordModule.intiialize(logger);
  discordService.registerAllEvents();

// AMBIENTE
  const { TOKEN: TOKEN } = process.env;
  if (!TOKEN) {
    logger.logToConsole(
      LoggerContextStatus.ERROR,
      LoggerContext.APP_CONTEXT,
      LoggerContextEntity.USER,
      ErrorMessages.MISSING_SECRET
    );
    process.exit(1);
  }

// DI - USE CASE
  const userUseCases = initializeUserUseCases(userRepository, logger);
  const channelUseCases = initializeChannelUseCases(channelRepository, logger);

// DI -> COMMAND
  new UserCommand(
    logger,
    userUseCases.createUserCase,
    userUseCases.updateUserCase
  );
  new ChannelCommand(
    logger,
    channelUseCases.createChannelUseCase,
    channelUseCases.updateChannelUseCase,
    channelUseCases.createManyChannelUseCase,
  )

  // Isso deve ser executado depois que o user command for iniciado
  discordService.login(TOKEN);

  try {
    await discordService.login(TOKEN);
  } catch (error) {
    logger.logToConsole(
      LoggerContextStatus.CRITICAL,
      LoggerContext.APP_CONTEXT,
      LoggerContextEntity.SYSTEM,
      `Failed to initialize Discord: ${error}`
    );
  }

  return {
    logger,
    discordServiceNew: discordService,
    userUseCases,
    channelUseCases
  };
}
