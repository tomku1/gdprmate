import type { APIRoute } from "astro";
import { createAnalysisSchema } from "../../lib/schemas/analysis.schema";
import { AnalysisService } from "../../lib/services/analysis.service";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import type { AnalysisListResponseDTO, AnalysisSummaryDTO, PaginationDTO } from "../../types";

export const prerender = false;

// Mock data generator for testing UI
const generateMockAnalyses = (count: number, page: number, limit: number): AnalysisListResponseDTO => {
  const total = 35; // Total mocked analyses
  const mockAnalyses: AnalysisSummaryDTO[] = [];

  // Generate the requested number of mock analyses
  for (let i = 0; i < count; i++) {
    const id = crypto.randomUUID();
    const languages = ["en", "pl"];
    const mockAnalysis: AnalysisSummaryDTO = {
      id,
      text_preview: `This is a mock analysis #${page * limit + i + 1} with a preview of text content that would normally come from an actual document...`,
      status: "completed",
      detected_language: languages[Math.floor(Math.random() * languages.length)],
      created_at: new Date(Date.now() - i * 86400000).toISOString(), // Each one day apart
    };
    mockAnalyses.push(mockAnalysis);
  }

  // Create pagination info
  const pagination: PaginationDTO = {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };

  return {
    analyses: mockAnalyses,
    pagination,
  };
};

export const GET: APIRoute = async ({ url }) => {
  try {
    // Parse query parameters
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 50) {
      return new Response(
        JSON.stringify({
          error: "Invalid pagination parameters",
          details: "Page must be >= 1 and limit must be between 1-50",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate mock data
    const itemsToGenerate = Math.min(limit, 35 - (page - 1) * limit);
    const mockData = generateMockAnalyses(Math.max(0, itemsToGenerate), page - 1, limit);

    return new Response(JSON.stringify(mockData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing GET analyses request:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: "Failed to retrieve analyses",
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
