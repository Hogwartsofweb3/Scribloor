'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  Coins,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/stores/uiStore';

const sidebarLinks = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/posts', label: 'Posts', icon: BookOpen },
  { href: '/dashboard/subscribers', label: 'Subscribers', icon: Users },
  { href: '/dashboard/vault', label: 'Vault', icon: Coins },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  // Fetch publication details using React Query
  const { data: pubData, isLoading } = useQuery({
    queryKey: ['creator-publication'],
    queryFn: async () => {
      const res = await fetch('/api/publications');
      if (!res.ok) throw new Error('Failed to fetch publication');
      return res.json();
    },
  });

  const publication = pubData?.publication;

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
      className="hidden md:flex flex-col h-screen sticky top-0 left-0 bg-card border-r border-border shrink-0 select-none overflow-x-hidden"
      id="dashboard-sidebar"
    >
      {/* Top Section: Publication Details */}
      <div className="p-4 border-b border-border h-[var(--header-height)] flex items-center gap-3">
        {isLoading ? (
          <div className="flex items-center gap-3 w-full animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-muted shrink-0" />
            {!sidebarCollapsed && (
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-muted rounded w-3/4" />
                <div className="h-2.5 bg-muted rounded w-1/2" />
              </div>
            )}
          </div>
        ) : publication ? (
          <div className="flex items-center gap-3 min-w-0 w-full">
            {publication.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={publication.coverImageUrl}
                alt={publication.name}
                className="w-8 h-8 rounded-lg object-cover border border-border shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                {publication.name.charAt(0).toUpperCase()}
              </div>
            )}
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col min-w-0"
              >
                <span className="text-sm font-bold text-foreground truncate leading-snug">
                  {publication.name}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground truncate">
                  solscribe.app/{publication.slug}
                </span>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 min-w-0 w-full">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              S
            </div>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col min-w-0"
              >
                <span className="text-sm font-bold text-foreground">Solscribe</span>
                <span className="text-[10px] text-muted-foreground">Setup Publication</span>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Middle Section: Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto scrollbar-thin">
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
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all relative group',
                isActive
                  ? 'text-primary bg-primary/5 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon size={18} className={cn('shrink-0 transition-transform duration-200', isActive && 'scale-105')} />
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="truncate"
                >
                  {link.label}
                </motion.span>
              )}
              {sidebarCollapsed && (
                <div className="absolute left-16 bg-zinc-950 text-zinc-200 border border-zinc-800 text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl z-50">
                  {link.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section: Collapse Toggle & Help */}
      <div className="p-3 border-t border-border space-y-1">
        {!sidebarCollapsed && (
          <a
            href="https://docs.solscribe.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <HelpCircle size={18} className="shrink-0" />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              Help & Docs
            </motion.span>
          </a>
        )}

        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center md:justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              Collapse Sidebar
            </motion.span>
          )}
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </motion.aside>
  );
}
