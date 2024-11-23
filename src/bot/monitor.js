import { messageCount, voiceParticipation } from "./index.js";

const { BOT_AUTHOR_ID } = process.env;

// Monitoramento de Mensagens
export const monitorMessages = (message) => {
  if (message.author.id !== BOT_AUTHOR_ID) {
    if (!message.guild) return;

    const userId = message.author.id;
    const currentMonth = new Date().getMonth() + 1;

    if (!messageCount[userId]) {
      messageCount[userId] = {};
    }

    if (messageCount[userId][currentMonth]) {
      messageCount[userId][currentMonth]++;
    } else {
      messageCount[userId][currentMonth] = 1;
    }
    console.log(
      `Messages by ${message.author.tag}: ${messageCount[userId][currentMonth]}`
    );
  }
};

// Monitoramento de Voz
export const voiceStateUpdate = (oldState, newState) => {
  const userId = newState.id;
  const currentMonth = new Date().getMonth() + 1;

  if (!voiceParticipation[userId]) {
    voiceParticipation[userId] = {};
  }

  if (!voiceParticipation[userId][currentMonth]) {
    voiceParticipation[userId][currentMonth] = {
      entries: 0,
      totalDuration: 0,
      joinTime: null,
    };
  }

  if (!oldState.channel && newState.channel) {
    // Entrou em um canal de voz
    voiceParticipation[userId][currentMonth].entries++;
    voiceParticipation[userId][currentMonth].joinTime = Date.now();
    console.log(
      `${newState.member.user.tag} entrou em ${newState.channel.name}`
    );
  } else if (oldState.channel && !newState.channel) {
    // Saiu de um canal de voz
    if (voiceParticipation[userId][currentMonth].joinTime) {
      const duration =
        (Date.now() - voiceParticipation[userId][currentMonth].joinTime) / 1000;
      voiceParticipation[userId][currentMonth].totalDuration += duration;
      voiceParticipation[userId][currentMonth].joinTime = null;
      console.log(
        `${newState.member.user.tag} saiu de ${
          oldState.channel.name
        }. Duração: ${duration.toFixed(2)} segundos`
      );
    }
  }
};
