import {
  Client,
  Events,
  Message,
  GuildMember,
  PartialGuildMember,
} from "discord.js";
import { IDiscordService } from "../../domain/interfaces/services/IDiscordService";

export class DiscordService
  implements IDiscordService<Message, GuildMember, PartialGuildMember, Client>
{
  public readonly client: Client;
  // Use estas funções para registar um handler que você queira executar quando o evento ocorrer
  private onDiscordStartHandlers: (() => void)[] = [];
  private onMessageHandlers: ((message: Message) => void)[] = [];
  private onNewUserHandlers: ((member: GuildMember) => void)[] = [];
  private onUserLeaveHandlers: ((
    member: GuildMember | PartialGuildMember
  ) => void)[] = [];

  constructor(client: Client) {
    this.client = client;
  }

  public registerEvents() {
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
}
