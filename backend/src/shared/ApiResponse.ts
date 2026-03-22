export interface ApiResponseOptions<T> {
  message: string;
  data?: T;
}

export class ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;

  private constructor(success: boolean, message: string, data?: T) {
    this.success = success;
    this.message = message;
    this.data = data;
  }

  static success<T>({ message, data }: ApiResponseOptions<T>) {
    return new ApiResponse<T>(true, message, data);
  }

  static error(message: string) {
    return new ApiResponse<null>(false, message);
  }
}
