export type naturalizeUser = {
  id: number;
  discord_id: string;
  username: string;
  global_name: string | null;
  joined_at: number | null;
  created_at: number | null;
  update_at: number | null;
  last_active: number | null;
  bot: boolean;
  email: string | null;
};

export const mockDBUserValue = {
  id: 1,
  discord_id: "1234567890",
  username: "John Doe",
  bot: false,
  global_name: undefined,
  joined_at: undefined,
  created_at: undefined,
  update_at: undefined,
  last_active: undefined,
  email: undefined,
} as unknown as naturalizeUser;

export const mockUserUpdateValue = {
  id: 1,
  discord_id: "1234567890",
  username: "Jane Doe",
  bot: false,
  global_name: undefined,
  joined_at: undefined,
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
  globalName: undefined,
  joinedAt: undefined,
  createdAt: undefined,
  updateAt: undefined,
  lastActive: undefined,
  email: undefined,
};
