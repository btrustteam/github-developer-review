"use client";

import useSWR from "swr";
import type { IssueDetail } from "@/lib/types";

type IssueDetailError = {
  status: number;
  message: string;
  resetAt?: number;
};

async function fetcher(url: string): Promise<IssueDetail> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err: IssueDetailError = {
      status: res.status,
      message: body.error ?? "Failed to fetch issue detail",
      resetAt: body.resetAt,
    };
    throw err;
  }
  return res.json();
}

export function useIssueDetail(
  owner: string | undefined,
  repo: string | undefined,
  number: number | undefined
) {
  const shouldFetch = owner && repo && number;
  const key = shouldFetch
    ? `/api/github/issue-detail/${owner}/${repo}/${number}`
    : null;

  const { data, error, isLoading } = useSWR<IssueDetail>(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 600_000,
  });

  return { data, error, isLoading };
}
