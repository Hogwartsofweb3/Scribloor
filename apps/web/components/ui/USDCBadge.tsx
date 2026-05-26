import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const usdcBadgeVariants = cva(
  "inline-flex items-center gap-1.5 font-semibold tabular-nums",
  {
    variants: {
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
      variant: {
        default: "text-text-primary",
        muted: "text-text-muted",
        success: "text-emerald-600 dark:text-emerald-400",
        brand: "text-brand-500 dark:text-brand-400",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
)

export interface USDCBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof usdcBadgeVariants> {
  /** Amount in USDC — displayed with exactly 2 decimal places */
  amount: number
  /** Whether to show the USDC icon */
  showIcon?: boolean
  /** Whether to show the "USDC" text label */
  showLabel?: boolean
}

function USDCIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="12" fill="#2775CA" />
      <path
        d="M15.6 14.1c0-1.8-1.1-2.4-3.3-2.7-1.6-.2-1.9-.6-1.9-1.3 0-.7.5-1.1 1.5-1.1.9 0 1.4.3 1.6 1.1.1.1.2.2.3.2h.7c.2 0 .3-.1.3-.3v-.1c-.2-1-1-1.8-2.1-1.9V7.2c0-.2-.1-.3-.3-.3h-.6c-.2 0-.3.1-.3.3V9c-1.4.2-2.3 1.1-2.3 2.2 0 1.7 1 2.4 3.2 2.7 1.5.3 2 .6 2 1.4 0 .8-.7 1.3-1.6 1.3-1.3 0-1.7-.5-1.9-1.2 0-.1-.2-.2-.3-.2h-.7c-.2 0-.3.1-.3.3 .2 1.1 .9 1.9 2.4 2.1v.8c0 .2.1.3.3.3h.6c.2 0 .3-.1.3-.3v-.8c1.5-.2 2.3-1.2 2.3-2.4z"
        fill="white"
      />
      <path
        d="M9.9 19.2c-4-1.4-6.1-5.8-4.7-9.8 .7-2 2.3-3.6 4.3-4.3 .2-.1.3-.2.3-.4V4c0-.2-.1-.3-.3-.3-3.9 1.3-6 5.5-4.6 9.4 .8 2.4 2.7 4.3 5.1 5.1 .2.1.3 0 .3-.2v-.7c.1-.2 0-.3-.2-.4h-.2zM14.1 4.1c-.2-.1-.3 0-.3.2v.7c0 .2.1.3.3.4 4 1.4 6.1 5.8 4.7 9.8-.7 2-2.3 3.6-4.3 4.3-.2.1-.3.2-.3.4v.7c0 .2.1.3.3.3 3.9-1.3 6-5.5 4.6-9.4-.8-2.4-2.7-4.3-5.1-5.1l.1-.3z"
        fill="white"
      />
    </svg>
  )
}

const iconSizes: Record<string, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
}

function USDCBadge({
  amount,
  showIcon = true,
  showLabel = false,
  size = "md",
  variant,
  className,
  ...props
}: USDCBadgeProps) {
  const formattedAmount = amount.toFixed(2)

  return (
    <span
      className={cn(usdcBadgeVariants({ size, variant }), className)}
      {...props}
    >
      {showIcon && <USDCIcon className={iconSizes[size ?? "md"]} />}
      <span>{formattedAmount}</span>
      {showLabel && (
        <span className="text-text-muted font-normal">USDC</span>
      )}
    </span>
  )
}

export { USDCBadge, usdcBadgeVariants }
