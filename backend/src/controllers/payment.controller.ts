import type { Request, Response } from "express";
import { getEventDetails } from "../services/event.service.js";
import { findAllRegistrations, createRegistration } from "../repositories/index.js";
import { uploadScreenshot } from "../repositories/imgbb.client.js";
import { ApiError } from "../utils/index.js";
import { HttpStatus } from "../constants/index.js";
import type { EventRegistrationInput } from "../validators/registration.schema.js";
import { verifyPaymentSchema } from "../validators/payment.schema.js";
import type { Registration } from "../types/index.js";

/**
 * Validates common event registration business rules (active, deadline, capacity, duplicates)
 */
async function validateEventRegistrationRules(eventId: string, email: string) {
  const event = await getEventDetails(eventId);

  if (event.status !== "active") {
    throw new ApiError(HttpStatus.BAD_REQUEST, "Registrations are not active for this event.");
  }

  const now = new Date();
  const deadlineDate = new Date(event.deadline);
  if (now > deadlineDate) {
    throw new ApiError(HttpStatus.BAD_REQUEST, "Registration deadline for this event has passed.");
  }

  const allRegistrations = await findAllRegistrations();
  const normalizedEmail = email.toLowerCase().trim();
  const existing = allRegistrations.find(
    (reg: Registration) => reg.eventId === eventId && reg.email.toLowerCase().trim() === normalizedEmail,
  );
  if (existing) {
    throw new ApiError(HttpStatus.CONFLICT, "You have already registered for this event.");
  }

  const currentCapacity = allRegistrations.filter((reg: Registration) => reg.eventId === eventId).length;
  if (currentCapacity >= event.capacity) {
    throw new ApiError(HttpStatus.BAD_REQUEST, "This event is at full capacity.");
  }

  return { event, allRegistrations };
}

function generateRegistrationId(eventId: string): string {
  const randomSuffix = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `REG-${eventId.toUpperCase()}-${randomSuffix}`;
}

/**
 * POST /api/v1/payments/create-order
 * If free, registers directly. If paid, returns registration metadata so frontend can show QR.
 */
export async function createOrder(req: Request, res: Response): Promise<void> {
  const user = req.session!.user!;
  const email = user.email;
  const input = req.body as EventRegistrationInput;
  const { eventId } = input;

  // 1. Validate business rules
  const { event } = await validateEventRegistrationRules(eventId, email);
  const registrationId = generateRegistrationId(eventId);

  // 2. If free event, register directly
  if (event.price === 0) {
    const newRegistration = {
      ...input,
      registrationId,
      email,
      name: input.name || user.name || "Unknown",
      registeredAt: new Date().toISOString(),
      projects: input.projects || "",
      linkedin: input.linkedin || "",
      tryhackme: input.tryhackme || "",
      hackthebox: input.hackthebox || "",
      otherComments: input.otherComments || "",
      domain: input.domain || "",
      paymentStatus: "FREE",
    };

    await createRegistration(newRegistration);

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: "Registration successful for free event.",
      data: {
        registrationId,
        paymentStatus: "FREE",
      },
    });
    return;
  }

  // 3. Paid event: Return metadata to proceed to Step 2 (QR code scan)
  res.status(HttpStatus.OK).json({
    success: true,
    message: "Proceed to payment.",
    data: {
      registrationId,
      price: event.price,
      eventTitle: event.title,
    },
  });
}

/**
 * POST /api/v1/payments/submit-utr
 * Accepts multipart/form-data with UTR and optional screenshot.
 */
export async function verifyPayment(req: Request, res: Response): Promise<void> {
  const user = req.session!.user!;
  const email = user.email;
  
  // 1. Parse and validate form data
  const { registrationId, utr, ...formPayload } = req.body;
  
  const validationResult = verifyPaymentSchema.safeParse({ registrationId, utr });
  if (!validationResult.success) {
    throw new ApiError(HttpStatus.BAD_REQUEST, validationResult.error.errors[0].message);
  }
  
  const input = formPayload as EventRegistrationInput;
  const { eventId } = input;

  // 2. Validate business rules
  const { event, allRegistrations } = await validateEventRegistrationRules(eventId, email);
  if (event.price === 0) {
    throw new ApiError(HttpStatus.BAD_REQUEST, "This is a free event. Payment verification is not required.");
  }

  // 3. Duplicate UTR check
  const duplicateReg = allRegistrations.find(
    (reg: Registration) => reg.utrNumber === utr
  );
  if (duplicateReg) {
    throw new ApiError(HttpStatus.CONFLICT, "This UTR number has already been used for a registration.");
  }

  // 4. Handle optional screenshot upload
  let screenshotUrl = "";
  if (req.file) {
    const fileName = `screenshot_${registrationId}_${Date.now()}`;
    screenshotUrl = await uploadScreenshot(req.file.buffer, fileName, req.file.mimetype);
  }

  // 5. Create Registration in Google Sheets
  const newRegistration = {
    ...input,
    registrationId,
    email,
    name: input.name || user.name || "Unknown",
    registeredAt: new Date().toISOString(),
    projects: input.projects || "",
    linkedin: input.linkedin || "",
    tryhackme: input.tryhackme || "",
    hackthebox: input.hackthebox || "",
    otherComments: input.otherComments || "",
    domain: input.domain || "",
    paymentStatus: "PENDING",
    utrNumber: utr,
    screenshotUrl: screenshotUrl,
  };

  await createRegistration(newRegistration);

  res.status(HttpStatus.CREATED).json({
    success: true,
    message: "Payment submitted and is pending verification.",
    data: {
      registrationId,
      paymentStatus: "PENDING",
    },
  });
}
