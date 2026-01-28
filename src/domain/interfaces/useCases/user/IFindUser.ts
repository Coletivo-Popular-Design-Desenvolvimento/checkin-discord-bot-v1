import { GenericOutputDto } from "@dtos/GenericOutputDto";
import { UserEntity } from "@entities/User";

export interface IFindUser {
  execute(id: number | string): Promise<GenericOutputDto<UserEntity | null>>;
  executeFindAll(limit?: number): Promise<GenericOutputDto<UserEntity[]>>;
}
