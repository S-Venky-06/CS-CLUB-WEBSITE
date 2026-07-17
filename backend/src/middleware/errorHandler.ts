import type { Request, Response, ErrorRequestHandler } from "express";
import { ApiError } from "../utils/index.js";
import { HttpStatus } from "../constants/index.js";
import { isProduction } from "../config/index.js";

/**
 * Global error-handling middleware.
 * Catches both ApiErrors (operational) and unexpected errors,
 * then returns a consistent JSON envelope.
 */
export const errorHandler: ErrorRequestHandler = (err, _req: Request, res: Response, _next) => {
  // Operational errors thrown via ApiError
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
    });
    return;
  }

  // Unexpected / programmer errors
  const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
  const message = isProduction
    ? "An unexpected error occurred."
    : (err as Error).message || "Internal Server Error";

  if (!isProduction) {
    console.error("[ERROR]", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
};
