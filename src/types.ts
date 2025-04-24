import type { Database, Enums } from "./db/database.types";

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
export type IssueCategory = Enums<"issue_category_enum">;
export type InteractionType = Enums<"interaction_type_enum">;

/**
 * Document models based on the `documents` table.
 */
export type DocumentSummaryDTO = Pick<
  Document,
  "id" | "original_filename" | "mime_type" | "size_bytes" | "detected_language" | "created_at"
>;

export type DocumentDetailsDTO = Pick<
  Document,
  "id" | "original_filename" | "mime_type" | "size_bytes" | "text_content" | "detected_language" | "created_at"
>;

/**
 * Command model for creating a document from text content.
 *
 * This type defines the structure for the payload used when creating a new document:
 * - It requires the "text_content" field from DocumentInsert (mandatory)
 * - It makes "original_filename" optional through Partial<Pick>
 *
 * This allows API clients to submit document content with an optional filename.
 */
export type CreateDocumentCommand = Pick<DocumentInsert, "text_content"> &
  Partial<Pick<DocumentInsert, "original_filename">>;

/**
 * Response shape for listing documents.
 */
export interface DocumentListResponseDTO {
  documents: DocumentSummaryDTO[];
  pagination: PaginationDTO;
}

/**
 * Analysis models based on the `analyses` table.
 */
export type CreateAnalysisCommand = Pick<AnalysisInsert, "document_id">;

export interface AnalysisSummaryDTO {
  id: string;
  document_id: string;
  document_name: string;
  status: AnalysisStatus;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
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
 * Detailed analysis shape, including optional issues if requested.
 */
export interface AnalysisDetailsDTO {
  id: string;
  document_id: string;
  document_name: string;
  status: AnalysisStatus;
  model_version: string;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  error_message: string | null;
  created_at: string;
  /** Included when `?include=issues` is specified */
  issues?: IssueDTO[];
  issues_pagination?: PaginationDTO;
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
