import React, { useRef, useCallback } from "react";
import type { AnalysisHistoryItemViewModel, PaginationDTO } from "@/types";
import HistoryItemCard from "./HistoryItemCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface InfiniteScrollListProps {
  items: AnalysisHistoryItemViewModel[];
  pagination: PaginationDTO | null;
  isLoading: boolean;
  isInitialLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onItemClick: (id: string) => void;
  emptyStateMessage?: React.ReactNode;
  // Allow customizing the number of skeleton loaders during initial load
  initialLoadSkeletonCount?: number;
}

const InfiniteScrollList: React.FC<InfiniteScrollListProps> = ({
  items,
  isLoading,
  isInitialLoading,
  hasMore,
  onLoadMore,
  onItemClick,
  emptyStateMessage = <p>Brak zapisanych analiz.</p>,
  initialLoadSkeletonCount = 5, // Show 5 skeletons initially
}) => {
  const observer = useRef<IntersectionObserver | null>(null);

  // Callback ref for the last element to observe
  const lastElementRef = useCallback(
    (node: HTMLLIElement | null) => {
      if (isLoading) return; // Don't observe if already loading
      if (observer.current) observer.current.disconnect(); // Disconnect previous observer

      observer.current = new IntersectionObserver((entries) => {
        // If the last element is intersecting and there are more pages, load more
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      });

      if (node) observer.current.observe(node); // Observe the new node if it exists
    },
    [isLoading, hasMore, onLoadMore]
  );

  // Render skeleton loaders
  const renderSkeletons = (count: number) => {
    return Array.from({ length: count }).map((_, index) => (
      <li key={`skeleton-${index}`}>
        <Card className="flex flex-col justify-between p-4 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </Card>
      </li>
    ));
  };

  return (
    <div className="space-y-4">
      {" "}
      {/* Add spacing between list items */}
      {isInitialLoading ? (
        <ul className="space-y-4">{renderSkeletons(initialLoadSkeletonCount)}</ul>
      ) : items.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">{emptyStateMessage}</div>
      ) : (
        <ul className="space-y-4">
          {items.map((item, index) => {
            // Attach the ref to the last element in the list
            if (items.length === index + 1) {
              return (
                <li key={item.id} ref={lastElementRef}>
                  <HistoryItemCard item={item} onClick={onItemClick} />
                </li>
              );
            }
            return (
              <li key={item.id}>
                <HistoryItemCard item={item} onClick={onItemClick} />
              </li>
            );
          })}
          {/* Show skeleton loaders at the end while loading more items */}
          {isLoading && !isInitialLoading && renderSkeletons(2)}
        </ul>
      )}
    </div>
  );
};

export default InfiniteScrollList;
