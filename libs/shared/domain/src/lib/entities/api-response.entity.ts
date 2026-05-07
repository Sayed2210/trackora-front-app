export interface ApiError {
  code: string;
  message: string;
  details?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
}

import { PaginationMeta, CursorMeta } from './pagination.entity';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta | CursorMeta;
  error?: ApiError;
}
