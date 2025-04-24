import type { APIRoute } from "astro";
import { createAnalysisSchema } from "../../lib/schemas/analysis.schema";
import { AnalysisService } from "../../lib/services/analysis.service";
import { DEFAULT_USER_ID } from "../../db/supabase.client";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = createAnalysisSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request",
          details: validationResult.error.errors,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create analysis service and process request
    const analysisService = new AnalysisService(locals.supabase);
    const result = await analysisService.createAnalysis(DEFAULT_USER_ID, {
      text_content: validationResult.data.text_content,
    });

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing analysis request:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: "Failed to process analysis request",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
