import { GenericOutputDto } from "@dtos/GenericOutputDto";

export interface ImportUserRolesProgress {
  batchNumber: number;
  fetched: number;
  created: number;
}

export interface ImportUserRolesInput {
  batchSize: number;
  onProgress?: (progress: ImportUserRolesProgress) => void;
}

export interface ImportUserRolesResult {
  fetched: number;
  created: number;
  skipped: number;
  failed: number;
}

export interface IImportUserRoles {
  execute(
    input: ImportUserRolesInput,
  ): Promise<GenericOutputDto<ImportUserRolesResult>>;
}
