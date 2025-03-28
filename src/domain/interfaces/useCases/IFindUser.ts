import { UserListOutputDto } from "../../dtos/UserListOutputDto";
import { UserOutputDto } from "../../dtos/UserOutputDto";

export interface IFindUser {
  execute(id: number | string): Promise<UserOutputDto>;
  executeFindAll(limit?: number): Promise<UserListOutputDto>;
}
