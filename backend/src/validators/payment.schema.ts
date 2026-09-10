import { z } from "zod";

/**
 * Validation schema for verifying a manual UPI payment and completing registration.
 * It extends the standard event registration schema with UTR validation.
 */
export const verifyPaymentSchema = z.object({
  registrationId: z.string().min(1, "Registration ID is required."),
  orderId: z.string().min(1, "Order ID is required."),
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
