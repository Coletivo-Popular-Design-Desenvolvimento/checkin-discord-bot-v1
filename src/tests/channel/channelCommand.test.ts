import { ChannelCommand } from "@application/command/channelCommand";
import { IDiscordService } from "@domain/interfaces/services/IDiscordService";
import { ILoggerService } from "@domain/interfaces/services/ILogger";
import { ICreateChannel } from "@domain/interfaces/useCases/channel/ICreateChannel";
import { IDeleteChannel } from "@domain/interfaces/useCases/channel/IDeleteChannel";
import { IUpdateChannel } from "@domain/interfaces/useCases/channel/IUpdateChannel";
import {
  Client,
  Events,
  GuildChannel,
  GuildMember,
  Message,
  PartialGuildMember,
} from "discord.js";

type DiscordServiceMockType = IDiscordService<
  Message,
  GuildMember,
  PartialGuildMember,
  Client
>;

describe("ChannelCommand", () => {
  let channelCommand: ChannelCommand;

  let createChannel: jest.Mocked<ICreateChannel>;
  let updateChannel: jest.Mocked<IUpdateChannel>;
  let deleteChannel: jest.Mocked<IDeleteChannel>;
  let discordService: jest.Mocked<DiscordServiceMockType>;

  beforeEach(() => {
    discordService = <jest.Mocked<DiscordServiceMockType>>{
      client: <Client>(<unknown>{
        on: jest.fn(),
      }),
    };
    createChannel = {
      execute: jest.fn(),
    } as jest.Mocked<ICreateChannel>;
    updateChannel = {
      execute: jest.fn(),
    } as jest.Mocked<IUpdateChannel>;
    deleteChannel = {
      execute: jest.fn(),
    } as jest.Mocked<IDeleteChannel>;
    channelCommand = new ChannelCommand(
      discordService,
      {} as ILoggerService,
      createChannel,
      updateChannel,
      deleteChannel,
    );
  });

  it("should call createChannel.execute when a new channel created", async () => {
    const channelMock = <GuildChannel>{
      id: "1",
      name: "my-channel",
      url: "https://discord.com/channels/999999999999999999/999999999999999999",
      createdAt: new Date(),
    };

    const eventCallbacks = new Map();
    (discordService.client.on as jest.Mock).mockImplementation(
      (event, callback) => {
        eventCallbacks.set(event, callback);
      },
    );

    await channelCommand.handleCreateChannel();

    const channelCreateCallback = eventCallbacks.get(Events.ChannelCreate);
    expect(channelCreateCallback).toBeDefined();

    await channelCreateCallback(channelMock);

    expect(createChannel.execute).toHaveBeenCalledWith(
      ChannelCommand.toChannelCreateEntity(channelMock),
    );
  });

  it("should call updateChannel.execute when send data to update channel", async () => {
    const channelIdMock = {
      id: "1234567890",
    };
    const oldChannelMock = <GuildChannel>{
      ...channelIdMock,
      name: "old-channel-name",
      url: "https://discord.com/channels/999999999999999999/999999999999999999",
      createdAt: new Date("2024-01-01"),
    };

    const newChannelMock = <GuildChannel>{
      ...channelIdMock,
      name: "new-channel-name",
      url: "https://discord.com/channels/999999999999999999/999999999999999999",
      createdAt: new Date(),
    };

    const eventCallbacks = new Map();
    (discordService.client.on as jest.Mock).mockImplementation(
      (event, callback) => {
        eventCallbacks.set(event, callback);
      },
    );

    await channelCommand.handleUpdateChannel();

    const channelUpdateCallback = eventCallbacks.get(Events.ChannelUpdate);
    expect(channelUpdateCallback).toBeDefined();

    await channelUpdateCallback(oldChannelMock, newChannelMock);

    expect(updateChannel.execute).toHaveBeenCalledWith(
      channelIdMock.id,
      ChannelCommand.toChannelCreateEntity(newChannelMock),
    );
  });

  it("should call deleteChannel.execute when channel is deleted", async () => {
    const channelMock = {
      id: "12345",
    } as GuildChannel;

    let deleteCallback: (channel: GuildChannel) => Promise<void>;

    (discordService.client.on as jest.Mock).mockImplementation(
      (event, callback) => {
        if (event === Events.ChannelDelete) {
          deleteCallback = callback;
        }
      },
    );

    await channelCommand.handleDeleteChannel();
    await deleteCallback!(channelMock);

    expect(deleteChannel.execute).toHaveBeenCalledWith("12345");
  });
});
