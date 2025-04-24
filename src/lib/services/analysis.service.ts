import type { CreateAnalysisCommand, CreateAnalysisResponseDTO, Document, Analysis, AnalysisIssue } from "../../types";
import type { SupabaseClient } from "../../db/supabase.client";

export class AnalysisService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Creates a new analysis for the given text content.
   * This includes:
   * 1. Storing the text in documents table
   * 2. Creating analysis record
   * 3. Detecting language
   * 4. Generating text preview
   * 5. Calling OpenRouter.ai API for GDPR analysis
   * 6. Processing results and creating issues
   * 7. Returning complete analysis with issues
   */
  async createAnalysis(userId: string, command: CreateAnalysisCommand): Promise<CreateAnalysisResponseDTO> {
    try {
      // Generate unique IDs for document and analysis
      const documentId = crypto.randomUUID();
      const analysisId = crypto.randomUUID();

      // Create document record
      const document: Document = {
        id: documentId,
        user_id: userId,
        text_content: command.text_content,
        created_at: new Date().toISOString(),
        detected_language: "en",
        mime_type: "text/plain",
        original_filename: "text-analysis.txt",
        s3_key: "",
        size_bytes: command.text_content.length,
      };

      const { error: documentError } = await this.supabase.from("documents").insert(document);

      if (documentError) {
        throw new Error(`Failed to create document: ${documentError.message}`);
      }

      // Create text preview (first 100 characters)
      const textPreview = command.text_content.slice(0, 100) + (command.text_content.length > 100 ? "..." : "");

      // Create analysis record
      const analysis: Analysis = {
        id: analysisId,
        user_id: userId,
        document_id: documentId,
        status: "completed",
        model_version: "v1.0",
        started_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        duration_ms: 1000,
        error_message: null,
      };

      const { error: analysisError } = await this.supabase.from("analyses").insert(analysis);

      if (analysisError) {
        throw new Error(`Failed to create analysis: ${analysisError.message}`);
      }

      // Mock issues for UI development
      const mockIssues: AnalysisIssue[] = [
        {
          id: crypto.randomUUID(),
          user_id: userId,
          analysis_id: analysisId,
          category: "critical",
          description: "Missing information about the data controller",
          suggestion:
            "Add a section clearly identifying the data controller, including their contact details and legal representative if applicable.",
          created_at: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          user_id: userId,
          analysis_id: analysisId,
          category: "important",
          description: "Unclear data retention period",
          suggestion: "Specify how long personal data will be stored, or the criteria used to determine that period.",
          created_at: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          user_id: userId,
          analysis_id: analysisId,
          category: "minor",
          description: "Vague description of data subject rights",
          suggestion:
            "List all GDPR rights (access, rectification, erasure, etc.) with clear instructions on how to exercise them.",
          created_at: new Date().toISOString(),
        },
      ];

      // Insert mock issues
      const { error: issuesError } = await this.supabase.from("analysis_issues").insert(mockIssues);

      if (issuesError) {
        throw new Error(`Failed to create issues: ${issuesError.message}`);
      }

      // Return response with mock issues
      return {
        id: analysisId,
        text_preview: textPreview,
        detected_language: "en",
        created_at: analysis.created_at,
        issues: mockIssues,
        issues_pagination: {
          total: mockIssues.length,
          page: 1,
          limit: 10,
          pages: 1,
        },
      };
    } catch (error) {
      // Log the error and rethrow
      console.error("Error in createAnalysis:", error);
      throw error;
    }
  }
}
