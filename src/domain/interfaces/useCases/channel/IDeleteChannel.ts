import { GenericOutputDto } from "@dtos/GenericOutputDto";

export interface IDeleteChannel {
  execute(id: number | string): Promise<GenericOutputDto<boolean>>;
}
