import type { APIRoute } from "astro";
import { DocumentService } from "../../lib/services/document.service";
import { textDocumentSchema } from "../../lib/schemas/document.schema";
import { DEFAULT_USER_ID } from "../../db/supabase.client";

export const prerender = false;

/**
 * POST /api/documents
 *
 * Endpoint to upload a document either as a file (multipart/form-data) or
 * as text content (application/json).
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const documentService = new DocumentService(locals.supabase);

    // Use placeholder user ID since authentication is handled elsewhere
    const userId = DEFAULT_USER_ID;

    // Check content type to determine processing method
    const contentType = request.headers.get("content-type") || "";

    // Process based on content type
    if (contentType.includes("multipart/form-data")) {
      // Handle file upload via multipart/form-data
      const formData = await request.formData();
      const file = formData.get("file") as File;

      // Validate file presence
      if (!file) {
        return new Response(
          JSON.stringify({
            error: "Bad Request",
            message: "No file provided",
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Process file upload
      const document = await documentService.uploadFromFile(userId, file);

      return new Response(JSON.stringify(document), {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else if (contentType.includes("application/json")) {
      // Handle text upload via JSON
      const body = await request.json();

      // Validate JSON structure
      const result = textDocumentSchema.safeParse(body);

      if (!result.success) {
        return new Response(
          JSON.stringify({
            error: "Bad Request",
            message: "Invalid request body",
            details: result.error.format(),
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Process text upload
      const document = await documentService.uploadFromText(userId, result.data);

      return new Response(JSON.stringify(document), {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      // Unsupported content type
      return new Response(
        JSON.stringify({
          error: "Unsupported Media Type",
          message: `Content-Type must be multipart/form-data or application/json`,
        }),
        {
          status: 415,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    // Handle different error types
    if (error instanceof Error) {
      const message = error.message;

      // Handle payload too large error
      if (message.includes("exceeds the maximum allowed")) {
        return new Response(
          JSON.stringify({
            error: "Payload Too Large",
            message,
          }),
          {
            status: 413,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Handle unsupported media type error
      if (message.includes("not supported") || message.includes("File type")) {
        return new Response(
          JSON.stringify({
            error: "Unsupported Media Type",
            message,
          }),
          {
            status: 415,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Handle general validation errors
      if (message.includes("No file provided")) {
        return new Response(
          JSON.stringify({
            error: "Bad Request",
            message,
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    // Log unexpected errors
    console.error("Document upload error:", error);

    // Return generic error for unhandled cases
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
