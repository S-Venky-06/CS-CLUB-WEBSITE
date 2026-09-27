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
  otherComments: z
    .string({
      invalid_type_error: "otherComments must be a string.",
    })
    .max(2000, "otherComments cannot exceed 2000 characters.")
    .optional(),
  teamSize: z.number().int().min(1).max(4).optional().default(1),
  teamMembers: z.array(
    z.object({
      name: z.string().min(1, "Member name is required."),
      email: z.string().email("Invalid member email."),
      phone: z.string().regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits."),
      rollNumber: z.string().min(1, "Member roll number is required."),
      branch: z.string().min(1, "Member branch is required."),
      section: z.string().min(1, "Member section is required.")
    })
  ).max(3).optional().default([]),
}).superRefine((input, ctx) => {
  if (input.teamMembers.length !== input.teamSize - 1) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["teamSize"], message: "Team size must include the leader and match the member list." });
  }
  const rolls = [input.rollNumber, ...input.teamMembers.map(member => member.rollNumber)]
    .map(roll => roll.trim().toUpperCase());
  if (rolls.some(roll => !roll) || new Set(rolls).size !== rolls.length) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["teamMembers"], message: "Every participant must have a unique, nonempty roll number." });
  }
});

export type EventRegistrationInput = z.infer<typeof eventRegistrationSchema>;
