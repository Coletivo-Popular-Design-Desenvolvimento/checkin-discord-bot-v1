import { ChannelType, Client } from "discord.js";
import { DiscordHistoryFetcher } from "@discord/fetchers/DiscordHistoryFetcher";

function buildMessages(
  count: number,
  baseTimestamp: number,
  options: { bot?: boolean; idPrefix?: string } = {},
) {
  const messages = [];
  for (let i = 0; i < count; i++) {
    messages.push({
      id: `${options.idPrefix ?? "msg"}-${count - i}`,
      createdTimestamp: baseTimestamp - i * 1000,
      author: {
        id: `user-${i}`,
        username: `user${i}`,
        globalName: null,
        bot: options.bot ?? false,
        createdTimestamp: baseTimestamp - i * 1000,
      },
      member: null,
    });
  }
  return messages;
}

function createTextChannel(id: string, allMessages: unknown[]) {
  const sorted = [...allMessages].sort(
    (a, b) =>
      (b as { createdTimestamp: number }).createdTimestamp -
      (a as { createdTimestamp: number }).createdTimestamp,
  );

  const fetch = jest.fn(
    async ({ limit, before }: { limit: number; before?: string }) => {
      let startIndex = 0;
      if (before) {
        startIndex =
          sorted.findIndex((m) => (m as { id: string }).id === before) + 1;
      }
      const page = sorted.slice(startIndex, startIndex + limit);
      return new Map(page.map((m) => [(m as { id: string }).id, m]));
    },
  );

  return {
    id,
    type: ChannelType.GuildText,
    name: `channel-${id}`,
    url: `https://discord.com/channels/g/${id}`,
    messages: { fetch },
  };
}

function createMockGuild(channels: unknown[], scheduledEvents: unknown[] = []) {
  const channelsCache = new Map(
    channels.map((c) => [(c as { id: string }).id, c]),
  );
  return {
    channels: { cache: channelsCache },
    scheduledEvents: {
      fetch: jest
        .fn()
        .mockResolvedValue(
          new Map(scheduledEvents.map((e) => [(e as { id: string }).id, e])),
        ),
    },
  };
}

function createMockClient(guild: unknown): Client {
  const guildsCache = new Map([["guild-1", { id: "guild-1" }]]);
  return {
    guilds: {
      cache: guildsCache,
      fetch: jest.fn().mockResolvedValue(guild),
    },
  } as unknown as Client;
}

