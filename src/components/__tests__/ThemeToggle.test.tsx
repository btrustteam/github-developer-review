import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { ThemeToggle } from "../ThemeToggle";

const setTheme = vi.fn();
let resolvedTheme: string | undefined;

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme, setTheme }),
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    setTheme.mockClear();
    resolvedTheme = undefined;
  });

  afterEach(() => {
    cleanup();
  });

  it("hydrates without mismatch when the client resolves a different theme than the server", async () => {
    // Server has no access to localStorage/media query, so theme is unknown
    resolvedTheme = undefined;
    const container = document.createElement("div");
    container.innerHTML = renderToString(<ThemeToggle />);
    document.body.appendChild(container);

    // Client resolves the stored theme on first render
    resolvedTheme = "dark";
    const onRecoverableError = vi.fn();
    await act(async () => {
      hydrateRoot(container, <ThemeToggle />, { onRecoverableError });
    });

    expect(onRecoverableError).not.toHaveBeenCalled();
    container.remove();
  });

  it("switches to light when the current theme is dark", () => {
    resolvedTheme = "dark";
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle theme" }));
    expect(setTheme).toHaveBeenCalledWith("light");
  });

  it("switches to dark when the current theme is light", () => {
    resolvedTheme = "light";
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle theme" }));
    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  it("renders both icons and lets the dark class choose which is visible", () => {
    const { container } = render(<ThemeToggle />);
    const sun = container.querySelector(".lucide-sun");
    const moon = container.querySelector(".lucide-moon");
    expect(sun).toHaveClass("hidden", "dark:block");
    expect(moon).toHaveClass("dark:hidden");
  });
});
