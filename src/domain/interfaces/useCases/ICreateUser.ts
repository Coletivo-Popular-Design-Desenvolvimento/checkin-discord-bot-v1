import { UserEntity } from "../../entities/User";
import { UserOutputDto } from "../../dtos/UserOutputDto";

//Input DTO para criar um novo usuario
export type CreateUserInput = Omit<UserEntity, "id">;

export interface ICreateUser {
  execute(User: CreateUserInput): Promise<UserOutputDto>;
}
