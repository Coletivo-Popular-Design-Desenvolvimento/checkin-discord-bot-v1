import { GenericOutputDto } from "@dtos/GenericOutputDto";

export interface ImportUsersProgress {
  batchNumber: number;
  fetched: number;
  created: number;
}

export interface ImportUsersInput {
  batchSize: number;
  onProgress?: (progress: ImportUsersProgress) => void;
}

export interface ImportUsersResult {
  fetched: number;
  created: number;
  skipped: number;
  failed: number;
}

export interface IImportUsers {
  execute(
    input: ImportUsersInput,
  ): Promise<GenericOutputDto<ImportUsersResult>>;
}
