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
};

export interface ICreateUserEvent {
  execute(
    User: CreateUserEventInput,
  ): Promise<GenericOutputDto<UserEventEntity>>;
  executeMany(
    users: CreateUserEventInput[],
  ): Promise<GenericOutputDto<CreateManyUserOutputDto>>;
}
