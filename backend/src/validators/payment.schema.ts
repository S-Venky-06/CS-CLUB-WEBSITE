import { z } from "zod";
import { eventRegistrationSchema } from "./registration.schema.js";

/**
 * Validation schema for verifying a Razorpay payment and completing registration.
 * It extends the standard event registration schema with Razorpay signature fields.
 */
export const verifyPaymentSchema = eventRegistrationSchema.extend({
  razorpay_order_id: z
    .string({
      required_error: "razorpay_order_id is required.",
    })
    .min(1, "razorpay_order_id cannot be empty."),
  razorpay_payment_id: z
    .string({
      required_error: "razorpay_payment_id is required.",
    })
    .min(1, "razorpay_payment_id cannot be empty."),
  razorpay_signature: z
    .string({
      required_error: "razorpay_signature is required.",
    })
    .min(1, "razorpay_signature cannot be empty."),
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
