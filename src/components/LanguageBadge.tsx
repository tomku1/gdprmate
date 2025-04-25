import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface LanguageBadgeProps {
  language: string;
}

export function LanguageBadge({ language }: LanguageBadgeProps) {
  // Get full language name from code
  const getFullLanguageName = () => {
    const languages: Record<string, string> = {
      pl: "Polski",
      en: "English",
      de: "Deutsch",
      fr: "Français",
      es: "Español",
      it: "Italiano",
    };

    return languages[language.toLowerCase()] || language;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="text-xs font-normal px-2.5 py-0.5 uppercase">
            {language}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            Wykryty język dokumentu: <span className="font-medium">{getFullLanguageName()}</span>
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
