import type { Request, Response } from "express";
import { getEventDetails } from "../services/event.service.js";
import { findAllRegistrations, createRegistration, updatePaymentStatus } from "../repositories/index.js";
import { ApiError } from "../utils/index.js";
import { HttpStatus } from "../constants/index.js";
import type { EventRegistrationInput } from "../validators/registration.schema.js";
import type { Registration } from "../types/index.js";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { env } from "../config/index.js";

const cashfree = new Cashfree(
  env.CASHFREE_ENVIRONMENT === "PRODUCTION" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX,
  env.CASHFREE_APP_ID,
  env.CASHFREE_SECRET_KEY
);

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
  
  let existingRegistrationId = null;
  if (existing) {
    if (existing.paymentStatus === "CONFIRMED" || existing.paymentStatus === "FREE" || existing.paymentStatus === "SUCCESS") {
      throw new ApiError(HttpStatus.CONFLICT, "You have already registered for this event.");
    }
    // If PENDING, allow them to retry payment
    existingRegistrationId = existing.registrationId;
  }

  const currentCapacity = allRegistrations.filter((reg: Registration) => reg.eventId === eventId).length;
  if (currentCapacity >= event.capacity) {
    throw new ApiError(HttpStatus.BAD_REQUEST, "This event is at full capacity.");
  }

  return { event, allRegistrations, existingRegistrationId };
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
  const { event, existingRegistrationId } = await validateEventRegistrationRules(eventId, email);
  const registrationId = existingRegistrationId || generateRegistrationId(eventId);

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

  // 3. Paid event: Create an order with Cashfree
  // Generate unique order ID
  const orderId = `ORDER_${registrationId}_${Date.now()}`;
  
  // Register the user with PENDING status first if they don't already exist
  if (!existingRegistrationId) {
    const pendingRegistration = {
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
    };
    await createRegistration(pendingRegistration);
  }

  const request = {
    order_amount: event.price,
    order_currency: "INR",
    order_id: orderId,
    customer_details: {
      customer_id: `cust_${email.replace(/[^a-zA-Z0-9]/g, "")}_${Date.now()}`,
      customer_phone: input.phone || "9999999999",
      customer_email: email,
      customer_name: input.name || user.name || "Unknown",
    },
    order_meta: {
      // The frontend will handle the modal, but Cashfree may still want these
      return_url: `${env.FRONTEND_URL}/dashboard/registrations?order_id={order_id}`,
    },
  };

  try {
    const response = await cashfree.PGCreateOrder(request);
    
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Order created successfully. Proceed to payment.",
      data: {
        registrationId,
        paymentSessionId: response.data.payment_session_id,
        orderId: response.data.order_id,
      },
    });
  } catch (error: any) {
    console.error("Cashfree Create Order Error:", error.response?.data || error.message);
    throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to initiate payment. Please try again.");
  }
}

/**
 * POST /api/v1/payments/verify
 * Verifies the Cashfree payment status securely using PGFetchOrder.
 */
export async function verifyPayment(req: Request, res: Response): Promise<void> {
  const { orderId, registrationId } = req.body;

  if (!orderId || !registrationId) {
    throw new ApiError(HttpStatus.BAD_REQUEST, "orderId and registrationId are required.");
  }

  try {
    const response = await cashfree.PGFetchOrder(orderId);
    
    if (response.data.order_status === "PAID") {
      // Mark registration as confirmed in Google Sheets, and save the Cashfree transaction ID (cf_order_id) into the UTR column
      const transactionId = response.data.cf_order_id?.toString() || orderId;
      await updatePaymentStatus(registrationId, "CONFIRMED", transactionId);
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: "Payment successful and registration confirmed.",
        data: {
          orderStatus: "PAID",
          registrationId,
        },
      });
      return;
    }
    
    res.status(HttpStatus.OK).json({
      success: true,
      message: `Payment status is ${response.data.order_status}.`,
      data: {
        orderStatus: response.data.order_status,
        registrationId,
      },
    });
  } catch (error: any) {
    console.error("Cashfree Fetch Order Error:", error.response?.data || error.message);
    throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to verify payment status.");
  }
}
