import { z } from "zod";

/**
 * Maximum allowed file size: 10MB
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Allowed MIME types for document uploads
 */
export const ALLOWED_MIME_TYPES = [
  "text/plain",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/markdown",
  "text/html",
  "text/csv",
];

/**
 * Schema for validating text document upload via JSON
 */
export const textDocumentSchema = z.object({
  text_content: z
    .string()
    .min(1, "Text content cannot be empty")
    .max(1000000, "Text content exceeds maximum allowed size"), // Reasonable limit for text
  original_filename: z.string().optional(),
});

/**
 * Schema for validating file document upload via multipart/form-data
 * Note: Actual file validation happens in the handler since Zod doesn't handle
 * file uploads directly. This schema is for documentation purposes.
 */
export const fileDocumentSchema = z.object({
  file: z
    .any()
    .refine((file) => file !== undefined, "File is required")
    .refine((file) => file.size <= MAX_FILE_SIZE, `File size should not exceed ${MAX_FILE_SIZE / (1024 * 1024)}MB`)
    .refine(
      (file) => ALLOWED_MIME_TYPES.includes(file.type),
      `File type must be one of: ${ALLOWED_MIME_TYPES.join(", ")}`
    ),
});

export type TextDocumentInput = z.infer<typeof textDocumentSchema>;