describe("DiscordHistoryFetcher", () => {
  describe("fetchNextMessageBatch", () => {
    it("should fetch messages within range and mark the channel done when the page is smaller than 100", async () => {
      const messages = buildMessages(3, new Date("2024-01-20").getTime());
      const channel = createTextChannel("channel-1", messages);
      const guild = createMockGuild([channel]);
      const client = createMockClient(guild);
      const fetcher = new DiscordHistoryFetcher(client);

      const result = await fetcher.fetchNextMessageBatch({
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-02-01"),
        batchSize: 100,
      });

      expect(result.messages).toHaveLength(3);
      expect(result.done).toBe(true);
      expect(result.cursor).toEqual({ channelIndex: 1, before: undefined });
    });

    it("should filter out bot messages and messages outside the date range", async () => {
      const tooNew = buildMessages(1, new Date("2024-03-01").getTime(), {
        idPrefix: "too-new",
      })[0];
      const inRange = buildMessages(1, new Date("2024-01-15").getTime(), {
        idPrefix: "in-range",
      })[0];
      const botMsg = buildMessages(1, new Date("2024-01-14").getTime(), {
        bot: true,
        idPrefix: "bot",
      })[0];
      const tooOld = buildMessages(1, new Date("2023-01-01").getTime(), {
        idPrefix: "too-old",
      })[0];

      const channel = createTextChannel("channel-1", [
        tooNew,
        inRange,
        botMsg,
        tooOld,
      ]);
      const guild = createMockGuild([channel]);
      const client = createMockClient(guild);
      const fetcher = new DiscordHistoryFetcher(client);

      const result = await fetcher.fetchNextMessageBatch({
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-02-01"),
        batchSize: 100,
      });

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].platformId).toBe(inRange.id);
      expect(result.done).toBe(true);
    });

    it("should paginate a channel across multiple 100-message pages", async () => {
      const messages = buildMessages(150, new Date("2024-01-20").getTime());
      const channel = createTextChannel("channel-1", messages);
      const guild = createMockGuild([channel]);
      const client = createMockClient(guild);
      const fetcher = new DiscordHistoryFetcher(client);

      const result = await fetcher.fetchNextMessageBatch({
        startDate: new Date("2023-01-01"),
        endDate: new Date("2024-02-01"),
        batchSize: 200,
      });

      expect(channel.messages.fetch).toHaveBeenCalledTimes(2);
      expect(channel.messages.fetch).toHaveBeenNthCalledWith(1, {
        limit: 100,
      });
      expect(channel.messages.fetch).toHaveBeenNthCalledWith(2, {
        limit: 100,
        before: expect.any(String),
      });
      expect(result.messages).toHaveLength(150);
      expect(result.done).toBe(true);
    });

    it("should stop a batch once batchSize is reached without exhausting all channels", async () => {
      const channel1 = createTextChannel(
        "channel-1",
        buildMessages(50, new Date("2024-01-20").getTime(), {
          idPrefix: "c1",
        }),
      );
      const channel2 = createTextChannel(
        "channel-2",
        buildMessages(50, new Date("2024-01-20").getTime(), {
          idPrefix: "c2",
        }),
      );
      const guild = createMockGuild([channel1, channel2]);
      const client = createMockClient(guild);
      const fetcher = new DiscordHistoryFetcher(client);

      const result = await fetcher.fetchNextMessageBatch({
        startDate: new Date("2023-01-01"),
        endDate: new Date("2024-02-01"),
        batchSize: 50,
      });

      expect(result.messages).toHaveLength(50);
      expect(result.done).toBe(false);
      expect(result.cursor.channelIndex).toBe(1);
      expect(channel2.messages.fetch).not.toHaveBeenCalled();
    });

    it("should resume from a provided cursor", async () => {
      const channel1 = createTextChannel(
        "channel-1",
        buildMessages(1, new Date("2024-01-20").getTime(), {
          idPrefix: "c1",
        }),
      );
      const channel2 = createTextChannel(
        "channel-2",
        buildMessages(1, new Date("2024-01-20").getTime(), {
          idPrefix: "c2",
        }),
      );
      const guild = createMockGuild([channel1, channel2]);
      const client = createMockClient(guild);
      const fetcher = new DiscordHistoryFetcher(client);

      const result = await fetcher.fetchNextMessageBatch({
        startDate: new Date("2023-01-01"),
        endDate: new Date("2024-02-01"),
        batchSize: 100,
        cursor: { channelIndex: 1 },
      });

      expect(channel1.messages.fetch).not.toHaveBeenCalled();
      expect(channel2.messages.fetch).toHaveBeenCalledTimes(1);
      expect(result.messages).toHaveLength(1);
      expect(result.done).toBe(true);
    });

    it("should ignore non text-based channels", async () => {
      const textChannel = createTextChannel(
        "channel-1",
        buildMessages(1, new Date("2024-01-20").getTime()),
      );
      const voiceChannel = {
        id: "voice-1",
        type: ChannelType.GuildVoice,
        name: "voice",
        url: "https://discord.com/channels/g/voice-1",
        messages: { fetch: jest.fn() },
      };
      const guild = createMockGuild([voiceChannel, textChannel]);
      const client = createMockClient(guild);
      const fetcher = new DiscordHistoryFetcher(client);

      const result = await fetcher.fetchNextMessageBatch({
        startDate: new Date("2023-01-01"),
        endDate: new Date("2024-02-01"),
        batchSize: 100,
      });

      expect(voiceChannel.messages.fetch).not.toHaveBeenCalled();
      expect(result.messages).toHaveLength(1);
    });
  });

  describe("fetchNextMessageReactionsBatch retry behavior", () => {
    let setTimeoutSpy: jest.SpyInstance;

    beforeEach(() => {
      setTimeoutSpy = jest.spyOn(global, "setTimeout").mockImplementation(((
        fn: () => void,
      ) => {
        fn();
        return 0 as unknown as NodeJS.Timeout;
      }) as unknown as typeof setTimeout);
    });

    afterEach(() => {
      setTimeoutSpy.mockRestore();
    });

    function createReactingUser(id: string, bot = false) {
      return {
        id,
        username: `user-${id}`,
        globalName: null,
        bot,
        createdTimestamp: undefined,
      };
    }

    function createMessageWithReaction(
      id: string,
      timestamp: number,
      usersFetch: jest.Mock,
    ) {
      return {
        id,
        createdTimestamp: timestamp,
        author: {
          id: "author-1",
          username: "author",
          globalName: null,
          bot: false,
          createdTimestamp: timestamp,
        },
        member: null,
        reactions: {
          cache: new Map([
            [
              "reaction-1",
              {
                emoji: { identifier: "👍", name: "👍", id: null },
                users: { fetch: usersFetch },
              },
            ],
          ]),
        },
      };
    }

    it("should retry a transient error when fetching reaction users and eventually succeed", async () => {
      const usersFetch = jest
        .fn()
        .mockRejectedValueOnce(new Error("other side closed"))
        .mockResolvedValueOnce(
          new Map([["user-1", createReactingUser("user-1")]]),
        );
      const message = createMessageWithReaction(
        "msg-1",
        new Date("2024-01-20").getTime(),
        usersFetch,
      );
      const channel = createTextChannel("channel-1", [message]);
      const guild = createMockGuild([channel]);
      const client = createMockClient(guild);
      const fetcher = new DiscordHistoryFetcher(client);

      const result = await fetcher.fetchNextMessageReactionsBatch({
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-02-01"),
        batchSize: 100,
      });

      expect(usersFetch).toHaveBeenCalledTimes(2);
      expect(result.reactions).toHaveLength(1);
      expect(result.reactions[0]).toMatchObject({
        messageId: "msg-1",
        userId: "user-1",
        reactionEmoji: "👍",
      });
    });

    it("should not retry a non-transient error when fetching reaction users", async () => {
      const usersFetch = jest.fn().mockRejectedValue(new Error("boom"));
      const message = createMessageWithReaction(
        "msg-1",
        new Date("2024-01-20").getTime(),
        usersFetch,
      );
      const channel = createTextChannel("channel-1", [message]);
      const guild = createMockGuild([channel]);
      const client = createMockClient(guild);
      const fetcher = new DiscordHistoryFetcher(client);

      await expect(
        fetcher.fetchNextMessageReactionsBatch({
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-02-01"),
          batchSize: 100,
        }),
      ).rejects.toThrow("boom");
      expect(usersFetch).toHaveBeenCalledTimes(1);
    });

    it("should give up after exhausting retry attempts and propagate the last transient error", async () => {
      const usersFetch = jest.fn().mockRejectedValue(new Error("ECONNRESET"));
      const message = createMessageWithReaction(
        "msg-1",
        new Date("2024-01-20").getTime(),
        usersFetch,
      );
      const channel = createTextChannel("channel-1", [message]);
      const guild = createMockGuild([channel]);
      const client = createMockClient(guild);
      const fetcher = new DiscordHistoryFetcher(client);

      await expect(
        fetcher.fetchNextMessageReactionsBatch({
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-02-01"),
          batchSize: 100,
        }),
      ).rejects.toThrow("ECONNRESET");
      expect(usersFetch).toHaveBeenCalledTimes(3);
    });
  });

  describe("fetchAudioEventsInRange", () => {
    function createMockScheduledEvent(overrides: Record<string, unknown> = {}) {
      return {
        id: "event-1",
        name: "Test Event",
        status: 3,
        scheduledStartAt: new Date("2024-01-10"),
        scheduledEndAt: new Date("2024-01-10T01:00:00.000Z"),
        userCount: 5,
        channelId: "channel-1",
        creatorId: "creator-1",
        description: "desc",
        channel: {
          name: "voice-general",
          url: "https://discord.com/channels/g/channel-1",
        },
        creator: { username: "Creator" },
        coverImageURL: () => "http://img",
        ...overrides,
      };
    }

    it("should return only events whose scheduledStartAt falls within range, mapped to raw DTOs", async () => {
      const inRange = createMockScheduledEvent({ id: "event-in-range" });
      const tooOld = createMockScheduledEvent({
        id: "event-too-old",
        scheduledStartAt: new Date("2023-01-01"),
      });
      const tooNew = createMockScheduledEvent({
        id: "event-too-new",
        scheduledStartAt: new Date("2024-03-01"),
      });

      const guild = createMockGuild([], [inRange, tooOld, tooNew]);
      const client = createMockClient(guild);
      const fetcher = new DiscordHistoryFetcher(client);

      const result = await fetcher.fetchAudioEventsInRange({
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-02-01"),
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        platformId: "event-in-range",
        name: "Test Event",
        statusId: "completed",
        startAt: inRange.scheduledStartAt,
        endAt: inRange.scheduledEndAt,
        userCount: 5,
        description: "desc",
        image: "http://img",
        channelId: "channel-1",
        channelName: "voice-general",
        channelUrl: "https://discord.com/channels/g/channel-1",
        creatorId: "creator-1",
        creatorUsername: "Creator",
      });
    });

    it("should request events with withUserCount", async () => {
      const guild = createMockGuild([], []);
      const client = createMockClient(guild);
      const fetcher = new DiscordHistoryFetcher(client);

      await fetcher.fetchAudioEventsInRange({
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-02-01"),
      });

      expect(guild.scheduledEvents.fetch).toHaveBeenCalledWith({
        withUserCount: true,
      });
    });
  });
});
