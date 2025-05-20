import { LogEvent } from "@entities/LogEvent";
import { ILoggerService } from "@services/ILogger";
import {
  LoggerContextStatus,
  LoggerContext,
  LoggerContextEntity,
} from "@type/LoggerContextEnum";

export class Logger implements ILoggerService {
  logToConsole(
    status: LoggerContextStatus,
    context: LoggerContext,
    entity: LoggerContextEntity,
    message: string,
  ): void {
    const eventId = new Date().getTime();
    const event = new LogEvent(
      eventId,
      status,
      context,
      entity,
      message,
      new Date(),
    );
    if (event.status === LoggerContextStatus.ERROR)
      console.error(JSON.stringify(event));
    else console.log(JSON.stringify(event));
  }
  logToDatabase(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    status: LoggerContextStatus,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: LoggerContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    entity: LoggerContextEntity,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    message: string,
  ): void {
    throw new Error("Method not implemented.");
  }
}
