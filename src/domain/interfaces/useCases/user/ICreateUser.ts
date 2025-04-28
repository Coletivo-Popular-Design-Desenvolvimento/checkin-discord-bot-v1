import { CreateManyUserOutputDto } from "../../../dtos/CreateManyUserOutputDto";
import { GenericOutputDto } from "../../../dtos/GenericOutputDto";
import { UserEntity } from "../../../entities/User";

//Input DTO para criar um novo usuario
export type CreateUserInput = Omit<UserEntity, "id">;

export interface ICreateUser {
  execute(User: CreateUserInput): Promise<GenericOutputDto<UserEntity>>;
  executeMany(
    users: CreateUserInput[]
  ): Promise<GenericOutputDto<CreateManyUserOutputDto>>;
}
