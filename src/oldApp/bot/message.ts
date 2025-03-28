
import { Message, MessageReaction, User } from "discord.js";
import { messageCount } from "./index.js";

const { BOT_AUTHOR_ID } = process.env;

// Monitoramento de reações
export const monitorReaction = async (reaction: MessageReaction, user: User) => {
    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();

    const { emoji, message } = reaction;
    const { id: messageId, channel } = message;
    const { id: username } = user;

    console.log(`${username} reagiu com ${emoji.name} na mensagem ${messageId}(canal: ${channel.id})`);
    console.log(reaction)
}

// Monitoramento de Mensagens de tipos diferentes
export const monitorContentType = async (message: Message) => {
    const attachment = message.attachments.first();
    const embed = message.embeds[0];
    if (message.stickers.size > 0) {
        const sticker = message.stickers.first();
        message.reply(`Você enviou a sticker: **${sticker.name}**!`);
    }
    if (attachment && attachment.contentType && attachment.contentType.includes('image/gif')) {
        console.log("é um gif");
    }

    if (embed && embed.url && embed.toJSON().type === 'gifv') {
        console.log('GIF via link detectado:', embed.url);
    }
}

// Monitoramento de Mensagens
export const monitorMessages = (message: Message) => {
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