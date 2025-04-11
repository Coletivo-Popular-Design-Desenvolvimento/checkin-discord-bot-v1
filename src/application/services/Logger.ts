import { LogEvent } from "../../domain/entities/LogEvent";
import { ILoggerService } from "../../domain/interfaces/services/ILogger";
import {
  LoggerContextStatus,
  LoggerContext,
  LoggerContextEntity,
} from "../../domain/types/LoggerContextEnum";

export class Logger implements ILoggerService {
  logToConsole(
    status: LoggerContextStatus,
    context: LoggerContext,
    entity: LoggerContextEntity,
    message: string
  ): void {
    const eventId = new Date().getTime();
    const event = new LogEvent(
      eventId,
      status,
      context,
      entity,
      message,
      new Date()
    );
    if (event.status === LoggerContextStatus.ERROR)
      console.error(JSON.stringify(event));
    else console.log(JSON.stringify(event));
  }
  logToDatabase(
    status: LoggerContextStatus,
    context: LoggerContext,
    entity: LoggerContextEntity,
    message: string
  ): void {
    throw new Error("Method not implemented.");
  }
}
