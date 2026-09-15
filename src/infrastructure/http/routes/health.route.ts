import { Router, Request, Response, RequestHandler } from "express";
import { ILoggerService } from "@services/ILogger";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "@type/LoggerContextEnum";

export function createHealthHandler(
  checkDatabaseHealth: () => Promise<boolean>,
  logger: ILoggerService,
): RequestHandler {
  return async (_req: Request, res: Response) => {
    const isDatabaseHealthy = await checkDatabaseHealth();

    if (!isDatabaseHealthy) {
      logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.CONTROLLER,
        LoggerContextEntity.HEALTH,
        "Health check failed: database unreachable",
      );
      res.status(503).json({ status: "DOWN", database: "UNREACHABLE" });
      return;
    }

    res.status(200).json({
      status: "UP",
      database: "HEALTHY",
      timestamp: new Date().toISOString(),
    });
  };
}

export function createHealthRouter(
  checkDatabaseHealth: () => Promise<boolean>,
  logger: ILoggerService,
): Router {
  const router = Router();
  router.get("/health", createHealthHandler(checkDatabaseHealth, logger));
  return router;
}
