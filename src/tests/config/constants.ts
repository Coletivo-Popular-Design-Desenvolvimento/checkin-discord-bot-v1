import { UserStatus } from "@type/UserStatusEnum";
import {
  AudioEvent as PrismaAudioEvent,
  User,
  Message,
  Channel,
  MessageReaction,
} from "@prisma/client";
import { AudioEventEntity } from "@domain/entities/AudioEvent";
import { UserEntity } from "@domain/entities/User";
import { MessageEntity } from "@domain/entities/Message";
import { ChannelEntity } from "@domain/entities/Channel";
import { MessageReactionEntity } from "@domain/entities/MessageReaction";

export type naturalizeUser = {
  id: number;
  platform_id: string;
  username: string;
  status: number;
  global_name: string | null;
  joined_at: Date | null;
  platform_created_at: Date | null;
  create_at: Date | null;
  update_at: Date | null;
  last_active: Date | null;
  bot: boolean;
  email: string | null;
};

export const mockDBUserValue = {
  id: 1,
  platform_id: "1234567890",
  username: "John Doe",
  bot: false,
  status: UserStatus.ACTIVE,
  global_name: undefined,
  joined_at: undefined,
  platform_created_at: undefined,
  create_at: undefined,
  update_at: undefined,
  last_active: undefined,
  email: undefined,
} as unknown as naturalizeUser;

export const mockUserUpdateValue = {
  id: 1,
  platform_id: "1234567890",
  username: "Jane Doe",
  bot: false,
  status: UserStatus.ACTIVE,
  global_name: undefined,
  joined_at: undefined,
  platform_created_at: undefined,
  created_at: undefined,
  update_at: undefined,
  last_active: undefined,
  email: undefined,
} as unknown as naturalizeUser;

export const mockUserValue = {
  id: 1,
  platformId: "1234567890",
  username: "John Doe",
  bot: false,
  status: UserStatus.ACTIVE,
  globalName: undefined,
  joinedAt: undefined,
  createdAt: undefined,
  updateAt: undefined,
  lastActive: undefined,
  email: undefined,
};

//MessageRepository tests consts

export type messageDbModel = {
  id: number;
  channel_id: string;
  platform_id: string;
  user_id: string;
  is_deleted: boolean;
  platform_created_at: Date;
  created_at: Date;
};

export const mockDbMessageValue = {
  id: 1,
  platform_id: "1234567890",
  channel_id: "654341",
  user_id: "1",
  is_deleted: false,
  platform_created_at: new Date(),
  created_at: new Date(),
} as unknown as messageDbModel;

export const mockMessageValue = {
  id: 1,
  platformId: "1234567890",
  channelId: "654341",
  userId: "1",
  isDeleted: false,
  discordCreatedAt: undefined,
  createdAt: undefined,
};

export const mockMessageUpdateValue = {
  id: 1,
  platform_id: "1234567890",
  channel_id: "654341",
  user_id: "1",
  is_deleted: true,
  discord_created_at: new Date(),
  created_at: new Date(),
} as unknown as messageDbModel;

/**
 * @description Função para criar quantos mocks quiser do model Message
 * @param amount Quantidade de registros mockados a serem gerados
 * @param includeDeleted Se devem ser gerados inclusive mocks com is_deleted = true
 * @returns {messageDbModel[]} Lista de mensagens mockadas
 */
export function createNumerousMocks(amount, includeDeleted = false) {
  const mocks: messageDbModel[] = [];
  for (let i = 0; i < amount; i++) {
    mocks.push({
      ...mockDbMessageValue,
      id: i + 2,
      user_id: `${i + 10}`,
      platform_id: `${(i + 1) * 1000}`,
      channel_id: `${(i + 1) * 4000}`,
      is_deleted: includeDeleted && i % 2 === 0,
    });
  }

  return mocks;
}

//ChannelRepository tests consts

export const mockDbChannelValue = {
  id: 1,
  platform_id: "discordId",
  created_at: new Date(),
  name: "channelName",
  url: "channelUrl",
};

export const mockChannelEntityValue = {
  id: 1,
  platformId: "discordId",
  name: "channelName",
  url: "channelUrl",
  createdAt: mockDbChannelValue.created_at, // ou new Date() se preferir um novo objeto
};

export const mockChannelUpdatePayload = {
  name: "updatedChannelName",
  url: "updatedChannelUrl",
};

export const mockDbChannelUpdatedValue = {
  ...mockDbChannelValue,
  name: mockChannelUpdatePayload.name,
  url: mockChannelUpdatePayload.url,
};

