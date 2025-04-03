import { UserCommand } from "../../application/command/userCommand";
import { IDiscordService } from "../../domain/interfaces/services/IDiscordService";
import { ICreateUser } from "../../domain/interfaces/useCases/user/ICreateUser";
import { IUpdateUser } from "../../domain/interfaces/useCases/user/IUpdateUser";
import {
  Client,
  Collection,
  Guild,
  GuildMember,
  Message,
  PartialGuildMember,
} from "discord.js";
import { ILoggerService } from "../../domain/interfaces/services/ILogger";

jest.mock("../../domain/interfaces/services/ILogger");

describe("UserCommand", () => {
  let discordService: jest.Mocked<
    IDiscordService<Message, GuildMember, PartialGuildMember, Client>
  >;
  let createUser: jest.Mocked<ICreateUser>;
  let updateUser: jest.Mocked<IUpdateUser>;
  let userCommand: UserCommand;

  beforeEach(() => {
    // Mock Discord service with basic client structure
    discordService = {
      onNewUser: jest.fn(),
      onDiscordStart: jest.fn(),
      onUserLeave: jest.fn(),
      client: {
        guilds: {
          cache: new Map([["guild1", { id: "123456789" }]]), // Corrected Map structure
          fetch: jest.fn().mockResolvedValue({ members: { fetch: jest.fn() } }), // Mocking a fetch method for members
        },
      } as unknown as Client,
    } as unknown as jest.Mocked<
      IDiscordService<Message, GuildMember, PartialGuildMember, Client>
    >;

    // Mock CreateUser and UpdateUser use cases
    createUser = {
      execute: jest.fn(),
      executeMany: jest.fn(),
    } as jest.Mocked<ICreateUser>;
    updateUser = {
      executeInvertUserStatus: jest.fn(),
      execute: jest.fn(),
    } as unknown as jest.Mocked<IUpdateUser>;

    // Instantiate UserCommand with mocked dependencies
    userCommand = new UserCommand(
      discordService,
      {} as ILoggerService,
      createUser,
      updateUser
    );
  });

  it("should call createUser.execute when a new user joins", async () => {
    const mockMember = {
      id: "123",
      user: {
        username: "test",
        bot: false,
        globalName: "TestUser",
        createdAt: new Date(),
      },
      joinedAt: new Date(),
    } as GuildMember;
    const handler = jest.fn();
    (discordService.onNewUser as jest.Mock).mockImplementation(
      (cb) => handler.mockImplementation(cb) // Capture the callback for later execution
    );

    await userCommand.executeNewUser();
    handler(mockMember); // Simulate a user joining

    expect(createUser.execute).toHaveBeenCalledWith(
      UserCommand.toUserEntity(mockMember)
    );
  });

  it("should call createUser.executeMany when Discord starts", async () => {
    const mockMember1 = {
      id: "123",
      user: {
        username: "test1",
        bot: false,
        globalName: "TestUser1",
        createdAt: new Date(),
      },
      joinedAt: new Date(),
    } as GuildMember;
    const mockMember2 = {
      id: "456",
      user: {
        username: "test2",
        bot: false,
        globalName: "TestUser2",
        createdAt: new Date(),
      },
      joinedAt: new Date(),
    } as GuildMember;

    // Mocking a guild with members that can be fetched
    const guild = {
      members: {
        fetch: jest.fn().mockResolvedValue(
          new Collection([
            ["123", mockMember1],
            ["456", mockMember2],
          ])
        ),
      },
    } as unknown as Guild;

    (discordService.client.guilds.fetch as jest.Mock).mockResolvedValue(guild);
    const handler = jest.fn();
    (discordService.onDiscordStart as jest.Mock).mockImplementation((cb) => {
      cb(); // Trigger the event
    });

    await userCommand.executeAllUsers();
    handler(); // Simulate the event trigger

    const members = await guild.members.fetch();

    expect(createUser.executeMany).toHaveBeenCalledWith(
      members.map((member) => UserCommand.toUserEntity(member))
    );
  });

  it("should call updateUser.executeDisableUser when a user leaves", async () => {
    const mockMember = { id: "123" } as GuildMember;
    const handler = jest.fn();
    (discordService.onUserLeave as jest.Mock).mockImplementation(
      (cb) => handler.mockImplementation(cb) // Capture the callback
    );

    await userCommand.executeUserLeave();
    handler(mockMember); // Simulate a user leaving

    expect(updateUser.executeInvertUserStatus).toHaveBeenCalledWith("123");
  });
});
