import * as React from "react";
import { cn } from "@/lib/utils";

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  serif?: boolean;
}

export const Display = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, serif = true, ...props }, ref) => {
    return (
      <h1
        ref={ref}
        className={cn(
          "text-4xl md:text-5xl font-black tracking-tight scroll-m-20",
          serif ? "font-serif" : "font-sans",
          "text-text-primary",
          className
        )}
        {...props}
      />
    );
  }
);
Display.displayName = "Display";

export const H1 = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, serif = false, ...props }, ref) => {
    return (
      <h1
        ref={ref}
        className={cn(
          "text-3xl md:text-4xl font-extrabold tracking-tight scroll-m-20",
          serif ? "font-serif" : "font-sans",
          "text-text-primary",
          className
        )}
        {...props}
      />
    );
  }
);
H1.displayName = "H1";

export const H2 = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, serif = false, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={cn(
          "text-2xl md:text-3xl font-bold tracking-tight pb-2 first:mt-0 scroll-m-20",
          serif ? "font-serif" : "font-sans",
          "text-text-primary",
          className
        )}
        {...props}
      />
    );
  }
);
H2.displayName = "H2";

export const H3 = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, serif = false, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(
          "text-xl md:text-2xl font-semibold tracking-tight scroll-m-20",
          serif ? "font-serif" : "font-sans",
          "text-text-primary",
          className
        )}
        {...props}
      />
    );
  }
);
H3.displayName = "H3";

export const Body = React.forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className, serif = false, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(
          "text-base leading-relaxed",
          serif ? "font-serif" : "font-sans",
          "text-text-secondary",
          className
        )}
        {...props}
      />
    );
  }
);
Body.displayName = "Body";

export const Caption = React.forwardRef<HTMLSpanElement, TypographyProps>(
  ({ className, serif = false, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "text-xs tracking-wide",
          serif ? "font-serif" : "font-sans",
          "text-text-muted",
          className
        )}
        {...props}
      />
    );
  }
);
Caption.displayName = "Caption";

export const Mono = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => {
    return (
      <code
        ref={ref}
        className={cn(
          "font-mono text-sm px-1.5 py-0.5 rounded bg-surface-tertiary border border-border-default text-text-primary font-medium",
          className
        )}
        {...props}
      />
    );
  }
);
Mono.displayName = "Mono";
