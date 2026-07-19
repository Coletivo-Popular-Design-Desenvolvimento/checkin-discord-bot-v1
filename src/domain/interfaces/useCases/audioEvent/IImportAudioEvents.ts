import { GenericOutputDto } from "@dtos/GenericOutputDto";

export interface ImportAudioEventsProgress {
  batchNumber: number;
  fetched: number;
  created: number;
}

export interface ImportAudioEventsInput {
  startDate: Date;
  endDate: Date;
  batchSize: number;
  onProgress?: (progress: ImportAudioEventsProgress) => void;
}

export interface ImportAudioEventsResult {
  fetched: number;
  created: number;
  skipped: number;
  failed: number;
}

export interface IImportAudioEvents {
  execute(
    input: ImportAudioEventsInput,
  ): Promise<GenericOutputDto<ImportAudioEventsResult>>;
}
