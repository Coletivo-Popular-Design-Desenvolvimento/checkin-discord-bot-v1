import { ILoggerService } from "../../domain/interfaces/services/ILogger";
import { prismaMock } from "../config/singleton";
import { mockDBChannelValue } from "../config/constants";
import ICreateChannelUseCase from "../../domain/interfaces/useCases/channel/ICreateChannelUseCase";
import IUpdateChannelUseCase from "../../domain/interfaces/useCases/channel/IUpdateChannelUseCase";
import { ChannelCommand } from "../../application/command/channelCommand"
import ChannelEvents from "../../application/events/ChannelEvents";
import DiscordEvents from "../../application/events/DiscordEvents";
import { Client, Collection, GuildChannel } from "discord.js";
import ICreateManyChannelUseCase from "../../domain/interfaces/useCases/channel/ICreateManyChannelUseCase";
import IChannelEvents from "../../domain/interfaces/events/IChannelEvents";

const mockChannelValue = {
    id: 1,
    discordId: 'ASDHJQIUWYEHQ',
    name: 'WASDSWEQEWSADWA',
    url: 'http://dicord/teste/123/456',
    createAt: new Date()
}

const mockChannelValue2 = {
    id: 2,
    discordId: 'ASDHJQIUWYEHQ',
    name: 'WASDSWEQEWSADWA',
    url: 'http://dicord/teste/123/456',
    createAt: new Date()
}

describe("Channel useCases", () => {
    let logger: jest.Mocked<ILoggerService>;
    let createChannel: jest.Mocked<ICreateChannelUseCase>;
    let createManyChannel: jest.Mocked<ICreateManyChannelUseCase>;
    let updateChannel: jest.Mocked<IUpdateChannelUseCase>;
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

        createChannel = {
            executeAsync: jest.fn().mockResolvedValue(mockDBChannelValue)
        } as jest.Mocked<ICreateChannelUseCase>;

        createManyChannel = {
            executeAsync: jest.fn().mockResolvedValue(mockDBChannelValue)
        }

        updateChannel = {
            executeAsync: jest.fn()
        } as unknown as jest.Mocked<IUpdateChannelUseCase>;

        const mockClient = {
            guilds: {
              cache: new Collection(),
              fetch: jest.fn(),
            },
          } as unknown as Client;

        channelEvents = {
            onChannelCreate: jest.fn((callback) => {
                return callback;
            }),
            onChannelUpdate: jest.fn((callback) => {
                return callback;
            }),
            client: mockClient
        } as unknown as jest.Mocked<ChannelEvents>;

        discordEvents = {
            onDiscordStart: jest.fn((callback) => {
                return callback;
            }),
        } as unknown as jest.Mocked<DiscordEvents>;

        channelCommand = new ChannelCommand(logger, createChannel, updateChannel, createManyChannel)
    });

    describe("createChannel", () => {
        it("should create new channel", async () => {
            // -- ARRANGE --
            const mockChannel = {
                id: 1,
                discordId: "QWEASDZXC",
                name: "ZezinhoTeste",
                url: "https:/discord/teste/123/456",
                createAt: new Date()
            } as unknown as GuildChannel

            const newChannelHandler = jest.fn();
            (channelEvents.onChannelCreate as jest.Mock).mockImplementation((callback) => {
                newChannelHandler.mockImplementation(callback);
                return callback;
            });

            //-- ACT --
            const result = await channelCommand.executeNewChannel(channelEvents);
            await newChannelHandler(mockChannel);

            //-- ASSERT --
            expect(result).toBeUndefined();
        });
    });
});