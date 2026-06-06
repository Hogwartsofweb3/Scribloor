'use client';

import React from 'react';
import { SubscribeButton } from '@/components/subscribe/SubscribeButton';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';

interface SubscriptionCardProps {
  publication: {
    id: string;
    name: string;
    slug: string;
    monthlyPriceUsdc: number | string | null;
    subscriberCount: number;
  };
  creator: {
    displayName: string | null;
    username: string;
    bio: string | null;
  };
}

export default function SubscriptionCard({
  publication,
  creator,
}: SubscriptionCardProps) {
  const { authenticated, login } = usePrivy();
  const price = publication.monthlyPriceUsdc ? Number(publication.monthlyPriceUsdc) : 0;
  const creatorName = creator.displayName || creator.username;

  return (
    <div className="bg-white dark:bg-[#111110] border border-[var(--color-border)] rounded-[10px] p-5 shadow-md flex flex-col gap-5 text-left">
      <div>
        <p className="text-[14px] text-[var(--color-text-muted)] font-mono uppercase tracking-wider">
          {publication.name}
        </p>
        
        {/* Pricing */}
        <div className="flex items-baseline gap-1 my-2">
          {price > 0 ? (
            <>
              <span className="text-[28px] font-sans font-bold tracking-tight text-[var(--color-teal-600)] dark:text-[var(--color-teal-400)]">
                {price} USDC
              </span>
              <span className="text-[12px] text-[var(--color-text-muted)]">/ month</span>
            </>
          ) : (
            <span className="text-[28px] font-sans font-bold tracking-tight text-[var(--color-text-primary)]">
              Free
            </span>
          )}
        </div>

        {/* Subscriber Count */}
        <p className="text-[12px] text-[var(--color-text-muted)]">
          {publication.subscriberCount} subscriber{publication.subscriberCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Subscribe Button */}
      <SubscribeButton
        publication={{
          id: publication.id,
          name: publication.name,
          monthlyPriceUsdc: publication.monthlyPriceUsdc,
          slug: publication.slug,
        }}
        variant="full"
      />

      {/* Auth/Sign-in trigger */}
      {!authenticated && (
        <button
          onClick={login}
          className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-brand-500)] text-center transition-colors underline cursor-pointer select-none"
        >
          Already a subscriber? Sign in
        </button>
      )}

      {/* Divider */}
      <hr className="border-[var(--color-border)] my-1" />

      {/* Creator bio */}
      <div className="space-y-2">
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed line-clamp-3">
          {creator.bio || `Support ${creatorName} by subscribing to their publication archives for high-quality insights.`}
        </p>
        
        <Link
          href={`/explore`}
          className="block text-xs font-semibold text-[var(--color-brand-500)] hover:underline"
        >
          More from {creatorName} →
        </Link>
      </div>
    </div>
  );
}
