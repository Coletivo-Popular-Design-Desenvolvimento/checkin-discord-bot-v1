import { ILoggerService } from "@services/ILogger";
import { IRegisterVoiceEvent } from "@interfaces/useCases/audioEvent/IRegisterVoiceEvent";
import { IFinalizeVoiceEvent } from "@interfaces/useCases/audioEvent/IFinalizeVoiceEvent";
import {
  LoggerContextStatus,
  LoggerContext,
  LoggerContextEntity,
} from "@type/LoggerContextEnum";
import { DiscordGuildScheduledEvent } from "@type/DiscordEventTypes";

export class VoiceEventService {
  constructor(
    private readonly registerVoiceEvent: IRegisterVoiceEvent,
    private readonly finalizeVoiceEvent: IFinalizeVoiceEvent,
    private readonly logger: ILoggerService,
  ) {}

  async handleVoiceEventStarted(
    event: DiscordGuildScheduledEvent,
  ): Promise<void> {
    try {
      this.logger.logToConsole(
        LoggerContextStatus.SUCCESS,
        LoggerContext.SERVICE,
        LoggerContextEntity.AUDIO_EVENT,
        `Voice event started detected: ${event.name}`,
      );

      const result = await this.registerVoiceEvent.execute({
        platformId: event.id,
        name: event.name,
        statusId: "active",
        startAt: event.scheduledStartAt || new Date(),
        userCount: event.userCount || 0,
        channelId: event.channelId,
        creatorId: event.creatorId,
        description: event.description,
        image: event.image,
      });

      if (result.success) {
        this.logger.logToConsole(
          LoggerContextStatus.SUCCESS,
          LoggerContext.SERVICE,
          LoggerContextEntity.AUDIO_EVENT,
          `Voice event registered successfully: ${event.name}`,
        );
      } else {
        this.logger.logToConsole(
          LoggerContextStatus.ERROR,
          LoggerContext.SERVICE,
          LoggerContextEntity.AUDIO_EVENT,
          `Failed to register voice event: ${result.message}`,
        );
      }
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.SERVICE,
        LoggerContextEntity.AUDIO_EVENT,
        `Error handling voice event started: ${error.message}`,
      );
    }
  }

  async handleVoiceEventEnded(
    event: DiscordGuildScheduledEvent,
  ): Promise<void> {
    try {
      this.logger.logToConsole(
        LoggerContextStatus.SUCCESS,
        LoggerContext.SERVICE,
        LoggerContextEntity.AUDIO_EVENT,
        `Voice event ended detected: ${event.name}`,
      );

      const result = await this.finalizeVoiceEvent.execute({
        platformId: event.id,
        endAt: event.scheduledEndAt || new Date(),
        userCount: event.userCount || 0,
      });

      if (result.success) {
        this.logger.logToConsole(
          LoggerContextStatus.SUCCESS,
          LoggerContext.SERVICE,
          LoggerContextEntity.AUDIO_EVENT,
          `Voice event finalized successfully: ${event.name}`,
        );
      } else {
        this.logger.logToConsole(
          LoggerContextStatus.ERROR,
          LoggerContext.SERVICE,
          LoggerContextEntity.AUDIO_EVENT,
          `Failed to finalize voice event: ${result.message}`,
        );
      }
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.SERVICE,
        LoggerContextEntity.AUDIO_EVENT,
        `Error handling voice event ended: ${error.message}`,
      );
    }
  }

  /**
   * Processa eventos de voz do Discord e determina se deve registrar ou finalizar
   */
  async processVoiceEvent(
    discordEvent: DiscordGuildScheduledEvent,
  ): Promise<void> {
    try {
      // Verificar se o evento foi iniciado ou finalizado
      if (discordEvent.status === "ACTIVE" && !discordEvent.scheduledEndAt) {
        // Evento iniciado
        await this.handleVoiceEventStarted(discordEvent);
      } else if (
        discordEvent.status === "COMPLETED" ||
        discordEvent.scheduledEndAt
      ) {
        // Evento finalizado
        await this.handleVoiceEventEnded(discordEvent);
      } else {
        this.logger.logToConsole(
          LoggerContextStatus.SUCCESS,
          LoggerContext.SERVICE,
          LoggerContextEntity.AUDIO_EVENT,
          `Voice event status change detected: ${discordEvent.name} - ${discordEvent.status}`,
        );
      }
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.SERVICE,
        LoggerContextEntity.AUDIO_EVENT,
        `Error processing voice event: ${error.message}`,
      );
    }
  }
}
