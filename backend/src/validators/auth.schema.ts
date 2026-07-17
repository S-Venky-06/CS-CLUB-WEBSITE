import { z } from "zod";

/**
 * Schema for verifying a Google Sign-In request body payload.
 */
export const googleLoginSchema = z.object({
  idToken: z
    .string({
      required_error: "idToken is required.",
      invalid_type_error: "idToken must be a string.",
    })
    .min(1, "idToken cannot be empty."),
});

export type GoogleLoginInput = z.infer<typeof googleLoginSchema>;