// Audio event repository const mocks.
export const mockDate = new Date("2023-01-01T00:00:00.000Z");

export const mockDbAudioEventValue: PrismaAudioEvent = {
  id: 1,
  platform_id: "1234567890",
  channel_id: "101",
  creator_id: "202",
  name: "Test Event",
  description: "This is a test event.",
  status_id: "1",
  start_at: mockDate,
  end_at: new Date("2023-01-01T01:00:00.000Z"),
  user_count: 0,
  image: "http://example.com/image.png",
  created_at: mockDate,
};

export const mockAudioEventEntityValue = new AudioEventEntity(
  mockDbAudioEventValue.id,
  mockDbAudioEventValue.platform_id,
  mockDbAudioEventValue.channel_id,
  mockDbAudioEventValue.creator_id,
  mockDbAudioEventValue.name,
  mockDbAudioEventValue.status_id,
  mockDbAudioEventValue.start_at,
  mockDbAudioEventValue.end_at,
  mockDbAudioEventValue.user_count,
  mockDbAudioEventValue.created_at,
  mockDbAudioEventValue.description,
  mockDbAudioEventValue.image,
);

export const mockAudioEventCreatePayload: Omit<
  AudioEventEntity,
  "id" | "createdAt"
> = {
  platformId: "1234567890",
  channelId: "102",
  creatorId: "203",
  name: "New Event",
  description: "A brand new event",
  statusId: "2",
  startAt: new Date("2023-02-01T10:00:00.000Z"),
  endAt: new Date("2023-02-01T11:00:00.000Z"),
  userCount: 5,
  image: "http://example.com/new_image.png",
};

export const mockDbAudioEventCreatedValue: PrismaAudioEvent = {
  id: 2,
  platform_id: mockAudioEventCreatePayload.platformId,
  channel_id: mockAudioEventCreatePayload.channelId,
  creator_id: mockAudioEventCreatePayload.creatorId,
  name: mockAudioEventCreatePayload.name!,
  description: mockAudioEventCreatePayload.description!,
  status_id: mockAudioEventCreatePayload.statusId,
  start_at: mockAudioEventCreatePayload.startAt,
  end_at: mockAudioEventCreatePayload.endAt,
  user_count: mockAudioEventCreatePayload.userCount,
  image: mockAudioEventCreatePayload.image!,
  created_at: new Date("2023-02-01T09:00:00.000Z"), // Simulating DB generated
};

export const mockAudioEventUpdatePayload: Partial<
  Omit<AudioEventEntity, "id" | "createdAt" | "channelId" | "creatorId">
> = {
  name: "Updated Event Name",
  statusId: "3",
  userCount: 10,
};

export const mockDbAudioEventUpdatedValue: PrismaAudioEvent = {
  ...mockDbAudioEventValue,
  name: mockAudioEventUpdatePayload.name!,
  status_id: mockAudioEventUpdatePayload.statusId!,
  user_count: mockAudioEventUpdatePayload.userCount!,
};

//RoleRepository tests consts
export const mockDBRoleValue = {
  id: 1,
  platform_id: "1",
  name: "dev",
  created_at: new Date("2025-01-01"),
  platform_created_at: new Date("2025-01-01"),
  user_role: [{ user: mockDBUserValue }],
};

/**
 * Factory para criar um User do Prisma com dados completos
 */
export function createMockDbUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    platform_id: "user123",
    username: "TestUser",
    global_name: "Test User Global",
    joined_at: new Date("2023-01-01"),
    platform_created_at: new Date("2023-01-01"),
    update_at: new Date("2023-01-01"),
    last_active: new Date("2023-01-01"),
    create_at: new Date("2023-01-01"),
    bot: false,
    email: "test@test.com",
    status: UserStatus.ACTIVE,
    ...overrides,
  } as User;
}

/**
 * Factory para criar um Channel do Prisma com dados completos
 */
export function createMockDbChannel(overrides: Partial<Channel> = {}): Channel {
  return {
    id: 1,
    platform_id: "channel789",
    name: "test-channel",
    url: "https://discord.com/channels/123/789",
    created_at: new Date("2023-01-01"),
    ...overrides,
  } as Channel;
}

/**
 * Factory para criar um Message do Prisma com dados completos
 */
export function createMockDbMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: 1,
    platform_id: "message456",
    channel_id: "channel789",
    is_deleted: false,
    user_id: "user123",
    platform_created_at: new Date("2023-01-01"),
    created_at: new Date("2023-01-01"),
    ...overrides,
  } as Message;
}

