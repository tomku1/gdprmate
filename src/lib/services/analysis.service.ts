import type {
  CreateAnalysisCommand,
  CreateAnalysisResponseDTO,
  Document,
  Analysis,
  AnalysisIssue,
  AnalysisStatus,
  IssueCategory,
  IssueDTO,
} from "../../types";
import type { SupabaseClient } from "../../db/supabase.client";
import { OpenRouterService } from "./openrouter.service";
import { z } from "zod";
import { AnalysisError } from "../errors";
import { getGdprReferenceText } from "../gdpr/gdprLoader";

// Define the schema for GDPR analysis issues
const gdprIssueSchema = z.object({
  issues: z.array(
    z.object({
      category: z.enum(["critical", "important", "minor"]),
      description: z.string(),
      suggestion: z.string(),
    })
  ),
  summary: z.string().optional(),
});

// Type for the response from the LLM
interface GdprAnalysisResult {
  issues: {
    category: IssueCategory;
    description: string;
    suggestion: string;
  }[];
  summary?: string;
}

export class AnalysisService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly openRouterService?: OpenRouterService
  ) {}

  /**
   * Creates a temporary analysis for non-logged users without saving to the database.
   * This method:
   * 1. Calls OpenRouter.ai API for GDPR analysis
   * 2. Processes results
   * 3. Returns complete analysis with issues but doesn't persist anything
   */
  async createTemporaryAnalysis(command: CreateAnalysisCommand): Promise<CreateAnalysisResponseDTO> {
    try {
      if (!this.openRouterService) {
        throw new AnalysisError("OpenRouter service is required for analysis but not initialized");
      }

      // Generate temporary ID for analysis (won't be stored in DB)
      const analysisId = crypto.randomUUID();

      // Create text preview (first 100 characters)
      const textPreview = command.text_content.slice(0, 100) + (command.text_content.length > 100 ? "..." : "");

      // Load GDPR reference text
      const gdprReferenceText = await getGdprReferenceText();

      // Prepare system prompt for GDPR analysis with GDPR reference text
      const systemPrompt = `You are a GDPR compliance expert. Analyze the provided text for GDPR compliance issues.
      
      Use the following GDPR reference articles as context for your analysis:
      ${gdprReferenceText}
      
      Look for the following issues in the provided text:
      1. Missing information about data controllers and their contact details
      2. Unclear or missing data retention periods
      3. Vague or inadequate descriptions of data subject rights
      4. Missing information about purposes of processing
      5. Unclear legal basis for processing
      6. Missing information about recipients of data
      7. Issues with consent mechanisms (if applicable)
      8. Issues with data transfers to third countries (if applicable)
      9. Other GDPR compliance issues based on the reference text
      
      Categorize each issue as:
      - 'critical': Issues that would likely result in non-compliance and significant risk
      - 'important': Issues that should be addressed but may not immediately result in penalties
      - 'minor': Issues that would improve compliance but are not essential
      
      Return structured data as a JSON object with an array of issues, each containing:
      - category: The severity category
      - description: Clear description of the compliance issue
      - suggestion: Specific recommendation for how to address the issue`;

      let result;
      try {
        // Send request to OpenRouter API
        result = await this.openRouterService.completeChat(command.text_content, {
          systemPrompt,
          responseSchema: gdprIssueSchema,
          params: {
            temperature: 0.1,
            max_tokens: 3000,
          },
        });
      } catch (error) {
        throw new AnalysisError(`Analysis failed: ${(error as Error).message}`);
      }

      // Ensure we got a valid response with issues
      if (
        typeof result !== "object" ||
        result === null ||
        !("issues" in result) ||
        !Array.isArray(result.issues) ||
        result.issues.length === 0
      ) {
        throw new AnalysisError("Analysis failed: Invalid response structure from OpenRouter");
      }

      const typedResult = result as GdprAnalysisResult;

      // Create issues from the API response
      const issues: IssueDTO[] = typedResult.issues.map((issue) => ({
        id: crypto.randomUUID(),
        category: issue.category,
        description: issue.description,
        suggestion: issue.suggestion,
        created_at: new Date().toISOString(),
      }));

      // Return response with issues
      return {
        id: analysisId,
        text_preview: textPreview,
        detected_language: "en",
        created_at: new Date().toISOString(),
        issues: issues,
        issues_pagination: {
          total: issues.length,
          page: 1,
          limit: 10,
          pages: 1,
        },
      };
    } catch (error) {
      // Log the error and rethrow
      console.error("Error in createTemporaryAnalysis:", error);
      throw error;
    }
  }

  /**
   * Creates a new analysis for the given text content.
   * This includes:
   * 1. Calling OpenRouter.ai API for GDPR analysis
   * 2. Storing the text in documents table
   * 3. Creating analysis record
   * 4. Processing results and creating issues
   * 5. Returning complete analysis with issues
   */
  async createAnalysis(userId: string, command: CreateAnalysisCommand): Promise<CreateAnalysisResponseDTO> {
    try {
      if (!this.openRouterService) {
        throw new AnalysisError("OpenRouter service is required for analysis but not initialized");
      }

      // Generate unique IDs for document and analysis
      const documentId = crypto.randomUUID();
      const analysisId = crypto.randomUUID();

      // Start timing
      const startTime = Date.now();

      // Create text preview (first 100 characters)
      const textPreview = command.text_content.slice(0, 100) + (command.text_content.length > 100 ? "..." : "");

      // Load GDPR reference text
      const gdprReferenceText = await getGdprReferenceText();

      // First call OpenRouter API to analyze the text
      // Prepare system prompt for GDPR analysis with GDPR reference text
      const systemPrompt = `You are a GDPR compliance expert. Analyze the provided text for GDPR compliance issues.
      
      Use the following GDPR reference articles as context for your analysis:
      ${gdprReferenceText}
      
      Look for the following issues in the provided text:
      1. Missing information about data controllers and their contact details
      2. Unclear or missing data retention periods
      3. Vague or inadequate descriptions of data subject rights
      4. Missing information about purposes of processing
      5. Unclear legal basis for processing
      6. Missing information about recipients of data
      7. Issues with consent mechanisms (if applicable)
      8. Issues with data transfers to third countries (if applicable)
      9. Other GDPR compliance issues based on the reference text
      
      Categorize each issue as:
      - 'critical': Issues that would likely result in non-compliance and significant risk
      - 'important': Issues that should be addressed but may not immediately result in penalties
      - 'minor': Issues that would improve compliance but are not essential
      
      Return structured data as a JSON object with an array of issues, each containing:
      - category: The severity category
      - description: Clear description of the compliance issue
      - suggestion: Specific recommendation for how to address the issue`;

      let result;
      try {
        // Send request to OpenRouter API
        result = await this.openRouterService.completeChat(command.text_content, {
          systemPrompt,
          responseSchema: gdprIssueSchema,
          params: {
            temperature: 0.1,
            max_tokens: 3000,
          },
        });
      } catch (error) {
        throw new AnalysisError(`Analysis failed: ${(error as Error).message}`);
      }

      // Ensure we got a valid response with issues
      if (
        typeof result !== "object" ||
        result === null ||
        !("issues" in result) ||
        !Array.isArray(result.issues) ||
        result.issues.length === 0
      ) {
        throw new AnalysisError("Analysis failed: Invalid response structure from OpenRouter");
      }

      const typedResult = result as GdprAnalysisResult;

      // Create document record - only after successful API call
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

      // Create analysis record with initial status as in_progress
      const analysisStatus: AnalysisStatus = "in_progress";
      const analysis: Analysis = {
        id: analysisId,
        user_id: userId,
        document_id: documentId,
        status: analysisStatus,
        model_version: "v1.0",
        started_at: new Date(startTime).toISOString(),
        created_at: new Date().toISOString(),
        completed_at: null,
        duration_ms: 0,
        error_message: null,
      };

      const { error: analysisError } = await this.supabase.from("analyses").insert(analysis);

      if (analysisError) {
        throw new Error(`Failed to create analysis: ${analysisError.message}`);
      }

      // Create analysis issues from the API response
      const issues: AnalysisIssue[] = typedResult.issues.map((issue) => ({
        id: crypto.randomUUID(),
        user_id: userId,
        analysis_id: analysisId,
        category: issue.category,
        description: issue.description,
        suggestion: issue.suggestion,
        created_at: new Date().toISOString(),
      }));

      // Insert issues
      if (issues.length > 0) {
        const { error: issuesError } = await this.supabase.from("analysis_issues").insert(issues);

        if (issuesError) {
          throw new Error(`Failed to create issues: ${issuesError.message}`);
        }
      }

      // Update analysis as completed
      const completedAt = new Date().toISOString();
      const durationMs = Date.now() - startTime;
      const completedStatus: AnalysisStatus = "completed";

      await this.supabase
        .from("analyses")
        .update({
          status: completedStatus,
          completed_at: completedAt,
          duration_ms: durationMs,
        })
        .eq("id", analysisId);

      // Return response with issues
      return {
        id: analysisId,
        text_preview: textPreview,
        detected_language: "en",
        created_at: analysis.created_at,
        issues: issues,
        issues_pagination: {
          total: issues.length,
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
