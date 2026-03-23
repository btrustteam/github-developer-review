"use client";

import { useState } from "react";
import { ChevronRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, stateColors } from "@/lib/utils";
import { formatDate } from "@/lib/date-utils";
import { ExpandedPRDetail } from "@/components/ExpandedPRDetail";
import { EmptyState } from "@/components/EmptyState";
import type { ContributionDetail } from "@/lib/types";

interface ContributionTableProps {
  items: ContributionDetail[];
}

export function ContributionTable({ items }: ContributionTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (items.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="hidden md:block text-sm">
      {/* Header row */}
      <div className="flex items-center gap-3 border-b px-2 pb-2 font-medium text-zinc-500 dark:text-zinc-400">
        <div className="w-4 flex-shrink-0" />
        <div className="min-w-0 flex-1">Title</div>
        <div className="w-40 flex-shrink-0">Repo</div>
        <div className="w-16 flex-shrink-0">Status</div>
        <div className="w-28 flex-shrink-0">Date</div>
        <div className="w-4 flex-shrink-0" />
      </div>

      {/* Data rows */}
      {items.map((item) => {
        const isExpanded = expandedId === item.id;
        const canExpand = item.type === "pr";
        const [owner, repo] = item.repoNameWithOwner.split("/");

        return (
          <div key={item.id}>
            <div
              className={cn(
                "flex items-center gap-3 border-b px-2 py-3 transition-colors",
                canExpand && "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900",
              )}
              onClick={() => {
                if (canExpand) {
                  setExpandedId(isExpanded ? null : item.id);
                }
              }}
              role={canExpand ? "button" : undefined}
              aria-expanded={canExpand ? isExpanded : undefined}
            >
              <div className="w-4 flex-shrink-0">
                {canExpand && (
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 text-zinc-400 transition-transform",
                      isExpanded && "rotate-90"
                    )}
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="block truncate">{item.title}</span>
              </div>
              <div className="w-40 flex-shrink-0 truncate text-zinc-500 dark:text-zinc-400">
                {item.repoNameWithOwner}
              </div>
              <div className="w-16 flex-shrink-0">
                <Badge
                  className={stateColors[item.state]}
                  variant="outline"
                >
                  {item.state}
                </Badge>
              </div>
              <div className="w-28 flex-shrink-0 text-zinc-500 dark:text-zinc-400">
                {formatDate(item.createdAt)}
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
            {isExpanded && canExpand && (
              <ExpandedPRDetail owner={owner} repo={repo} number={item.number} />
            )}
          </div>
        );
      })}
    </div>
  );
}
