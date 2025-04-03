import { CreateManyUserOutputDto } from "../../../dtos/CreateManyUserOutputDto";
import { OutputDto } from "../../../dtos/OutputDto";
import { UserEntity } from "../../../entities/User";

//Input DTO para criar um novo usuario
export type CreateUserInput = Omit<UserEntity, "id">;

export interface ICreateUser {
  execute(User: CreateUserInput): Promise<OutputDto<UserEntity>>;
  executeMany(
    users: CreateUserInput[]
  ): Promise<OutputDto<CreateManyUserOutputDto>>;
}
