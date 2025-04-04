import { GenericOutputDto } from "../../../dtos/GenericOutputDto";

export interface IDeleteUser {
  execute(id: number | string): Promise<GenericOutputDto<Boolean>>;
}
