'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronDown, User, BookOpen, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import NotificationBell from '@/components/ui/NotificationBell';

export default function AppHeader() {
  const router = useRouter();
  const { user, logout } = usePrivy();
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch publication to link "My publication"
  const { data: pubData } = useQuery({
    queryKey: ['creator-publication'],
    queryFn: async () => {
      const res = await fetch('/api/publications');
      if (!res.ok) throw new Error('Failed to fetch publication');
      return res.json();
    },
  });

  const publication = pubData?.publication;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const displayName = user?.email?.address
    ? user.email.address.split('@')[0]
    : user?.wallet?.address
    ? `${user.wallet.address.slice(0, 4)}...${user.wallet.address.slice(-4)}`
    : 'Creator';

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#111110] border-b border-[var(--color-border)] h-[56px] safe-area-top select-none">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        {/* Left Logo */}
        <Link href="/explore" className="font-serif font-bold text-lg text-foreground tracking-tight shrink-0">
          Sol<span className="text-[var(--color-brand-500)]">scribe</span>
        </Link>

        {/* Center: Search input */}
        <div className="hidden md:block flex-1 max-w-md mx-8">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search publications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-10 pr-4 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-primary)] focus:bg-[var(--color-bg-primary)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-500)] transition-all"
            />
          </form>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <NotificationBell />

          {/* User Menu Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={cn(
                'flex items-center gap-1.5 p-1 rounded-[var(--radius-md)] transition-colors hover:bg-black/5 dark:hover:bg-white/5',
                dropdownOpen && 'bg-black/5 dark:hover:bg-white/5'
              )}
            >
              <div className="w-8 h-8 rounded-full bg-[var(--color-brand-50)] dark:bg-zinc-800 border border-[var(--color-border-strong)] flex items-center justify-center text-[var(--color-brand-500)] text-sm font-bold uppercase">
                {displayName.charAt(0)}
              </div>
              <ChevronDown size={14} className="text-[var(--color-text-secondary)]" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#111110] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-xl py-1.5 z-50">
                <div className="px-3 py-2 border-b border-[var(--color-border)]">
                  <p className="text-xs text-[var(--color-text-muted)]">Signed in as</p>
                  <p className="text-sm font-bold text-[var(--color-text-primary)] truncate">{displayName}</p>
                </div>

                <Link
                  href="/account"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <User size={15} />
                  My account
                </Link>

                <Link
                  href={publication ? `/${publication.slug}` : '/dashboard'}
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <BookOpen size={15} />
                  My publication
                </Link>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:text-red-400 hover:bg-red-500/5 transition-colors text-left"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
