import React from "react";
import { IssueCard } from "./IssueCard";
import type { IssueDTO, PaginationDTO } from "@/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface IssuesListProps {
  issues: IssueDTO[];
  pagination: PaginationDTO;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

export function IssuesList({ issues, pagination, isLoadingMore, onLoadMore }: IssuesListProps) {
  const showLoadMoreButton = pagination.page < pagination.pages;

  if (issues.length === 0) {
    return (
      <div className="text-center py-12 px-6 border rounded-lg bg-muted/20">
        <div className="text-3xl mb-3">🔍</div>
        <h3 className="text-lg font-medium mb-2">Brak problemów do wyświetlenia</h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Nie znaleziono problemów dla wybranych filtrów. Spróbuj zmienić kryteria filtrowania lub sprawdź inny
          dokument.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <h2 className="text-xl font-semibold">
          Zidentyfikowane problemy
          <span className="ml-2 text-sm font-normal text-muted-foreground">({pagination.total})</span>
        </h2>

        <div className="text-xs text-muted-foreground">
          Strona {pagination.page} z {pagination.pages}
        </div>
      </div>

      <div className="space-y-4">
        {issues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>

      {isLoadingMore && (
        <div className="mt-6 space-y-3">
          <Skeleton className="h-[140px] w-full rounded-lg" />
          <Skeleton className="h-[140px] w-full rounded-lg" />
        </div>
      )}

      {showLoadMoreButton && !isLoadingMore && (
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={onLoadMore} size="lg" className="w-full sm:w-auto">
            Załaduj więcej problemów
          </Button>
        </div>
      )}

      {!showLoadMoreButton && issues.length > 0 && (
        <div className="mt-6 text-center text-sm text-muted-foreground">Wszystkie problemy zostały załadowane</div>
      )}
    </div>
  );
}
