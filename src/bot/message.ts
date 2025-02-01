export const monitorReaction = async (reaction, user) => {
    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();

    const { emoji, message } = reaction;
    const { id: messageId, channel } = message;
    const { id: userId, username } = user;

    console.log(`${username} reagiu com ${emoji.name} na mensagem ${messageId}(canal: ${channel.name})`);
}

export const monitorContentType = async (message) => {
    const attachment = message.attachments.first();
    const embed = message.embeds[0];
    if (message.stickers.size > 0) {
        const sticker = message.stickers.first();
        message.reply(`Você enviou a sticker: **${sticker.name}**!`);
    }
    if (attachment && attachment.contentType && attachment.contentType.includes('image/gif')) {
        console.log("é um gif");
    }
    if (embed && embed.url && embed.type === 'gifv') { // GIFs do Tenor
        console.log('GIF via link detectado:', embed.url);
    }
}