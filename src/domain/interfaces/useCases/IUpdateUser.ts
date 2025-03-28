import { UserOutputDto } from "../../dtos/UserOutputDto";
import { UserEntity } from "../../entities/User";

export interface IUpdateUser {
  execute(
    id: number | string,
    data: Partial<UserEntity>
  ): Promise<UserOutputDto>;
}
