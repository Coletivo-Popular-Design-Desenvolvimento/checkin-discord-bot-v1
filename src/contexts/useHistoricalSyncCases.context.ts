import { Client } from "discord.js";
import { PrismaClient } from "@prisma/client";
import { ILoggerService } from "@services/ILogger";
import { PrismaService } from "@infra/persistence/prisma/prismaService";
import { DiscordHistoryFetcher } from "@discord/fetchers/DiscordHistoryFetcher";
import { HistoricalImportRepository } from "@infra/repositories/HistoricalImportRepository";
import { ImportMessages } from "@domain/useCases/message/ImportMessages";
import { ImportAudioEvents } from "@domain/useCases/audioEvent/ImportAudioEvents";
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

  const importMessages = new ImportMessages(
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
    importMessages,
    importAudioEvents,
    logger,
  );

  return { prismaService, syncHistoryRange };
}
