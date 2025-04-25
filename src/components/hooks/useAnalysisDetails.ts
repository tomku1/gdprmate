import { useState, useEffect, useCallback } from "react";
import type { AnalysisDetailsDTO, IssueCategory, IssueDTO, PaginationDTO } from "@/types";

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

        let url = `/api/analyses/${analysisId}?page=${page}`;

        if (categories.length > 0) {
          url += `&category=${categories.join(",")}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          const errorText = await response.text();
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

        setState((prevState) => {
          // If it's the first page, replace all issues
          // Otherwise, append new issues to existing ones
          const issues = page === 1 ? [...data.issues] : [...prevState.issues, ...data.issues];

          return {
            ...prevState,
            analysis: data,
            issues,
            currentIssuePage: data.issues_pagination.page,
            totalIssuePages: data.issues_pagination.pages,
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
    [analysisId]
  );

  useEffect(() => {
    fetchAnalysis(1, state.selectedFilters);
  }, [fetchAnalysis, state.selectedFilters]);

  const loadMoreIssues = useCallback(async () => {
    if (state.currentIssuePage < state.totalIssuePages && !state.isLoadingIssues) {
      await fetchAnalysis(state.currentIssuePage + 1, state.selectedFilters);
    }
  }, [fetchAnalysis, state.currentIssuePage, state.totalIssuePages, state.isLoadingIssues, state.selectedFilters]);

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
