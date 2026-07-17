import type { Response } from "express";
import type { ApiResponse } from "../types/index.js";

/**
 * Sends a consistent JSON response using the standard envelope.
 */
export function sendResponse<T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T | null = null,
): void {
  const body: ApiResponse<T> = {
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
  };
  res.status(statusCode).json(body);
}
