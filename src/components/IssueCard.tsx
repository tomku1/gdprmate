import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CategoryBadge } from "./CategoryBadge";
import type { IssueDTO } from "@/types";

interface IssueCardProps {
  issue: IssueDTO;
}

export function IssueCard({ issue }: IssueCardProps) {
  return (
    <Card className="mb-4 transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <CategoryBadge category={issue.category} />
        <time className="text-xs text-muted-foreground">{new Date(issue.created_at).toLocaleDateString()}</time>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2">Problem:</h3>
          <p className="text-sm text-muted-foreground">{issue.description}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-2">Sugestia:</h3>
          <div className="bg-muted p-4 rounded-md text-sm font-mono whitespace-pre-wrap border border-border shadow-inner">
            {issue.suggestion}
          </div>
          <div className="mt-3 text-xs text-right text-muted-foreground">ID: {issue.id.substring(0, 8)}</div>
        </div>
      </CardContent>
    </Card>
  );
}
