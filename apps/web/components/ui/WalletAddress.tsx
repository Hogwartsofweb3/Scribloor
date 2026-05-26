"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, Copy } from "lucide-react"

export interface WalletAddressProps extends React.HTMLAttributes<HTMLButtonElement> {
  /** Full wallet address */
  address: string
  /** Number of characters to show at start and end */
  chars?: number
  /** Whether to use monospace font */
  mono?: boolean
}

function truncateAddress(address: string, chars: number): string {
  if (address.length <= chars * 2 + 3) return address
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

function WalletAddress({
  address,
  chars = 4,
  mono = true,
  className,
  ...props
}: WalletAddressProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy wallet address:", err)
    }
  }, [address])

  const truncated = truncateAddress(address, chars)

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "group/wallet inline-flex items-center gap-1.5 rounded-lg px-2 py-1",
        "text-sm text-text-secondary",
        "bg-surface-secondary/60 hover:bg-surface-tertiary/80",
        "border border-border-default hover:border-border-strong",
        "transition-all duration-200 cursor-pointer",
        mono && "font-mono",
        className
      )}
      title={`Copy: ${address}`}
      aria-label={`Copy wallet address ${truncated}`}
      {...props}
    >
      <span className="select-none">{truncated}</span>
      <span className="relative h-3.5 w-3.5 shrink-0">
        <Copy
          className={cn(
            "absolute inset-0 h-3.5 w-3.5 text-text-muted transition-all duration-200",
            copied
              ? "opacity-0 scale-75"
              : "opacity-100 scale-100 group-hover/wallet:text-brand-500"
          )}
        />
        <Check
          className={cn(
            "absolute inset-0 h-3.5 w-3.5 text-emerald-500 transition-all duration-200",
            copied ? "opacity-100 scale-100" : "opacity-0 scale-75"
          )}
        />
      </span>
    </button>
  )
}

export { WalletAddress }
