import { OutputDto } from "../../../dtos/OutputDto";
import { UserEntity } from "../../../entities/User";

export interface IUpdateUser {
  execute(
    id: number | string,
    data: Partial<UserEntity>
  ): Promise<OutputDto<UserEntity>>;

  executeInvertUserStatus(id: number | string): Promise<OutputDto<UserEntity>>;
}
