import { GenericOutputDto } from "@dtos/GenericOutputDto";

export interface ImportMessagesProgress {
  batchNumber: number;
  fetched: number;
  created: number;
}

export interface ImportMessagesInput {
  startDate: Date;
  endDate: Date;
  batchSize: number;
  onProgress?: (progress: ImportMessagesProgress) => void;
}

export interface ImportMessagesResult {
  fetched: number;
  created: number;
  skipped: number;
  failed: number;
}

export interface IImportMessages {
  execute(
    input: ImportMessagesInput,
  ): Promise<GenericOutputDto<ImportMessagesResult>>;
}
