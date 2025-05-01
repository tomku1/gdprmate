import type { APIRoute } from "astro";
// Import server-side env variables directly
import { OPENROUTER_API_KEY } from "astro:env/server";
import { createAnalysisSchema } from "../../lib/schemas/analysis.schema";
import { AnalysisService } from "../../lib/services/analysis.service";
import { OpenRouterService } from "../../lib/services/openrouter.service";
import type { AnalysisListResponseDTO, AnalysisSummaryDTO, PaginationDTO } from "../../types";

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Extract query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    // Check if user is authenticated
    const isAuthenticated = !!locals.user;

    if (!isAuthenticated) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be logged in to view analyses",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get analyses from database for the authenticated user
    const {
      data: analysesData,
      error,
      count,
    } = await locals.supabase
      .from("analyses")
      .select("id, document_id, status, created_at", { count: "exact" })
      .eq("user_id", locals.user?.id || "")
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      return new Response(
        JSON.stringify({
          error: "Database error",
          message: error.message,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Calculate total pages
    const totalRecords = count || 0;
    const totalPages = Math.ceil(totalRecords / limit);

    const analysesWithPreviews: AnalysisSummaryDTO[] = [];
    // For each analysis, get document details to create preview

    for (const analysis of analysesData || []) {
      // Get document for this analysis
      const { data: documentData } = await locals.supabase
        .from("documents")
        .select("text_content, detected_language")
        .eq("id", analysis.document_id)
        .single();

      if (documentData) {
        // Create text preview (first 100 characters)
        const textPreview =
          documentData.text_content.slice(0, 100) + (documentData.text_content.length > 100 ? "..." : "");

        // Add to result list
        analysesWithPreviews.push({
          id: analysis.id,
          text_preview: textPreview,
          status: analysis.status,
          detected_language: documentData.detected_language,
          created_at: analysis.created_at,
        });
      }
    }

    // Create pagination info
    const pagination: PaginationDTO = {
      total: totalRecords,
      page,
      limit,
      pages: totalPages,
    };

    // Return analyses with pagination
    const response: AnalysisListResponseDTO = {
      analyses: analysesWithPreviews,
      pagination,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching analyses:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: "Failed to fetch analyses",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

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

    // Use the imported OPENROUTER_API_KEY directly
    if (!OPENROUTER_API_KEY) {
      // This check might still be useful in case the env var is somehow unset despite the schema
      console.error("OpenRouter API Key is not configured in the environment.");
      return new Response(
        JSON.stringify({
          error: "Configuration error",
          message: "OpenRouter API key is not configured",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Initialize OpenRouterService
    const openRouterService = new OpenRouterService({
      apiKey: OPENROUTER_API_KEY, // Use the imported variable directly
    });

    // Create analysis service
    const analysisService = new AnalysisService(locals.supabase, openRouterService);

    // Check if user is authenticated
    const isAuthenticated = !!locals.user;

    // Handle differently based on authentication status
    if (isAuthenticated) {
      // User is logged in - save to database as before
      const userId = locals.user?.id || "";
      const result = await analysisService.createAnalysis(userId, {
        text_content: validationResult.data.text_content,
      });
      return new Response(JSON.stringify(result), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // User is not logged in - process analysis without saving to database
      const result = await analysisService.createTemporaryAnalysis({
        text_content: validationResult.data.text_content,
      });

      // For temporary analyses, include the full text_content in the response
      // so the client can store it in localStorage
      return new Response(
        JSON.stringify({
          ...result,
          text_content: validationResult.data.text_content,
          is_temporary: true,
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error processing analysis request:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: `Failed to process analysis request: ${(error as Error).message}`,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
