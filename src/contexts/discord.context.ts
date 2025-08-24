import {
  Client,
  Events,
  GatewayIntentBits,
  GuildMember,
  Message,
  PartialGuildMember,
} from "discord.js";
import { DiscordService } from "@discord/DiscordService";
import { IDiscordService } from "@services/IDiscordService";

// Mapea os eventos do discord para as intents que precisam ser registradas no client.
const EVENT_INTENTS_MAP: Partial<Record<Events, GatewayIntentBits[]>> = {
  [Events.ClientReady]: [],
  [Events.MessageCreate]: [GatewayIntentBits.GuildMessages],
  [Events.GuildMemberAdd]: [
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.Guilds,
  ],
  [Events.GuildScheduledEventUpdate]: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildScheduledEvents,
  ],
  [Events.GuildScheduledEventCreate]: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildScheduledEvents,
  ],
  [Events.GuildScheduledEventDelete]: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildScheduledEvents,
  ],
};

/**
 * Inicializa o contexto do Discord.
 *
 * Esta funcao cria um novo cliente do Discord com as intents necessarias
 * com base no EVENT_INTENTS_MAP e inicializa o DiscordService com
 * este cliente. Ela retorna um objeto contendo o DiscordService
 * inicializado para uso posterior.
 *
 * @returns {discordService: IDiscordService} Um objeto contendo o DiscordService inicializado.
 */

export function initializeDiscord(): {
  discordService: IDiscordService<
    Message,
    GuildMember,
    PartialGuildMember,
    Client
  >;
} {
  const intents = Object.values(EVENT_INTENTS_MAP).flat();
  const client = new Client({ intents: intents });
  const discordService = new DiscordService(client);
  return { discordService };
}
