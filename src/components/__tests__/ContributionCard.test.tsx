import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ContributionCard } from "@/components/ContributionCard";
import type { ContributionDetail } from "@/lib/types";

// Mock ExpandedPRDetail
vi.mock("@/components/ExpandedPRDetail", () => ({
  ExpandedPRDetail: ({ number }: { number: number }) => (
    <div data-testid="pr-detail">PR Detail #{number}</div>
  ),
}));

afterEach(cleanup);

const prItem: ContributionDetail = {
  id: 1,
  number: 42,
  title: "Fix consensus bug",
  repoNameWithOwner: "bitcoin/bitcoin",
  type: "pr",
  state: "merged",
  createdAt: "2024-06-01T00:00:00Z",
  closedAt: "2024-06-02T00:00:00Z",
  url: "https://github.com/bitcoin/bitcoin/pull/42",
};

const issueItem: ContributionDetail = {
  id: 2,
  number: 10,
  title: "Tracking issue",
  repoNameWithOwner: "bitcoin/bitcoin",
  type: "issue",
  state: "open",
  createdAt: "2024-07-01T00:00:00Z",
  closedAt: null,
  url: "https://github.com/bitcoin/bitcoin/issues/10",
};

describe("ContributionCard", () => {
  it("renders PR card with title and repo", () => {
    render(<ContributionCard item={prItem} />);

    expect(screen.getByText("Fix consensus bug")).toBeInTheDocument();
    expect(screen.getByText("bitcoin/bitcoin")).toBeInTheDocument();
    expect(screen.getByText("merged")).toBeInTheDocument();
  });

  it("renders issue card", () => {
    render(<ContributionCard item={issueItem} />);

    expect(screen.getByText("Tracking issue")).toBeInTheDocument();
    expect(screen.getByText("open")).toBeInTheDocument();
  });

  it("has external link to GitHub", () => {
    render(<ContributionCard item={prItem} />);

    const link = screen.getByLabelText("Open #42 on GitHub");
    expect(link).toHaveAttribute("href", "https://github.com/bitcoin/bitcoin/pull/42");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("PR card has expand button role", () => {
    render(<ContributionCard item={prItem} />);

    const expandable = screen.getByRole("button");
    expect(expandable).toBeInTheDocument();
  });

  it("issue card has no expand button", () => {
    render(<ContributionCard item={issueItem} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
