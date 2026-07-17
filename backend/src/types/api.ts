/** Standard API response envelope */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
}

/** Standard error response payload */
export interface ApiErrorResponse {
  success: false;
  message: string;
  data: null;
  /** Detailed validation errors (if applicable) */
  errors?: Record<string, string[]>;
}
