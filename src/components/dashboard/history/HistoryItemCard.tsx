import React from "react";
import type { AnalysisHistoryItemViewModel } from "@/types";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

interface HistoryItemCardProps {
  item: AnalysisHistoryItemViewModel;
  onClick: (id: string) => void;
}

const HistoryItemCard: React.FC<HistoryItemCardProps> = ({ item, onClick }) => {
  const formattedDate = new Date(item.createdAt).toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card
      className="cursor-pointer border border-transparent hover:border-primary/50 hover:shadow-md transition-all duration-200"
      onClick={() => onClick(item.id)}
      role="button" // Accessibility: Indicate it's clickable
      tabIndex={0} // Accessibility: Make it focusable
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick(item.id);
      }} // Accessibility: Trigger click on Enter/Space
      aria-label={`Przejdź do analizy z dnia ${formattedDate}`}
    >
      <CardHeader>
        {/* Use CardDescription for the less prominent date */}
        <CardDescription>{formattedDate}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Use a paragraph for the text preview */}
        <p className="text-sm text-muted-foreground line-clamp-3">{item.textPreview}</p>
      </CardContent>
      {/* CardFooter could be used later if error counts are added */}
    </Card>
  );
};

export default HistoryItemCard;
