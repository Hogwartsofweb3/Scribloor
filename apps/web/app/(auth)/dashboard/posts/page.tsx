'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Search,
  Eye,
  Mail,
  MailCheck,
  Check,
  AlertCircle,
  RefreshCw,
  MoreVertical,
  Clock,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import EmptyState from '@/components/dashboard/EmptyState';

interface Post {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  status: 'draft' | 'published' | 'scheduled';
  publishedAt: string | null;
  viewCount: number;
  isPaywalled: boolean;
  emailSentAt: string | null;
  createdAt: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtering and search
  const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'scheduled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [publication, setPublication] = useState<any>(null);

  // Checkbox selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Dropdown menu state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Deletion modals
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load publication and posts on mount
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Resolve publication first to get slug
      const pubRes = await fetch('/api/publications');
      const pubData = await pubRes.json();
      
      if (pubRes.ok && pubData.publication) {
        setPublication(pubData.publication);
      }

      // 2. Fetch posts
      const postsRes = await fetch('/api/posts');
      const postsData = await postsRes.json();

      if (postsRes.ok && postsData.posts) {
        setPosts(postsData.posts);
      } else {
        setError(postsData.error || 'Failed to fetch posts');
      }
    } catch (err) {
      setError('Network error retrieving posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter posts based on selected tab and search query
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesFilter = filter === 'all' || post.status === filter;
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.subtitle && post.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  }, [posts, filter, searchQuery]);

  // Tab counts
  const counts = useMemo(() => {
    return {
      all: posts.length,
      published: posts.filter((p) => p.status === 'published').length,
      draft: posts.filter((p) => p.status === 'draft').length,
      scheduled: posts.filter((p) => p.status === 'scheduled').length,
    };
  }, [posts]);

  // Checkbox handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredPosts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (postId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, postId]);
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== postId));
    }
  };

  const isAllSelected = filteredPosts.length > 0 && selectedIds.length === filteredPosts.length;

  // Single Delete trigger
  const triggerDelete = (postId: string) => {
    setDeletingId(postId);
    setIsBulkDelete(false);
    setActiveMenuId(null);
  };

  // Bulk Delete trigger
  const triggerBulkDelete = () => {
    setIsBulkDelete(true);
    setDeletingId(null);
  };

  // Deletion logic
  const handleDelete = async () => {
    setDeleting(true);
    try {
      if (isBulkDelete) {
        // Bulk delete items
        await Promise.all(
          selectedIds.map((id) =>
            fetch(`/api/posts/${id}`, {
              method: 'DELETE',
            })
          )
        );
        setPosts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
        setSelectedIds([]);
      } else if (deletingId) {
        // Single delete item
        const response = await fetch(`/api/posts/${deletingId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete post');
        }
        setPosts((prev) => prev.filter((p) => p.id !== deletingId));
      }
      setDeletingId(null);
      setIsBulkDelete(false);
    } catch (err: any) {
      alert(err.message || 'An error occurred while deleting the post.');
    } finally {
      setDeleting(false);
    }
  };

  // Click outside to close actions menu
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      {/* Posts Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-5 mb-6 select-none">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)] mb-1">
            Posts
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] font-sans">
            Create, edit, schedule, and manage dispatches for your publication.
          </p>
        </div>
        <Link href="/dashboard/posts/new">
          <Button className="font-bold bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white shadow-md rounded-lg">
            <Plus className="w-4 h-4 mr-2" /> Write new post
          </Button>
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 text-sm leading-normal flex items-start gap-3 select-none">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[450px] p-6 text-zinc-500">
          <RefreshCw className="w-8 h-8 animate-spin text-[var(--color-brand-500)] mb-4" />
          <span className="text-sm font-mono uppercase tracking-widest text-zinc-400">Loading posts...</span>
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={FileText}
          heading="No posts written yet"
          sub="Begin sharing your insights with your web3 subscribers. Publish premium articles paywalled securely with Solana USDC."
          cta="Write Your First Post"
          ctaHref="/dashboard/posts/new"
        />
      ) : (
        <div className="flex flex-col gap-6">
          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between select-none">
            {/* Filter Tabs */}
            <div className="flex border border-[var(--color-border)] rounded-lg p-0.5 bg-[var(--color-bg-secondary)]/50 w-full lg:w-auto overflow-x-auto">
              {(['all', 'draft', 'published', 'scheduled'] as const).map((t) => {
                const isActive = filter === t;
                const labels = {
                  all: 'All',
                  draft: 'Drafts',
                  published: 'Published',
                  scheduled: 'Scheduled',
                };
                const countVal = counts[t === 'draft' ? 'draft' : t];

                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setFilter(t);
                      setSelectedIds([]); // Clear selection on tab change
                    }}
                    className={cn(
                      'flex-1 lg:flex-none px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 whitespace-nowrap',
                      isActive
                        ? 'text-[var(--color-brand-500)] bg-[var(--color-brand-50)] dark:bg-violet-950/20 font-bold shadow-sm'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    )}
                  >
                    {labels[t]}
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded-full text-[10px] font-bold font-mono transition-colors duration-200',
                        isActive
                          ? 'bg-[var(--color-brand-500)] text-white'
                          : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]'
                      )}
                    >
                      {countVal}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:max-w-xs">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2.5 pl-9 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] text-xs focus:outline-none focus:border-[var(--color-brand-500)]/60 transition"
              />
            </div>
          </div>

          {/* Bulk Actions Indicator */}
          {selectedIds.length > 0 && (
            <div className="p-4 rounded-xl border border-[var(--color-brand-500)]/20 bg-[var(--color-brand-50)]/30 dark:bg-violet-950/10 flex items-center justify-between select-none animate-fade-in shadow-sm">
              <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                {selectedIds.length} post{selectedIds.length !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={triggerBulkDelete}
                className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-500 border border-rose-500/20 hover:border-rose-500/50 bg-rose-500/5 px-3 py-1.5 rounded-lg transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Selected
              </button>
            </div>
          )}

          {/* Table Container */}
          {filteredPosts.length === 0 ? (
            <div className="mt-4">
              {filter === 'draft' && (
                <EmptyState
                  icon={FileText}
                  heading="No draft posts"
                  sub="Need to gather your thoughts? Draft your newsletter issues and edit them anytime before publishing."
                  cta="Create a new draft"
                  ctaHref="/dashboard/posts/new"
                />
              )}
              {filter === 'published' && (
                <EmptyState
                  icon={BookOpen}
                  heading="No published posts yet"
                  sub="You haven't released any articles to your subscribers. Write a post or publish a draft to get started."
                  cta="Publish a draft"
                  ctaHref="/dashboard/posts"
                />
              )}
              {filter === 'scheduled' && (
                <EmptyState
                  icon={Clock}
                  heading="No scheduled posts"
                  sub="Want to schedule articles ahead of time? Choose a publication release date when editing a post."
                  cta="Schedule a post"
                  ctaHref="/dashboard/posts"
                />
              )}
              {filter === 'all' && (
                <div className="py-12 text-center text-[var(--color-text-muted)] font-mono text-xs select-none">
                  No posts match your search query.
                </div>
              )}
            </div>
          ) : (
            <div className="border border-[var(--color-border)] rounded-[10px] bg-white dark:bg-[#111110] shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]/30 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] select-none">
                    <th className="p-4 pl-6 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        className="rounded border-[var(--color-border-strong)] text-[var(--color-brand-500)] focus:ring-[var(--color-brand-500)] w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="p-4">Title</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Published Date</th>
                    <th className="p-4">Views</th>
                    <th className="p-4">Email Sent</th>
                    <th className="p-4 text-right pr-6 w-16">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)] text-sm">
                  {filteredPosts.map((post) => {
                    const viewUrl = publication
                      ? `/pub/${publication.slug}/${post.slug}`
                      : '#';
                    const isSelected = selectedIds.includes(post.id);

                    return (
                      <tr 
                        key={post.id} 
                        className={cn(
                          'hover:bg-[var(--color-brand-50)]/10 dark:hover:bg-violet-950/5 transition-colors group',
                          isSelected && 'bg-[var(--color-brand-50)]/20 dark:bg-violet-950/10'
                        )}
                      >
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectOne(post.id, e.target.checked)}
                            className="rounded border-[var(--color-border-strong)] text-[var(--color-brand-500)] focus:ring-[var(--color-brand-500)] w-4 h-4 cursor-pointer"
                          />
                        </td>
                        <td className="p-4 max-w-xs md:max-w-sm">
                          <div className="flex flex-col gap-0.5">
                            <Link 
                              href={`/dashboard/posts/${post.id}/edit`}
                              className="font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-brand-500)] transition-colors truncate"
                            >
                              {post.title}
                            </Link>
                            {post.subtitle && (
                              <p className="text-[13px] text-[var(--color-text-secondary)] truncate">
                                {post.subtitle}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4 select-none">
                          <span
                            className={cn(
                              'px-2 py-0.5 text-[10px] font-bold rounded-full border tracking-wide uppercase',
                              post.status === 'published' && 'text-emerald-600 border-emerald-500/20 bg-emerald-500/5',
                              post.status === 'draft' && 'text-[var(--color-text-secondary)] border-[var(--color-border-strong)] bg-[var(--color-bg-secondary)]',
                              post.status === 'scheduled' && 'text-sky-600 border-sky-500/20 bg-sky-500/5'
                            )}
                          >
                            {post.status}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-xs text-[var(--color-text-secondary)] select-none">
                          {post.publishedAt
                            ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'Draft'}
                        </td>
                        <td className="p-4 font-mono text-xs text-[var(--color-text-secondary)] select-none">
                          {post.viewCount}
                        </td>
                        <td className="p-4 select-none">
                          <div className="flex items-center gap-1.5 text-xs">
                            {post.emailSentAt ? (
                              <span className="flex items-center gap-1 text-teal-600 font-semibold">
                                <MailCheck className="w-4 h-4 shrink-0" /> Sent
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[var(--color-text-muted)]">
                                <Mail className="w-4 h-4 shrink-0" /> Queue
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right pr-6 relative">
                          {/* Actions Menu */}
                          <div className="inline-block text-left">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === post.id ? null : post.id);
                              }}
                              className="p-1 rounded-md hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {activeMenuId === post.id && (
                              <div className="absolute right-6 mt-1 w-36 bg-white dark:bg-zinc-900 border border-[var(--color-border-strong)] rounded-lg shadow-xl py-1 z-30 select-none text-left animate-scale-in">
                                <Link
                                  href={`/dashboard/posts/${post.id}/edit`}
                                  className="flex items-center gap-2 px-3.5 py-2 text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors font-medium"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-[var(--color-text-muted)]" /> Edit
                                </Link>
                                
                                {post.status === 'published' && (
                                  <a
                                    href={viewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3.5 py-2 text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors font-medium"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 text-[var(--color-text-muted)]" /> View live
                                  </a>
                                )}

                                <button
                                  onClick={() => triggerDelete(post.id)}
                                  className="flex items-center gap-2 w-full px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-500/5 transition-colors font-semibold"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-500/70" /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {(deletingId || isBulkDelete) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
          <div className="w-full max-w-sm border border-red-500/20 bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-2xl animate-scale-in">
            <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 mb-2">
              {isBulkDelete ? 'Delete selected posts?' : 'Delete post?'}
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed mb-6">
              {isBulkDelete
                ? `Are you sure you want to permanently delete these ${selectedIds.length} selected posts? This action will remove all analytics, content, and links. This cannot be undone.`
                : 'Are you sure you want to permanently delete this post? This will remove all statistics, content history, and online links. This cannot be undone.'}
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                onClick={() => {
                  setDeletingId(null);
                  setIsBulkDelete(false);
                }}
                disabled={deleting}
                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-250 dark:border-zinc-700 font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-sm"
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
