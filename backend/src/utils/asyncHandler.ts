import type { Request, Response, NextFunction } from "express";

/**
 * Wraps an async route handler so that rejected promises
 * are automatically forwarded to the Express error handler.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
