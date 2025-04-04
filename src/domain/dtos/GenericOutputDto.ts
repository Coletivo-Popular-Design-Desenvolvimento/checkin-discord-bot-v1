export interface GenericOutputDto<T> extends Dto {
  data: T;
}

export interface Dto {
  success: boolean;
  message?: string;
}
