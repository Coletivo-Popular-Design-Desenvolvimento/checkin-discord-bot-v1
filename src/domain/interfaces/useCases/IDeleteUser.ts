import { UserOutputDto } from "../../dtos/UserOutputDto";

export interface IDeleteUser {
  execute(id: number | string): Promise<UserOutputDto>;
}
