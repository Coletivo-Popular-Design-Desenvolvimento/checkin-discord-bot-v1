import { GenericOutputDto } from "@dtos/GenericOutputDto";
import {
  ImportMessagesProgress,
  ImportMessagesResult,
} from "@interfaces/useCases/message/IImportMessages";
import {
  ImportAudioEventsProgress,
  ImportAudioEventsResult,
} from "@interfaces/useCases/audioEvent/IImportAudioEvents";
import {
  ImportUsersProgress,
  ImportUsersResult,
} from "@interfaces/useCases/user/IImportUsers";
import {
  ImportUserRolesProgress,
  ImportUserRolesResult,
} from "@interfaces/useCases/role/IImportUserRoles";
import {
  ImportChannelsProgress,
  ImportChannelsResult,
} from "@interfaces/useCases/channel/IImportChannels";
import {
  ImportMessageReactionsProgress,
  ImportMessageReactionsResult,
} from "@interfaces/useCases/messageReaction/IImportMessageReactions";

export interface SyncHistoryRangeInput {
  startDate?: Date;
  endDate?: Date;
  batchSize?: number;
  onUserProgress?: (progress: ImportUsersProgress) => void;
  onUserRoleProgress?: (progress: ImportUserRolesProgress) => void;
  onChannelProgress?: (progress: ImportChannelsProgress) => void;
  onMessageProgress?: (progress: ImportMessagesProgress) => void;
  onMessageReactionProgress?: (
    progress: ImportMessageReactionsProgress,
  ) => void;
  onAudioEventProgress?: (progress: ImportAudioEventsProgress) => void;
}

export interface SyncHistoryRangeResult {
  startDate: Date;
  endDate: Date;
  batchSize: number;
  users: ImportUsersResult;
  userRoles: ImportUserRolesResult;
  channels: ImportChannelsResult;
  messages: ImportMessagesResult;
  messageReactions: ImportMessageReactionsResult;
  audioEvents: ImportAudioEventsResult;
  errors: string[];
}

export interface ISyncHistoryRange {
  execute(
    input: SyncHistoryRangeInput,
  ): Promise<GenericOutputDto<SyncHistoryRangeResult>>;
}
