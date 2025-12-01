import { IUserEventCommand } from "@interfaces/commands/IUserEventCommand";
import { IDiscordService } from "@services/IDiscordService";
import {
  Client,
  GuildMember,
  Message,
  PartialGuildMember,
  VoiceState,
} from "discord.js";
import { ILoggerService } from "@services/ILogger";
import {
  CreateUserEventInput,
  ICreateUserEvent,
} from "@interfaces/useCases/userEvent/ICreateUserEvent";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "@type/LoggerContextEnum";
import { EventType } from "@prisma/client";

export class UserEventCommand implements IUserEventCommand {
  constructor(
    private readonly discordService: IDiscordService<
      Message,
      GuildMember,
      PartialGuildMember,
      Client,
      VoiceState,
      unknown,
      unknown
    >,
    private readonly logger: ILoggerService,
    private readonly createUserEvent: ICreateUserEvent,
  ) {
    this.executeUserJoinOrLeaveAudioEvent();
  }

  async executeUserJoinOrLeaveAudioEvent(): Promise<void> {
    this.logger.logToConsole(
      LoggerContextStatus.SUCCESS,
      LoggerContext.COMMAND,
      LoggerContextEntity.USER_EVENT,
      "UserEventCommand executeUserJoinOrLeaveAudioEvent",
    );
    try {
      this.discordService.onVoiceEventUserChange(async (oldState, newState) => {
        this.logger.logToConsole(
          LoggerContextStatus.SUCCESS,
          LoggerContext.COMMAND,
          LoggerContextEntity.USER_EVENT,
          "discordService onVoiceEventUserChange",
        );
        const eventType = this.getEventType(oldState, newState);
        await this.createUserEvent.execute(
          this.toCreateUserEventInput(newState, eventType),
        );
      });
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.COMMAND,
        LoggerContextEntity.USER,
        `executeNewUser | ${error.message}`,
      );
    }
  }
  private getEventType(
    oldState: VoiceState | null,
    newState: VoiceState | null,
  ): EventType {
    if (oldState === null && newState !== null) return EventType.JOINED;
    if (oldState !== null && newState === null) return EventType.LEFT;
    throw new Error("Unsupported event type");
  }

  private toCreateUserEventInput(
    voiceState: VoiceState,
    eventType: EventType,
  ): CreateUserEventInput {
    return {
      createdAt: new Date(),
      userPlatformId: voiceState.member.id,
      channelPlatformId: voiceState.channelId,
      eventType,
    };
  }
}
