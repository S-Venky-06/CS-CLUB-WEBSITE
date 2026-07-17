import type { Request, Response, NextFunction } from "express";
import { HttpStatus } from "../constants/index.js";

/**
 * Catches all requests that do not match any registered route
 * and returns a 404 JSON response.
 */
export function notFoundHandler(_req: Request, res: Response, _next: NextFunction): void {
  res.status(HttpStatus.NOT_FOUND).json({
    success: false,
    message: "The requested resource was not found.",
    data: null,
  });
}
