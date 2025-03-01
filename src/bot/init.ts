import bcrypt from "bcryptjs";
import { ChannelType, Message } from "discord.js";
import { readUsers, saveUsers } from "./file.js";
import { modules } from "./index.js";

const { AUTH_ROLE_ID, AUTH_CHANNEL_ID, BOT_AUTHOR_ID } = process.env;

// Autentica usuário
export const authUser = async (message: Message) => {
  if (message.author.id !== BOT_AUTHOR_ID) {
    if (message.channel.id === AUTH_CHANNEL_ID) {
      const [command] = message.content.split(" ");

      const users = await readUsers(); // Ler usuários no início do comando

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

      const users = await readUsers();
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
};

// Faz o login
export const loginUser = async (message: Message) => {
  const [command, ...args] = message.content.split(" ");

  if (command === "!login") {
    if (args.length < 2) {
      message.channel.send(
        "Por favor, forneça um nome de usuário e uma senha. Uso: `!login <username> <password> <module>`"
      );
      return;
    }

    // const username = args[0]; // Nunca usado.
    const password = args[1];
    const module = args[2];

    const users = await readUsers();

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
};
