import { Client } from "discord.js";
import { PrismaClient } from "@prisma/client";
import { ILoggerService } from "@services/ILogger";
import { PrismaService } from "@infra/persistence/prisma/prismaService";
import { DiscordHistoryFetcher } from "@discord/fetchers/DiscordHistoryFetcher";
import { HistoricalImportRepository } from "@infra/repositories/HistoricalImportRepository";
import { ImportMessages } from "@domain/useCases/message/ImportMessages";
import { ImportAudioEvents } from "@domain/useCases/audioEvent/ImportAudioEvents";
import { ImportUsers } from "@domain/useCases/user/ImportUsers";
import { ImportUserRoles } from "@domain/useCases/role/ImportUserRoles";
import { ImportChannels } from "@domain/useCases/channel/ImportChannels";
import { ImportMessageReactions } from "@domain/useCases/messageReaction/ImportMessageReactions";
import { SyncHistoryRange } from "@domain/useCases/sync/SyncHistoryRange";

export function initializeHistoricalSyncUseCases(
  client: Client,
  logger: ILoggerService,
): {
  prismaService: PrismaService;
  syncHistoryRange: SyncHistoryRange;
} {
  const prismaClient = new PrismaClient();
  const prismaService = new PrismaService(prismaClient);

  const discordHistoryFetcher = new DiscordHistoryFetcher(client);
  const historicalImportRepository = new HistoricalImportRepository(
    prismaService,
    logger,
  );

  const importUsers = new ImportUsers(
    discordHistoryFetcher,
    historicalImportRepository,
    logger,
  );
  const importUserRoles = new ImportUserRoles(
    discordHistoryFetcher,
    historicalImportRepository,
    logger,
  );
  const importChannels = new ImportChannels(
    discordHistoryFetcher,
    historicalImportRepository,
    logger,
  );
  const importMessages = new ImportMessages(
    discordHistoryFetcher,
    historicalImportRepository,
    logger,
  );
  const importMessageReactions = new ImportMessageReactions(
    discordHistoryFetcher,
    historicalImportRepository,
    logger,
  );
  const importAudioEvents = new ImportAudioEvents(
    discordHistoryFetcher,
    historicalImportRepository,
    logger,
  );
  const syncHistoryRange = new SyncHistoryRange(
    importUsers,
    importUserRoles,
    importChannels,
    importMessages,
    importMessageReactions,
    importAudioEvents,
    logger,
  );

  return { prismaService, syncHistoryRange };
}
