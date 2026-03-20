import { type Request, type Response, type NextFunction } from "express";
import { ApiError, InternalServerError } from "../shared/ApiError.js";
import { ApiResponse } from "../shared/ApiResponse.js";

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ Error:", err);

  let statusCode = 500;
  let message = "Internal Server Error";

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else {
    const error = new InternalServerError();
    statusCode = error.statusCode;
    message = error.message;
  }
  
  res.status(statusCode).json(ApiResponse.error(message));
};
