"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ReadingProgressProps {
  /** Custom class for the container */
  className?: string
  /** Color for the progress bar — defaults to brand gradient */
  color?: string
}

export function ReadingProgress({ className, color }: ReadingProgressProps) {
  const [progress, setProgress] = React.useState(0)

  React.useEffect(() => {
    let rafId: number

    function updateProgress() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight

      if (docHeight <= 0) {
        setProgress(0)
        return
      }

      const scrollPercent = Math.min((scrollTop / docHeight) * 100, 100)
      setProgress(scrollPercent)
    }

    function onScroll() {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(updateProgress)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    updateProgress()

    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-[2px] bg-transparent pointer-events-none",
        className
      )}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      <div
        className="h-full transition-[width] duration-150 ease-out"
        style={{
          width: `${progress}%`,
          background:
            color ||
            "linear-gradient(90deg, hsl(262 80% 50%), hsl(262 70% 60%), hsl(262 60% 70%))",
        }}
      />
    </div>
  )
}
