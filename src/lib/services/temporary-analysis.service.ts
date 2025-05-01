import type { AnalysisDetailsDTO, CreateAnalysisResponseDTO } from "../../types";

// Key used for storing temporary analyses in sessionStorage
const TEMP_ANALYSES_STORAGE_KEY = "gdprmate_temp_analyses";

/**
 * Service to handle temporary analyses for non-logged users
 * Uses sessionStorage to persist analyses between page refreshes
 */
export const temporaryAnalysisService = {
  /**
   * Store a temporary analysis in sessionStorage
   */
  storeAnalysis(analysis: CreateAnalysisResponseDTO, textContent: string): void {
    try {
      // Get existing stored analyses or initialize empty object
      const storedData = sessionStorage.getItem(TEMP_ANALYSES_STORAGE_KEY);
      const analyses: Record<string, AnalysisDetailsDTO> = storedData ? JSON.parse(storedData) : {};

      // Create a full analysis details object
      const fullAnalysis: AnalysisDetailsDTO = {
        ...analysis,
        text_content: textContent,
        status: "completed",
        model_version: "v1.0",
      };

      // Add/update the analysis in the storage object
      analyses[analysis.id] = fullAnalysis;

      // Save back to sessionStorage
      sessionStorage.setItem(TEMP_ANALYSES_STORAGE_KEY, JSON.stringify(analyses));
    } catch (error) {
      console.error("Failed to store temporary analysis:", error);
    }
  },

  /**
   * Get a temporary analysis by ID
   */
  getAnalysis(id: string): AnalysisDetailsDTO | null {
    try {
      const storedData = sessionStorage.getItem(TEMP_ANALYSES_STORAGE_KEY);
      if (!storedData) return null;

      const analyses: Record<string, AnalysisDetailsDTO> = JSON.parse(storedData);
      return analyses[id] || null;
    } catch (error) {
      console.error("Failed to retrieve temporary analysis:", error);
      return null;
    }
  },

  /**
   * Check if an analysis ID belongs to a temporary analysis
   */
  isTemporaryAnalysis(id: string): boolean {
    return !!this.getAnalysis(id);
  },

  /**
   * Get all temporary analyses
   */
  getAllAnalyses(): AnalysisDetailsDTO[] {
    try {
      const storedData = sessionStorage.getItem(TEMP_ANALYSES_STORAGE_KEY);
      if (!storedData) return [];

      const analyses: Record<string, AnalysisDetailsDTO> = JSON.parse(storedData);
      return Object.values(analyses);
    } catch (error) {
      console.error("Failed to retrieve temporary analyses:", error);
      return [];
    }
  },
};
