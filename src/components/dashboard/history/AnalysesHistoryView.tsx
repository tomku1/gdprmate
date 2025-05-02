import React from "react";
import { useAnalysesHistory } from "@/hooks/useAnalysesHistory";
import InfiniteScrollList from "./InfiniteScrollList";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react"; // Import an icon for the alert

const AnalysesHistoryView: React.FC = () => {
  const {
    analyses,
    isLoading,
    isInitialLoading,
    error,
    hasMore,
    loadMoreAnalyses,
    retryFetch,
    pagination, // Get pagination info for the list
  } = useAnalysesHistory();

  // Handle navigation to the details page
  const handleItemClick = (id: string) => {
    // Use relative path for navigation within the dashboard
    window.location.href = `/analyses/${id}`; // Correct path to existing details page
    // If using Astro's View Transitions, you might use navigate() instead:
    // import { navigate } from 'astro:transitions/client';
    // navigate(`/analyses/${id}`);
  };

  // Component to display errors
  const ErrorMessage: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Błąd</AlertTitle>
      <AlertDescription>
        {message}
        {onRetry && (
          <Button onClick={onRetry} variant="secondary" size="sm" className="ml-4">
            Spróbuj ponownie
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <h1 className="text-2xl font-semibold mb-4">Historia Analiz</h1>

      {/* Display error message if there is an error */}
      {error && <ErrorMessage message={error} onRetry={retryFetch} />}

      {/* Infinite Scroll List - Don't render list if there was an initial error */}
      {!error || analyses.length > 0 ? (
        <InfiniteScrollList
          items={analyses}
          pagination={pagination} // Pass pagination info
          isLoading={isLoading}
          isInitialLoading={isInitialLoading}
          hasMore={hasMore}
          onLoadMore={loadMoreAnalyses}
          onItemClick={handleItemClick}
          emptyStateMessage={<p>Nie znaleziono żadnych analiz pasujących do kryteriów.</p>}
        />
      ) : // If there was an error during initial load, ErrorMessage is already shown
      // No need to render the list container or empty state here again.
      null}
    </div>
  );
};

export default AnalysesHistoryView;
