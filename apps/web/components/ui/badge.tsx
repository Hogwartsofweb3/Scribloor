import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        free:
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        paid:
          "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        new:
          "bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20",
        active:
          "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
        expired:
          "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
        pending:
          "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
      },
    },
    defaultVariants: {
      variant: "free",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
