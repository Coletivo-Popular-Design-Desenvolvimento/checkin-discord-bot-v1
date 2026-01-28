import { IUserEventCommand } from "@interfaces/commands/IUserEventCommand";
import { IDiscordService } from "@services/IDiscordService";
import {
  Client,
  GuildChannel,
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
import { EventType } from "@type/EventTypeEnum";

export class UserEventCommand implements IUserEventCommand {
  constructor(
    private readonly discordService: IDiscordService<
      Message,
      GuildMember,
      PartialGuildMember,
      Client,
      VoiceState,
      GuildChannel,
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
        // Ignora eventos que não sejam JOIN ou LEAVE (ex: mute, deafen, etc)
        if (eventType === null) {
          return;
        }
        await this.createUserEvent.execute(
          this.toCreateUserEventInput(oldState, newState, eventType),
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
    oldState: VoiceState,
    newState: VoiceState,
  ): EventType | null {
    // Verifica se o usuário entrou em um voice channel
    if (oldState.channelId === null && newState.channelId !== null) {
      return EventType.JOINED;
    }
    // Verifica se o usuário saiu de um voice channel
    if (oldState.channelId !== null && newState.channelId === null) {
      return EventType.LEFT;
    }
    // Ignora outros casos: mudança de estado (mute/deafen), movimento entre canais, etc
    return null;
  }

  private toCreateUserEventInput(
    oldState: VoiceState,
    newState: VoiceState,
    eventType: EventType,
  ): CreateUserEventInput {
    // Para LEFT, usa oldState (canal de onde saiu); para JOINED, usa newState (canal onde entrou)
    const relevantState = eventType === EventType.LEFT ? oldState : newState;

    return {
      createdAt: new Date(),
      userPlatformId: relevantState.member.id,
      channelPlatformId: relevantState.channelId,
      eventType,
      userDiscordInfo: {
        username: relevantState.member.user.username,
        bot: relevantState.member.user.bot,
        globalName: relevantState.member.user.globalName,
      },
      channelDiscordInfo: relevantState.channel
        ? {
            name: relevantState.channel.name,
            url: relevantState.channel.url,
          }
        : undefined,
    };
  }
}
