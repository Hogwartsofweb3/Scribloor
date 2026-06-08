'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Download, 
  Copy, 
  Check, 
  ArrowUpDown,
  Search,
  Users,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import StatChip from '@/components/dashboard/StatChip';
import EmptyState from '@/components/dashboard/EmptyState';
import { formatLocalCurrency } from '@/lib/currency/exchangeRates';

interface Subscriber {
  id: string;
  wallet: string;
  displayName: string | null;
  username: string | null;
  startedAt: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'cancelled';
  totalPaid: number;
}

// Wallet copy cell component for high-quality UX
function WalletCopyCell({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncated = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

  return (
    <div className="flex items-center gap-1.5 font-mono text-xs">
      <span title={address} className="text-[var(--color-text-primary)]">
        {truncated}
      </span>
      <button
        onClick={handleCopy}
        className="p-1 rounded hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition"
        title="Copy full address"
      >
        {copied ? (
          <Check className="w-3 h-3 text-emerald-500" />
        ) : (
          <Copy className="w-3 h-3" />
        )}
      </button>
    </div>
  );
}

export default function SubscribersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'cancelled'>('all');
  
  // Sorting
  const [sortField, setSortField] = useState<'wallet' | 'status' | 'startedAt' | 'expiresAt' | 'totalPaid'>('startedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // 1. Fetch data from dashboard stats (reuses query cache)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: stats, isLoading, error, refetch } = useQuery<any>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/stats');
      if (!res.ok) {
        throw new Error('Failed to retrieve analytics data');
      }
      return res.json();
    },
  });

  // Calculate summary stats
  const summary = useMemo(() => {
    if (!stats) return { total: 0, newThisMonth: 0, churnedThisMonth: 0, avgPaid: 0 };
    const list = (stats.subscribersList as Subscriber[]) || [];
    
    const totalPaidSum = list.reduce((acc, sub) => acc + (sub.totalPaid || 0), 0);
    const avgPaid = list.length > 0 ? totalPaidSum / list.length : 0;

    return {
      total: stats.subscribers?.total ?? 0,
      newThisMonth: stats.subscribers?.newThisMonth ?? 0,
      churnedThisMonth: stats.subscribers?.churnedThisMonth ?? 0,
      avgPaid: Math.round(avgPaid * 100) / 100,
    };
  }, [stats]);

  // Handle Export CSV
  const handleExportCSV = () => {
    if (typeof window === 'undefined') return;
    window.open('/api/dashboard/subscribers/export', '_blank');
  };

  // Sorting Handler
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to descending on new field
    }
    setCurrentPage(1); // Reset page on sort change
  };

  // Filter and Sort list
  const processedSubscribers = useMemo(() => {
    if (!stats?.subscribersList) return [];
    
    let list = (stats.subscribersList as Subscriber[]) || [];

    // Filter by status
    if (statusFilter !== 'all') {
      list = list.filter((sub) => sub.status === statusFilter);
    }

    // Filter by search query (displayName, username, or wallet)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter((sub) => {
        return (
          sub.wallet.toLowerCase().includes(query) ||
          (sub.displayName && sub.displayName.toLowerCase().includes(query)) ||
          (sub.username && sub.username.toLowerCase().includes(query))
        );
      });
    }

    // Sort list
    list.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      // Format comparisons based on field type
      if (sortField === 'startedAt' || sortField === 'expiresAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (sortField === 'totalPaid') {
        aVal = Number(aVal);
        bVal = Number(bVal);
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [stats?.subscribersList, statusFilter, searchQuery, sortField, sortDirection]);

  // Paginated visible list
  const visibleList = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedSubscribers.slice(startIndex, startIndex + itemsPerPage);
  }, [processedSubscribers, currentPage]);

  const totalPages = Math.max(1, Math.ceil(processedSubscribers.length / itemsPerPage));

  // Pagination boundaries labels
  const startItemIndex = processedSubscribers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItemIndex = Math.min(currentPage * itemsPerPage, processedSubscribers.length);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-5 select-none">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)] mb-1">
            Subscribers
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] font-sans">
            Monitor, audit, and analyze active user memberships and payment histories.
          </p>
        </div>
        
        <button
          onClick={handleExportCSV}
          disabled={!stats?.subscribersList || stats.subscribersList.length === 0}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white text-xs font-bold uppercase tracking-wider transition shadow-md disabled:opacity-55 cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 text-sm leading-normal flex items-start gap-3 select-none">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error instanceof Error ? error.message : 'Failed to query subscriber data.'}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[450px] p-6 text-zinc-500">
          <RefreshCw className="w-8 h-8 animate-spin text-[var(--color-brand-500)] mb-4" />
          <span className="text-sm font-mono uppercase tracking-widest text-zinc-400">Loading subscribers...</span>
        </div>
      ) : !stats?.subscribersList || stats.subscribersList.length === 0 ? (
        <EmptyState
          icon={Users}
          heading="No subscribers yet"
          sub="Your publication does not have any subscription records. Share your link and welcome your first USDC subscriber!"
          cta="View Publication Link"
          ctaHref="/dashboard"
        />
      ) : (
        <div className="flex flex-col gap-6">
          
          {/* Summary Stats Row */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none">
            <StatChip label="Total Active" value={summary.total} />
            <StatChip label="New This Month" value={`+${summary.newThisMonth}`} />
            <StatChip label="Churned (Month)" value={summary.churnedThisMonth} />
            <StatChip label="Avg USDC Paid" value={`$${summary.avgPaid.toFixed(2)}`} />
          </section>

          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between select-none">
            {/* Filter Tabs */}
            <div className="flex border border-[var(--color-border)] rounded-lg p-0.5 bg-[var(--color-bg-secondary)]/50 w-full lg:w-auto">
              {(['all', 'active', 'expired', 'cancelled'] as const).map((filterVal) => {
                const isActive = statusFilter === filterVal;
                const labels = {
                  all: 'All',
                  active: 'Active',
                  expired: 'Expired',
                  cancelled: 'Cancelled',
                };
                return (
                  <button
                    key={filterVal}
                    onClick={() => {
                      setStatusFilter(filterVal);
                      setCurrentPage(1);
                    }}
                    className={cn(
                      'flex-1 lg:flex-none px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all duration-200 whitespace-nowrap',
                      isActive
                        ? 'text-[var(--color-brand-500)] bg-[var(--color-brand-50)] dark:bg-violet-950/20 font-bold shadow-sm'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    )}
                  >
                    {labels[filterVal]}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:max-w-xs">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder="Search by wallet, name, username..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2.5 pl-9 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] text-xs focus:outline-none focus:border-[var(--color-brand-500)]/60 transition"
              />
            </div>
          </div>

          {/* Table Container */}
          {processedSubscribers.length === 0 ? (
            <div className="py-12 text-center text-[var(--color-text-muted)] font-mono text-xs select-none">
              No matching subscriber records found.
            </div>
          ) : (
            <div className="border border-[var(--color-border)] rounded-[10px] bg-white dark:bg-[#111110] shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]/30 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] select-none">
                    <th className="p-4 pl-6">Reader</th>
                    <th className="p-4">
                      <button 
                        onClick={() => handleSort('wallet')}
                        className="flex items-center gap-1 hover:text-[var(--color-text-primary)] transition-colors"
                      >
                        Wallet Address <ArrowUpDown className="w-3.5 h-3.5" />
                      </button>
                    </th>
                    <th className="p-4">
                      <button 
                        onClick={() => handleSort('status')}
                        className="flex items-center gap-1 hover:text-[var(--color-text-primary)] transition-colors"
                      >
                        Status <ArrowUpDown className="w-3.5 h-3.5" />
                      </button>
                    </th>
                    <th className="p-4">
                      <button 
                        onClick={() => handleSort('startedAt')}
                        className="flex items-center gap-1 hover:text-[var(--color-text-primary)] transition-colors"
                      >
                        Subscribed Date <ArrowUpDown className="w-3.5 h-3.5" />
                      </button>
                    </th>
                    <th className="p-4">
                      <button 
                        onClick={() => handleSort('expiresAt')}
                        className="flex items-center gap-1 hover:text-[var(--color-text-primary)] transition-colors"
                      >
                        Expiry Date <ArrowUpDown className="w-3.5 h-3.5" />
                      </button>
                    </th>
                    <th className="p-4 text-right pr-6">
                      <button 
                        onClick={() => handleSort('totalPaid')}
                        className="flex items-center gap-1 hover:text-[var(--color-text-primary)] transition-colors justify-end ml-auto"
                      >
                        Total Paid <ArrowUpDown className="w-3.5 h-3.5" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)] text-sm">
                  {visibleList.map((sub) => {
                    const readerName = sub.displayName || sub.username || 'Anonymous Reader';
                    const handle = sub.username ? `@${sub.username}` : 'Web3 Reader';
                    
                    return (
                      <tr 
                        key={sub.id} 
                        className="hover:bg-[var(--color-brand-50)]/10 dark:hover:bg-violet-950/5 transition-colors"
                      >
                        <td className="p-4 pl-6">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-[var(--color-text-primary)]">
                              {readerName}
                            </span>
                            <span className="text-xs text-[var(--color-text-muted)]">
                              {handle}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <WalletCopyCell address={sub.wallet} />
                        </td>
                        <td className="p-4 select-none">
                          <span
                            className={cn(
                              'px-2.5 py-0.5 text-[10px] font-bold rounded-full border tracking-wide uppercase',
                              sub.status === 'active' && 'text-emerald-600 border-emerald-500/20 bg-emerald-500/5',
                              sub.status === 'expired' && 'text-[var(--color-text-secondary)] border-[var(--color-border-strong)] bg-[var(--color-bg-secondary)]',
                              sub.status === 'cancelled' && 'text-rose-600 border-rose-500/20 bg-rose-500/5'
                            )}
                          >
                            {sub.status}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-xs text-[var(--color-text-secondary)] select-none">
                          {new Date(sub.startedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="p-4 font-mono text-xs text-[var(--color-text-secondary)] select-none">
                          {new Date(sub.expiresAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="p-4 pr-6">
                          <div className="flex flex-col items-end leading-none">
                            <span className="font-mono text-xs text-[var(--color-text-primary)] font-bold">
                              {sub.totalPaid.toFixed(2)} USDC
                            </span>
                            {stats?.exchangeRate && stats.exchangeRate.rate && (
                              <span className="text-[10px] text-[var(--color-text-muted)] font-mono mt-1 select-none">
                                ≈ {formatLocalCurrency(sub.totalPaid * stats.exchangeRate.rate, stats.exchangeRate.currency)}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination Controls Footer */}
              {totalPages > 1 && (
                <div className="p-4 bg-[var(--color-bg-secondary)]/10 border-t border-[var(--color-border)] flex items-center justify-between select-none">
                  <span className="text-xs text-[var(--color-text-muted)]">
                    Showing <span className="font-semibold text-[var(--color-text-primary)]">{startItemIndex}</span>–
                    <span className="font-semibold text-[var(--color-text-primary)]">{endItemIndex}</span> of{' '}
                    <span className="font-semibold text-[var(--color-text-primary)]">{processedSubscribers.length}</span>
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-border-strong)] bg-white dark:bg-zinc-900 text-xs font-semibold text-[var(--color-text-primary)] transition disabled:opacity-40"
                    >
                      Prev
                    </button>
                    
                    <span className="text-xs font-mono font-semibold text-[var(--color-text-muted)]">
                      {currentPage} / {totalPages}
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-border-strong)] bg-white dark:bg-zinc-900 text-xs font-semibold text-[var(--color-text-primary)] transition disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
