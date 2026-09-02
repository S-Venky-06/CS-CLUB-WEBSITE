import { z } from "zod";

/**
 * Validation schema for verifying a manual UPI payment and completing registration.
 * It extends the standard event registration schema with UTR validation.
 */
export const verifyPaymentSchema = z.object({
  registrationId: z.string().min(1, "Registration ID is required."),
  utr: z.string().min(8, "UTR/Transaction ID must be at least 8 characters.").max(25, "UTR/Transaction ID cannot exceed 25 characters."),
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
