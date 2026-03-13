"use client";

import useSWR from "swr";
import type { PRDetail } from "@/lib/types";

type PRDetailError = {
  status: number;
  message: string;
  resetAt?: number;
};

async function fetcher(url: string): Promise<PRDetail> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err: PRDetailError = {
      status: res.status,
      message: body.error ?? "Failed to fetch PR detail",
      resetAt: body.resetAt,
    };
    throw err;
  }
  return res.json();
}

export function usePRDetail(
  owner: string | undefined,
  repo: string | undefined,
  number: number | undefined
) {
  const shouldFetch = owner && repo && number;
  const key = shouldFetch
    ? `/api/github/pr-detail/${owner}/${repo}/${number}`
    : null;

  const { data, error, isLoading } = useSWR<PRDetail>(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 600_000,
  });

  return { data, error, isLoading };
}
