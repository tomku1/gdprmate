import type { SupabaseClient } from "../../db/supabase.client";
import type { CreateDocumentCommand, DocumentSummaryDTO } from "../../types";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "../schemas/document.schema";

/**
 * Service for handling document operations
 */
export class DocumentService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Upload a document from a file to S3 and record metadata in the database
   *
   * @param userId - The ID of the authenticated user
   * @param file - The file to upload
   * @returns Document summary information
   * @throws Error when file validation fails or upload/db operations fail
   */
  async uploadFromFile(userId: string, file: File): Promise<DocumentSummaryDTO> {
    // Validate file
    if (!file) {
      throw new Error("No file provided");
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds the maximum allowed (${MAX_FILE_SIZE / (1024 * 1024)}MB)`);
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error(`File type '${file.type}' is not supported`);
    }

    try {
      // Convert file to ArrayBuffer for text extraction
      const arrayBuffer = await file.arrayBuffer();
      const textContent = new TextDecoder().decode(arrayBuffer);

      // Generate S3 key using user ID and timestamp for uniqueness
      const s3Key = `documents/${userId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

      // Mock upload to S3: skip actual storage call, assume success
      // (Real upload is disabled for now)

      // Insert document record in database
      const { data: document, error: insertError } = await this.supabase
        .from("documents")
        .insert({
          user_id: userId,
          original_filename: file.name,
          s3_key: s3Key,
          mime_type: file.type,
          size_bytes: file.size,
          text_content: textContent,
          detected_language: "en", // Hardcoded to English as requested
        })
        .select("id, original_filename, mime_type, size_bytes, detected_language, created_at")
        .single();

      if (insertError) {
        throw new Error(`Failed to insert document record: ${insertError.message}`);
      }

      return document;
    } catch (error) {
      console.error("Error in uploadFromFile:", error);
      throw error;
    }
  }

  /**
   * Upload a document from text content and record it in the database
   *
   * @param userId - The ID of the authenticated user
   * @param command - Text content and optional filename
   * @returns Document summary information
   * @throws Error when validation fails or upload/db operations fail
   */
  async uploadFromText(userId: string, command: CreateDocumentCommand): Promise<DocumentSummaryDTO> {
    const { text_content, original_filename = "document.txt" } = command;

    try {
      // Generate S3 key using user ID and timestamp for uniqueness
      const s3Key = `documents/${userId}/${Date.now()}_${original_filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

      // Mock upload to S3: skip actual storage call, assume success
      // (Real upload is disabled for now)

      // Calculate size in bytes
      const size_bytes = new Blob([text_content]).size;

      // Insert document record in database
      const { data: document, error: insertError } = await this.supabase
        .from("documents")
        .insert({
          user_id: userId,
          original_filename,
          s3_key: s3Key,
          mime_type: "text/plain",
          size_bytes,
          text_content,
          detected_language: "en", // Hardcoded to English as requested
        })
        .select("id, original_filename, mime_type, size_bytes, detected_language, created_at")
        .single();

      if (insertError) {
        throw new Error(`Failed to insert document record: ${insertError.message}`);
      }

      return document;
    } catch (error) {
      console.error("Error in uploadFromText:", error);
      throw error;
    }
  }
}
