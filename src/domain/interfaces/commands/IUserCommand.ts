export interface IUserCommand {
  executeNewUser(): Promise<void>;
  executeAllUsers(): Promise<void>;
  executeUserLeave(): Promise<void>;
}
