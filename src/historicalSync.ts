import * as dotenv from "dotenv";
import { Client, Events } from "discord.js";
import { initializeDiscord } from "@contexts/discord.context";
import { initializeHistoricalSyncUseCases } from "@contexts/useHistoricalSyncCases.context";
import { Logger } from "@application/services/Logger";

dotenv.config();

interface ParsedArgs {
  start?: string;
  end?: string;
  batchSize?: number;
}

function parseArgs(argv: string[]): ParsedArgs {
  const args: ParsedArgs = {};
  for (const arg of argv) {
    const [rawKey, rawValue] = arg.split("=");
    if (!rawKey.startsWith("--") || rawValue === undefined) continue;

    const key = rawKey.slice(2);
    if (key === "start") args.start = rawValue;
    if (key === "end") args.end = rawValue;
    if (key === "batchSize") args.batchSize = Number(rawValue);
  }
  return args;
}

function waitForDiscordReady(client: Client): Promise<void> {
  if (client.isReady()) return Promise.resolve();
  return new Promise((resolve) => {
    client.once(Events.ClientReady, () => resolve());
  });
}

async function main(): Promise<void> {
  const logger = new Logger();
  const args = parseArgs(process.argv.slice(2));

  const startDate = args.start ? new Date(args.start) : undefined;
  const endDate = args.end ? new Date(args.end) : undefined;
  const batchSize = args.batchSize;

  console.log(
    `Iniciando sincronização histórica de ${startDate?.toISOString() ?? "(últimos 3 meses)"} até ${endDate?.toISOString() ?? "agora"}, batchSize=${batchSize ?? 1000}`,
  );

  const { TOKEN_BOT } = process.env;
  if (!TOKEN_BOT) {
    throw new Error("TOKEN_BOT não encontrado nas variáveis de ambiente");
  }

  const { discordService } = initializeDiscord();
  await discordService.client.login(TOKEN_BOT);
  await waitForDiscordReady(discordService.client);

  const { prismaService, syncHistoryRange } = initializeHistoricalSyncUseCases(
    discordService.client,
    logger,
  );

  const result = await syncHistoryRange.execute({
    startDate,
    endDate,
    batchSize,
    onUserProgress: (progress) => {
      console.log(
        `[USER] lote ${progress.batchNumber} — ${progress.created} registros importados até agora`,
      );
    },
    onUserRoleProgress: (progress) => {
      console.log(
        `[USER_ROLE] lote ${progress.batchNumber} — ${progress.created} registros importados até agora`,
      );
    },
    onChannelProgress: (progress) => {
      console.log(
        `[CHANNEL] lote ${progress.batchNumber} — ${progress.created} registros importados até agora`,
      );
    },
    onMessageProgress: (progress) => {
      console.log(
        `[MESSAGE] lote ${progress.batchNumber} — ${progress.created} registros importados até agora`,
      );
    },
    onMessageReactionProgress: (progress) => {
      console.log(
        `[MESSAGE_REACTION] lote ${progress.batchNumber} — ${progress.created} registros importados até agora`,
      );
    },
    onAudioEventProgress: (progress) => {
      console.log(
        `[AUDIO_EVENT] lote ${progress.batchNumber} — ${progress.created} registros importados até agora`,
      );
    },
  });

  console.log("Resumo final:");
  console.log(
    `  Usuários: fetched=${result.data.users.fetched} created=${result.data.users.created} skipped=${result.data.users.skipped} failed=${result.data.users.failed}`,
  );
  console.log(
    `  Cargos: fetched=${result.data.userRoles.fetched} created=${result.data.userRoles.created} skipped=${result.data.userRoles.skipped} failed=${result.data.userRoles.failed}`,
  );
  console.log(
    `  Canais: fetched=${result.data.channels.fetched} created=${result.data.channels.created} skipped=${result.data.channels.skipped} failed=${result.data.channels.failed}`,
  );
  console.log(
    `  Mensagens: fetched=${result.data.messages.fetched} created=${result.data.messages.created} skipped=${result.data.messages.skipped} failed=${result.data.messages.failed}`,
  );
  console.log(
    `  Reações: fetched=${result.data.messageReactions.fetched} created=${result.data.messageReactions.created} skipped=${result.data.messageReactions.skipped} failed=${result.data.messageReactions.failed}`,
  );
  console.log(
    `  Eventos de áudio: fetched=${result.data.audioEvents.fetched} created=${result.data.audioEvents.created} skipped=${result.data.audioEvents.skipped} failed=${result.data.audioEvents.failed}`,
  );

  if (result.data.errors.length > 0) {
    console.error(`Erros: ${result.data.errors.join("; ")}`);
  }

  await prismaService.disconnect();
  discordService.client.destroy();

  if (!result.success) {
    process.exit(1);
  }
  process.exit(0);
}

main().catch((error) => {
  console.error(
    `Falha na sincronização histórica: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
});
