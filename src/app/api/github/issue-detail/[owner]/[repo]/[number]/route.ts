import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCached, setCache } from "@/lib/cache";
import { fetchIssueDetail } from "@/lib/github-rest";
import { RateLimitError } from "@/lib/types";
import type { IssueDetail } from "@/lib/types";

const CACHE_TTL = 600; // 10 minutes

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ owner: string; repo: string; number: string }> }
) {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { owner, repo, number: numStr } = await params;
  const issueNumber = parseInt(numStr, 10);

  if (isNaN(issueNumber) || issueNumber < 1) {
    return NextResponse.json({ error: "Invalid issue number" }, { status: 400 });
  }

  const cacheKey = `issue-detail:${owner}/${repo}/${issueNumber}`;

  const cached = await getCached<IssueDetail>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const result = await fetchIssueDetail(owner, repo, issueNumber, session.accessToken);

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
