// orquestra os useCases command de voice event.

import {
  Client,
  GuildChannel,
  GuildScheduledEvent,
  PartialGuildScheduledEvent,
} from "discord.js";
import { IDiscordService } from "@services/IDiscordService";
import { ILoggerService } from "@services/ILogger";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "@type/LoggerContextEnum";
import { IRegisterVoiceEvent } from "@interfaces/useCases/audioEvent/IRegisterVoiceEvent";
import { IFinalizeVoiceEvent } from "@interfaces/useCases/audioEvent/IFinalizeVoiceEvent";
import { RegisterVoiceEventInput } from "@interfaces/useCases/audioEvent/IRegisterVoiceEvent";
import { FinalizeVoiceEventInput } from "@interfaces/useCases/audioEvent/IFinalizeVoiceEvent";
import { DiscordEventStatus } from "@type/DiscordEventTypes";

export class VoiceEventCommand {
  constructor(
    private readonly discordService: IDiscordService<
      unknown,
      unknown,
      unknown,
      Client,
      GuildChannel,
      GuildScheduledEvent | PartialGuildScheduledEvent
    >,
    private readonly logger: ILoggerService,
    private readonly registerVoiceEvent: IRegisterVoiceEvent,
    private readonly finalizeVoiceEvent: IFinalizeVoiceEvent,
  ) {
    this.executeVoiceEvent();
  }

  async executeVoiceEvent(): Promise<void> {
    try {
      this.discordService.onVoiceEvent(async (discordEvent) => {
        const convertedEvent =
          VoiceEventCommand.convertDiscordEvent(discordEvent);
        await this.processVoiceEvent(convertedEvent);
      });
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.COMMAND,
        LoggerContextEntity.AUDIO_EVENT,
        `executeVoiceEvent | ${error.message}`,
      );
    }
  }

  private async processVoiceEvent(event: {
    id: string;
    name: string;
    status: DiscordEventStatus;
    scheduledStartAt: Date | null;
    scheduledEndAt: Date | null;
    userCount: number | null;
    channelId: string | null;
    creatorId: string | null;
    description: string | null;
    image?: string;
  }): Promise<void> {
    try {
      if (event.status === "ACTIVE" && !event.scheduledEndAt) {
        await this.handleVoiceEventStarted(event);
      } else if (event.status === "COMPLETED" || event.scheduledEndAt) {
        await this.handleVoiceEventEnded(event);
      } else {
        this.logger.logToConsole(
          LoggerContextStatus.SUCCESS,
          LoggerContext.COMMAND,
          LoggerContextEntity.AUDIO_EVENT,
          `Voice event status change detected: ${event.name} - ${event.status}`,
        );
      }
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.COMMAND,
        LoggerContextEntity.AUDIO_EVENT,
        `Error processing voice event: ${error.message}`,
      );
    }
  }

  private async handleVoiceEventStarted(event: {
    id: string;
    name: string;
    status: DiscordEventStatus;
    scheduledStartAt: Date | null;
    scheduledEndAt: Date | null;
    userCount: number | null;
    channelId: string | null;
    creatorId: string | null;
    description: string | null;
    image?: string;
  }): Promise<void> {
    try {
      const input: RegisterVoiceEventInput = {
        platformId: event.id,
        name: event.name,
        status: VoiceEventCommand.mapStatusToPlatformId(event.status),
        startAt: event.scheduledStartAt || new Date(),
        endAt: event.scheduledEndAt,
        userCount: event.userCount || 0,
        channelId: event.channelId || "",
        creatorId: event.creatorId || "",
        description: event.description || undefined,
        image: event.image,
      };

      const result = await this.registerVoiceEvent.execute(input);

      if (result.success) {
        this.logger.logToConsole(
          LoggerContextStatus.SUCCESS,
          LoggerContext.COMMAND,
          LoggerContextEntity.AUDIO_EVENT,
          `Voice event started successfully: ${event.name}`,
        );
      } else {
        this.logger.logToConsole(
          LoggerContextStatus.ERROR,
          LoggerContext.COMMAND,
          LoggerContextEntity.AUDIO_EVENT,
          `Failed to register voice event: ${result.message}`,
        );
      }
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.COMMAND,
        LoggerContextEntity.AUDIO_EVENT,
        `Error handling voice event started: ${error.message}`,
      );
    }
  }

  private async handleVoiceEventEnded(event: {
    id: string;
    name: string;
    status: DiscordEventStatus;
    scheduledStartAt: Date | null;
    scheduledEndAt: Date | null;
    userCount: number | null;
    channelId: string | null;
    creatorId: string | null;
    description: string | null;
    image?: string;
  }): Promise<void> {
    try {
      const input: FinalizeVoiceEventInput = {
        platformId: event.id,
        endAt: event.scheduledEndAt || new Date(),
        userCount: event.userCount || 0,
      };

      const result = await this.finalizeVoiceEvent.execute(input);

      if (result.success) {
        this.logger.logToConsole(
          LoggerContextStatus.SUCCESS,
          LoggerContext.COMMAND,
          LoggerContextEntity.AUDIO_EVENT,
          `Voice event ended successfully: ${event.name}`,
        );
      } else {
        this.logger.logToConsole(
          LoggerContextStatus.ERROR,
          LoggerContext.COMMAND,
          LoggerContextEntity.AUDIO_EVENT,
          `Failed to finalize voice event: ${result.message}`,
        );
      }
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.COMMAND,
        LoggerContextEntity.AUDIO_EVENT,
        `Error handling voice event ended: ${error.message}`,
      );
    }
  }

  static convertDiscordEvent(
    event: GuildScheduledEvent | PartialGuildScheduledEvent,
  ): {
    id: string;
    name: string;
    status: DiscordEventStatus;
    scheduledStartAt: Date | null;
    scheduledEndAt: Date | null;
    userCount: number | null;
    channelId: string | null;
    creatorId: string | null;
    description: string | null;
    image?: string;
  } {
    const statusMap = <const>{
      "1": "SCHEDULED",
      "2": "ACTIVE",
      "3": "COMPLETED",
      "4": "CANCELED",
    };

    return {
      id: event.id,
      name: event.name,
      status: statusMap[event.status.toString()] || "SCHEDULED",
      scheduledStartAt: event.scheduledStartAt,
      scheduledEndAt: event.scheduledEndAt,
      userCount: event.userCount,
      channelId: event.channelId,
      creatorId: event.creatorId,
      description: event.description,
      image: event.coverImageURL ? event.coverImageURL() : undefined,
    };
  }

  static mapStatusToPlatformId(status: DiscordEventStatus): string {
    const statusMap = <const>{
      SCHEDULED: "scheduled",
      ACTIVE: "active",
      COMPLETED: "completed",
      CANCELED: "canceled",
    };

    return statusMap[status] || "scheduled";
  }
}
