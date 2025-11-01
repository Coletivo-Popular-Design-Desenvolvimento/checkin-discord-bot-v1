import { ChannelCommand } from "@application/command/channelCommand";
import { UserCommand } from "@application/command/userCommand";
import { VoiceEventCommand } from "@application/command/voiceEventCommand";
import { Logger } from "@application/services/Logger";
import { ErrorMessages } from "@type/ErrorMessages";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "@type/LoggerContextEnum";
import { initializeDatabase } from "./database.context";
import { initializeDiscord } from "./discord.context";
import { initializeChannelUseCases } from "./useChannelCases.context";
import { initializeUserUseCases } from "./useUserCases.context";
import { initializeVoiceEventUseCases } from "./useVoiceEventCases.context";

export function initializeApp() {
  // Aqui vao as dependencias externas
  const logger = new Logger();
  const { userRepository, channelRepository, audioEventRepository } =
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
  const { registerVoiceEvent, finalizeVoiceEvent } =
    initializeVoiceEventUseCases(audioEventRepository, logger);

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

  // Isso deve ser executado depois que o user command for iniciado
  discordService.registerEvents();
  discordService.client.login(TOKEN_BOT);

  const channelUseCases = initializeChannelUseCases(channelRepository, logger);
  new ChannelCommand(
    discordService,
    logger,
    channelUseCases.createChannelCase,
    channelUseCases.updateChannelCase,
    channelUseCases.deleteChannelCase,
  );
}
