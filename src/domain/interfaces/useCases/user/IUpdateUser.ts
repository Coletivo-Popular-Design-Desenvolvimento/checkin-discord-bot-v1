import { GenericOutputDto } from "@dtos/GenericOutputDto";
import { UserEntity } from "@entities/User";

export interface IUpdateUser {
  execute(
    id: number | string,
    data: Partial<UserEntity>,
  ): Promise<GenericOutputDto<UserEntity>>;

  executeInvertUserStatus(
    id: number | string,
  ): Promise<GenericOutputDto<UserEntity>>;
}
