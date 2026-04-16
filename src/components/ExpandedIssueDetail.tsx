"use client";

import { useIssueDetail } from "@/hooks/use-issue-detail";

interface ExpandedIssueDetailProps {
  owner: string;
  repo: string;
  number: number;
}

export function ExpandedIssueDetail({ owner, repo, number }: ExpandedIssueDetailProps) {
  const { data, error, isLoading } = useIssueDetail(owner, repo, number);

  if (isLoading) {
    return (
      <div role="status" aria-label="Loading issue details" className="animate-pulse p-4">
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 text-sm text-zinc-500">
        Failed to load issue details.
      </div>
    );
  }

  return (
    <div className="border-t bg-zinc-50 px-4 py-3 dark:bg-zinc-900/50" data-testid="issue-detail">
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <div>
          <span className="text-zinc-500 dark:text-zinc-400">Comments: </span>
          <span className="font-medium">{data.commentCount}</span>
        </div>
      </div>
    </div>
  );
}
