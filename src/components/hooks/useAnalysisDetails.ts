import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import type { AnalysisDetailsDTO, IssueCategory, IssueDTO } from "@/types";
import { temporaryAnalysisService } from "@/lib/services/temporary-analysis.service";

interface AnalysisDetailsState {
  analysis: AnalysisDetailsDTO | null;
  isLoading: boolean;
  error: string | null;
  selectedFilters: IssueCategory[];
  issues: IssueDTO[];
  currentIssuePage: number;
  totalIssuePages: number;
  isLoadingIssues: boolean;
}

interface UseAnalysisDetailsReturn extends AnalysisDetailsState {
  loadMoreIssues: () => Promise<void>;
  setFilters: (categories: IssueCategory[]) => void;
}

export function useAnalysisDetails(analysisId: string): UseAnalysisDetailsReturn {
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<AnalysisDetailsState>({
    analysis: null,
    isLoading: true,
    error: null,
    selectedFilters: [],
    issues: [],
    currentIssuePage: 1,
    totalIssuePages: 1,
    isLoadingIssues: false,
  });

  const fetchAnalysis = useCallback(
    async (page = 1, categories: IssueCategory[] = []) => {
      try {
        setState((prevState) => ({
          ...prevState,
          isLoading: page === 1,
          isLoadingIssues: page > 1,
        }));

        // First check if this is a temporary analysis (for non-logged users)
        const tempAnalysis = temporaryAnalysisService.getAnalysis(analysisId);

        if (tempAnalysis) {
          // We have a temporary analysis, use it instead of making an API call
          let filteredIssues = tempAnalysis.issues;

          // Apply category filter if needed
          if (categories.length > 0) {
            filteredIssues = filteredIssues.filter((issue) => categories.includes(issue.category));
          }

          // For non-authenticated users, limit to first 2 issues as per PRD
          if (!isAuthenticated && filteredIssues.length > 2) {
            filteredIssues = filteredIssues.slice(0, 2);
          }

          setState({
            analysis: tempAnalysis,
            issues: filteredIssues,
            isLoading: false,
            isLoadingIssues: false,
            error: null,
            selectedFilters: categories,
            currentIssuePage: 1,
            totalIssuePages: 1, // Temp analyses have only one page
          });

          return;
        }

        // Otherwise proceed with API call for persistent analyses
        let url = `/api/analyses/${analysisId}?page=${page}`;

        if (categories.length > 0) {
          url += `&category=${categories.join(",")}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          let errorMessage = "Wystąpił błąd podczas pobierania analizy.";

          switch (response.status) {
            case 401:
              window.location.href = "/login";
              return;
            case 403:
              errorMessage = "Brak dostępu do tej analizy.";
              break;
            case 404:
              errorMessage = "Nie znaleziono analizy.";
              break;
          }

          throw new Error(errorMessage);
        }

        const data = (await response.json()) as AnalysisDetailsDTO;

        // For non-authenticated users, limit to first 2 issues as per PRD
        let displayedIssues = [...data.issues];
        if (!isAuthenticated && displayedIssues.length > 2) {
          displayedIssues = displayedIssues.slice(0, 2);
        }

        setState((prevState) => {
          // If it's the first page, replace all issues
          // Otherwise, append new issues to existing ones
          const issues = page === 1 ? displayedIssues : [...prevState.issues, ...displayedIssues];

          return {
            ...prevState,
            analysis: data,
            issues,
            currentIssuePage: data.issues_pagination.page,
            totalIssuePages: !isAuthenticated ? 1 : data.issues_pagination.pages, // For guests, there's only 1 page (max 2 issues)
            isLoading: false,
            isLoadingIssues: false,
            error: null,
          };
        });
      } catch (error) {
        setState((prevState) => ({
          ...prevState,
          isLoading: false,
          isLoadingIssues: false,
          error: error instanceof Error ? error.message : "Nieznany błąd",
        }));
      }
    },
    [analysisId, isAuthenticated]
  );

  useEffect(() => {
    fetchAnalysis(1, state.selectedFilters);
  }, [fetchAnalysis, state.selectedFilters]);

  const loadMoreIssues = useCallback(async () => {
    // Only authenticated users can load more issues
    if (isAuthenticated && state.currentIssuePage < state.totalIssuePages && !state.isLoadingIssues) {
      await fetchAnalysis(state.currentIssuePage + 1, state.selectedFilters);
    }
  }, [
    fetchAnalysis,
    state.currentIssuePage,
    state.totalIssuePages,
    state.isLoadingIssues,
    state.selectedFilters,
    isAuthenticated,
  ]);

  const setFilters = useCallback((categories: IssueCategory[]) => {
    setState((prevState) => ({
      ...prevState,
      selectedFilters: categories,
      currentIssuePage: 1, // Reset to first page when filters change
    }));
  }, []);

  return {
    ...state,
    loadMoreIssues,
    setFilters,
  };
}
