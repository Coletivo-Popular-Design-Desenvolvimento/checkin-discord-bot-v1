import { Client, Events, GatewayIntentBits, Partials } from "discord.js";
import {
  monitorEvents,
  monitorEventUserAdd,
  monitorStatusUpdateEvent,
  monitorCreateEvents,
  monitorEventUserRemove,
  monitorStatusEvent,
} from "./events.js";
import { authUser, loginUser } from "./init";
import { voiceStateUpdate } from "./monitor";
import { createReport, executeReport } from "./report";
import {
  monitorReaction,
  monitorContentType,
  monitorMessages,
} from "./message.js";
import { checkForRoleUpdate } from "./member.js";

const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Message, // Permite rastrear reações em mensagens não armazenadas em cache
    Partials.Reaction,
  ],
});

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", authUser);
client.on("messageCreate", loginUser);
client.on("guildScheduledEventCreate", monitorEvents);
client.on("guildScheduledEventUserAdd", monitorEventUserAdd);
client.on("guildScheduledEventUserRemove", monitorEventUserRemove);
client.on("guildScheduledEventUpdate", monitorStatusEvent);
client.on("GuildScheduledEventCreateOptions", monitorCreateEvents);
client.on("guildScheduledEventUpdate", monitorStatusUpdateEvent);
client.on("messageReactionAdd", monitorReaction);
client.on("messageCreate", monitorContentType);

client.on("messageCreate", monitorMessages);
client.on("voiceStateUpdate", voiceStateUpdate);

client.on(Events.GuildMemberUpdate, checkForRoleUpdate);

// Comando de Relatório
client["command"] = new Map(); // <--- metodo nao existente no client do discord. Referencia: https://dev.to/fellipeutaka/creating-your-first-discord-bot-using-typescript-1eh6

client["command"].set("report", {
  // <--- metodo nao existente no client do discord. Referencia: https://dev.to/fellipeutaka/creating-your-first-discord-bot-using-typescript-1eh6
  execute: executeReport,
});

client.on("messageCreate", createReport);

export default client;
