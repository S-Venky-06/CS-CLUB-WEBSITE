import type { HttpStatusCode } from "../constants/index.js";

/**
 * Custom error class for API errors.
 * Carries an HTTP status code so the global error handler
 * can send a properly formatted response.
 */
export class ApiError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly isOperational: boolean;

  constructor(statusCode: HttpStatusCode, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
