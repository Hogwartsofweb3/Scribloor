"use client";

import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useSubscribeModal } from '@/hooks/useSubscribeModal';
import { Button } from '@/components/ui/button';
import { Check, Lock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SubscribeButtonPub {
  id: string;
  name: string;
  monthlyPriceUsdc: number | string | null;
  slug: string;
}

interface SubscribeButtonProps {
  publication: SubscribeButtonPub;
  variant?: 'full' | 'compact';
  className?: string;
}

export function SubscribeButton({
  publication,
  variant = 'full',
  className,
}: SubscribeButtonProps) {
  const { authenticated } = usePrivy();
  const { open } = useSubscribeModal();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const price = publication.monthlyPriceUsdc ? Number(publication.monthlyPriceUsdc) : 0;

  useEffect(() => {
    async function checkSubscription() {
      if (!authenticated || !publication.id) {
        setIsSubscribed(false);
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(`/api/subscription/status?publicationId=${publication.id}`);
        if (res.ok) {
          const data = await res.json();
          setIsSubscribed(data.isSubscribed || false);
        }
      } catch (err) {
        console.error('Error checking active subscriber term:', err);
      } finally {
        setLoading(false);
      }
    }
    checkSubscription();
  }, [authenticated, publication.id]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    open(publication.id, publication.name, price);
  };

  if (isSubscribed) {
    return (
      <Button
        disabled
        className={cn(
          'font-bold cursor-default select-none transition border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 disabled:opacity-100 disabled:cursor-default flex items-center justify-center gap-1.5',
          variant === 'compact' ? 'h-8 px-3 text-xs rounded-full' : 'w-full h-11 text-sm rounded-xl',
          className
        )}
      >
        <Check className="w-4 h-4 shrink-0" /> Subscribed ✓
      </Button>
    );
  }

  if (variant === 'compact') {
    return (
      <Button
        onClick={handleClick}
        disabled={loading}
        className={cn(
          'font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 px-4 h-8 text-xs rounded-full shadow-md shadow-amber-500/10 flex items-center justify-center gap-1 shrink-0',
          className
        )}
      >
        <Lock className="w-3.5 h-3.5" /> Subscribe
      </Button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        'w-full h-11 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1.5',
        className
      )}
    >
      <Sparkles className="w-4 h-4 shrink-0" /> Subscribe with USDC
    </Button>
  );
}
