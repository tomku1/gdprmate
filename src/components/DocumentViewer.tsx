import React from "react";
import { LanguageBadge } from "./LanguageBadge";
import type { AnalysisDetailsDTO } from "@/types";

interface DocumentViewerProps {
  analysisData: AnalysisDetailsDTO;
}

export function DocumentViewer({ analysisData }: DocumentViewerProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <h2 className="text-xl font-semibold">Analizowany dokument</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Język:</span>
          <LanguageBadge language={analysisData.detected_language} />
        </div>
      </div>

      <div className="p-4 border rounded-lg bg-muted/30 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 text-xs text-muted-foreground">
          <span>Data analizy: {new Date(analysisData.created_at).toLocaleString()}</span>
          <span>Model: {analysisData.model_version}</span>
        </div>

        <div className="mt-4 whitespace-pre-wrap font-mono text-sm p-3 bg-card rounded border max-h-[500px] overflow-y-auto shadow-inner">
          {analysisData.text_content}
        </div>
      </div>
    </div>
  );
}
