import { Client, GatewayIntentBits, ChannelType } from "discord.js"; // Importando ChannelType
import { promises as fs } from "fs";
import bcrypt from "bcrypt";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

const messageCount = {};
const voiceParticipation = {};
const { ALLOWED_ROLEID, AUTH_ROLE_ID, AUTH_CHANNEL_ID, BOT_AUTHOR_ID } =
  process.env;

// Lê os usuários cadastrados
const readUsers = async () => {
  try {
    const data = await fs.readFile("users.json", "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      // Arquivo não encontrado, retorna um objeto vazio
      return {};
    }
    throw error;
  }
};

// Salva os usuários cadastrados
const saveUsers = async (users) => {
  try {
    await fs.writeFile("users.json", JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Erro ao salvar usuários:", error);
  }
};

// Objetos para armazenar os links das aulas
const modules = {
  modulo1: "http://link-para-o-modulo1.com",
  modulo2: "http://link-para-o-modulo2.com",
  modulo3: "http://link-para-o-modulo3.com",
  // Adicione mais módulos conforme necessário
};

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Autentica usuário
client.on("messageCreate", async (message) => {
  if (message.author.id !== BOT_AUTHOR_ID) {
    if (message.channel.id === AUTH_CHANNEL_ID) {
      const [command, ...args] = message.content.split(" ");

      let users = await readUsers(); // Ler usuários no início do comando

      if (command === "!register") {
        if (users[message.author.id] === message.author.id) {
          message.channel.send("Você já está registrado.");
          return;
        }

        try {
          await message.author.send(
            "Por favor, digite seu nome de usuário e senha no formato: `<username> <password>` DM"
          );
          message.channel.send(
            `Uma mensagem foi enviada para sua DM para concluir seu registro.`
          );
        } catch (error) {
          console.error("Erro ao enviar mensagem na DM:", error);
          message.channel.send(
            "Não consegui enviar uma mensagem na sua DM. Certifique-se de que suas DMs estão abertas e tente novamente."
          );
        }
      }
    } else if (message.channel.type === ChannelType.DM) {
      const args = message.content.split(" ");
      if (args.length < 2) {
        message.channel.send(
          "Por favor, forneça um nome de usuário e uma senha no formato: `<username> <password>`"
        );
        return;
      }

      const username = args[0];
      const password = args[1];

      let users = await readUsers();
      console.log("usuários cadastrados", users);

      if (!users[message.author.id]) {
        try {
          const hashedPassword = await bcrypt.hash(password, 10); // Hash da senha
          users[message.author.id] = { username, password: hashedPassword };
          await saveUsers(users); // Salvar após alteração
          message.channel.send(
            `Usuário registrado com sucesso! Bem-vindo, ${username}.`
          );
        } catch (error) {
          console.error("Erro ao registrar usuário:", error);
          message.channel.send(
            "Ocorreu um erro ao registrar o usuário. Tente novamente."
          );
        }
      } else {
        return message.channel.send("Você já está registrado. DM");
      }
    }
  }
});

// Faz o login
client.on("messageCreate", async (message) => {
  const [command, ...args] = message.content.split(" ");

  if (command === "!login") {
    if (args.length < 2) {
      message.channel.send(
        "Por favor, forneça um nome de usuário e uma senha. Uso: `!login <username> <password> <module>`"
      );
      return;
    }

    const username = args[0];
    const password = args[1];
    const module = args[2];

    let users = await readUsers();

    if (users[message.author.id]) {
      try {
        const validPassword = await bcrypt.compare(
          password,
          users[message.author.id].password
        );
        if (validPassword) {
          // Atribuir o cargo "Authenticated" ao usuário
          const member = message.guild.members.cache.get(message.author.id);
          if (member) {
            try {
              await member.roles.add(AUTH_ROLE_ID);
              console.log(
                `Cargo "Authenticated" adicionado a ${member.user.tag}`
              );
            } catch (error) {
              console.error(
                `Erro ao adicionar cargo a ${member.user.tag}:`,
                error
              );
              message.channel.send(
                "Ocorreu um erro ao adicionar o cargo. Entre em contato com um administrador."
              );
              return;
            }
          }

          if (module && modules[module]) {
            // Enviar o link do módulo correspondente
            message.channel.send(
              `Aqui está o link para o módulo ${module}: ${modules[module]}`
            );
            return;
          } else {
            message.channel.send(
              "Por favor, especifique um módulo válido que deseja acessar."
            );
          }
        } else {
          message.channel.send("Senha incorreta.");
        }
      } catch (error) {
        console.error("Erro ao fazer login:", error);
        message.channel.send(
          "Ocorreu um erro ao fazer login. Tente novamente."
        );
      }
    } else {
      message.channel.send("Usuário não encontrado.");
    }
  }
});

// Monitoramento de Mensagens
client.on("messageCreate", (message) => {
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
});

// Monitoramento de Voz
client.on("voiceStateUpdate", (oldState, newState) => {
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
});

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

export default client;
