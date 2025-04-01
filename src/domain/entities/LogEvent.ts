import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "../types/LoggerContextEnum";

export class LogEvent {
  constructor(
    public readonly id: number,
    public readonly status: LoggerContextStatus,
    public readonly context: LoggerContext,
    public readonly entity: LoggerContextEntity,
    public readonly message: string,
    public readonly createdAt: Date
  ) {}
}
