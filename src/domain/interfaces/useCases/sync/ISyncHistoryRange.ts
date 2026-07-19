import { GenericOutputDto } from "@dtos/GenericOutputDto";
import {
  ImportMessagesProgress,
  ImportMessagesResult,
} from "@interfaces/useCases/message/IImportMessages";
import {
  ImportAudioEventsProgress,
  ImportAudioEventsResult,
} from "@interfaces/useCases/audioEvent/IImportAudioEvents";

export interface SyncHistoryRangeInput {
  startDate?: Date;
  endDate?: Date;
  batchSize?: number;
  onMessageProgress?: (progress: ImportMessagesProgress) => void;
  onAudioEventProgress?: (progress: ImportAudioEventsProgress) => void;
}

export interface SyncHistoryRangeResult {
  startDate: Date;
  endDate: Date;
  batchSize: number;
  messages: ImportMessagesResult;
  audioEvents: ImportAudioEventsResult;
  errors: string[];
}

export interface ISyncHistoryRange {
  execute(
    input: SyncHistoryRangeInput,
  ): Promise<GenericOutputDto<SyncHistoryRangeResult>>;
}
