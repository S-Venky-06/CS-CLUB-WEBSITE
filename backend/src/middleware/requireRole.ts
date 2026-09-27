import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/index.js";
import { HttpStatus } from "../constants/index.js";
import type { UserRole } from "../types/index.js";
import { env } from "../config/index.js";
import { findMemberByEmail } from "../repositories/member.repository.js";

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
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.session || !req.session.user) {
      throw new ApiError(
        HttpStatus.UNAUTHORIZED,
        "Authentication required. Please log in.",
      );
    }

    // Roles in old tokens must not retain access after an administrator demotes a user.
    const email = req.session.user.email.toLowerCase().trim();
    const userRole = env.SUPER_ADMIN_EMAILS.includes(email) ? "super_admin"
      : env.ADMIN_EMAILS.includes(email) ? "admin"
      : (await findMemberByEmail(email))?.role ?? "member";
    req.session.user.role = userRole;

    if (!Object.hasOwn(ROLE_RANKINGS, userRole) || ROLE_RANKINGS[userRole] < ROLE_RANKINGS[requiredRole]) {
      throw new ApiError(
        HttpStatus.FORBIDDEN,
        "Access denied. Insufficient permissions.",
      );
    }

    next();
  };
}
