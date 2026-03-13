"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import { getPresetRange } from "@/lib/date-utils";
import type { PresetKey } from "@/lib/date-utils";
import type { ContributionFilters, DrillDownTab, RelevanceTier } from "@/lib/types";

const DEFAULT_PRESET: PresetKey = "1yr";

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function useContributionFilters(): {
  filters: ContributionFilters;
  setTab: (tab: DrillDownTab) => void;
  setPreset: (preset: PresetKey | "custom") => void;
  setProject: (project: string | undefined) => void;
  setStatus: (status: "open" | "closed" | "merged" | "all") => void;
  setTier: (tier: RelevanceTier | "all") => void;
} {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo((): ContributionFilters => {
    const tab = (searchParams.get("tab") as DrillDownTab) ?? "prs";
    const preset = (searchParams.get("preset") as PresetKey | "custom") ?? DEFAULT_PRESET;

    let from: string | undefined;
    let to: string | undefined;

    if (preset !== "custom") {
      const range = getPresetRange(preset as PresetKey);
      from = formatDate(range.from);
      to = formatDate(range.to);
    } else {
      from = searchParams.get("from") ?? undefined;
      to = searchParams.get("to") ?? undefined;
    }

    return {
      tab,
      preset,
      from,
      to,
      project: searchParams.get("project") ?? undefined,
      status: (searchParams.get("status") as ContributionFilters["status"]) ?? "all",
      tier: (searchParams.get("tier") as ContributionFilters["tier"]) ?? "all",
    };
  }, [searchParams]);

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const setTab = useCallback(
    (tab: DrillDownTab) => updateParams({ tab }),
    [updateParams]
  );

  const setPreset = useCallback(
    (preset: PresetKey | "custom") => {
      if (preset === "custom") {
        updateParams({ preset });
      } else {
        // Clear custom from/to when switching to preset
        updateParams({ preset, from: undefined, to: undefined });
      }
    },
    [updateParams]
  );

  const setProject = useCallback(
    (project: string | undefined) => updateParams({ project }),
    [updateParams]
  );

  const setStatus = useCallback(
    (status: "open" | "closed" | "merged" | "all") =>
      updateParams({ status: status === "all" ? undefined : status }),
    [updateParams]
  );

  const setTier = useCallback(
    (tier: RelevanceTier | "all") =>
      updateParams({ tier: tier === "all" ? undefined : tier }),
    [updateParams]
  );

  return { filters, setTab, setPreset, setProject, setStatus, setTier };
}
