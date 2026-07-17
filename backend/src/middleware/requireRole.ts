import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/index.js";
import { HttpStatus } from "../constants/index.js";
import type { UserRole } from "../types/index.js";

const ROLE_RANKINGS: Record<UserRole, number> = {
  member: 1,
  admin: 2,
  super_admin: 3,
};

/**
 * Middleware factory that blocks requests from users who do not
 * meet the minimum role requirement.
 * @param requiredRole The minimum role required to access the resource
 */
export function requireRole(requiredRole: UserRole) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.session || !req.session.user) {
      throw new ApiError(
        HttpStatus.UNAUTHORIZED,
        "Authentication required. Please log in.",
      );
    }

    const userRole = req.session.user.role;

    if (ROLE_RANKINGS[userRole] < ROLE_RANKINGS[requiredRole]) {
      throw new ApiError(
        HttpStatus.FORBIDDEN,
        "Access denied. Insufficient permissions.",
      );
    }

    next();
  };
}
