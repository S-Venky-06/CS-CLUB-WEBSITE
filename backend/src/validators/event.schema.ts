import { z } from "zod";

/**
 * Validation schema for creating or updating an event.
 */
export const eventSchema = z.object({
  eventId: z
    .string({
      required_error: "eventId is required.",
      invalid_type_error: "eventId must be a string.",
    })
    .min(2, "eventId must be at least 2 characters.")
    .max(50, "eventId cannot exceed 50 characters.")
    .regex(/^[a-zA-Z0-9-_]+$/, "eventId can only contain alphanumeric characters, hyphens, and underscores."),
  title: z
    .string({
      required_error: "title is required.",
      invalid_type_error: "title must be a string.",
    })
    .min(3, "Title must be at least 3 characters.")
    .max(100, "Title cannot exceed 100 characters."),
  description: z
    .string({
      required_error: "description is required.",
      invalid_type_error: "description must be a string.",
    })
    .min(10, "Description must be at least 10 characters.")
    .max(2000, "Description cannot exceed 2000 characters."),
  date: z
    .string({
      required_error: "date is required.",
      invalid_type_error: "date must be a string.",
    })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "date must be a valid date string.",
    }),
  capacity: z
    .number({
      required_error: "capacity is required.",
      invalid_type_error: "capacity must be a number.",
    })
    .int("Capacity must be an integer.")
    .positive("Capacity must be a positive number."),
  deadline: z
    .string({
      required_error: "deadline is required.",
      invalid_type_error: "deadline must be a string.",
    })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "deadline must be a valid date string.",
    }),
  status: z.enum(["active", "cancelled", "completed"], {
    required_error: "status is required.",
    invalid_type_error: "status must be either active, cancelled, or completed.",
  }),
  location: z
    .string()
    .max(100, "Location cannot exceed 100 characters.")
    .optional(),
});

export type EventInput = z.infer<typeof eventSchema>;
