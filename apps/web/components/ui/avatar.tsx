import * as React from "react"
import { cn } from "@/lib/utils"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  displayName?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
}

const sizeClasses = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-12 h-12 text-base",
  lg: "w-16 h-16 text-xl",
};

export function getInitials(name?: string | null): string {
  if (!name) return "U";
  const trimmed = name.trim();
  if (!trimmed) return "U";

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  const firstLetter = parts[0].charAt(0);
  const lastLetter = parts[parts.length - 1].charAt(0);
  return (firstLetter + lastLetter).toUpperCase();
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, displayName, size = "md", ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false);

    React.useEffect(() => {
      setImageError(false);
    }, [src]);

    const initials = getInitials(displayName);

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-xl border border-border-default bg-brand-100 font-bold select-none",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src && !imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={displayName || "User avatar"}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover aspect-square"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand-100 text-brand-600 font-extrabold uppercase">
            {initials}
          </div>
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

export { Avatar }
