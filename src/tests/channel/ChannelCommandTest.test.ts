import { ChannelCommand } from "../../application/command/channelCommand";
import ICreateChannelUseCase from "../../domain/interfaces/useCases/channel/ICreateChannelUseCase";
import IUpdateChannelUseCase from "../../domain/interfaces/useCases/channel/IUpdateChannelUseCase";
import ICreateManyChannelUseCase from "../../domain/interfaces/useCases/channel/ICreateManyChannelUseCase";
import { ILoggerService } from "../../domain/interfaces/services/ILogger";
import { GuildChannel, Collection, Guild, Client } from "discord.js"; // Adicionado Client aqui
import ChannelEvents from "../../application/events/ChannelEvents";
import DiscordEvents from "../../application/events/DiscordEvents";
import { mockDBUserValue } from "../config/constants";
import { prismaMock } from "../config/singleton";
import { DiscordModule } from "../../contexts/DiscordModule";
import { GenericOutputDto } from "../../domain/dtos/GenericOutputDto"; // Nova importação
import ChannelEntity from "../../domain/entities/Channel";

jest.mock("../../application/events/ChannelEvents");
jest.mock("../../application/events/DiscordEvents");
jest.mock("../../contexts/DiscordModule");

describe("ChannelCommand", () => {
        let logger: jest.Mocked<ILoggerService>;
        let createChannel: jest.Mocked<ICreateChannelUseCase>;
        let updateChannel: jest.Mocked<IUpdateChannelUseCase>;
        let createManyChannels: jest.Mocked<ICreateManyChannelUseCase>;
        let channelCommand: ChannelCommand;
        let channelEvents: jest.Mocked<ChannelEvents>;
        let discordEvents: jest.Mocked<DiscordEvents>;

    beforeEach(() => {
        prismaMock.$connect.mockReset();
        prismaMock.$disconnect.mockReset();
        logger = {
            logToConsole: jest.fn(),
            logToDatabase: jest.fn(),
        } as unknown as jest.Mocked<ILoggerService>;
        // Mock Use Cases com GenericOutputDto correto
        createChannel = {
            executeAsync: jest.fn().mockResolvedValue({ 
                success: true, 
                message: "",
                data: mockDBUserValue // Adicionado data
            }),
        } as jest.Mocked<ICreateChannelUseCase>;
        updateChannel = {
            executeAsync: jest.fn().mockResolvedValue({ 
                success: true, 
                message: "",
                data: mockDBUserValue // Adicionado data
            }),
        } as jest.Mocked<IUpdateChannelUseCase>;
        createManyChannels = {
            executeAsync: jest.fn().mockResolvedValue({ 
                success: true, 
                message: "",
                data: [mockDBUserValue] // Adicionado data
            }),
        } as jest.Mocked<ICreateManyChannelUseCase>;
        // Create a proper mock Client
        const mockClient = {
            guilds: {
                cache: new Collection(),
                fetch: jest.fn(),
            },
        } as unknown as Client;
        // Mock ChannelEvents and DiscordEvents
        channelEvents = {
            onChannelCreate: jest.fn((callback) => {
                return callback;
            }),
            onChannelUpdate: jest.fn((callback) => {
                return callback;
            }),
            client: mockClient,
        } as unknown as jest.Mocked<ChannelEvents>;
        discordEvents = {
            onDiscordStart: jest.fn((callback) => {
                return callback;
            }),
        } as unknown as jest.Mocked<DiscordEvents>;
        // Mock DiscordModule
        (DiscordModule.getChannelEvents as jest.Mock).mockReturnValue(channelEvents);
        (DiscordModule.getDiscordEvents as jest.Mock).mockReturnValue(discordEvents);
        // Instantiate ChannelCommand with mocked dependencies
        channelCommand = new ChannelCommand(
        logger,
        createChannel,
        updateChannel,
        createManyChannels
        );
    });

    describe("executeNewChannel", () => {
        it("should call createChannel.executeAsync when a new channel is created", async () => {
            const testDate = new Date();
            const mockChannel = {
                id: "123",
                name: "test-channel",
                url: "https://discord.com/channels/123/456",
                createdAt: testDate,
            } as unknown as GuildChannel;

            const channelCreateHandler = jest.fn();
            (channelEvents.onChannelCreate as jest.Mock).mockImplementation((callback) => {
                channelCreateHandler.mockImplementation(callback);
                return callback;
            });

            await channelCommand.executeNewChannel(channelEvents);
            await channelCreateHandler(mockChannel);

            expect(createChannel.executeAsync).toHaveBeenCalledWith({
                discordId: "123",
                name: "test-channel",
                url: "https://discord.com/channels/123/456",
                createAt: testDate,
            });
        });
    });

    it("should log error when createChannel fails", async () => {
        const mockChannel = {
              id: "123",
              name: "test-channel",
              url: "https://discord.com/channels/123/456",
              createdTimestamp: Date.now(),
        } as unknown as GuildChannel;
        const errorMessage = "Failed to create channel";
        createChannel.executeAsync.mockResolvedValue({
            success: false,
            message: errorMessage,
            data: {
                discordId: "123",
                name: "test-channel",
                url: "https://discord.com/channels/123/456",
                createAt: new Date(),
          } as ChannelEntity
        });
        const channelCreateHandler = jest.fn();
        (channelEvents.onChannelCreate as jest.Mock).mockImplementation((callback) => {
            channelCreateHandler.mockImplementation(callback);
            return callback;
        });
        await channelCommand.executeNewChannel(channelEvents);
        await channelCreateHandler(mockChannel);
        expect(logger.logToConsole).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(String),
            expect.any(String),
            `executeNewChannel | ${errorMessage}`
        );
    });

    describe("executeUpdateChannelExisting", () => {
        it("should call updateChannel.executeAsync when a channel is updated", async () => {
            const testDate = new Date();
            const oldChannel = {
                id: "123",
                name: "old-channel",
                url: "https://discord.com/channels/123/456",
            } as unknown as GuildChannel;
        
            const newChannel = {
                id: "123",
                name: "new-channel",
                url: "https://discord.com/channels/123/456",
                createdAt: testDate,
            } as unknown as GuildChannel;
        
            const channelUpdateHandler = jest.fn();
            (channelEvents.onChannelUpdate as jest.Mock).mockImplementation((callback) => {
                channelUpdateHandler.mockImplementation(callback);
                return callback;
            });
        
            await channelCommand.executeUpdateChannelExisting(channelEvents);
            await channelUpdateHandler(oldChannel, newChannel);
        
            expect(updateChannel.executeAsync).toHaveBeenCalledWith(
                oldChannel, {
                    discordId: "123",
                    name: "new-channel",
                    url: "https://discord.com/channels/123/456",
                    createAt: testDate,
                }
            );
        });
    });
  
    describe("mapToChannelEntity", () => {
        it("should correctly convert GuildChannel to ChannelEntity", () => {
            const testDate = new Date();
            const mockChannel = {
                id: "123",
                name: "test-channel",
                url: "https://discord.com/channels/123/456",
                createdAt: testDate,
            } as unknown as GuildChannel;
        
            const result = channelCommand["mapToChannelEntity"](mockChannel);
        
            expect(result).toEqual({
                discordId: "123",
                name: "test-channel",
                url: "https://discord.com/channels/123/456",
                createAt: testDate,
            });
        });
    });
});