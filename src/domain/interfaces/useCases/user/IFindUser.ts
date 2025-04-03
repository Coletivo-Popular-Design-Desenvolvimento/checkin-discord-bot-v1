import { OutputDto } from "../../../dtos/OutputDto";
import { UserEntity } from "../../../entities/User";

export interface IFindUser {
  execute(id: number | string): Promise<OutputDto<UserEntity>>;
  executeFindAll(limit?: number): Promise<OutputDto<UserEntity[]>>;
}
