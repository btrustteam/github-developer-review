"use client";

import { useState } from "react";
import { ChevronRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn, stateColors } from "@/lib/utils";
import { formatDate } from "@/lib/date-utils";
import { ExpandedPRDetail } from "@/components/ExpandedPRDetail";
import type { ContributionDetail } from "@/lib/types";

interface ContributionCardProps {
  item: ContributionDetail;
}

export function ContributionCard({ item }: ContributionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const canExpand = item.type === "pr";
  const [owner, repo] = item.repoNameWithOwner.split("/");

  return (
    <Card className="md:hidden">
      <CardContent className="p-4">
        <div
          className={cn(
            "flex items-start gap-2",
            canExpand && "cursor-pointer"
          )}
          onClick={() => canExpand && setExpanded(!expanded)}
          role={canExpand ? "button" : undefined}
          aria-expanded={canExpand ? expanded : undefined}
        >
          {canExpand && (
            <ChevronRight
              className={cn(
                "mt-0.5 h-4 w-4 flex-shrink-0 text-zinc-400 transition-transform",
                expanded && "rotate-90"
              )}
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
              {item.title}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {item.repoNameWithOwner}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Badge className={stateColors[item.state]} variant="outline">
                {item.state}
              </Badge>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {formatDate(item.createdAt)}
              </span>
            </div>
          </div>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            aria-label={`Open #${item.number} on GitHub`}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
        {expanded && canExpand && (
          <div className="mt-3">
            <ExpandedPRDetail owner={owner} repo={repo} number={item.number} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
