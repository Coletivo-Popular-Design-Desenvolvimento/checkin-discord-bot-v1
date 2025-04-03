import { OutputDto } from "../../../dtos/OutputDto";

export interface IDeleteUser {
  execute(id: number | string): Promise<OutputDto<Boolean>>;
}
