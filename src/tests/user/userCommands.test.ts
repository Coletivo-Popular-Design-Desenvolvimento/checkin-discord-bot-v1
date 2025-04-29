import { UserCommand } from "../../application/command/userCommand";
import { ICreateUser } from "../../domain/interfaces/useCases/user/ICreateUser";
import { IUpdateUser } from "../../domain/interfaces/useCases/user/IUpdateUser";
import { GuildMember, Collection, Guild, Client } from "discord.js";
import { ILoggerService } from "../../domain/interfaces/services/ILogger";
import UserEvents from "../../application/events/UserEvents";
import DiscordEvents from "../../application/events/DiscordEvents";
import { mockDBUserValue } from "../config/constants";
import { prismaMock } from "../config/singleton";
import { UserStatus } from "../../domain/types/UserStatusEnum";

jest.mock("../../application/events/UserEvents");
jest.mock("../../application/events/DiscordEvents");
jest.mock("../../contexts/DiscordModule");

describe("UserCommand", () => {
  let logger: jest.Mocked<ILoggerService>;
  let createUser: jest.Mocked<ICreateUser>;
  let updateUser: jest.Mocked<IUpdateUser>;
  let userCommand: UserCommand;
  let userEvents: jest.Mocked<UserEvents>;
  let discordEvents: jest.Mocked<DiscordEvents>;

  beforeEach(() => {
    prismaMock.$connect.mockReset();
    prismaMock.$disconnect.mockReset();

    // Mock Logger
    logger = {
      logToConsole: jest.fn(),
      logToDatabase: jest.fn(),
    } as unknown as jest.Mocked<ILoggerService>;

    createUser = {
      execute: jest.fn().mockResolvedValue(mockDBUserValue),
      executeMany: jest.fn().mockResolvedValue([mockDBUserValue]),
    } as jest.Mocked<ICreateUser>;

    updateUser = {
      executeInvertUserStatus: jest.fn().mockResolvedValue(mockDBUserValue),
      execute: jest.fn(),
    } as unknown as jest.Mocked<IUpdateUser>;

    const mockClient = {
      guilds: {
        cache: new Collection(),
        fetch: jest.fn(),
      },
    } as unknown as Client;

    userEvents = {
      onNewUser: jest.fn((callback) => {
        return callback;
      }),
      onUserLeave: jest.fn((callback) => {
        return callback;
      }),
      client: mockClient,
    } as unknown as jest.Mocked<UserEvents>;

    discordEvents = {
      onDiscordStart: jest.fn((callback) => {
        return callback;
      }),
    } as unknown as jest.Mocked<DiscordEvents>;

    userCommand = new UserCommand(logger, createUser, updateUser);
  });

  describe("executeNewUser", () => {
    it("should call createUser.execute when a new user joins", async () => {
      const mockMember = {
        id: "123",
        user: {
          username: "test",
          bot: false,
          globalName: "TestUser",
          createdTimestamp: Date.now(),
        },
        joinedTimestamp: Date.now(),
      } as unknown as GuildMember;

      const newUserHandler = jest.fn();
      (userEvents.onNewUser as jest.Mock).mockImplementation((callback) => {
        newUserHandler.mockImplementation(callback);
        return callback;
      });

      await userCommand.executeNewUser(userEvents);
      await newUserHandler(mockMember);

      expect(createUser.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          discordId: "123",
          username: "test",
          globalName: "TestUser",
          bot: false,
          status: UserStatus.ACTIVE,
        })
      );
    });
  });

  describe("executeAllUsers", () => {
    it("should call createUser.executeMany with all guild members", async () => {
      const mockMember1 = {
        id: "123",
        user: {
          username: "test1",
          bot: false,
          globalName: "TestUser1",
          createdTimestamp: Date.now(),
        },
        joinedTimestamp: Date.now(),
      } as unknown as GuildMember;

      const mockMember2 = {
        id: "456",
        user: {
          username: "test2",
          bot: false,
          globalName: "TestUser2",
          createdTimestamp: Date.now(),
        },
        joinedTimestamp: Date.now(),
      } as unknown as GuildMember;

      const mockGuild = {
        members: {
          fetch: jest.fn().mockResolvedValue(
            new Collection([
              ["123", mockMember1],
              ["456", mockMember2],
            ])
          ),
        },
      } as unknown as Guild;

      (userEvents.client.guilds.fetch as jest.Mock).mockResolvedValue(mockGuild);
      
      const discordStartHandler = jest.fn();
      (discordEvents.onDiscordStart as jest.Mock).mockImplementation((callback) => {
        discordStartHandler.mockImplementation(callback);
        return callback;
      });

      await userCommand.executeAllUsers(discordEvents, userEvents);
      await discordStartHandler();

      expect(createUser.executeMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            discordId: "123",
            username: "test1",
          }),
          expect.objectContaining({
            discordId: "456",
            username: "test2",
          }),
        ])
      );
    });
  });

  describe("executeUserLeave", () => {
    it("should call updateUser.executeInvertUserStatus when user leaves", async () => {
      const mockMember = { 
        id: "123",
        user: {
          username: "test",
          bot: false,
        }
      } as unknown as GuildMember;

      const userLeaveHandler = jest.fn();
      (userEvents.onUserLeave as jest.Mock).mockImplementation((callback) => {
        userLeaveHandler.mockImplementation(callback);
        return callback;
      });

      await userCommand.executeUserLeave(userEvents);
      await userLeaveHandler(mockMember);

      expect(updateUser.executeInvertUserStatus).toHaveBeenCalledWith("123");
    });
  });

  describe("toUserEntity", () => {
    it("should correctly convert GuildMember to UserEntity", () => {
      const mockMember = {
        id: "123",
        user: {
          username: "test",
          bot: false,
          globalName: "TestUser",
          createdTimestamp: Date.now(),
        },
        joinedTimestamp: Date.now(),
      } as unknown as GuildMember;

      const result = UserCommand.toUserEntity(mockMember);

      expect(result).toEqual({
        discordId: "123",
        username: "test",
        globalName: "TestUser",
        bot: false,
        status: UserStatus.ACTIVE,
        discordCreatedAt: expect.any(Date),
        joinedAt: expect.any(Date),
        lastActive: undefined,
      });
    });
  });
});