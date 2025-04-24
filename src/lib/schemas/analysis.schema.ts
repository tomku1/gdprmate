import { z } from "zod";

/**
 * Schema for validating analysis creation requests
 */
export const createAnalysisSchema = z.object({
  text_content: z
    .string({
      required_error: "Text content is required",
      invalid_type_error: "Text content must be a string",
    })
    .min(1, "Text content cannot be empty")
    .max(50000, "Text content cannot exceed 50,000 characters")
    .transform((text) => text.trim()),
});

export type CreateAnalysisSchema = typeof createAnalysisSchema;
