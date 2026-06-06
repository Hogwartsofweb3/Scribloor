import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: React.ComponentType<any>;
  heading: string;
  sub: string;
  cta?: string;
  ctaHref?: string;
}

export default function EmptyState({
  icon: Icon,
  heading,
  sub,
  cta,
  ctaHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-[var(--color-border)] border-dashed rounded-xl bg-[var(--color-bg-secondary)]/30 min-h-[300px]">
      <div className="flex items-center justify-center w-12 h-12 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] mb-4">
        <Icon className="w-5 h-5 stroke-[1.5]" />
      </div>
      
      <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-1">
        {heading}
      </h3>
      
      <p className="max-w-md text-xs text-[var(--color-text-secondary)] leading-relaxed mb-6">
        {sub}
      </p>

      {cta && ctaHref && (
        <Link href={ctaHref}>
          <Button className="font-bold bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white shadow-md rounded-lg">
            {cta}
          </Button>
        </Link>
      )}
    </div>
  );
}
