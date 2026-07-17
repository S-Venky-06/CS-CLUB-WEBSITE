import { z } from "zod";

/**
 * Validation schema for registering for an event.
 */
export const eventRegistrationSchema = z.object({
  eventId: z
    .string({
      required_error: "eventId is required.",
      invalid_type_error: "eventId must be a string.",
    })
    .min(1, "eventId cannot be empty."),
  name: z
    .string({
      invalid_type_error: "name must be a string.",
    })
    .min(1, "Name cannot be empty.")
    .max(100, "Name cannot exceed 100 characters.")
    .optional(),
  motivation: z
    .string({
      required_error: "motivation is required.",
      invalid_type_error: "motivation must be a string.",
    })
    .refine(
      (val) => {
        const matches = val.match(/[\p{L}\p{N}]+(?:[-'][\p{L}\p{N}]+)*/gu);
        const count = matches ? matches.length : 0;
        return count >= 10;
      },
      { message: "Motivation must be at least 10 words." }
    )
    .refine(
      (val) => {
        const matches = val.match(/[\p{L}\p{N}]+(?:[-'][\p{L}\p{N}]+)*/gu);
        const count = matches ? matches.length : 0;
        return count <= 2000;
      },
      { message: "Motivation cannot exceed 2000 words." }
    ),
  phone: z
    .string({
      required_error: "phone is required.",
      invalid_type_error: "phone must be a string.",
    })
    .regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits."),
});

export type EventRegistrationInput = z.infer<typeof eventRegistrationSchema>;
