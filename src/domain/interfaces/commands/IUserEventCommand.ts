export interface IUserEventCommand {
  executeUserJoinOrLeaveAudioEvent(): Promise<void>;
}
