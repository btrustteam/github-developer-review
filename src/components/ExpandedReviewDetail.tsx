"use client";

import { usePRDetail } from "@/hooks/use-pr-detail";

interface ExpandedReviewDetailProps {
  owner: string;
  repo: string;
  number: number;
}

export function ExpandedReviewDetail({ owner, repo, number }: ExpandedReviewDetailProps) {
  const { data, error, isLoading } = usePRDetail(owner, repo, number);

  if (isLoading) {
    return (
      <div role="status" aria-label="Loading review details" className="animate-pulse p-4">
        <div className="flex gap-6">
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="h-4 w-16 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 text-sm text-zinc-500">
        Failed to load review details.
      </div>
    );
  }

  return (
    <div className="border-t bg-zinc-50 px-4 py-3 dark:bg-zinc-900/50" data-testid="review-detail">
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <div>
          <span className="text-zinc-500 dark:text-zinc-400">Reviews: </span>
          <span className="font-medium">{data.reviewCount}</span>
        </div>
        <div>
          <span className="text-zinc-500 dark:text-zinc-400">Comments: </span>
          <span className="font-medium">{data.commentCount}</span>
        </div>
      </div>
    </div>
  );
}
