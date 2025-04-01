import { OutputDto } from "../../dtos/OutPutDto";

export interface IDeleteUser {
  execute(id: number | string): Promise<OutputDto<Boolean>>;
}
