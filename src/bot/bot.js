import { Client, GatewayIntentBits } from "discord.js";

import { monitorEvents, monitorEventUserAdd, monitorStatusUpdateEvent, monitorCreateEvents, monitorEventUserRemove, monitorStatusEvent, scheduledEventsFetch, updateStatusEvent } from "./events.js"
import { authUser, loginUser } from "./init.js";
import { monitorMessages, voiceStateUpdate } from "./monitor.js";
import { createReport, executeReport } from "./report.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildScheduledEvents
  ],
});

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", authUser);
client.on("messageCreate", loginUser);
client.on("guildScheduledEventCreate", monitorEvents);
client.on('guildScheduledEventUserAdd', monitorEventUserAdd);
client.on('guildScheduledEventUserRemove', monitorEventUserRemove);
client.on('guildScheduledEventUpdate',  monitorStatusEvent)
client.on("GuildScheduledEventCreateOptions", monitorCreateEvents)
client.on("guildScheduledEventUpdate", monitorStatusUpdateEvent)
client.on("guildScheduledEventUpdate", updateStatusEvent)



client.on("messageCreate", monitorMessages);
client.on("voiceStateUpdate", voiceStateUpdate);

// Comando de Relatório
client.command = new Map();

client.command.set("report", {
  execute: executeReport,
});

client.on("messageCreate", createReport);

export default client;
