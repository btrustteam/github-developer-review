import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { ContributionDrillDown } from "@/components/ContributionDrillDown";
import type { RepoClassification } from "@/lib/types";

// Mock hooks
const mockSetTab = vi.fn();
const mockSetPreset = vi.fn();
const mockSetProject = vi.fn();
const mockSetStatus = vi.fn();
const mockSetTier = vi.fn();
const mockLoadMore = vi.fn();

import type { ContributionFilters, ContributionDetail } from "@/lib/types";

let mockFilters: ContributionFilters = {
  tab: "prs",
  preset: "1yr",
  status: "all",
  tier: "all",
  from: "2024-01-01",
  to: "2025-01-01",
};

let mockContributions: {
  items: ContributionDetail[];
  totalCount: number;
  hasMore: boolean;
  error: { status: number; message: string; resetAt?: number } | undefined;
  isLoading: boolean;
  isLoadingMore: boolean;
  loadMore: typeof mockLoadMore;
} = {
  items: [
    {
      id: 1,
      number: 42,
      title: "Fix bug",
      repoNameWithOwner: "bitcoin/bitcoin",
      type: "pr",
      state: "merged",
      createdAt: "2024-06-01T00:00:00Z",
      closedAt: "2024-06-02T00:00:00Z",
      url: "https://github.com/bitcoin/bitcoin/pull/42",
    },
  ],
  totalCount: 1,
  hasMore: false,
  error: undefined,
  isLoading: false,
  isLoadingMore: false,
  loadMore: mockLoadMore,
};

vi.mock("@/hooks/use-contribution-filters", () => ({
  useContributionFilters: () => ({
    filters: mockFilters,
    setTab: mockSetTab,
    setPreset: mockSetPreset,
    setProject: mockSetProject,
    setStatus: mockSetStatus,
    setTier: mockSetTier,
  }),
}));

vi.mock("@/hooks/use-contributions", () => ({
  useContributions: () => mockContributions,
}));

// Mock ExpandedPRDetail
vi.mock("@/components/ExpandedPRDetail", () => ({
  ExpandedPRDetail: () => <div data-testid="pr-detail">Detail</div>,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const bitcoinRepos: RepoClassification[] = [
  { nameWithOwner: "bitcoin/bitcoin", tier: "core", reason: "curated" },
  { nameWithOwner: "mempool/mempool", tier: "ecosystem", reason: "curated" },
];

describe("ContributionDrillDown", () => {
  it("renders tabs", () => {
    render(<ContributionDrillDown username="alice" bitcoinRepos={bitcoinRepos} />);

    expect(screen.getByText("Pull Requests")).toBeInTheDocument();
    expect(screen.getByText("Reviews")).toBeInTheDocument();
    expect(screen.getByText("Issues")).toBeInTheDocument();
  });

  it("renders date filter bar", () => {
    render(<ContributionDrillDown username="alice" bitcoinRepos={bitcoinRepos} />);

    expect(screen.getByText("30 days")).toBeInTheDocument();
    expect(screen.getByText("1 year")).toBeInTheDocument();
  });

  it("renders contribution filters", () => {
    render(<ContributionDrillDown username="alice" bitcoinRepos={bitcoinRepos} />);

    expect(screen.getByLabelText("Project")).toBeInTheDocument();
    expect(screen.getByLabelText("Status")).toBeInTheDocument();
    expect(screen.getByLabelText("Tier")).toBeInTheDocument();
  });

  it("shows result count", () => {
    render(<ContributionDrillDown username="alice" bitcoinRepos={bitcoinRepos} />);

    expect(screen.getByText("1 result")).toBeInTheDocument();
  });

  it("shows items", () => {
    render(<ContributionDrillDown username="alice" bitcoinRepos={bitcoinRepos} />);

    // Both table and card render same items, so use getAllByText
    expect(screen.getAllByText("Fix bug").length).toBeGreaterThanOrEqual(1);
  });

  it("switches tabs", () => {
    render(<ContributionDrillDown username="alice" bitcoinRepos={bitcoinRepos} />);

    fireEvent.click(screen.getByText("Reviews"));
    expect(mockSetTab).toHaveBeenCalledWith("reviews");
  });

  it("shows load more when hasMore", () => {
    mockContributions = { ...mockContributions, hasMore: true };
    render(<ContributionDrillDown username="alice" bitcoinRepos={bitcoinRepos} />);

    const btn = screen.getByText("Load more");
    fireEvent.click(btn);
    expect(mockLoadMore).toHaveBeenCalled();

    mockContributions = { ...mockContributions, hasMore: false };
  });

  it("shows skeleton when loading", () => {
    mockContributions = { ...mockContributions, isLoading: true };
    render(<ContributionDrillDown username="alice" bitcoinRepos={bitcoinRepos} />);

    expect(screen.getByRole("status")).toBeInTheDocument();

    mockContributions = { ...mockContributions, isLoading: false };
  });

  it("shows 1000 result cap message", () => {
    mockContributions = { ...mockContributions, totalCount: 1000 };
    render(<ContributionDrillDown username="alice" bitcoinRepos={bitcoinRepos} />);

    expect(screen.getByText(/first 1,000 results/)).toBeInTheDocument();

    mockContributions = { ...mockContributions, totalCount: 1 };
  });

  it("filters by tier client-side", () => {
    mockFilters = { ...mockFilters, tier: "ecosystem" as const };
    mockContributions = {
      ...mockContributions,
      items: [
        {
          id: 1,
          number: 42,
          title: "Core PR",
          repoNameWithOwner: "bitcoin/bitcoin",
          type: "pr" as const,
          state: "merged" as const,
          createdAt: "2024-06-01T00:00:00Z",
          closedAt: null,
          url: "https://github.com/bitcoin/bitcoin/pull/42",
        },
        {
          id: 2,
          number: 10,
          title: "Ecosystem PR",
          repoNameWithOwner: "mempool/mempool",
          type: "pr" as const,
          state: "open" as const,
          createdAt: "2024-06-01T00:00:00Z",
          closedAt: null,
          url: "https://github.com/mempool/mempool/pull/10",
        },
      ],
    };

    render(<ContributionDrillDown username="alice" bitcoinRepos={bitcoinRepos} />);

    // Core PR should be filtered out, Ecosystem PR should show
    expect(screen.queryByText("Core PR")).not.toBeInTheDocument();
    expect(screen.getAllByText("Ecosystem PR").length).toBeGreaterThanOrEqual(1);

    // Reset
    mockFilters = { ...mockFilters, tier: "all" as const };
    mockContributions = {
      ...mockContributions,
      items: [mockContributions.items[0]],
      totalCount: 1,
    };
  });
});
