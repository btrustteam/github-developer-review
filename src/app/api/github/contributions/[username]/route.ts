import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCached, setCache } from "@/lib/cache";
import { searchContributions } from "@/lib/github-rest";
import { GITHUB_USERNAME_RE } from "@/lib/utils";
import { RateLimitError } from "@/lib/types";
import type { PaginatedContributions, DrillDownTab } from "@/lib/types";

const VALID_TABS: DrillDownTab[] = ["prs", "reviews", "issues"];
const VALID_STATUSES = ["open", "closed", "merged", "all"];
const CACHE_TTL = 600; // 10 minutes

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username } = await params;

  if (!GITHUB_USERNAME_RE.test(username)) {
    return NextResponse.json(
      { error: "Invalid GitHub username" },
      { status: 400 }
    );
  }

  const url = new URL(request.url);
  const tab = (url.searchParams.get("tab") ?? "prs") as DrillDownTab;
  const page = parseInt(url.searchParams.get("page") ?? "1", 10);
  const from = url.searchParams.get("from") ?? undefined;
  const to = url.searchParams.get("to") ?? undefined;
  const project = url.searchParams.get("project") ?? undefined;
  const status = url.searchParams.get("status") ?? undefined;

  // Validate
  if (!VALID_TABS.includes(tab)) {
    return NextResponse.json({ error: "Invalid tab" }, { status: 400 });
  }
  if (isNaN(page) || page < 1) {
    return NextResponse.json({ error: "Invalid page" }, { status: 400 });
  }
  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Cache key — use labeled segments to avoid collisions from undefined values
  const cacheKey = `contributions:${username.toLowerCase()}:tab=${tab}:page=${page}:from=${from ?? ""}:to=${to ?? ""}:project=${project ?? ""}:status=${status ?? ""}`;

  const cached = await getCached<PaginatedContributions>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const result = await searchContributions(
      username,
      session.accessToken,
      { tab, from, to, project, status },
      page
    );

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
