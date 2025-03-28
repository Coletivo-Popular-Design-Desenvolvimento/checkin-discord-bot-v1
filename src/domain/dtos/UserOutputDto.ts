import { UserEntity } from "../entities/User";

//Output DTO para users
export interface UserOutputDto {
  user: UserEntity;
  success: boolean;
  message?: string;
}
