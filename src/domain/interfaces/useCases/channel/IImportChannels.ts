import { GenericOutputDto } from "@dtos/GenericOutputDto";

export interface ImportChannelsProgress {
  batchNumber: number;
  fetched: number;
  created: number;
}

export interface ImportChannelsInput {
  batchSize: number;
  onProgress?: (progress: ImportChannelsProgress) => void;
}

export interface ImportChannelsResult {
  fetched: number;
  created: number;
  skipped: number;
  failed: number;
}

export interface IImportChannels {
  execute(
    input: ImportChannelsInput,
  ): Promise<GenericOutputDto<ImportChannelsResult>>;
}
