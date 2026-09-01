import express, { Application } from "express";
import { PrismaService } from "@infra/persistence/prisma/prismaService";
import { createHealthRouter } from "@infra/http/routes/health.route";
import { ILoggerService } from "@services/ILogger";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "@type/LoggerContextEnum";

export function initializeHttp(
  prismaService: PrismaService,
  logger: ILoggerService,
): { app: Application } {
  const app = express();

  app.use(createHealthRouter(() => prismaService.isHealthy(), logger));

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => {
    logger.logToConsole(
      LoggerContextStatus.SUCCESS,
      LoggerContext.APP_CONTEXT,
      LoggerContextEntity.HEALTH,
      `HTTP server listening on port ${port}`,
    );
  });

  return { app };
}
