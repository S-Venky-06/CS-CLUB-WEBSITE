import type { Request, Response } from "express";
import { registerForEvent, getUserRegistrations } from "../services/index.js";
import { sendResponse, asyncHandler } from "../utils/index.js";
import { HttpStatus } from "../constants/index.js";

/**
 * POST /api/v1/registrations
 * Registers the current authenticated session user for a specific event.
 */
export const postRegistration = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { eventId, motivation, name: customName, phone } = req.body;
    const { email, name: sessionName } = req.session!.user!; // Ensured by requireAuth middleware
    const displayName = customName || sessionName;

    const registration = await registerForEvent(eventId, email, displayName, motivation, phone);

    sendResponse(
      res,
      HttpStatus.CREATED,
      "Registration successful.",
      registration,
    );
  },
);

/**
 * GET /api/v1/registrations/me
 * Retrieves all event registrations for the logged-in session user.
 */
export const getMeRegistrations = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email } = req.session!.user!; // Ensured by requireAuth middleware

    const registrations = await getUserRegistrations(email);

    sendResponse(
      res,
      HttpStatus.OK,
      "Registrations retrieved successfully.",
      registrations,
    );
  },
);
