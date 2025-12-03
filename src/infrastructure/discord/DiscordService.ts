import { IDiscordService } from "@services/IDiscordService";
import {
  Client,
  Events,
  GuildChannel,
  GuildMember,
  Message,
  PartialGuildMember,
  GuildScheduledEvent,
  PartialGuildScheduledEvent,
  VoiceState,
} from "discord.js";

export class DiscordService
  implements
    IDiscordService<
      Message,
      GuildMember,
      PartialGuildMember,
      Client,
      VoiceState,
      GuildChannel,
      GuildScheduledEvent | PartialGuildScheduledEvent
    >
{
  public readonly client: Client;
  // Use estas funções para registar um handler que você queira executar quando o evento ocorrer
  private onDiscordStartHandlers: (() => void)[] = [];
  private onMessageHandlers: ((message: Message) => void)[] = [];
  private onNewUserHandlers: ((member: GuildMember) => void)[] = [];
  private onUserLeaveHandlers: ((
    member: GuildMember | PartialGuildMember,
  ) => void)[] = [];
  private onNewChannelHandlers: Array<(channel: GuildChannel) => void> = [];
  private onChangeChannelHandlers: Array<
    (oldChannel: GuildChannel, newChannel: GuildChannel) => void
  > = [];
  private onDeleteChannelHandlers: Array<(channel: GuildChannel) => void> = [];
  private onVoiceEventHandlers: ((
    event: GuildScheduledEvent | PartialGuildScheduledEvent,
  ) => void)[] = [];
  private onVoiceEventUserChangeHandlers: ((
    oldState: VoiceState,
    newState: VoiceState,
  ) => void)[] = [];

  constructor(client: Client) {
    this.client = client;
  }

  public registerEvents() {
    console.log("[DiscordService] Registering all Discord events...");
    // Inicializa o event handler. Caso tenha outros contextos que precisem de eventos, eles devem ser adicionados aqui
    // Não esqueça de adicionar estes novos eventos na interface IDiscordService e no EVENT_INTENTS_MAP do contexto do discord. (/contexts/discord.context.ts)
    // Existem excessoes, caso o evento precise de um intent ja registrado no EVENT_INTENTS_MAP, nao precisa ser adicionado la
    this.client.once(Events.ClientReady, () => {
      this.onDiscordStartHandlers.forEach((fn) => fn());
    });

    this.client.on(Events.MessageCreate, (message) => {
      this.onMessageHandlers.forEach((fn) => fn(message));
    });

    this.client.on(Events.GuildMemberAdd, (member) => {
      this.onNewUserHandlers.forEach((fn) => fn(member));
    });

    //caso de excessao, pois esse evento compartilha o intent com GuildMemberAdd
    this.client.on(Events.GuildMemberRemove, (member) => {
      this.onUserLeaveHandlers.forEach((fn) => fn(member));
    });

    this.client.on(Events.ChannelCreate, (channel) => {
      this.onNewChannelHandlers.forEach((fn) => fn(channel));
    });

    this.client.on(Events.ChannelUpdate, (oldChannel, newChannel) => {
      this.onChangeChannelHandlers.forEach((fn) =>
        fn(<GuildChannel>oldChannel, <GuildChannel>newChannel),
      );
    });

    this.client.on(Events.ChannelDelete, (channel) => {
      this.onDeleteChannelHandlers.forEach((fn) => fn(<GuildChannel>channel));
    });

    this.client.on(Events.GuildScheduledEventUpdate, (event) => {
      console.log(
        `[DiscordService] GuildScheduledEventUpdate fired: ${event.name} (${event.id})`,
      );
      this.onVoiceEventHandlers.forEach((fn) => fn(event));
    });

    this.client.on(Events.GuildScheduledEventCreate, (event) => {
      console.log(
        `[DiscordService] GuildScheduledEventCreate fired: ${event.name} (${event.id})`,
      );
      this.onVoiceEventHandlers.forEach((fn) => fn(event));
    });

    this.client.on(Events.GuildScheduledEventDelete, (event) => {
      console.log(
        `[DiscordService] GuildScheduledEventDelete fired: ${event.name} (${event.id})`,
      );
      this.onVoiceEventHandlers.forEach((fn) => fn(event));
    });

    this.client.on(Events.VoiceStateUpdate, (oldState, newState) => {
      this.onVoiceEventUserChangeHandlers.forEach((fn) =>
        fn(oldState, newState),
      );
    });
  }

  public onDiscordStart(handler: () => void): void {
    this.onDiscordStartHandlers.push(handler);
  }

  public onMessage(handler: (message: Message) => void): void {
    this.onMessageHandlers.push(handler);
  }

  public onNewUser(handler: (member: GuildMember) => void): void {
    this.onNewUserHandlers.push(handler);
  }

  public onUserLeave(handler: (member: GuildMember) => void): void {
    this.onUserLeaveHandlers.push(handler);
  }

  public onVoiceEventUserChange(
    handler: (oldState: VoiceState, newState: VoiceState) => void,
  ): void {
    this.onVoiceEventUserChangeHandlers.push(handler);
  }

  public onCreateChannel(handler: (channel: GuildChannel) => void): void {
    this.onNewChannelHandlers.push(handler);
  }

  public onChangeChannel(
    handler: (oldChannel: GuildChannel, newChannel: GuildChannel) => void,
  ): void {
    this.onChangeChannelHandlers.push(handler);
  }

  public onDeleteChannel(handler: (channel: GuildChannel) => void): void {
    this.onDeleteChannelHandlers.push(handler);
  }

  public onVoiceEvent(
    handler: (event: GuildScheduledEvent | PartialGuildScheduledEvent) => void,
  ): void {
    this.onVoiceEventHandlers.push(handler);
  }
}
