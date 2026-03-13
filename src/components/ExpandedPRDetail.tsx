"use client";

import { usePRDetail } from "@/hooks/use-pr-detail";

interface ExpandedPRDetailProps {
  owner: string;
  repo: string;
  number: number;
}

function formatDuration(ms: number): string {
  const hours = Math.floor(ms / 3_600_000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h`;
  return `${hours}h`;
}

export function ExpandedPRDetail({ owner, repo, number }: ExpandedPRDetailProps) {
  const { data, error, isLoading } = usePRDetail(owner, repo, number);

  if (isLoading) {
    return (
      <div role="status" aria-label="Loading PR details" className="animate-pulse p-4">
        <div className="flex gap-6">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-4 w-16 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 text-sm text-zinc-500">
        Failed to load PR details.
      </div>
    );
  }

  const stats = [
    { label: "Additions", value: `+${data.additions}`, color: "text-green-600 dark:text-green-400" },
    { label: "Deletions", value: `-${data.deletions}`, color: "text-red-600 dark:text-red-400" },
    { label: "Files", value: data.changedFiles },
    { label: "Commits", value: data.commits },
    { label: "Reviews", value: data.reviewCount },
    {
      label: "Time to merge",
      value: data.timeToMerge ? formatDuration(data.timeToMerge) : "\u2014",
    },
  ];

  return (
    <div className="border-t bg-zinc-50 px-4 py-3 dark:bg-zinc-900/50" data-testid="pr-detail">
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {stats.map(({ label, value, color }) => (
          <div key={label}>
            <span className="text-zinc-500 dark:text-zinc-400">{label}: </span>
            <span className={`font-medium ${color ?? ""}`}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
