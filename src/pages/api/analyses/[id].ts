import type { APIRoute } from "astro";
import type { AnalysisDetailsDTO, IssueDTO, PaginationDTO, AnalysisIssue, IssueCategory } from "../../../types";

export const prerender = false;

export const GET: APIRoute = async ({ params, url, locals }) => {
  try {
    const id = params.id;

    if (!id) {
      return new Response(
        JSON.stringify({
          error: "Missing identifier",
          details: "Analysis ID is required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse query parameters
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "5", 10);
    const category = url.searchParams.get("category") as IssueCategory | null;

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

    // Get the analysis details
    const { data: analysis, error: analysisError } = await locals.supabase
      .from("analyses")
      .select("*, documents(*)")
      .eq("id", id)
      .single();

    if (analysisError) {
      return new Response(
        JSON.stringify({
          error: "Analysis not found",
          details: analysisError.message,
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!analysis) {
      return new Response(
        JSON.stringify({
          error: "Analysis not found",
          details: "No analysis found with the provided ID",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Calculate pagination details for the issues query
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Get the issues with pagination and optional category filter
    let issuesQuery = locals.supabase
      .from("analysis_issues")
      .select("*", { count: "exact" })
      .eq("analysis_id", id)
      .order("created_at", { ascending: false })
      .range(from, to);

    // Apply category filter if provided
    if (category) {
      issuesQuery = issuesQuery.eq("category", category);
    }

    const { data: issues, error: issuesError, count: totalIssues } = await issuesQuery;

    if (issuesError) {
      return new Response(
        JSON.stringify({
          error: "Failed to fetch issues",
          details: issuesError.message,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create pagination information
    const totalCount = totalIssues || 0;
    const totalPages = Math.ceil(totalCount / limit);

    const issuesPagination: PaginationDTO = {
      total: totalCount,
      page,
      limit,
      pages: totalPages,
    };

    // Map issues to the DTO format
    const issuesDTO: IssueDTO[] = issues
      ? issues.map((issue: AnalysisIssue) => ({
          id: issue.id,
          category: issue.category,
          description: issue.description,
          suggestion: issue.suggestion,
          created_at: issue.created_at,
        }))
      : [];

    // Create text preview from the document's text content
    const textContent = analysis.documents?.text_content || "";
    const textPreview = textContent.slice(0, 100) + (textContent.length > 100 ? "..." : "");

    // Build the response
    const response: AnalysisDetailsDTO = {
      id: analysis.id,
      text_content: textContent,
      text_preview: textPreview,
      status: analysis.status,
      model_version: analysis.model_version,
      detected_language: analysis.documents?.detected_language || "en",
      created_at: analysis.created_at,
      issues: issuesDTO,
      issues_pagination: issuesPagination,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing GET analysis details request:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: "Failed to retrieve analysis details",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
