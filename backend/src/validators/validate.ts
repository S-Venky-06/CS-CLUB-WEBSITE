import type { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { HttpStatus } from "../constants/index.js";

/**
 * Express middleware factory that validates the request body
 * against a Zod schema. Returns 422 with field-level errors
 * if validation fails.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string[]> = {};
        for (const issue of error.issues) {
          const path = issue.path.join(".");
          if (!fieldErrors[path]) fieldErrors[path] = [];
          fieldErrors[path].push(issue.message);
        }
        res.status(HttpStatus.UNPROCESSABLE).json({
          success: false,
          message: "Validation failed.",
          data: null,
          errors: fieldErrors,
        });
        return;
      }
      next(error);
    }
  };
}
