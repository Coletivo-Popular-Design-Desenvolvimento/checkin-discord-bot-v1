import { LogEvent } from "../../entities/LogEvent";

export interface ILoggerRepository {
  create(user: Omit<LogEvent, "id">): Promise<LogEvent>;
}
