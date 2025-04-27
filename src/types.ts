import type { Database, Enums } from "./db/database.types";
import { z } from "zod";

/**
 * Common structure for paginated responses.
 */
export interface PaginationDTO {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ------------------------------------------------------------------------------------------------
// Aliases for base database types extracted from the Database model definitions
// ------------------------------------------------------------------------------------------------
export type Document = Database["public"]["Tables"]["documents"]["Row"];
export type DocumentInsert = Database["public"]["Tables"]["documents"]["Insert"];
export type Analysis = Database["public"]["Tables"]["analyses"]["Row"];
export type AnalysisInsert = Database["public"]["Tables"]["analyses"]["Insert"];
export type AnalysisIssue = Database["public"]["Tables"]["analysis_issues"]["Row"];
export type AnalysisIssueInsert = Database["public"]["Tables"]["analysis_issues"]["Insert"];
export type SuggestionInteraction = Database["public"]["Tables"]["suggestion_interactions"]["Row"];
export type SuggestionInteractionInsert = Database["public"]["Tables"]["suggestion_interactions"]["Insert"];
export type AnalysisStatus = Enums<"analysis_status_enum">;
export type IssueCategory = "critical" | "important" | "minor";
export type InteractionType = Enums<"interaction_type_enum">;

/**
 * Command model for creating an analysis with text content.
 * The text will be stored in the documents table internally.
 */
export interface CreateAnalysisCommand {
  text_content: string;
}

/**
 * Analysis models based on the `analyses` table.
 */
export interface AnalysisSummaryDTO {
  id: string;
  text_preview: string;
  status: AnalysisStatus;
  detected_language: string;
  created_at: string;
}

/**
 * Response shape for listing analyses.
 */
export interface AnalysisListResponseDTO {
  analyses: AnalysisSummaryDTO[];
  pagination: PaginationDTO;
}

/**
 * Issue models based on the `analysis_issues` table.
 */
export interface IssueDTO {
  id: string;
  category: IssueCategory;
  description: string;
  suggestion: string;
  created_at: string;
}

/**
 * Detailed analysis shape with issues.
 */
export interface AnalysisDetailsDTO {
  id: string;
  text_content: string;
  text_preview: string;
  status: AnalysisStatus;
  model_version: string;
  detected_language: string;
  created_at: string;
  issues: IssueDTO[];
  issues_pagination: PaginationDTO;
}

/**
 * Response shape for newly created analysis.
 */
export interface CreateAnalysisResponseDTO {
  id: string;
  text_preview: string;
  detected_language: string;
  created_at: string;
  issues: IssueDTO[];
  issues_pagination: PaginationDTO;
}

/**
 * Interaction models based on the `suggestion_interactions` table.
 */
export interface CreateInteractionCommand {
  interaction_type: InteractionType;
}

export interface InteractionDTO {
  id: string;
  issue_id: string;
  interaction_type: InteractionType;
  created_at: string;
}

// OpenRouter service types
export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterResponseFormat {
  type: "json_schema";
  json_schema: {
    name: string;
    strict?: boolean;
    schema: object;
  };
}

export interface OpenRouterServiceConfig {
  apiKey: string;
  defaultModel?: string;
  baseUrl?: string;
}

export interface OpenRouterChatCompletionParams {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface OpenRouterChatCompletionOptions {
  systemPrompt?: string;
  responseSchema?: z.ZodTypeAny;
  params?: OpenRouterChatCompletionParams;
}

export interface OpenRouterApiResponse {
  choices: {
    message: {
      content: string;
      role: string;
    };
    index: number;
    finish_reason: string;
  }[];
  id: string;
  model: string;
  created: number;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface Issue {
  id: string;
  category: IssueCategory;
  title: string;
  description: string;
  start_index: number;
  end_index: number;
  suggestion: string;
}

export interface Analysis {
  id: string;
  text_content: string;
  created_at: string;
  issues_pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}
