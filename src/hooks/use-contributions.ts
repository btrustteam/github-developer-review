"use client";

import useSWRInfinite from "swr/infinite";
import type { PaginatedContributions, ContributionFilters } from "@/lib/types";

type ContributionsError = {
  status: number;
  message: string;
  resetAt?: number;
};

async function fetcher(url: string): Promise<PaginatedContributions> {
  const res = await fetch(url);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err: ContributionsError = {
      status: res.status,
      message: body.error ?? "An unexpected error occurred",
      resetAt: body.resetAt,
    };
    throw err;
  }

  return res.json();
}

function buildUrl(
  username: string,
  filters: ContributionFilters,
  page: number
): string {
  const params = new URLSearchParams();
  params.set("tab", filters.tab);
  params.set("page", String(page));
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.project) params.set("project", filters.project);
  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }
  return `/api/github/contributions/${username}?${params.toString()}`;
}

export function useContributions(
  username: string | undefined,
  filters: ContributionFilters
) {
  const { data, error, size, setSize, isLoading, isValidating } =
    useSWRInfinite<PaginatedContributions, ContributionsError>(
      (pageIndex) => {
        if (!username) return null;
        return buildUrl(username, filters, pageIndex + 1);
      },
      fetcher,
      {
        revalidateOnFocus: false,
        revalidateFirstPage: false,
        dedupingInterval: 300_000,
      }
    );

  const items = data ? data.flatMap((page) => page.items) : [];
  const totalCount = data?.[0]?.totalCount ?? 0;
  const hasMore = data ? data[data.length - 1]?.hasMore ?? false : false;

  return {
    items,
    totalCount,
    hasMore,
    error,
    isLoading,
    isLoadingMore: isValidating && size > 1 && data && data.length < size,
    loadMore: () => setSize(size + 1),
  };
}
