import { OutputDto } from "../../dtos/OutPutDto";
import { UserEntity } from "../../entities/User";

export interface IUpdateUser {
  execute(
    id: number | string,
    data: Partial<UserEntity>
  ): Promise<OutputDto<UserEntity>>;

  executeDisableUser(id: number | string): Promise<OutputDto<UserEntity>>;
}
