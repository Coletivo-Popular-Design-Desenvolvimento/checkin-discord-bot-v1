import { CreateManyUserOutputDto } from "@dtos/CreateManyUserOutputDto";
import { GenericOutputDto } from "@dtos/GenericOutputDto";
import { UserEventEntity } from "@entities/UserEvent";

//Input DTO para criar um novo userEvent
export type CreateUserEventInput = Omit<
  UserEventEntity,
  "id" | "user" | "event"
> & {
  userPlatformId: UserEventEntity["user"]["platformId"];
  channelPlatformId: UserEventEntity["event"]["channel"]["platformId"];
  // Informações opcionais do Discord para criar User se não existir
  userDiscordInfo?: {
    username: string;
    bot: boolean;
    globalName?: string;
  };
  // Informações opcionais do Discord para criar AudioEvent se não existir
  channelDiscordInfo?: {
    name: string;
    url?: string;
  };
};

export interface ICreateUserEvent {
  execute(
    User: CreateUserEventInput,
  ): Promise<GenericOutputDto<UserEventEntity>>;
  executeMany(
    users: CreateUserEventInput[],
  ): Promise<GenericOutputDto<CreateManyUserOutputDto>>;
}
