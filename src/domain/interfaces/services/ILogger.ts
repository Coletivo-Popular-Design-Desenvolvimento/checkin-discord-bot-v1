import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "../../types/LoggerContextEnum";

export interface ILoggerService {
  logToConsole(
    status: LoggerContextStatus,
    context: LoggerContext,
    entity: LoggerContextEntity,
    message: string
  ): void;

  logToDatabase(
    status: LoggerContextStatus,
    context: LoggerContext,
    entity: LoggerContextEntity,
    message: string
  ): void;
}
