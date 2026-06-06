'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import {
  PenSquare,
  ChevronDown,
  LogOut,
  User,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import NotificationBell from '@/components/ui/NotificationBell';
import { useState, useRef, useEffect } from 'react';

export default function AppHeader() {
  const pathname = usePathname();
  const { user, logout } = usePrivy();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Generate breadcrumbs from pathname
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }));

  const displayName = user?.email?.address
    ? user.email.address.split('@')[0]
    : user?.wallet?.address
    ? `${user.wallet.address.slice(0, 4)}...${user.wallet.address.slice(-4)}`
    : 'Creator';

  return (
    <header className="sticky top-0 z-50 glass safe-area-top" id="app-header">
      <div className="flex items-center justify-between h-[var(--header-height)] px-4 lg:px-6">
        {/* Left: Logo + Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
            <span className="hidden lg:inline text-lg font-bold tracking-tight text-foreground">
              Sol<span className="text-primary">scribe</span>
            </span>
          </Link>

          {/* Breadcrumbs */}
          <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground min-w-0">
            {breadcrumbs.map((crumb) => (
              <span key={crumb.href} className="flex items-center gap-1 min-w-0">
                <span className="text-border-strong">/</span>
                {crumb.isLast ? (
                  <span className="text-foreground font-medium truncate max-w-[150px]">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="hover:text-foreground truncate max-w-[120px] transition-colors">
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* New Post CTA */}
          <Link href="/dashboard/posts/new">
            <button className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20" id="app-header-new-post">
              <PenSquare size={15} />
              New Post
            </button>
          </Link>

          <NotificationBell />
          <ThemeToggle />

          {/* Avatar Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={cn(
                'flex items-center gap-1.5 p-1.5 rounded-lg transition-colors',
                dropdownOpen ? 'bg-accent' : 'hover:bg-accent'
              )}
              id="app-header-avatar"
            >
              <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <ChevronDown size={14} className={cn('text-muted-foreground transition-transform', dropdownOpen && 'rotate-180')} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl py-1.5 animate-scale-in">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground">Creator Account</p>
                </div>
                <Link
                  href="/account"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <User size={15} />
                  Account
                </Link>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <Settings size={15} />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-accent transition-colors"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
