import React from 'react';
import { Eye, Clock, BarChart3 } from 'lucide-react';

interface TopPost {
  id: string;
  title: string;
  viewCount: number;
  readTime: number;
  slug: string;
}

interface TopPostsProps {
  posts: TopPost[];
}

export default function TopPosts({ posts }: TopPostsProps) {
  const maxViews = React.useMemo(() => {
    if (posts.length === 0) return 1;
    return Math.max(...posts.map((p) => p.viewCount), 1);
  }, [posts]);

  return (
    <div className="p-5 bg-white dark:bg-[#111110] border border-[var(--color-border)] rounded-[10px] shadow-sm flex flex-col gap-5 h-full">
      <div>
        <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-1.5 select-none">
          <BarChart3 className="w-4 h-4 text-[var(--color-brand-500)]" /> Top Articles
        </h3>
        <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 select-none">
          Your 5 most-read dispatches by cumulative view counts
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center py-12 text-[var(--color-text-muted)] font-mono text-[10px] uppercase tracking-wider select-none">
          <span>💤 No post traffic recorded</span>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => {
            const relativePercent = Math.max(2, Math.round((post.viewCount / maxViews) * 100));

            return (
              <div key={post.id} className="flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center justify-between gap-3 text-xs select-none">
                  <span className="font-semibold text-[var(--color-text-primary)] truncate" title={post.title}>
                    {post.title}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--color-text-muted)] whitespace-nowrap shrink-0 flex items-center gap-0.5">
                    <Eye className="w-3 h-3" /> {post.viewCount}
                  </span>
                </div>
                
                {/* Views Bar */}
                <div className="relative h-1.5 w-full bg-[var(--color-bg-secondary)] rounded-full overflow-hidden select-none">
                  <div
                    className="h-full bg-[var(--color-brand-500)] rounded-full transition-all duration-500"
                    style={{ width: `${relativePercent}%` }}
                  />
                </div>

                {/* Read time */}
                <div className="flex items-center gap-1 text-[9px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider select-none">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{post.readTime} min read</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
