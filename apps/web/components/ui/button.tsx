import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-brand-500 text-white hover:bg-brand-600 shadow-sm border border-brand-600/10 hover:shadow transition-all",
        secondary:
          "border border-brand-500/30 text-brand-500 bg-transparent hover:bg-brand-50/50 dark:hover:bg-brand-900/10 hover:border-brand-500 transition-all",
        ghost:
          "bg-transparent text-text-secondary hover:text-brand-500 hover:bg-surface-secondary transition-all",
        danger:
          "bg-rose-600 text-white hover:bg-rose-700 shadow-sm border border-rose-700/10 hover:shadow transition-all",
        outline:
          "border border-brand-500/30 text-brand-500 bg-transparent hover:bg-brand-50/50 dark:hover:bg-brand-900/10 hover:border-brand-500 transition-all",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3.5 text-xs",
        lg: "h-12 rounded-2xl px-8 text-base",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