/**
 * Factory para criar um MessageReaction do Prisma com dados completos
 */
export function createMockDbMessageReaction(
  overrides: Partial<MessageReaction> = {},
): MessageReaction {
  return {
    id: 1,
    user_id: "user123",
    message_id: "message456",
    channel_id: "channel789",
    ...overrides,
  } as MessageReaction;
}

/**
 * Factory para criar um Message com relacionamentos (como retornado pelo Prisma include)
 */
export function createMockDbMessageWithRelations(
  messageOverrides: Partial<Message> = {},
  userOverrides: Partial<User> = {},
  channelOverrides: Partial<Channel> = {},
  messageReactionsOverrides: Partial<MessageReaction>[] = [],
) {
  const user = createMockDbUser(userOverrides);
  const channel = createMockDbChannel(channelOverrides);
  const message = createMockDbMessage(messageOverrides);

  const messageReactions =
    messageReactionsOverrides.length > 0
      ? messageReactionsOverrides.map((override) =>
          createMockDbMessageReaction(override),
        )
      : [createMockDbMessageReaction()];

  return {
    ...message,
    user,
    channel,
    message_reaction: messageReactions,
  };
}

/**
 * Factory para criar UserEntity de teste
 */
export function createMockUserEntity(
  overrides: Partial<UserEntity> = {},
): UserEntity {
  const dbUser = createMockDbUser();
  const userEntity = UserEntity.fromPersistence(dbUser);
  return new UserEntity(
    overrides.id ?? userEntity.id,
    overrides.platformId ?? userEntity.platformId,
    overrides.username ?? userEntity.username,
    overrides.bot ?? userEntity.bot,
    overrides.status ?? userEntity.status,
    overrides.globalName ?? userEntity.globalName,
    overrides.joinedAt ?? userEntity.joinedAt,
    overrides.platformCreatedAt ?? userEntity.platformCreatedAt,
    overrides.createAt ?? userEntity.createAt,
    overrides.updateAt ?? userEntity.updateAt,
    overrides.lastActive ?? userEntity.lastActive,
    overrides.email ?? userEntity.email,
  );
}

/**
 * Factory para criar ChannelEntity de teste
 */
export function createMockChannelEntity(
  overrides: Partial<ChannelEntity> = {},
): ChannelEntity {
  const dbChannel = createMockDbChannel();
  const channelEntity = ChannelEntity.fromPersistence(dbChannel);
  return new ChannelEntity(
    overrides.id ?? channelEntity.id,
    overrides.platformId ?? channelEntity.platformId,
    overrides.name ?? channelEntity.name,
    overrides.url ?? channelEntity.url,
    overrides.createdAt ?? channelEntity.createdAt,
  );
}

/**
 * Factory para criar MessageReactionEntity de teste
 */
export function createMockMessageReactionEntity(
  userEntity?: UserEntity,
  messageEntity?: MessageEntity,
  channelEntity?: ChannelEntity,
  id: number = 1,
): MessageReactionEntity {
  return new MessageReactionEntity(
    id,
    userEntity ?? createMockUserEntity(),
    messageEntity ?? createMockMessageEntity(),
    channelEntity ?? createMockChannelEntity(),
  );
}

/**
 * Factory para criar MessageEntity de teste (versão atual - será atualizada na Fase 2)
 */
export function createMockMessageEntity(
  overrides: Partial<MessageEntity> = {},
): MessageEntity {
  const dbMessage = createMockDbMessage();
  const messageEntity = MessageEntity.fromPersistence(dbMessage);
  return new MessageEntity(
    overrides.channelId ?? messageEntity.channelId,
    overrides.platformId ?? messageEntity.platformId,
    overrides.platformCreatedAt ?? messageEntity.platformCreatedAt,
    overrides.isDeleted ?? messageEntity.isDeleted,
    overrides.userId ?? messageEntity.userId,
    overrides.id ?? messageEntity.id,
    overrides.createdAt ?? messageEntity.createdAt,
  );
}

// Mocks pré-configurados para compatibilidade com testes existentes
export const mockDbUserForRelations = createMockDbUser();
export const mockDbChannelForRelations = createMockDbChannel();
export const mockDbMessageForRelations = createMockDbMessage();
export const mockDbMessageReactionForRelations = createMockDbMessageReaction();

export const mockUserEntityForRelations = createMockUserEntity();
export const mockChannelEntityForRelations = createMockChannelEntity();
export const mockMessageEntityForRelations = createMockMessageEntity();
export const mockMessageReactionEntityForRelations =
  createMockMessageReactionEntity();
