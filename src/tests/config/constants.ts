import { UserStatus } from "@type/UserStatusEnum";

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
