import type { Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { env } from "../config/index.js";
import { getEventDetails } from "../services/event.service.js";
import { findAllRegistrations, createRegistration } from "../repositories/index.js";
import { ApiError } from "../utils/index.js";
import { HttpStatus } from "../constants/index.js";
import type { EventRegistrationInput } from "../validators/registration.schema.js";
import type { VerifyPaymentInput } from "../validators/payment.schema.js";
import type { Registration } from "../types/index.js";

// Ensure keys exist, otherwise we can't initialize Razorpay
if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
  console.warn("WARNING: Razorpay keys are missing in the environment. Payments will fail.");
}

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID || "missing_key_id",
  key_secret: env.RAZORPAY_KEY_SECRET || "missing_key_secret",
});

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
 * Creates a Razorpay order if event is paid. If free, registers directly.
 */
export async function createOrder(req: Request, res: Response): Promise<void> {
  const user = req.session!.user!;
  const email = user.email;
  const input = req.body as EventRegistrationInput;
  const { eventId } = input;

  // 1. Validate business rules
  const { event } = await validateEventRegistrationRules(eventId, email);

  // 2. If free event, register directly
  if (event.price === 0) {
    const registrationId = generateRegistrationId(eventId);
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

  // 3. Paid event: Create Razorpay order
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new ApiError(HttpStatus.SERVICE_UNAVAILABLE, "Payment gateway is not configured.");
  }

  const amountInPaise = event.price * 100;
  try {
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${eventId}_${Date.now()}`,
      notes: {
        eventId,
        email,
      },
    });

    res.status(HttpStatus.OK).json({
      success: true,
      message: "Payment order created.",
      data: {
        orderId: order.id,
        amount: amountInPaise,
        currency: "INR",
        keyId: env.RAZORPAY_KEY_ID,
        prefill: {
          name: input.name || user.name,
          email,
          contact: input.phone,
        },
      },
    });
  } catch (error: any) {
    console.error("Razorpay Order Error:", error);
    throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create payment order with Razorpay.");
  }
}

/**
 * POST /api/v1/payments/verify
 * Verifies signature, amounts, and completes registration.
 */
export async function verifyPayment(req: Request, res: Response): Promise<void> {
  const user = req.session!.user!;
  const email = user.email;
  const input = req.body as VerifyPaymentInput;
  const { eventId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = input;

  // 1. Verify HMAC Signature
  const expectedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new ApiError(HttpStatus.BAD_REQUEST, "Payment verification failed. Invalid signature.");
  }

  // 2. Fetch event to get price
  const { event, allRegistrations } = await validateEventRegistrationRules(eventId, email);
  if (event.price === 0) {
    throw new ApiError(HttpStatus.BAD_REQUEST, "This is a free event. Payment verification is not required.");
  }

  // 3. Idempotency Check (in case of double submission)
  const duplicateReg = allRegistrations.find(
    (reg: Registration) => reg.razorpayOrderId === razorpay_order_id
  );
  if (duplicateReg) {
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Payment already verified.",
      data: {
        registrationId: duplicateReg.registrationId,
        paymentStatus: duplicateReg.paymentStatus,
        razorpayPaymentId: duplicateReg.razorpayPaymentId,
      },
    });
    return;
  }

  // 4. Server-Side Order Fetch to prevent Amount Tampering
  try {
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const expectedAmountPaise = event.price * 100;

    if (order.amount !== expectedAmountPaise) {
      throw new ApiError(HttpStatus.BAD_REQUEST, "Payment amount mismatch.");
    }
    if (order.status !== "paid") {
      throw new ApiError(HttpStatus.BAD_REQUEST, "Order is not marked as paid in Razorpay.");
    }
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    console.error("Razorpay Fetch Error:", error);
    throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to fetch order details from Razorpay.");
  }

  // 5. Create Registration in Google Sheets
  const registrationId = generateRegistrationId(eventId);
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
    paymentStatus: "SUCCESS",
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
  };

  await createRegistration(newRegistration);

  res.status(HttpStatus.CREATED).json({
    success: true,
    message: "Payment verified and registration successful.",
    data: {
      registrationId,
      paymentStatus: "SUCCESS",
      razorpayPaymentId: razorpay_payment_id,
    },
  });
}
