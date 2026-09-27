import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/index.js";
import { HttpStatus } from "../constants/index.js";

/**
 * Middleware that blocks requests from unauthenticated clients.
 * Requires express-session to be mounted and a valid user in the session.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const loginAt = Date.parse(req.session?.user?.loginAt || "");
  const age = Date.now() - loginAt;
  if (!req.session || !req.session.user || !Number.isFinite(loginAt) || age < 0 || age >= 86_400_000) {
    if (req.session) delete req.session.user;
    throw new ApiError(
      HttpStatus.UNAUTHORIZED,
      "Authentication required. Please log in.",
    );
  }
  next();
}
