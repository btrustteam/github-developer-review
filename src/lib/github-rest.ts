import { githubFetch } from "./github-search";
import type {
  ContributionDetail,
  PRDetail,
  PaginatedContributions,
  DrillDownTab,
} from "./types";

const PER_PAGE = 30;
const REPO_NAME_RE = /repos\/(.+)$/;

interface SearchFilters {
  tab: DrillDownTab;
  from?: string;
  to?: string;
  project?: string;
  status?: string;
}

interface GitHubSearchItem {
  id: number;
  number: number;
  title: string;
  state: string;
  created_at: string;
  closed_at: string | null;
  html_url: string;
  repository_url: string;
  pull_request?: {
    merged_at: string | null;
  };
}

interface GitHubSearchResponse {
  total_count: number;
  items: GitHubSearchItem[];
}

interface GitHubPR {
  additions: number;
  deletions: number;
  changed_files: number;
  commits: number;
  merged_at: string | null;
  created_at: string;
}

interface GitHubReview {
  id: number;
  state: string;
}

function buildSearchQuery(
  username: string,
  filters: SearchFilters
): string {
  const parts: string[] = [];

  if (filters.tab === "reviews") {
    parts.push(`reviewed-by:${username}`);
    parts.push("type:pr");
  } else if (filters.tab === "prs") {
    parts.push(`author:${username}`);
    parts.push("type:pr");
  } else {
    parts.push(`author:${username}`);
    parts.push("type:issue");
  }

  if (filters.from || filters.to) {
    const from = filters.from ?? "*";
    const to = filters.to ?? "*";
    parts.push(`created:${from}..${to}`);
  }

  if (filters.project) {
    parts.push(`repo:${filters.project}`);
  }

  if (filters.status && filters.status !== "all") {
    if (filters.status === "merged") {
      parts.push("is:merged");
    } else {
      parts.push(`is:${filters.status}`);
    }
  }

  return parts.join(" ");
}

function repoNameFromUrl(repositoryUrl: string): string {
  // https://api.github.com/repos/owner/repo -> owner/repo
  const match = repositoryUrl.match(REPO_NAME_RE);
  return match ? match[1] : repositoryUrl;
}

function mapItemType(tab: DrillDownTab): "pr" | "issue" | "review" {
  if (tab === "prs") return "pr";
  if (tab === "reviews") return "review";
  return "issue";
}

function mapItemState(
  item: GitHubSearchItem
): "open" | "closed" | "merged" {
  if (item.pull_request?.merged_at) return "merged";
  return item.state as "open" | "closed";
}

function mapSearchItem(
  item: GitHubSearchItem,
  tab: DrillDownTab
): ContributionDetail {
  return {
    id: item.id,
    number: item.number,
    title: item.title,
    repoNameWithOwner: repoNameFromUrl(item.repository_url),
    type: mapItemType(tab),
    state: mapItemState(item),
    createdAt: item.created_at,
    closedAt: item.closed_at,
    url: item.html_url,
  };
}

export async function searchContributions(
  username: string,
  token: string,
  filters: SearchFilters,
  page: number = 1
): Promise<PaginatedContributions> {
  const q = encodeURIComponent(buildSearchQuery(username, filters));
  const path = `/search/issues?q=${q}&sort=created&order=desc&per_page=${PER_PAGE}&page=${page}`;

  const data = (await githubFetch(path, token)) as GitHubSearchResponse;

  const items = data.items.map((item) => mapSearchItem(item, filters.tab));
  const totalCount = Math.min(data.total_count, 1000); // GitHub caps at 1000

  return {
    items,
    totalCount,
    hasMore: page * PER_PAGE < totalCount,
    page,
  };
}

export async function fetchPRDetail(
  owner: string,
  repo: string,
  number: number,
  token: string
): Promise<PRDetail> {
  const [prData, reviewsData] = await Promise.all([
    githubFetch(`/repos/${owner}/${repo}/pulls/${number}`, token) as Promise<GitHubPR>,
    githubFetch(
      `/repos/${owner}/${repo}/pulls/${number}/reviews`,
      token
    ) as Promise<GitHubReview[]>,
  ]);

  const mergedAt = prData.merged_at;
  let timeToMerge: number | null = null;

  if (mergedAt) {
    timeToMerge =
      new Date(mergedAt).getTime() - new Date(prData.created_at).getTime();
  }

  return {
    number,
    repoNameWithOwner: `${owner}/${repo}`,
    additions: prData.additions,
    deletions: prData.deletions,
    changedFiles: prData.changed_files,
    commits: prData.commits,
    mergedAt,
    timeToMerge,
    reviewCount: reviewsData.length,
  };
}

// Export for testing
export { buildSearchQuery, mapSearchItem, repoNameFromUrl };
export type { SearchFilters, GitHubSearchItem, GitHubSearchResponse };
