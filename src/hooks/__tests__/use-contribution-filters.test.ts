import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useContributionFilters } from "@/hooks/use-contribution-filters";

// Mock next/navigation
const mockReplace = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => "/developer/alice",
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockSearchParams = new URLSearchParams();
});

describe("useContributionFilters", () => {
  it("returns default filters", () => {
    const { result } = renderHook(() => useContributionFilters());

    expect(result.current.filters.tab).toBe("prs");
    expect(result.current.filters.preset).toBe("1yr");
    expect(result.current.filters.status).toBe("all");
    expect(result.current.filters.tier).toBe("all");
    expect(result.current.filters.from).toBeDefined();
    expect(result.current.filters.to).toBeDefined();
  });

  it("reads tab from URL params", () => {
    mockSearchParams = new URLSearchParams("tab=reviews");
    const { result } = renderHook(() => useContributionFilters());
    expect(result.current.filters.tab).toBe("reviews");
  });

  it("reads preset from URL params", () => {
    mockSearchParams = new URLSearchParams("preset=30d");
    const { result } = renderHook(() => useContributionFilters());
    expect(result.current.filters.preset).toBe("30d");
  });

  it("reads project from URL params", () => {
    mockSearchParams = new URLSearchParams("project=bitcoin/bitcoin");
    const { result } = renderHook(() => useContributionFilters());
    expect(result.current.filters.project).toBe("bitcoin/bitcoin");
  });

  it("setTab updates URL", () => {
    const { result } = renderHook(() => useContributionFilters());

    act(() => {
      result.current.setTab("issues");
    });

    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining("tab=issues"),
      { scroll: false }
    );
  });

  it("setPreset updates URL and clears from/to", () => {
    mockSearchParams = new URLSearchParams("preset=custom&from=2024-01-01&to=2024-12-31");
    const { result } = renderHook(() => useContributionFilters());

    act(() => {
      result.current.setPreset("30d");
    });

    const call = mockReplace.mock.calls[0][0] as string;
    expect(call).toContain("preset=30d");
    expect(call).not.toContain("from=");
    expect(call).not.toContain("to=");
  });

  it("setProject updates URL", () => {
    const { result } = renderHook(() => useContributionFilters());

    act(() => {
      result.current.setProject("bitcoin/bitcoin");
    });

    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining("project=bitcoin"),
      { scroll: false }
    );
  });

  it("setStatus removes param when 'all'", () => {
    mockSearchParams = new URLSearchParams("status=open");
    const { result } = renderHook(() => useContributionFilters());

    act(() => {
      result.current.setStatus("all");
    });

    const call = mockReplace.mock.calls[0][0] as string;
    expect(call).not.toContain("status=");
  });

  it("setTier removes param when 'all'", () => {
    mockSearchParams = new URLSearchParams("tier=core");
    const { result } = renderHook(() => useContributionFilters());

    act(() => {
      result.current.setTier("all");
    });

    const call = mockReplace.mock.calls[0][0] as string;
    expect(call).not.toContain("tier=");
  });

  it("computes date range from preset", () => {
    mockSearchParams = new URLSearchParams("preset=30d");
    const { result } = renderHook(() => useContributionFilters());

    // from should be approximately 30 days ago
    expect(result.current.filters.from).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result.current.filters.to).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
