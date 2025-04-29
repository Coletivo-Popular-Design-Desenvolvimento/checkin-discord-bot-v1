jest.mock("discord.js", () => {
  const actual = jest.requireActual("discord.js");
  return {
    ...actual,
    Client: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      once: jest.fn(),
      login: jest.fn(),
    })),
  };
});

import { Client, GatewayIntentBits } from "discord.js";
import { DiscordModule } from "../../contexts/DiscordModule"
import { DiscordService } from "../../infrastructure/discord/DiscordService";
import { Logger } from "../../application/services/Logger";
import DiscordEvents from "../../application/events/DiscordEvents";
import UserEvents from "../../application/events/UserEvents";
import ChannelEvents from "../../application/events/ChannelEvents";
import MessageEvents from "../../application/events/MessageEvents";

jest.mock("../../application/events/DiscordEvents");
jest.mock("../../application/events/UserEvents");
jest.mock("../../application/events/ChannelEvents");
jest.mock("../../application/events/MessageEvents");

const mockLogger: jest.Mocked<Logger> = {
  logToConsole: jest.fn(),
  logToDatabase: jest.fn(),
  // Adicione aqui todos os métodos que existem na sua classe Logger real
  // Por exemplo, se você tiver:
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  // ... outros métodos que seu Logger possui
} as any;

jest.mock("../../application/events/DiscordEvents");
jest.mock("../../application/events/UserEvents");
jest.mock("../../application/events/ChannelEvents");
jest.mock("../../application/events/MessageEvents");

describe("DiscordModule", () => {
  afterEach(() => {
    jest.clearAllMocks();
    // Reset the singleton instance
    (DiscordModule as any).instance = undefined;
    (DiscordModule as any).client = undefined;
    (DiscordModule as any).channelEvents = undefined;
    (DiscordModule as any).discordEvents = undefined;
    (DiscordModule as any).messageEvents = undefined;
    (DiscordModule as any).userEvents = undefined;
  });

  describe("initialize", () => {
    it("should create a new instance when first initialized", () => {
      const instance = DiscordModule.intiialize(mockLogger);
      
      expect(instance).toBeInstanceOf(DiscordService);
      expect(Client).toHaveBeenCalledTimes(1);
      expect(Client).toHaveBeenCalledWith({
        intents: expect.arrayContaining([
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.GuildMembers,
          GatewayIntentBits.Guilds,
        ]),
      });
    });

    it("should return the same instance on subsequent calls", () => {
      const firstInstance = DiscordModule.intiialize(mockLogger);
      const secondInstance = DiscordModule.intiialize(mockLogger);
      
      expect(firstInstance).toBe(secondInstance);
      expect(Client).toHaveBeenCalledTimes(1); // Client should only be created once
    });

    it("should initialize all event handlers", () => {
      DiscordModule.intiialize(mockLogger);
      
      expect(DiscordEvents).toHaveBeenCalled();
      expect(UserEvents).toHaveBeenCalled();
      expect(ChannelEvents).toHaveBeenCalled();
      expect(MessageEvents).toHaveBeenCalled();
    });
  });

  describe("getInstance", () => {
    it("should return the initialized instance", () => {
      const initializedInstance = DiscordModule.intiialize(mockLogger);
      const retrievedInstance = DiscordModule.getInstance();
      
      expect(retrievedInstance).toBe(initializedInstance);
    });

    it("should throw error if not initialized", () => {
      expect(() => DiscordModule.getInstance()).toThrowError(
        "DiscordModule not initialized"
      );
    });
  });

  describe("getter methods", () => {
    beforeEach(() => {
      DiscordModule.intiialize(mockLogger);
    });

    it("should return ChannelEvents instance", () => {
      const channelEvents = DiscordModule.getChannelEvents();
      expect(channelEvents).toBeInstanceOf(ChannelEvents);
    });

    it("should return UserEvents instance", () => {
      const userEvents = DiscordModule.getUserEvents();
      expect(userEvents).toBeInstanceOf(UserEvents);
    });

    it("should return DiscordEvents instance", () => {
      const discordEvents = DiscordModule.getDiscordEvents();
      expect(discordEvents).toBeInstanceOf(DiscordEvents);
    });

    it("should throw error if events are accessed before initialization", () => {
      (DiscordModule as any).channelEvents = undefined;
      (DiscordModule as any).userEvents = undefined;
      (DiscordModule as any).discordEvents = undefined;

      expect(() => DiscordModule.getChannelEvents()).toThrowError(
        "ChannelEvents not initialized"
      );
      expect(() => DiscordModule.getUserEvents()).toThrowError(
        "UserEvents not initialized"
      );
      expect(() => DiscordModule.getDiscordEvents()).toThrowError(
        "DiscordEvents not initialized"
      );
    });
  });
});