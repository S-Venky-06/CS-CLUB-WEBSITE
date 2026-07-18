import type { Request, Response, NextFunction } from "express";
import { verifyGoogleToken } from "../services/index.js";
import { sendResponse, ApiError, generateToken } from "../utils/index.js";
import { HttpStatus } from "../constants/index.js";
import { env } from "../config/index.js";
import type { SessionUser, UserRole } from "../types/index.js";
import { findMemberByEmail } from "../repositories/member.repository.js";

/**
 * POST /api/v1/auth/google
 * Verifies the Google ID token and establishes a server-side session.
 */
export async function googleLogin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { idToken } = req.body;

  try {
    const googleUser = await verifyGoogleToken(idToken);

    // Regenerate session to prevent session fixation
    req.session.regenerate(async (err) => {
      if (err) {
        return next(
          new ApiError(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "Failed to initialize session.",
          ),
        );
      }

      const email = googleUser.email.toLowerCase();
      let role: UserRole = "member";

      if (env.SUPER_ADMIN_EMAILS.includes(email)) {
        role = "super_admin";
      } else if (env.ADMIN_EMAILS.includes(email)) {
        role = "admin";
      } else {
        const member = await findMemberByEmail(email);
        if (member) {
          role = member.role;
        }
      }

      const sessionUser: SessionUser = {
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        role,
        loginAt: new Date().toISOString(),
      };

      req.session.user = sessionUser;

      const token = generateToken(sessionUser);

      sendResponse(res, HttpStatus.OK, "Authentication successful.", {
        user: sessionUser,
        token,
      });
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/auth/me
 * Retrieves current logged-in user profile from session.
 */
export function getMe(req: Request, res: Response): void {
  // Safe to assume req.session.user exists because this endpoint is protected by requireAuth
  sendResponse(
    res,
    HttpStatus.OK,
    "Profile retrieved successfully.",
    req.session!.user,
  );
}

/**
 * POST /api/v1/auth/logout
 * Destroys the user session and clears the session cookie.
 */
export function logout(req: Request, res: Response, next: NextFunction): void {
  if (!req.session) {
    sendResponse(res, HttpStatus.OK, "No active session found.");
    return;
  }

  req.session.destroy((err) => {
    if (err) {
      return next(
        new ApiError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          "Failed to terminate session.",
        ),
      );
    }

    res.clearCookie("sid");
    sendResponse(res, HttpStatus.OK, "Logged out successfully.");
  });
}
