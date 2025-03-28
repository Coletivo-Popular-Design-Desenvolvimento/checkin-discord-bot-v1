import { UserEntity } from "../entities/User";

//Output DTO com lista de users
export interface UserListOutputDto {
  users: UserEntity[];
  success: boolean;
  message?: string;
}
