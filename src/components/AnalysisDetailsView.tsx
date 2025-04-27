import React, { useState, useEffect } from "react";
import { DocumentViewer } from "./DocumentViewer";
import { FilterControls } from "./FilterControls";
import { IssuesList } from "./IssuesList";
import { useAnalysisDetails } from "./hooks/useAnalysisDetails";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "./hooks/useAuth";
import { Alert, AlertDescription } from "./ui/alert";
import type { IssueCategory } from "@/types";

interface AnalysisDetailsViewProps {
  analysisId: string;
}

export function AnalysisDetailsView({ analysisId }: AnalysisDetailsViewProps) {
  const { isAuthenticated } = useAuth();
  const {
    analysis,
    issues,
    isLoading,
    error,
    selectedFilters,
    setFilters,
    currentIssuePage,
    totalIssuePages,
    isLoadingIssues,
    loadMoreIssues,
  } = useAnalysisDetails(analysisId);

  const [showScrollTop, setShowScrollTop] = useState(false);
  // Add client-side rendering flag to prevent hydration mismatches
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true once component mounts on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if we should show scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // All available categories for filtering
  const availableCategories: IssueCategory[] = ["critical", "important", "minor"];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-[300px] w-full rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-md" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="space-y-4 mt-6">
            <Skeleton className="h-[160px] w-full rounded-lg" />
            <Skeleton className="h-[160px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/10 my-12">
        <div className="mb-4 text-destructive text-4xl">⚠️</div>
        <h2 className="text-xl font-semibold mb-3">Nie można wyświetlić analizy</h2>
        <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
        <a
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Wróć do panelu
        </a>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Mobile view - stacked */}
      <div className="lg:hidden">
        <DocumentViewer analysisData={analysis} />
        <div className="mt-8">
          {/* Only render auth notice when on client side to prevent hydration mismatch */}
          {isClient && !isAuthenticated && <AuthNoticeAlert />}
          <FilterControls
            availableCategories={availableCategories}
            selectedCategories={selectedFilters}
            onFilterChange={setFilters}
          />
          <IssuesList
            issues={issues}
            pagination={{
              total: analysis.issues_pagination.total,
              page: currentIssuePage,
              limit: analysis.issues_pagination.limit,
              pages: totalIssuePages,
            }}
            isLoadingMore={isLoadingIssues}
            onLoadMore={loadMoreIssues}
          />
        </div>
      </div>

      {/* Desktop view - side by side */}
      <div className="hidden lg:grid lg:grid-cols-[1fr_1.5fr] lg:gap-8">
        <div>
          <DocumentViewer analysisData={analysis} />
        </div>
        <div>
          {/* Only render auth notice when on client side to prevent hydration mismatch */}
          {isClient && !isAuthenticated && <AuthNoticeAlert />}
          <FilterControls
            availableCategories={availableCategories}
            selectedCategories={selectedFilters}
            onFilterChange={setFilters}
          />
          <IssuesList
            issues={issues}
            pagination={{
              total: analysis.issues_pagination.total,
              page: currentIssuePage,
              limit: analysis.issues_pagination.limit,
              pages: totalIssuePages,
            }}
            isLoadingMore={isLoadingIssues}
            onLoadMore={loadMoreIssues}
          />
        </div>
      </div>

      {/* Scroll to top button - visible on mobile & when scrolled down */}
      {showScrollTop && (
        <Button
          className="fixed bottom-4 right-4 rounded-full size-12 p-0 shadow-lg z-50"
          onClick={scrollToTop}
          aria-label="Przewiń do góry"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 5L5 12M12 5L19 12M12 5V19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      )}
    </div>
  );
}

function AuthNoticeAlert() {
  return (
    <Alert className="mb-6 bg-muted/50 border border-primary/20">
      <AlertDescription>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="font-medium">Ograniczona widoczność dla niezalogowanych użytkowników</p>
            <p className="text-sm text-muted-foreground mt-1">
              Widzisz tylko 2 pierwsze problemy. Zaloguj się, aby zobaczyć wszystkie wyniki analizy.
            </p>
          </div>
          <a href="/login" className="shrink-0">
            <Button size="sm">Zaloguj się</Button>
          </a>
        </div>
      </AlertDescription>
    </Alert>
  );
}
