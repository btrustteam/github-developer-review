"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme === "dark";
  const Icon = isDark ? Sun : Moon;
  const next = isDark ? "light" : "dark";

  return (
    <button
      onClick={() => setTheme(next)}
      className="cursor-pointer rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      suppressHydrationWarning
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
