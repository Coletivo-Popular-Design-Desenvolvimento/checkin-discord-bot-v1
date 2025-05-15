import { UserStatus } from "../../domain/types/UserStatusEnum";

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
}

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
}

export const mockMessageUpdateValue = {
  id: 1,
  discord_id: "1234567890",
  channel_id: 654341,
  user_id: 1,
  is_deleted: true,
  discord_created_at: new Date(),
  created_at: new Date(),
} as unknown as messageDbModel;