import {
  Client,
  Events,
  Message,
  GuildMember,
  PartialGuildMember,
} from "discord.js";
import { DiscordService } from "@discord/DiscordService";

describe("DiscordService", () => {
  let client: Client;
  let discordService: DiscordService;

  beforeEach(() => {
    client = new Client({ intents: [] }); // Mock client
    jest.spyOn(client, "on"); // Spy on event registration
    jest.spyOn(client, "once");
    discordService = new DiscordService(client);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should register event listeners when registerEvents is called", () => {
    discordService.registerEvents();

    expect(client.once).toHaveBeenCalledWith(
      Events.ClientReady,
      expect.any(Function),
    );
    expect(client.on).toHaveBeenCalledWith(
      Events.MessageCreate,
      expect.any(Function),
    );
    expect(client.on).toHaveBeenCalledWith(
      Events.GuildMemberAdd,
      expect.any(Function),
    );
    expect(client.on).toHaveBeenCalledWith(
      Events.GuildMemberRemove,
      expect.any(Function),
    );
  });

  it("should call all onDiscordStart handlers when the client is ready", () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    discordService.onDiscordStart(handler1);
    discordService.onDiscordStart(handler2);

    discordService.registerEvents();
    const readyCallback = (client.once as jest.Mock).mock.calls.find(
      (call) => call[0] === Events.ClientReady,
    )?.[1];

    readyCallback?.(); // Simulate client ready event

    expect(handler1).toHaveBeenCalled();
    expect(handler2).toHaveBeenCalled();
  });

  it("should call all onMessage handlers when a message is created", () => {
    const handler = jest.fn();
    discordService.onMessage(handler);

    discordService.registerEvents();
    const messageCallback = (client.on as jest.Mock).mock.calls.find(
      (call) => call[0] === Events.MessageCreate,
    )?.[1];

    const mockMessage = { content: "Hello" } as Message;
    messageCallback?.(mockMessage);

    expect(handler).toHaveBeenCalledWith(mockMessage);
  });

  it("should call all onNewUser handlers when a user joins", () => {
    const handler = jest.fn();
    discordService.onNewUser(handler);

    discordService.registerEvents();
    const joinCallback = (client.on as jest.Mock).mock.calls.find(
      (call) => call[0] === Events.GuildMemberAdd,
    )?.[1];

    const mockMember = { id: "1234" } as GuildMember;
    joinCallback?.(mockMember);

    expect(handler).toHaveBeenCalledWith(mockMember);
  });

  it("should call all onUserLeave handlers when a user leaves", () => {
    const handler = jest.fn();
    discordService.onUserLeave(handler);

    discordService.registerEvents();
    const leaveCallback = (client.on as jest.Mock).mock.calls.find(
      (call) => call[0] === Events.GuildMemberRemove,
    )?.[1];

    const mockMember = { id: "5678" } as PartialGuildMember;
    leaveCallback?.(mockMember);

    expect(handler).toHaveBeenCalledWith(mockMember);
  });
});
