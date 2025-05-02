import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { IssueCategory } from "@/types";

interface CategoryBadgeProps {
  category: IssueCategory;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const getVariant = () => {
    switch (category) {
      case "critical":
        return "destructive";
      case "important":
        return "warning";
      case "minor":
        return "secondary";
      default:
        return "default";
    }
  };

  const getCategoryDescription = () => {
    switch (category) {
      case "critical":
        return "Krytyczny problem wymagający natychmiastowej uwagi. Poważne naruszenie GDPR.";
      case "important":
        return "Ważny problem, który należy rozwiązać. Może prowadzić do niezgodności z GDPR.";
      case "minor":
        return "Drobny problem lub sugestia ulepszenia zgodności z GDPR.";
      default:
        return "Problem związany z GDPR.";
    }
  };

  // Get display name in Polish
  const getCategoryDisplayName = () => {
    switch (category) {
      case "critical":
        return "Krytyczny";
      case "important":
        return "Ważny";
      case "minor":
        return "Drobny";
      default:
        return category;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={getVariant() as "default" | "destructive" | "outline" | "secondary"} className="capitalize">
            {getCategoryDisplayName()}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs text-xs">{getCategoryDescription()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
