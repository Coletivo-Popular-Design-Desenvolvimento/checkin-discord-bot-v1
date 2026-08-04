import { GenericOutputDto } from "@dtos/GenericOutputDto";

export interface ImportMessageReactionsProgress {
  batchNumber: number;
  fetched: number;
  created: number;
}

export interface ImportMessageReactionsInput {
  startDate: Date;
  endDate: Date;
  batchSize: number;
  onProgress?: (progress: ImportMessageReactionsProgress) => void;
}

export interface ImportMessageReactionsResult {
  fetched: number;
  created: number;
  skipped: number;
  failed: number;
}

export interface IImportMessageReactions {
  execute(
    input: ImportMessageReactionsInput,
  ): Promise<GenericOutputDto<ImportMessageReactionsResult>>;
}
