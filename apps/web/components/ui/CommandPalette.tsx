'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/lib/stores/uiStore';
import { useToast } from '@/components/ui/Toast';
import {
  Compass,
  LayoutDashboard,
  Settings,
  PlusCircle,
  FolderLock,
  Search,
  BookOpen,
  User,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResultItem {
  type: 'publication' | 'post' | 'command';
  id: string;
  label: string;
  sublabel?: string;
  url: string;
  icon: React.ReactNode;
  shortcut?: string;
}

export default function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, closeCommandPalette } = useUIStore();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard shortcut listener for palette toggle (Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const open = useUIStore.getState().commandPaletteOpen;
        if (open) {
          useUIStore.getState().closeCommandPalette();
        } else {
          useUIStore.getState().openCommandPalette();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Autofocus input when palette opens
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [commandPaletteOpen]);

  // Default commands
  const defaultCommands: SearchResultItem[] = [
    {
      type: 'command',
      id: 'cmd-dashboard',
      label: 'Dashboard',
      sublabel: 'View your creator analytics and posts',
      url: '/dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      shortcut: 'G D',
    },
    {
      type: 'command',
      id: 'cmd-new-post',
      label: 'New Post',
      sublabel: 'Create a new article draft',
      url: '/dashboard/posts',
      icon: <PlusCircle className="w-4 h-4" />,
    },
    {
      type: 'command',
      id: 'cmd-explore',
      label: 'Explore',
      sublabel: 'Discover publications and trending articles',
      url: '/explore',
      icon: <Compass className="w-4 h-4" />,
      shortcut: 'G E',
    },
    {
      type: 'command',
      id: 'cmd-vault',
      label: 'The Vault',
      sublabel: 'Browse premium unlockable research vault entries',
      url: '/vault',
      icon: <FolderLock className="w-4 h-4" />,
    },
    {
      type: 'command',
      id: 'cmd-settings',
      label: 'Settings',
      sublabel: 'Manage your profile and payment credentials',
      url: '/dashboard', // maps to dashboard settings
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  // Fetch search results on query change
  useEffect(() => {
    if (!query.trim()) {
      setResults(defaultCommands);
      setSelectedIndex(0);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=4`);
        if (res.ok) {
          const data = await res.json();
          
          const pubResults: SearchResultItem[] = (data.publications || []).map((p: any) => ({
            type: 'publication',
            id: p.id,
            label: p.name,
            sublabel: `Publication by ${p.ownerName || 'Creator'} • ${p.subscriberCount} subs`,
            url: `/${p.slug}`,
            icon: <User className="w-4 h-4 text-emerald-400" />,
          }));

          const postResults: SearchResultItem[] = (data.posts || []).map((p: any) => ({
            type: 'post',
            id: p.id,
            label: p.title,
            sublabel: `Article in ${p.publicationName}`,
            url: `/${p.publicationSlug}/${p.slug}`,
            icon: <BookOpen className="w-4 h-4 text-violet-400" />,
          }));

          const matchedCommands = defaultCommands.filter(c => 
            c.label.toLowerCase().includes(query.toLowerCase())
          );

          setResults([...matchedCommands, ...pubResults, ...postResults]);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error('[CommandPalette] Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Keyboard navigation inside the result list
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!commandPaletteOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        closeCommandPalette();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, results.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(1, results.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, results, selectedIndex]);

  // Scroll active item into view
  useEffect(() => {
    const activeEl = listRef.current?.querySelector('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleSelect = (item: SearchResultItem) => {
    router.push(item.url);
    closeCommandPalette();
  };

  if (!mounted || !commandPaletteOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-start justify-center pt-[15vh] p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeCommandPalette}
          className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
        />

        {/* Palette Dialog */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-[560px] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl z-10 flex flex-col max-h-[420px]"
        >
          {/* Search Input Box */}
          <div className="relative border-b border-zinc-800 flex items-center px-4">
            <Search className="w-5 h-5 text-zinc-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search or jump to..."
              className="w-full bg-transparent border-0 px-3 py-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-0"
            />
            {loading ? (
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest shrink-0 animate-pulse">
                Searching...
              </span>
            ) : (
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-bold text-zinc-500 border border-zinc-800 rounded bg-zinc-950/50 uppercase select-none">
                esc
              </kbd>
            )}
          </div>

          {/* Results List */}
          <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-4">
            {results.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500 leading-relaxed font-sans">
                No matching results found for "{query}"
              </div>
            ) : (
              <div className="space-y-1">
                {/* Categorized grouping is done visually by rendering items */}
                {results.map((item, index) => {
                  const isActive = index === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      data-active={isActive}
                      onClick={() => handleSelect(item)}
                      className={cn(
                        'flex items-center gap-3 px-3.5 py-3 rounded-xl cursor-pointer transition select-none',
                        isActive
                          ? 'bg-zinc-800 text-zinc-100'
                          : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
                      )}
                    >
                      <div className={cn(
                        'shrink-0 p-1.5 rounded-lg bg-zinc-950/50',
                        isActive ? 'text-violet-400 border border-violet-500/10' : 'text-zinc-500'
                      )}>
                        {item.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className={cn(
                          'text-sm font-semibold block leading-snug',
                          isActive ? 'text-zinc-100' : 'text-zinc-300'
                        )}>
                          {item.label}
                        </span>
                        {item.sublabel && (
                          <span className="text-[11px] text-zinc-500 block truncate leading-tight mt-0.5">
                            {item.sublabel}
                          </span>
                        )}
                      </div>

                      {/* Right shortcut or hover pointer */}
                      {item.shortcut ? (
                        <kbd className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-mono font-bold text-zinc-500 border border-zinc-800 rounded bg-zinc-950/20">
                          {item.shortcut}
                        </kbd>
                      ) : (
                        isActive && <ArrowRight className="w-3.5 h-3.5 text-violet-400 animate-in slide-in-from-left-1 duration-150" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Palette Footer Instructions */}
          <div className="px-4 py-2 bg-zinc-950/40 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-zinc-500 select-none">
            <div className="flex gap-4">
              <span>↑↓ Navigation</span>
              <span>↵ Select</span>
            </div>
            <span>Solscribe Command Palette</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
