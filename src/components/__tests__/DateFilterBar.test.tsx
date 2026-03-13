import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { DateFilterBar } from "@/components/DateFilterBar";

afterEach(cleanup);

describe("DateFilterBar", () => {
  it("renders all preset buttons", () => {
    render(<DateFilterBar activePreset="1yr" onPresetChange={() => {}} />);

    expect(screen.getByText("30 days")).toBeInTheDocument();
    expect(screen.getByText("3 months")).toBeInTheDocument();
    expect(screen.getByText("6 months")).toBeInTheDocument();
    expect(screen.getByText("1 year")).toBeInTheDocument();
    expect(screen.getByText("All time")).toBeInTheDocument();
  });

  it("highlights active preset", () => {
    render(<DateFilterBar activePreset="30d" onPresetChange={() => {}} />);

    const btn = screen.getByText("30 days");
    expect(btn).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onPresetChange when clicked", () => {
    const onChange = vi.fn();
    render(<DateFilterBar activePreset="1yr" onPresetChange={onChange} />);

    fireEvent.click(screen.getByText("3 months"));
    expect(onChange).toHaveBeenCalledWith("3mo");
  });

  it("marks non-active presets as not pressed", () => {
    render(<DateFilterBar activePreset="1yr" onPresetChange={() => {}} />);

    const btn = screen.getByText("30 days");
    expect(btn).toHaveAttribute("aria-pressed", "false");
  });
});
