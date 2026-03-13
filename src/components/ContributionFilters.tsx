"use client";

import { useMemo } from "react";
import type { RepoClassification, RelevanceTier } from "@/lib/types";

interface ContributionFiltersProps {
  bitcoinRepos: RepoClassification[];
  project?: string;
  status: string;
  tier: string;
  onProjectChange: (project: string | undefined) => void;
  onStatusChange: (status: "open" | "closed" | "merged" | "all") => void;
  onTierChange: (tier: RelevanceTier | "all") => void;
}

const selectClass =
  "rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

export function ContributionFilters({
  bitcoinRepos,
  project,
  status,
  tier,
  onProjectChange,
  onStatusChange,
  onTierChange,
}: ContributionFiltersProps) {
  // Deduplicate repos for dropdown
  const repos = useMemo(
    () => [...new Set(bitcoinRepos.map((r) => r.nameWithOwner))].sort(),
    [bitcoinRepos]
  );

  return (
    <div className="flex flex-wrap gap-3">
      <select
        aria-label="Project"
        value={project ?? ""}
        onChange={(e) =>
          onProjectChange(e.target.value || undefined)
        }
        className={selectClass}
      >
        <option value="">All projects</option>
        {repos.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <select
        aria-label="Status"
        value={status}
        onChange={(e) =>
          onStatusChange(e.target.value as "open" | "closed" | "merged" | "all")
        }
        className={selectClass}
      >
        <option value="all">All statuses</option>
        <option value="open">Open</option>
        <option value="closed">Closed</option>
        <option value="merged">Merged</option>
      </select>

      <select
        aria-label="Tier"
        value={tier}
        onChange={(e) =>
          onTierChange(e.target.value as RelevanceTier | "all")
        }
        className={selectClass}
      >
        <option value="all">All tiers</option>
        <option value="core">Core</option>
        <option value="ecosystem">Ecosystem</option>
        <option value="adjacent">Adjacent</option>
      </select>
    </div>
  );
}
