import { Client, GatewayIntentBits } from "discord.js";
import { monitorEvents, monitorEventUserAdd, monitorStatusUpdateEvent, monitorCreateEvents, monitorEventUserRemove, monitorStatusEvent, scheduledEventsFetch } from "./events.js"
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
client.on('guildScheduledEventUpdate', monitorStatusEvent)
client.on("GuildScheduledEventCreateOptions", monitorCreateEvents)
client.on("guildScheduledEventUpdate", monitorStatusUpdateEvent)


client.on("messageCreate", monitorMessages);
client.on("voiceStateUpdate", voiceStateUpdate);

// Comando de Relatório
// client.command = new Map(); // <--- metodo nao existente no client do discord. Referencia: https://dev.to/fellipeutaka/creating-your-first-discord-bot-using-typescript-1eh6

// client.command.set("report", { // <--- metodo nao existente no client do discord. Referencia: https://dev.to/fellipeutaka/creating-your-first-discord-bot-using-typescript-1eh6
//   execute: executeReport,
// }); 

client.on("messageCreate", createReport);

export default client;
