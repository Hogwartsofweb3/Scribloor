'use client';

import React, { useState, useMemo } from 'react';
import { PostCard } from '@/components/shared/PostCard';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  coverImageUrl: string | null;
  contentHtml: string;
  isPaywalled: boolean;
  publishedAt: string | Date | null;
  viewCount: number;
}

interface PublicationPostsListProps {
  posts: Post[];
  publicationSlug: string;
  isCreator: boolean;
}

const POSTS_PER_PAGE = 5;

export default function PublicationPostsList({
  posts,
  publicationSlug,
  isCreator,
}: PublicationPostsListProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'free' | 'paid'>('all');
  const [page, setPage] = useState(1);

  // Filter posts based on active tab
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (activeTab === 'free') return !post.isPaywalled;
      if (activeTab === 'paid') return post.isPaywalled;
      return true;
    });
  }, [posts, activeTab]);

  // Paginated posts list
  const visiblePosts = useMemo(() => {
    return filteredPosts.slice(0, page * POSTS_PER_PAGE);
  }, [filteredPosts, page]);

  const hasMore = filteredPosts.length > visiblePosts.length;

  const handleTabChange = (tab: 'all' | 'free' | 'paid') => {
    setActiveTab(tab);
    setPage(1); // Reset pagination on tab change
  };

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex border-b border-[var(--color-border)] select-none">
        {(['all', 'free', 'paid'] as const).map((tab) => {
          const isActive = activeTab === tab;
          const labels = {
            all: 'All posts',
            free: 'Free',
            paid: 'Subscribers only',
          };
          return (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-4 py-3 text-sm font-semibold uppercase tracking-wider relative transition-colors duration-200 ${
                isActive 
                  ? 'text-[var(--color-brand-500)] font-bold' 
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {labels[tab]}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-brand-500)] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Post List */}
      {visiblePosts.length === 0 ? (
        <div className="py-16 text-center border border-[var(--color-border)] border-dashed rounded-xl bg-[var(--color-bg-secondary)]/10 select-none">
          <div className="flex items-center justify-center w-12 h-12 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-muted)] mx-auto mb-4">
            <FileText className="w-5 h-5 stroke-[1.5]" />
          </div>
          {isCreator ? (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                You haven't published anything yet
              </h3>
              <p className="max-w-xs text-xs text-[var(--color-text-secondary)] mx-auto leading-relaxed">
                Write and publish your first article to share it with your audience.
              </p>
              <Link href="/dashboard/posts/new">
                <Button className="font-bold bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white shadow-md">
                  <Plus className="w-4 h-4 mr-1.5" /> Write your first post →
                </Button>
              </Link>
            </div>
          ) : (
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                Nothing published yet
              </h3>
              <p className="max-w-xs text-xs text-[var(--color-text-secondary)] mx-auto leading-relaxed">
                Nothing published yet. Check back soon.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col">
          {visiblePosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              publicationSlug={publicationSlug}
              variant="full"
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-4 select-none">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-6 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-secondary)] text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] transition-all hover:border-[var(--color-border-strong)] shadow-sm"
          >
            Load more posts
          </button>
        </div>
      )}
    </div>
  );
}
