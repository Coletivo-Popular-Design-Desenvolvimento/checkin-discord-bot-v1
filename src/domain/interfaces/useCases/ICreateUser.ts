import { OutputDto } from "../../dtos/OutPutDto";
import { UserEntity } from "../../entities/User";

//Input DTO para criar um novo usuario
export type CreateUserInput = Omit<UserEntity, "id">;

export interface ICreateUser {
  execute(User: CreateUserInput): Promise<OutputDto<UserEntity>>;
}
