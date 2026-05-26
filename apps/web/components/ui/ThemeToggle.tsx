"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }, [resolvedTheme, setTheme])

  // Prevent hydration mismatch — render placeholder until mounted
  if (!mounted) {
    return (
      <button
        type="button"
        className={cn(
          "relative inline-flex h-9 w-9 items-center justify-center rounded-xl",
          "border border-border-default bg-surface-secondary/60",
          className
        )}
        aria-label="Toggle theme"
        disabled
      >
        <span className="h-4 w-4" />
      </button>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-xl",
        "border border-border-default bg-surface-secondary/60",
        "hover:bg-surface-tertiary hover:border-border-strong",
        "active:scale-95 transition-all duration-200 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary",
        className
      )}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Sun icon — visible in dark mode */}
      <Sun
        className={cn(
          "absolute h-4 w-4 transition-all duration-300",
          isDark
            ? "rotate-0 scale-100 text-amber-400"
            : "-rotate-90 scale-0 text-amber-400"
        )}
      />
      {/* Moon icon — visible in light mode */}
      <Moon
        className={cn(
          "absolute h-4 w-4 transition-all duration-300",
          isDark
            ? "rotate-90 scale-0 text-brand-500"
            : "rotate-0 scale-100 text-brand-500"
        )}
      />
    </button>
  )
}
