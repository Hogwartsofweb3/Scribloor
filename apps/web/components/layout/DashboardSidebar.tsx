'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { usePrivy } from '@privy-io/react-auth';
import { motion } from 'framer-motion';
import { DashboardStats } from '@/lib/types/dashboard';
import {
  LayoutDashboard,
  FileText,
  Users,
  BookOpen,
  Settings,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/stores/uiStore';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { formatLocalCurrency } from '@/lib/currency/exchangeRates';

const sidebarLinks = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/posts', label: 'Posts', icon: FileText },
  { href: '/dashboard/subscribers', label: 'Subscribers', icon: Users },
  { href: '/dashboard/vault', label: 'The Vault', icon: BookOpen },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  { href: '/dashboard/migration', label: 'Migration', icon: ArrowLeftRight },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = usePrivy();
  const { sidebarCollapsed, setSidebarCollapsed, toggleSidebar } = useUIStore();
  const { balance } = useWalletBalance();
  const [copied, setCopied] = React.useState(false);

  // Monitor screen width to auto-collapse on < 1280px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarCollapsed]);

  // Fetch publication details using React Query
  const { data: pubData, isLoading } = useQuery({
    queryKey: ['creator-publication'],
    queryFn: async () => {
      const res = await fetch('/api/publications');
      if (!res.ok) throw new Error('Failed to fetch publication');
      return res.json();
    },
  });

  // Fetch dashboard stats (uses cached data if already fetched by page)
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/stats');
      if (!res.ok) throw new Error('Failed to retrieve analytics data');
      return res.json();
    },
    staleTime: 60000,
  });

  const publication = pubData?.publication;

  const walletAddress = user?.wallet?.address ?? '';
  const truncatedWallet = walletAddress
    ? `${walletAddress.slice(0, 5)}...${walletAddress.slice(-4)}`
    : 'No wallet';

  const handleCopyWallet = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const displayName = user?.email?.address
    ? user.email.address.split('@')[0]
    : 'Creator';

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 72 : 240 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="hidden md:flex flex-col h-screen sticky top-0 left-0 bg-white dark:bg-[#111110] border-r border-[var(--color-border)] shrink-0 select-none overflow-x-hidden"
      id="dashboard-sidebar"
    >
      {/* Top Header: Publication & Creator Info */}
      <div className="p-4 border-b border-[var(--color-border)] h-[56px] flex items-center gap-3">
        {isLoading ? (
          <div className="flex items-center gap-3 w-full animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-bg-tertiary)] shrink-0" />
            {!sidebarCollapsed && (
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-[var(--color-bg-tertiary)] rounded w-3/4" />
                <div className="h-2 bg-[var(--color-bg-tertiary)] rounded w-1/2" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 min-w-0 w-full">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-500)] text-white flex items-center justify-center font-bold text-sm shrink-0">
              {publication?.name?.charAt(0).toUpperCase() ?? 'S'}
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-[var(--color-text-primary)] truncate leading-snug">
                  {publication?.name ?? 'Solscribe'}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] truncate">
                  by {displayName}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Middle Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const isActive = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-semibold transition-all relative group',
                isActive
                  ? 'text-[var(--color-brand-500)] bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-500)]/10 border-l-2 border-[var(--color-brand-500)] rounded-l-none'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{link.label}</span>}
              {sidebarCollapsed && (
                <div className="absolute left-16 bg-zinc-950 text-zinc-200 border border-zinc-800 text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl z-50">
                  {link.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section: Wallet, USDC and Toggle */}
      <div className="p-3 border-t border-[var(--color-border)] space-y-3">
        {walletAddress && !sidebarCollapsed && (
          <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-strong)] space-y-1.5">
            {/* Wallet Address */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[var(--color-text-secondary)] truncate">
                {truncatedWallet}
              </span>
              <button
                onClick={handleCopyWallet}
                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                title="Copy wallet address"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              </button>
            </div>
            {/* USDC Balance */}
            <div className="flex flex-col gap-1 pt-1.5 border-t border-[var(--color-border)]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--color-text-muted)]">USDC Balance:</span>
                <span className="font-bold text-[var(--color-teal-600)] dark:text-[var(--color-teal-400)] shrink-0">
                  {balance !== null ? `${balance.toFixed(2)} USDC` : '—'}
                </span>
              </div>
              {balance !== null && stats?.exchangeRate && stats.exchangeRate.rate && (
                <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] font-mono leading-none">
                  <span>Local Balance:</span>
                  <span className="shrink-0">
                    ≈ {formatLocalCurrency(balance * stats.exchangeRate.rate, stats.exchangeRate.currency)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sidebar Collapse Toggle */}
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center md:justify-between px-3 py-2 rounded-[var(--radius-md)] text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {!sidebarCollapsed && <span>Collapse Sidebar</span>}
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </motion.aside>
  );
}
