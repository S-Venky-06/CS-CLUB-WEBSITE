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
  year: z
    .string({
      required_error: "year is required.",
      invalid_type_error: "year must be a string.",
    })
    .min(1, "year cannot be empty.")
    .max(20, "year cannot exceed 20 characters."),
  section: z
    .string({
      required_error: "section is required.",
      invalid_type_error: "section must be a string.",
    })
    .min(1, "section cannot be empty.")
    .max(10, "section cannot exceed 10 characters."),
  branch: z
    .string({
      required_error: "branch is required.",
      invalid_type_error: "branch must be a string.",
    })
    .min(1, "branch cannot be empty.")
    .max(20, "branch cannot exceed 20 characters."),
  rollNumber: z
    .string({
      required_error: "rollNumber is required.",
      invalid_type_error: "rollNumber must be a string.",
    })
    .min(1, "rollNumber cannot be empty.")
    .max(20, "rollNumber cannot exceed 20 characters."),
  projects: z
    .string({
      invalid_type_error: "projects must be a string.",
    })
    .max(2000, "projects cannot exceed 2000 characters.")
    .optional(),
  linkedin: z
    .string({
      invalid_type_error: "linkedin must be a string.",
    })
    .max(200, "linkedin link cannot exceed 200 characters.")
    .optional(),
  tryhackme: z
    .string({
      invalid_type_error: "tryhackme must be a string.",
    })
    .max(200, "tryhackme link cannot exceed 200 characters.")
    .optional(),
  hackthebox: z
    .string({
      invalid_type_error: "hackthebox must be a string.",
    })
    .max(200, "hackthebox link cannot exceed 200 characters.")
    .optional(),
  otherComments: z
    .string({
      invalid_type_error: "otherComments must be a string.",
    })
    .max(2000, "otherComments cannot exceed 2000 characters.")
    .optional(),
});

export type EventRegistrationInput = z.infer<typeof eventRegistrationSchema>;
