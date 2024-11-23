import { messageCount, voiceParticipation } from "./index.js";

const { ALLOWED_ROLEID } = process.env;

// Comando de Relatório
client.command = new Map();

client.command.set("report", {
  execute: (message) => {
    if (!message.member.roles.cache.has(ALLOWED_ROLEID)) {
      message.reply("Você não tem permissão para usar este comando.");
      return;
    }

    const currentMonth = new Date().getMonth() + 1;
    let report = "Reporte de engajamento:\n";

    for (const [userId, data] of Object.entries(voiceParticipation)) {
      if (data[currentMonth]) {
        report += `<@${userId}>: Entradas: ${
          data[currentMonth].entries
        }, Duração Total: ${data[currentMonth].totalDuration.toFixed(
          2
        )} segundos\n`;
      }
    }

    for (const [userId, months] of Object.entries(messageCount)) {
      if (months[currentMonth]) {
        report += `<@${userId}>: Mensagens: ${months[currentMonth]}\n`;
      }
    }

    for (const [userId] of Object.entries(messageCount)) {
      const member = message.guild.members.cache.get(userId);
      const joinedTimestamp = member.joinedAt;
      report += `<@${userId}>: Data de entrada no servidor: ${joinedTimestamp}\n`;
    }

    message.channel.send(report);
  },
});

client.on("messageCreate", (message) => {
  if (message.content.startsWith("!report")) {
    const command = client.command.get("report");
    if (command) command.execute(message);
  }
});
