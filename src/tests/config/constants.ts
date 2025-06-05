import { UserStatus } from "@type/UserStatusEnum";
import { AudioEvent as PrismaAudioEvent } from "@prisma/client";
import { AudioEventEntity } from "@domain/entities/AudioEvent";

export type naturalizeUser = {
  id: number;
  discord_id: string;
  username: string;
  status: number;
  global_name: string | null;
  joined_at: Date | null;
  discord_created_at: Date | null;
  create_at: Date | null;
  update_at: Date | null;
  last_active: Date | null;
  bot: boolean;
  email: string | null;
};

export const mockDBUserValue = {
  id: 1,
  discord_id: "1234567890",
  username: "John Doe",
  bot: false,
  status: UserStatus.ACTIVE,
  global_name: undefined,
  joined_at: undefined,
  discord_created_at: undefined,
  create_at: undefined,
  update_at: undefined,
  last_active: undefined,
  email: undefined,
} as unknown as naturalizeUser;

export const mockUserUpdateValue = {
  id: 1,
  discord_id: "1234567890",
  username: "Jane Doe",
  bot: false,
  status: UserStatus.ACTIVE,
  global_name: undefined,
  joined_at: undefined,
  discord_created_at: undefined,
  created_at: undefined,
  update_at: undefined,
  last_active: undefined,
  email: undefined,
} as unknown as naturalizeUser;

export const mockUserValue = {
  id: 1,
  discordId: "1234567890",
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
  channel_id: number;
  discord_id: string;
  user_id: number;
  is_deleted: boolean;
  discord_created_at: Date;
  created_at: Date;
};

export const mockDbMessageValue = {
  id: 1,
  discord_id: "1234567890",
  channel_id: 654341,
  user_id: 1,
  is_deleted: false,
  discord_created_at: new Date(),
  created_at: new Date(),
} as unknown as messageDbModel;

export const mockMessageValue = {
  id: 1,
  discordId: "1234567890",
  channelId: 654341,
  userId: 1,
  isDeleted: false,
  discordCreatedAt: undefined,
  createdAt: undefined,
};

export const mockMessageUpdateValue = {
  id: 1,
  discord_id: "1234567890",
  channel_id: 654341,
  user_id: 1,
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
      user_id: i + 10,
      discord_id: `${(i + 1) * 1000}`,
      channel_id: (i + 1) * 4000,
      is_deleted: includeDeleted && i % 2 === 0,
    });
  }

  return mocks;
}

//ChannelRepository tests consts

export const mockDbChannelValue = {
  id: 1,
  discord_id: "discordId",
  created_at: new Date(),
  name: "channelName",
  url: "channelUrl",
};

export const mockChannelEntityValue = {
  id: 1,
  discordId: "discordId",
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
  channel_id: 101,
  creator_id: 202,
  name: "Test Event",
  description: "This is a test event.",
  status_id: 1,
  start_at: mockDate,
  end_at: new Date("2023-01-01T01:00:00.000Z"),
  user_count: 0,
  image: "http://example.com/image.png",
  created_at: mockDate,
};

export const mockAudioEventEntityValue = new AudioEventEntity(
  mockDbAudioEventValue.id,
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
  channelId: 102,
  creatorId: 203,
  name: "New Event",
  description: "A brand new event",
  statusId: 2,
  startAt: new Date("2023-02-01T10:00:00.000Z"),
  endAt: new Date("2023-02-01T11:00:00.000Z"),
  userCount: 5,
  image: "http://example.com/new_image.png",
};

export const mockDbAudioEventCreatedValue: PrismaAudioEvent = {
  id: 2,
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
  statusId: 3,
  userCount: 10,
};

export const mockDbAudioEventUpdatedValue: PrismaAudioEvent = {
  ...mockDbAudioEventValue,
  name: mockAudioEventUpdatePayload.name!,
  status_id: mockAudioEventUpdatePayload.statusId!,
  user_count: mockAudioEventUpdatePayload.userCount!,
};
