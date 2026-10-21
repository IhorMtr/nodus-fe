export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  messageType: null;
  errors: null;
}

export interface ApiErrorResponse {
  success: false;
  data: null;
  messageType: string;
  errors: Record<string, string[]> | null;
}
