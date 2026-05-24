"use client";

import React, { useState, useEffect } from 'react';
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
  Check,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function PostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'scheduled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [publication, setPublication] = useState<any>(null);

  // Deletion modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);
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

  // Handle Post Deletion
  const handleDelete = async (postId: string) => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete post');
      }

      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setDeletingId(null);
    } catch (err: any) {
      alert(err.message || 'An error occurred while deleting the post.');
    } finally {
      setDeleting(false);
    }
  };

  // Filtering and Searching Logic
  const filteredPosts = posts.filter((post) => {
    const matchesFilter = filter === 'all' || post.status === filter;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.subtitle && post.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-6 text-zinc-500">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mb-4" />
        <span className="text-sm font-mono uppercase tracking-widest">Loading posts...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Posts Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100 mb-1">
            Editorial Panel
          </h1>
          <p className="text-sm text-zinc-400">
            Create, edit, scheduled, and manage newsletter dispatches for your publication.
          </p>
        </div>
        <Link href="/dashboard/posts/new">
          <Button className="font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/10">
            <Plus className="w-4 h-4 mr-2" /> Write Post
          </Button>
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 text-sm leading-normal flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty State */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[350px] p-8 border border-zinc-800 rounded-2xl bg-zinc-900/5 text-center">
          <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full border border-zinc-800 bg-zinc-950 text-zinc-400">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-zinc-200">No posts written yet</h3>
          <p className="max-w-md text-sm text-zinc-400 mb-6 leading-relaxed">
            Begin sharing your insights with your web3 subscribers. Publish premium articles paywalled securely with Solana USDC.
          </p>
          <Link href="/dashboard/posts/new">
            <Button className="font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950">
              Write Your First Post
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Filter Tabs */}
            <div className="flex border border-zinc-800 rounded-lg p-0.5 bg-zinc-950/60 w-full sm:w-auto shrink-0 select-none">
              {(['all', 'draft', 'published', 'scheduled'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilter(t)}
                  className={cn(
                    'flex-grow sm:flex-grow-0 px-4 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition',
                    filter === t
                      ? 'text-amber-500 bg-amber-500/10 font-bold'
                      : 'text-zinc-500 hover:text-zinc-300'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2.5 pl-9 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300 placeholder:text-zinc-600 text-xs focus:outline-none focus:border-amber-500/60 transition"
              />
            </div>
          </div>

          {/* Posts Table */}
          <div className="border border-zinc-800 rounded-xl bg-zinc-950/20 shadow-xl overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/10 text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold select-none">
                  <th className="p-4 pl-6">Post Details</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Subscribers Only</th>
                  <th className="p-4">Metrics</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-sm">
                {filteredPosts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-500 font-mono text-xs">
                      No posts match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredPosts.map((post) => {
                    const viewUrl = publication
                      ? `/pub/${publication.slug}/${post.slug}`
                      : '#';

                    return (
                      <tr key={post.id} className="hover:bg-zinc-900/10 transition-colors">
                        <td className="p-4 pl-6 max-w-sm">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-zinc-200 line-clamp-1 group-hover:text-zinc-100">
                              {post.title}
                            </span>
                            <span className="text-xs text-zinc-500 font-mono">
                              {post.publishedAt
                                ? `Published ${new Date(post.publishedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}`
                                : 'Created as draft'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={cn(
                              'px-2.5 py-0.5 text-[10px] font-bold rounded-full border tracking-wide uppercase',
                              post.status === 'published' && 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
                              post.status === 'draft' && 'text-zinc-400 border-zinc-800 bg-zinc-900/60',
                              post.status === 'scheduled' && 'text-sky-500 border-sky-500/20 bg-sky-500/5'
                            )}
                          >
                            {post.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={cn(
                              'text-xs font-semibold',
                              post.isPaywalled ? 'text-amber-500' : 'text-zinc-500'
                            )}
                          >
                            {post.isPaywalled ? '🔒 Paywalled' : '🔓 Free'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                            <span className="flex items-center gap-1" title="Views">
                              <Eye className="w-3.5 h-3.5 text-zinc-500" />
                              {post.viewCount}
                            </span>
                            <span className="flex items-center gap-1" title="Newsletter Delivery">
                              <Mail
                                className={cn(
                                  'w-3.5 h-3.5',
                                  post.emailSentAt ? 'text-emerald-500' : 'text-zinc-500'
                                )}
                              />
                              {post.emailSentAt ? 'Sent' : 'Queue'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-right pr-6">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link href={`/dashboard/posts/${post.id}/edit`}>
                              <button
                                type="button"
                                title="Edit post"
                                className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </Link>
                            
                            {post.status === 'published' && (
                              <a href={viewUrl} target="_blank" rel="noopener noreferrer">
                                <button
                                  type="button"
                                  title="View live post"
                                  className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                              </a>
                            )}

                            <button
                              type="button"
                              onClick={() => setDeletingId(post.id)}
                              title="Delete post"
                              className="p-1.5 text-red-500/60 hover:text-red-400 hover:bg-red-950/10 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm select-none">
          <div className="w-full max-w-sm border border-red-500/20 bg-zinc-900 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-zinc-100 mb-2">Delete post?</h3>
            <p className="text-zinc-400 text-xs leading-relaxed mb-6">
              Are you sure you want to permanently delete this post? This will remove all statistics, content history, and online links.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                onClick={() => setDeletingId(null)}
                disabled={deleting}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => handleDelete(deletingId)}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold"
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
