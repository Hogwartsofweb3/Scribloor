"use client";

import React, { useState } from 'react';
import {
  Download,
  Users,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface SubscriberItem {
  id: string;
  wallet: string;
  displayName: string | null;
  username: string | null;
  startedAt: string;
  expiresAt: string;
  status: string;
  totalPaid: number;
}

interface SubscriberTableProps {
  subscribers: SubscriberItem[];
}

export default function SubscriberTable({ subscribers }: SubscriberTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const totalPages = Math.max(1, Math.ceil(subscribers.length / itemsPerPage));
  
  // Clamp current page to valid bounds
  const activePage = Math.min(currentPage, totalPages);

  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedItems = subscribers.slice(startIndex, startIndex + itemsPerPage);

  const handleExportCSV = () => {
    if (subscribers.length === 0) return;

    const headers = [
      'Wallet Address',
      'Display Name',
      'Username',
      'Subscribed Date',
      'Expiration Date',
      'Status',
      'Total Paid (USDC)',
    ];

    const rows = subscribers.map((sub) => [
      sub.wallet,
      sub.displayName || '',
      sub.username || '',
      new Date(sub.startedAt).toISOString(),
      new Date(sub.expiresAt).toISOString(),
      sub.status,
      sub.totalPaid.toFixed(2),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((val) => `"${val.replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `solscribe_subscribers_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/10 backdrop-blur-sm shadow-xl flex flex-col gap-4">
      {/* Roster Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-500" /> Subscribers Roster Directory
          </h3>
          <p className="text-[10px] text-zinc-500">
            View active term details, wallet keys, and export records to Excel or CSV
          </p>
        </div>

        <Button
          onClick={handleExportCSV}
          disabled={subscribers.length === 0}
          className="text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 h-8 px-3 shrink-0"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" /> Export to CSV
        </Button>
      </div>

      {/* Roster Directory Table */}
      <div className="border border-zinc-800/80 rounded-xl bg-zinc-950/20 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[650px]">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/20 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold select-none">
              <th className="p-3 pl-4">Wallet Key</th>
              <th className="p-3">User Branding</th>
              <th className="p-3">Started Date</th>
              <th className="p-3">Expires Date</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right pr-4">Total USDC Contributed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40 text-xs">
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                  No active subscribers found.
                </td>
              </tr>
            ) : (
              paginatedItems.map((sub) => (
                <tr key={sub.id} className="hover:bg-zinc-900/10 transition-colors">
                  <td className="p-3 pl-4 font-mono text-[10px] text-zinc-300">
                    <span className="flex items-center gap-1.5" title={sub.wallet}>
                      {sub.wallet.substring(0, 6)}...{sub.wallet.substring(sub.wallet.length - 4)}
                      <a
                        href={`https://solscan.io/account/${sub.wallet}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-600 hover:text-amber-500 transition"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-zinc-200">
                        {sub.displayName || 'Anonymous Reader'}
                      </span>
                      {sub.username && (
                        <span className="text-[10px] text-zinc-500 font-mono">
                          @{sub.username}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-zinc-400 font-mono text-[10px]">
                    {formatDate(sub.startedAt)}
                  </td>
                  <td className="p-3 text-zinc-400 font-mono text-[10px]">
                    {formatDate(sub.expiresAt)}
                  </td>
                  <td className="p-3">
                    <span
                      className={cn(
                        'px-2 py-0.5 text-[9px] font-bold rounded-full border tracking-wide uppercase',
                        sub.status === 'active' && 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
                        sub.status === 'expired' && 'text-rose-500 border-rose-500/20 bg-rose-500/5',
                        sub.status === 'cancelled' && 'text-zinc-500 border-zinc-800 bg-zinc-900/60',
                        sub.status === 'pending' && 'text-amber-500 border-amber-500/20 bg-amber-500/5'
                      )}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="p-3 text-right pr-4 font-mono font-bold text-amber-500">
                    ${sub.totalPaid.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {subscribers.length > itemsPerPage && (
        <div className="flex items-center justify-between select-none pt-2">
          <span className="text-[10px] font-mono text-zinc-500">
            SHOWING {startIndex + 1} - {Math.min(startIndex + itemsPerPage, subscribers.length)} OF {subscribers.length} ENTRIES
          </span>

          <div className="flex items-center gap-1">
            <Button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={activePage === 1}
              className="p-1 w-7 h-7 rounded-md bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 disabled:opacity-40 disabled:hover:bg-zinc-850 shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-[10px] font-mono text-zinc-300 px-2.5">
              {activePage} / {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={activePage === totalPages}
              className="p-1 w-7 h-7 rounded-md bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 disabled:opacity-40 disabled:hover:bg-zinc-850 shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
