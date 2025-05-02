import { useState, useEffect, useCallback } from "react";
import type { AnalysisHistoryItemViewModel, AnalysisListResponseDTO, AnalysisSummaryDTO, PaginationDTO } from "@/types";

const API_ENDPOINT = "/api/analyses";
const DEFAULT_LIMIT = 15; // Number of items per page

// Helper to map DTO to ViewModel
const mapAnalysisDtoToViewModel = (dto: AnalysisSummaryDTO): AnalysisHistoryItemViewModel => ({
  id: dto.id,
  textPreview: dto.text_preview,
  createdAt: dto.created_at, // Keep as ISO string for now, format in component
});

export function useAnalysesHistory() {
  const [analyses, setAnalyses] = useState<AnalysisHistoryItemViewModel[]>([]);
  const [pagination, setPagination] = useState<PaginationDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Keep track of the last fetch attempt for retry logic
  const [lastFetchParams, setLastFetchParams] = useState<{ page: number; limit: number }>({
    page: 1,
    limit: DEFAULT_LIMIT,
  });

  const fetchAnalyses = useCallback(async (page: number, limit: number, isRetry = false) => {
    // Don't fetch if already loading, unless it's a retry triggered manually
    if (isLoading && !isRetry) return;

    setIsLoading(true);
    if (page === 1) {
      setIsInitialLoading(true); // Set initial loading only for the first page
    }
    setError(null);
    setLastFetchParams({ page, limit }); // Store params for potential retry

    // Note: API currently ignores sort/order, but we include it for future-proofing
    const url = `${API_ENDPOINT}?page=${page}&limit=${limit}`;

    try {
      const response = await fetch(url);

      if (response.status === 401) {
        setError("Wymagane logowanie.");
        // Potentially redirect to login or call a global logout function here
        setAnalyses([]); // Clear data on auth error
        setPagination(null);
        return; // Stop further processing
      }

      if (!response.ok) {
        throw new Error(`Błąd serwera: ${response.status} ${response.statusText}`);
      }

      const data: AnalysisListResponseDTO = await response.json();
      const newAnalyses = data.analyses.map(mapAnalysisDtoToViewModel);

      setAnalyses((prevAnalyses) => (page === 1 ? newAnalyses : [...prevAnalyses, ...newAnalyses]));
      setPagination(data.pagination);
    } catch (err) {
      console.error("Failed to fetch analyses:", err);
      setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd podczas ładowania historii analiz.");
      // On error, don't wipe existing data if it was loading more pages
      if (page === 1) {
        setAnalyses([]);
        setPagination(null);
      }
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false); // Always false after first attempt (success or fail)
    }
  }, []); // Remove isLoading dependency - internal check prevents concurrent fetches

  // Effect for initial load and sort changes
  useEffect(() => {
    // Reset and fetch page 1 when sortValue changes
    setAnalyses([]);
    setPagination(null);
    fetchAnalyses(1, DEFAULT_LIMIT);
  }, [fetchAnalyses]); // Run only once on mount (fetchAnalyses is stable now)

  const loadMoreAnalyses = useCallback(() => {
    if (!isLoading && pagination && pagination.page < pagination.pages) {
      fetchAnalyses(pagination.page + 1, DEFAULT_LIMIT);
    }
  }, [isLoading, pagination, fetchAnalyses]);

  const retryFetch = useCallback(() => {
    // Retry the last failed/attempted fetch
    fetchAnalyses(lastFetchParams.page, lastFetchParams.limit, true);
  }, [fetchAnalyses, lastFetchParams]);

  // Derived state: Check if more pages are available
  const hasMore = pagination ? pagination.page < pagination.pages : false;

  return {
    analyses,
    pagination,
    isLoading,
    isInitialLoading,
    error,
    hasMore,
    loadMoreAnalyses,
    retryFetch,
  };
}
