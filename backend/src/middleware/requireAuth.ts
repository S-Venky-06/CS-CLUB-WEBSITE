import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/index.js";
import { HttpStatus } from "../constants/index.js";

/**
 * Middleware that blocks requests from unauthenticated clients.
 * Requires express-session to be mounted and a valid user in the session.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.session || !req.session.user) {
    throw new ApiError(
      HttpStatus.UNAUTHORIZED,
      "Authentication required. Please log in.",
    );
  }
  next();
}
