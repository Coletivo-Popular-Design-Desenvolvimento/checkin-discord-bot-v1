export enum LoggerContext {
  COMMAND = "COMMAND",
  INFRASTRUCTURE = "INFRASTRUCTURE",
  APP_CONTEXT = "APP CONTEXT",
  REPOSITORY = "REPOSITORY",
  SERVICE = "SERVICE",
  USECASE = "USECASE",
  CONTROLLER = "CONTROLLER",
}

export enum LoggerContextEntity {
  USER = "USER",
  CHANNEL = "CHANNEL",
}

export enum LoggerContextStatus {
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}