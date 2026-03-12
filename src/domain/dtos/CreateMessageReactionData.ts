export type CreateMessageReactionData = {
  userId: string;
  messageId: string;
  channelId: string;
  reactionEmoji?: string;
  reactedAt?: Date;
};
