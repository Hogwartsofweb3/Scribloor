'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  UserPlus,
  Trophy,
  Coins,
  FileText,
  HelpCircle,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Custom Tabler Bell Icon SVG
const BellIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5 stroke-current"
    viewBox="0 0 24 24"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" />
    <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
  </svg>
);

interface Notification {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  read: boolean;
  type: 'subscriber' | 'milestone' | 'payment' | 'post' | 'system';
}

const initialNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Subscriber!',
    message: 'alex.sol subscribed to your publication.',
    timeAgo: '5m ago',
    read: false,
    type: 'subscriber',
  },
  {
    id: '2',
    title: 'Milestone Unlocked! 🏆',
    message: 'You reached 100 subscribers!',
    timeAgo: '2h ago',
    read: false,
    type: 'milestone',
  },
  {
    id: '3',
    title: 'Payment Received',
    message: 'Received 10.00 USDC from jake.sol',
    timeAgo: '1d ago',
    read: true,
    type: 'payment',
  },
  {
    id: '4',
    title: 'Post Published',
    message: '"State of Solana 2026" is now live.',
    timeAgo: '3d ago',
    read: true,
    type: 'post',
  },
  {
    id: '5',
    title: 'Welcome to Solscribe',
    message: 'Start drafting your first newsletter.',
    timeAgo: '1w ago',
    read: true,
    type: 'system',
  },
];

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'subscriber':
        return <UserPlus className="w-4 h-4 text-violet-500" />;
      case 'milestone':
        return <Trophy className="w-4 h-4 text-amber-500" />;
      case 'payment':
        return <Coins className="w-4 h-4 text-teal-500" />;
      case 'post':
        return <FileText className="w-4 h-4 text-blue-500" />;
      default:
        return <HelpCircle className="w-4 h-4 text-zinc-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'relative p-2 rounded-[var(--radius-md)] transition-colors',
          open
            ? 'bg-black/5 dark:bg-white/5 text-[var(--color-text-primary)]'
            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
        )}
        aria-label="Notifications"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-error)] rounded-full ring-2 ring-white dark:ring-[#111110]" />
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#111110] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-xl z-50 overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
            <span className="text-sm font-bold text-[var(--color-text-primary)]">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-[var(--color-brand-500)] hover:text-[var(--color-brand-600)] transition-colors flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List (limit to last 5) */}
          <div className="divide-y divide-[var(--color-border)] max-h-80 overflow-y-auto scrollbar-thin">
            {notifications.slice(0, 5).map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleToggleRead(notif.id)}
                className={cn(
                  'px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex gap-3 items-start',
                  !notif.read && 'bg-[var(--color-brand-50)]/30 dark:bg-[var(--color-brand-500)]/5'
                )}
              >
                {/* Icon Container */}
                <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  {getIcon(notif.type)}
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <p className={cn('text-xs font-bold text-[var(--color-text-primary)] truncate', !notif.read && 'font-extrabold')}>
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-[var(--color-text-muted)] whitespace-nowrap">
                      {notif.timeAgo}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                {/* Unread Dot */}
                {!notif.read && (
                  <span className="w-1.5 h-1.5 bg-[var(--color-brand-500)] rounded-full shrink-0 mt-1.5 animate-pulse" />
                )}
              </div>
            ))}
          </div>

          {/* Footer Link */}
          <div className="bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] px-4 py-2.5 text-center">
            <button
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
