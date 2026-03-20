// Common types and interfaces used across the application

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: any;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// HTTP Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Please login to continue',
  FAILED_TO_FETCH: 'Failed to fetch data',
  FAILED_TO_UPLOAD: 'Failed to upload file',
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_ALREADY_EXISTS: 'User with this email already exists',
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
} as const;
