import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, helperText, error, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full flex flex-col space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-bold text-text-primary tracking-wide select-none"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          className={cn(
            "flex h-11 w-full rounded-xl border border-border-default bg-surface-primary px-3 py-2 text-sm text-text-primary ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:border-brand-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
            error && "border-rose-500 focus-visible:ring-rose-500/30 focus-visible:border-rose-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p
            id={errorId}
            className="text-xs font-semibold text-rose-500 dark:text-rose-400 select-none"
          >
            {error}
          </p>
        )}
        {!error && helperText && (
          <p
            id={helperId}
            className="text-xs text-text-muted select-none"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
