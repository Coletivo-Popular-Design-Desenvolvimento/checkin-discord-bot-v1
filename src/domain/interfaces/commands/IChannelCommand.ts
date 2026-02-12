export interface IChannelCommand {
  handleCreateChannel(): Promise<void>;
  handleUpdateChannel(): Promise<void>;
  handleDeleteChannel(): Promise<void>;
}
