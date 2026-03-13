import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCached, setCache } from "@/lib/cache";
import { fetchPRDetail } from "@/lib/github-rest";
import { RateLimitError } from "@/lib/types";
import type { PRDetail } from "@/lib/types";

const CACHE_TTL = 86400; // 24 hours - merged PRs are immutable

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ owner: string; repo: string; number: string }> }
) {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { owner, repo, number: numStr } = await params;
  const prNumber = parseInt(numStr, 10);

  if (isNaN(prNumber) || prNumber < 1) {
    return NextResponse.json({ error: "Invalid PR number" }, { status: 400 });
  }

  const cacheKey = `pr-detail:${owner}/${repo}/${prNumber}`;

  const cached = await getCached<PRDetail>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const result = await fetchPRDetail(owner, repo, prNumber, session.accessToken);

    await setCache(cacheKey, result, CACHE_TTL);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: "Rate limit exceeded", resetAt: error.resetAt },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: "GitHub API error" },
      { status: 502 }
    );
  }
}
