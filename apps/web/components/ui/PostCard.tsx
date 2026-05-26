"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Clock } from "lucide-react"

const postCardVariants = cva(
  "group relative overflow-hidden rounded-3xl border border-border-default bg-surface-primary transition-all duration-300",
  {
    variants: {
      variant: {
        default:
          "flex flex-col hover:border-brand-200 dark:hover:border-brand-900/50 hover:shadow-lg hover:shadow-zinc-950/5 dark:hover:shadow-black/20",
        compact:
          "flex flex-row items-stretch hover:border-brand-200 dark:hover:border-brand-900/50 hover:shadow-md hover:shadow-zinc-950/5 dark:hover:shadow-black/20",
        featured:
          "flex flex-col hover:border-brand-200 dark:hover:border-brand-900/50 hover:shadow-xl hover:shadow-zinc-950/5 dark:hover:shadow-black/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface PostCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof postCardVariants> {
  /** Post title */
  title: string
  /** Optional excerpt / description snippet */
  description?: string
  /** Cover image URL */
  coverImage?: string | null
  /** Author display name */
  authorName?: string
  /** Author avatar URL */
  authorAvatar?: string | null
  /** Publication name */
  publicationName?: string
  /** ISO date string for the post creation time */
  createdAt?: string
  /** Estimated reading time in minutes */
  readingTime?: number
  /** Link destination for the card */
  href?: string
  /** Whether the post is paywalled */
  isPaid?: boolean
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const PostCard = React.forwardRef<HTMLDivElement, PostCardProps>(
  (
    {
      className,
      variant = "default",
      title,
      description,
      coverImage,
      authorName,
      authorAvatar,
      publicationName,
      createdAt,
      readingTime,
      href,
      isPaid,
      ...props
    },
    ref
  ) => {
    const Wrapper = href ? Link : "div"
    const wrapperProps = href
      ? { href, className: cn(postCardVariants({ variant, className })) }
      : { className: cn(postCardVariants({ variant, className })) }

    if (variant === "compact") {
      return (
        <div ref={ref} {...wrapperProps as React.HTMLAttributes<HTMLDivElement>} {...props}>
          {/* Compact: image on the left */}
          {coverImage && (
            <div className="relative w-32 min-h-[100px] shrink-0 overflow-hidden">
              <Image
                src={coverImage}
                alt={title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          )}
          <div className="flex flex-col justify-center gap-1.5 p-4 min-w-0">
            {isPaid && <Badge variant="paid" className="w-fit">Paid</Badge>}
            <h3 className="text-sm font-semibold text-text-primary line-clamp-2 leading-snug">
              {title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              {authorName && <span>{authorName}</span>}
              {createdAt && (
                <>
                  <span className="text-border-strong">·</span>
                  <span>{formatDate(createdAt)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      )
    }

    if (variant === "featured") {
      return (
        <div ref={ref} {...wrapperProps as React.HTMLAttributes<HTMLDivElement>} {...props}>
          {coverImage && (
            <div className="relative w-full aspect-[21/9] overflow-hidden">
              <Image
                src={coverImage}
                alt={title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                {isPaid && <Badge variant="paid" className="mb-3">Paid</Badge>}
                <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight mb-2">
                  {title}
                </h2>
                {description && (
                  <p className="text-sm md:text-base text-white/80 line-clamp-2 max-w-2xl leading-relaxed">
                    {description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-4 text-white/70 text-sm">
                  {authorName && (
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={authorAvatar}
                        displayName={authorName}
                        size="xs"
                      />
                      <span className="font-medium text-white">{authorName}</span>
                    </div>
                  )}
                  {createdAt && (
                    <>
                      <span className="text-white/40">·</span>
                      <span>{formatDate(createdAt)}</span>
                    </>
                  )}
                  {readingTime && (
                    <>
                      <span className="text-white/40">·</span>
                      <Clock className="h-3.5 w-3.5" />
                      <span>{readingTime} min read</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          {!coverImage && (
            <div className="p-6 md:p-10">
              {isPaid && <Badge variant="paid" className="mb-3">Paid</Badge>}
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-text-primary leading-tight mb-2">
                {title}
              </h2>
              {description && (
                <p className="text-sm md:text-base text-text-muted line-clamp-2 max-w-2xl leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          )}
        </div>
      )
    }

    // Default variant
    return (
      <div ref={ref} {...wrapperProps as React.HTMLAttributes<HTMLDivElement>} {...props}>
        {coverImage && (
          <div className="relative w-full aspect-[16/9] overflow-hidden">
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
        <div className="flex flex-col gap-2 p-5">
          <div className="flex items-center justify-between">
            {publicationName && (
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-500">
                {publicationName}
              </span>
            )}
            {isPaid && <Badge variant="paid">Paid</Badge>}
          </div>
          <h3 className="text-base md:text-lg font-bold text-text-primary line-clamp-2 leading-snug group-hover:text-brand-500 transition-colors">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-text-muted line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 pt-3 border-t border-border-default text-xs text-text-muted">
            {authorName && (
              <div className="flex items-center gap-2">
                <Avatar
                  src={authorAvatar}
                  displayName={authorName}
                  size="xs"
                />
                <span className="font-medium text-text-secondary">{authorName}</span>
              </div>
            )}
            <div className="flex items-center gap-2 ml-auto">
              {createdAt && <span>{formatDate(createdAt)}</span>}
              {readingTime && (
                <>
                  <span className="text-border-strong">·</span>
                  <Clock className="h-3 w-3" />
                  <span>{readingTime} min</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
)
PostCard.displayName = "PostCard"

export { PostCard, postCardVariants }
