'use client';

import React, { useState, useEffect, useRef, useTransition, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Compass, Users, CreditCard, Sparkles, RefreshCw, Flame, Clock, Plus, BookOpen, ExternalLink, Shield, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PostCard } from '@/components/shared/PostCard';
import { SubscribeButton } from '@/components/subscribe/SubscribeButton';
import { VaultEntryCard } from '@/components/vault/VaultEntryCard';

interface Creator {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  username: string;
}

interface LatestPost {
  id: string;
  title: string;
  slug: string;
}

interface Publication {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverImageUrl: string | null;
  monthlyPriceUsdc: number;
  subscriberCount: number;
  owner: Creator;
  latestPost?: LatestPost | null;
}

interface ExploreClientProps {
  initialPublications: Publication[];
  featuredPublications: Publication[];
  trendingPosts: any[];
  newPublications: any[];
}

export default function ExploreClient({
  initialPublications,
  featuredPublications,
  trendingPosts,
  newPublications,
}: ExploreClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // URL State
  const activeCategory = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('q') || '';

  // Local State
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [dropdownResults, setDropdownResults] = useState<{ publications: any[]; posts: any[]; research: any[] } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearchingDropdown, setIsSearchingDropdown] = useState(false);
  const [focusSearchFlag, setFocusSearchFlag] = useState(false);

  // Pagination State
  const [publicationsGrid, setPublicationsGrid] = useState<Publication[]>(initialPublications);
  const [hasMore, setHasMore] = useState(initialPublications.length >= 12);
  const [offset, setOffset] = useState(initialPublications.length);
  const [loadingMore, setLoadingMore] = useState(false);

  // Search Results Mode State (when q is active in URL)
  const [searchResults, setSearchResults] = useState<{ publications: any[]; posts: any[]; research: any[] } | null>(null);
  const [loadingResults, setLoadingResults] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Focus search if URL parameter ?focusSearch=true is passed
  useEffect(() => {
    if (searchParams.get('focusSearch') === 'true') {
      searchInputRef.current?.focus();
      // Clean query parameter
      const params = new URLSearchParams(searchParams.toString());
      params.delete('focusSearch');
      router.replace(`/explore?${params.toString()}`);
    }
  }, [searchParams, router]);

  // Sync search input state with URL param
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Fetch publications grid on category change
  useEffect(() => {
    async function reloadGrid() {
      setLoadingMore(true);
      try {
        const res = await fetch(`/api/explore/publications?category=${activeCategory}&q=${searchQuery}&offset=0&limit=12`);
        if (res.ok) {
          const data = await res.json();
          setPublicationsGrid(data.publications || []);
          setHasMore(data.hasMore);
          setOffset(data.publications.length);
        }
      } catch (err) {
        console.error('[Explore] Failed to load grid:', err);
      } finally {
        setLoadingMore(false);
      }
    }
    
    // If not search query, reload grid based on category. If search query is present, we handle search results mode
    if (!searchQuery) {
      reloadGrid();
    }
  }, [activeCategory, searchQuery]);

  // Load search results when ?q= URL parameter changes
  useEffect(() => {
    async function fetchFullSearchResults() {
      if (!searchQuery) {
        setSearchResults(null);
        return;
      }
      setLoadingResults(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=12`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error('[Explore] Failed to search results:', err);
      } finally {
        setLoadingResults(false);
      }
    }
    fetchFullSearchResults();
  }, [searchQuery]);

  // Dropdown search autocomplete debounce logic
  useEffect(() => {
    if (!searchInput.trim() || searchInput === searchQuery) {
      setDropdownResults(null);
      setShowDropdown(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearchingDropdown(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchInput)}&limit=4`);
        if (res.ok) {
          const data = await res.json();
          setDropdownResults(data);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error('[Explore] Autocomplete error:', err);
      } finally {
        setIsSearchingDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchInput, searchQuery]);

  // Debounced URL updates for ?q= (300ms)
  useEffect(() => {
    if (searchInput === searchQuery) return;
    
    const delayURL = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchInput.trim()) {
        params.set('q', searchInput);
      } else {
        params.delete('q');
      }
      // Keep category filter if applicable
      startTransition(() => {
        router.replace(`/explore?${params.toString()}`);
      });
    }, 400);

    return () => clearTimeout(delayURL);
  }, [searchInput, searchQuery, searchParams, router]);

  // Hide dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Category change handler
  const handleCategorySelect = (categorySlug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categorySlug === 'all') {
      params.delete('category');
    } else {
      params.set('category', categorySlug);
    }
    // Reset page grid when category changes
    startTransition(() => {
      router.replace(`/explore?${params.toString()}`);
    });
  };

  // Search Enter handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput.trim()) {
      params.set('q', searchInput);
    } else {
      params.delete('q');
    }
    router.replace(`/explore?${params.toString()}`);
  };

  // Load more pagination
  const handleLoadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/explore/publications?category=${activeCategory}&q=${searchQuery}&offset=${offset}&limit=12`
      );
      if (res.ok) {
        const data = await res.json();
        setPublicationsGrid((prev) => [...prev, ...(data.publications || [])]);
        setHasMore(data.hasMore);
        setOffset((prev) => prev + data.publications.length);
      }
    } catch (err) {
      console.error('[Explore] Failed to load more:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const categories = [
    { slug: 'all', label: '🌐 All Sectors' },
    { slug: 'crypto', label: '⚡ Crypto' },
    { slug: 'finance', label: '📈 Finance' },
    { slug: 'tech', label: '💻 Tech' },
    { slug: 'culture', label: '🎭 Culture' },
    { slug: 'health', label: '❤️ Health' },
    { slug: 'research', label: '🔬 Research' },
  ];

  // Check if search results mode is active
  const isSearchMode = !!searchQuery;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-10 select-none">
      {/* Header titles */}
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-100 font-serif mb-2">
          Explore Solscribe
        </h1>
        <p className="text-sm text-zinc-400">
          Discover publications from creators around the world
        </p>
      </div>

      {/* Prominent Full Width Search Bar */}
      <div className="relative w-full" ref={dropdownRef}>
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <input
            ref={searchInputRef}
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search publications, posts, and research..."
            className="w-full h-[52px] pl-12 pr-10 rounded-[10px] bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all font-sans"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
            <Search className="w-5 h-5" />
          </div>
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                setShowDropdown(false);
                const params = new URLSearchParams(searchParams.toString());
                params.delete('q');
                router.replace(`/explore?${params.toString()}`);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Search Results Dropdown Inline */}
        {showDropdown && dropdownResults && (
          <div className="absolute top-[58px] left-0 right-0 rounded-xl border border-zinc-800 bg-zinc-900/95 backdrop-blur-md shadow-2xl p-2 z-[100] space-y-4 max-h-[400px] overflow-y-auto">
            {/* Publications */}
            {dropdownResults.publications.length > 0 && (
              <div>
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider px-3 mb-1 block">
                  Publications
                </span>
                <div className="space-y-0.5">
                  {dropdownResults.publications.map((pub) => (
                    <Link key={pub.id} href={`/${pub.slug}`} onClick={() => setShowDropdown(false)}>
                      <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800/60 transition">
                        {pub.coverImageUrl ? (
                          <img src={pub.coverImageUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-zinc-400 text-xs">
                            {pub.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-zinc-200 block truncate">{pub.name}</span>
                          <span className="text-[10px] text-zinc-500 block truncate">by {pub.ownerName}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Posts */}
            {dropdownResults.posts.length > 0 && (
              <div>
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider px-3 mb-1 block">
                  Posts
                </span>
                <div className="space-y-0.5">
                  {dropdownResults.posts.map((post) => (
                    <Link key={post.id} href={`/${post.publicationSlug}/${post.slug}`} onClick={() => setShowDropdown(false)}>
                      <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800/60 transition">
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-zinc-200 block truncate">{post.title}</span>
                          <span className="text-[10px] text-zinc-500 block truncate">in {post.publicationName}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Research */}
            {dropdownResults.research.length > 0 && (
              <div>
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider px-3 mb-1 block">
                  Vault Research
                </span>
                <div className="space-y-0.5">
                  {dropdownResults.research.map((r) => (
                    <Link key={r.id} href={`/vault/${r.slug}`} onClick={() => setShowDropdown(false)}>
                      <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800/60 transition">
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-zinc-200 block truncate">{r.title}</span>
                          <span className="text-[10px] text-zinc-500 block truncate">{r.category} • {r.readTimeMinutes}m read</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {dropdownResults.publications.length === 0 &&
              dropdownResults.posts.length === 0 &&
              dropdownResults.research.length === 0 && (
                <div className="py-4 text-center text-xs text-zinc-500">
                  No quick matches. Press Enter to search all.
                </div>
              )}
          </div>
        )}
      </div>

      {/* Categories Horizontal Selector */}
      <div className="flex overflow-x-auto gap-2.5 pb-2 -mx-4 px-4 scrollbar-none border-b border-zinc-900">
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => handleCategorySelect(cat.slug)}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-bold tracking-wide border uppercase transition select-none shrink-0',
              activeCategory === cat.slug
                ? 'text-violet-400 border-violet-500/20 bg-violet-500/5 font-extrabold shadow-lg shadow-violet-500/5'
                : 'text-zinc-500 border-zinc-900 hover:text-zinc-300 hover:border-zinc-850'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Grid & Sidebars layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left main content block (span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          {isSearchMode ? (
            /* SEARCH RESULTS MODE (?q= is present) */
            <div className="space-y-8">
              {loadingResults ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <RefreshCw className="w-8 h-8 text-violet-500 animate-spin" />
                  <span className="text-xs font-semibold text-zinc-500 tracking-wider uppercase">
                    Searching Solscribe...
                  </span>
                </div>
              ) : !searchResults || 
                (searchResults.publications.length === 0 &&
                 searchResults.posts.length === 0 &&
                 searchResults.research.length === 0) ? (
                /* No Results page styling */
                <div className="py-16 px-6 border border-zinc-850 rounded-2xl bg-zinc-900/10 text-center flex flex-col gap-4 items-center select-none">
                  <span className="text-4xl">🔍</span>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-200">
                      No results for "{searchQuery}"
                    </h3>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-normal mt-1">
                      Check your spelling or try searching for another topic.
                    </p>
                  </div>
                  {/* Suggestions pills */}
                  <div className="flex flex-col gap-2 mt-2">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                      Popular search terms:
                    </span>
                    <div className="flex flex-wrap justify-center gap-2 max-w-xs">
                      {['crypto', 'finance', 'tech', 'solana', 'macro', 'nfts'].map((term) => (
                        <button
                          key={term}
                          onClick={() => {
                            setSearchInput(term);
                            const params = new URLSearchParams(searchParams.toString());
                            params.set('q', term);
                            router.replace(`/explore?${params.toString()}`);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-950/20 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition text-[11px] font-semibold"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Matches Render Group */
                <div className="space-y-10">
                  {/* Matching Publications */}
                  {searchResults.publications.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-xs font-bold text-zinc-400 font-mono uppercase tracking-widest border-b border-zinc-900 pb-2 flex items-center gap-2">
                        Publications ({searchResults.publications.length})
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {searchResults.publications.map((pub) => (
                          <div
                            key={pub.id}
                            className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/40 hover:shadow-2xl hover:shadow-violet-500/5 select-none h-full"
                          >
                            <Link href={`/${pub.slug}`} className="block">
                              <div className="relative h-36 w-full overflow-hidden bg-zinc-900 border-b border-zinc-850">
                                {pub.coverImageUrl ? (
                                  <img src={pub.coverImageUrl} alt="" className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
                                ) : (
                                  <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 to-zinc-900 flex items-center justify-center font-bold text-zinc-500 text-xl" />
                                )}
                              </div>
                              <div className="p-5">
                                <h3 className="text-base font-bold text-zinc-200 leading-tight truncate">
                                  {pub.name}
                                </h3>
                                <p className="text-xs text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
                                  {pub.description || 'No description provided.'}
                                </p>
                              </div>
                            </Link>
                            <div className="px-5 pb-5 pt-3 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500">
                              <span>{pub.subscriberCount} subscribers</span>
                              <SubscribeButton publication={pub} variant="compact" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Posts */}
                  {searchResults.posts.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-xs font-bold text-zinc-400 font-mono uppercase tracking-widest border-b border-zinc-900 pb-2">
                        Posts ({searchResults.posts.length})
                      </h2>
                      <div className="flex flex-col gap-2">
                        {searchResults.posts.map((post) => (
                          <PostCard
                            key={post.id}
                            post={{
                              id: post.id,
                              title: post.title,
                              subtitle: post.subtitle,
                              slug: post.slug,
                              coverImageUrl: post.coverImageUrl,
                              contentHtml: '', // Not needed for compact list
                              isPaywalled: post.isPaywalled,
                              publishedAt: post.publishedAt,
                              viewCount: post.viewCount,
                            }}
                            publicationSlug={post.publicationSlug}
                            publicationName={post.publicationName}
                            variant="compact"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Research */}
                  {searchResults.research.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-xs font-bold text-zinc-400 font-mono uppercase tracking-widest border-b border-zinc-900 pb-2">
                        Research ({searchResults.research.length})
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {searchResults.research.map((entry) => (
                          <VaultEntryCard
                            key={entry.id}
                            entry={{
                              ...entry,
                              author: { displayName: entry.authorName, avatarUrl: entry.authorAvatar } as any,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* REGULAR DIRECTORY MODE */
            <>
              {/* Featured Section (Spotlight) */}
              {activeCategory === 'all' && featuredPublications.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xs font-bold text-zinc-400 font-mono uppercase tracking-widest border-b border-zinc-900 pb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-400" /> Featured Creators
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {featuredPublications.map((pub) => (
                      <div
                        key={pub.id}
                        className="group flex flex-col justify-between rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 hover:border-zinc-700 transition duration-300"
                      >
                        {/* Cover image (200px height) */}
                        <div className="relative h-[200px] w-full overflow-hidden border-b border-zinc-900">
                          {pub.coverImageUrl ? (
                            <img src={pub.coverImageUrl} alt="" className="h-full w-full object-cover group-hover:scale-[1.01] transition duration-500" />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/35 to-zinc-950" />
                          )}
                          {/* Overlay gradient bottom */}
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                          {/* Title overlay */}
                          <div className="absolute bottom-4 left-4 right-4">
                            <Link href={`/${pub.slug}`} className="block">
                              <h3 className="text-xl font-bold font-serif text-white truncate leading-tight hover:text-violet-300 transition">
                                {pub.name}
                              </h3>
                            </Link>
                          </div>
                        </div>
                        {/* Body description */}
                        <div className="p-4 flex flex-col justify-between flex-1 gap-4">
                          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                            {pub.description || 'No description provided.'}
                          </p>
                          <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-900">
                            <span>{pub.subscriberCount} subscribers</span>
                            <SubscribeButton publication={pub} variant="compact" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Directory Grid */}
              <div className="space-y-5">
                <h2 className="text-xs font-bold text-zinc-400 font-mono uppercase tracking-widest border-b border-zinc-900 pb-2">
                  All Publications ({activeCategory !== 'all' ? categories.find(c => c.slug === activeCategory)?.label.split(' ').slice(1).join(' ') : 'Directory'})
                </h2>

                {publicationsGrid.length === 0 ? (
                  <div className="py-20 text-center border border-zinc-850 rounded-2xl bg-zinc-900/10">
                    <span className="text-3xl block mb-2">🔭</span>
                    <h4 className="text-sm font-bold text-zinc-350">No newsletters found</h4>
                    <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                      There are currently no active publications in this sector.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {publicationsGrid.map((pub) => (
                      <div
                        key={pub.id}
                        className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/10 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-500/5 select-none h-full"
                      >
                        <Link href={`/${pub.slug}`} className="block">
                          {/* Cover Image (3:2) */}
                          <div className="relative aspect-[3/2] w-full overflow-hidden bg-zinc-900 border-b border-zinc-850">
                            {pub.coverImageUrl ? (
                              <img src={pub.coverImageUrl} alt="" className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-tr from-violet-900/20 to-zinc-950 flex items-center justify-center font-bold text-zinc-500 text-lg" />
                            )}
                          </div>

                          {/* Details */}
                          <div className="p-5 space-y-4">
                            <div>
                              <h3 className="text-base font-bold text-zinc-200 leading-tight font-sans group-hover:text-white transition-colors">
                                {pub.name}
                              </h3>
                              {/* Creator avatar and name */}
                              <div className="flex items-center gap-2 mt-2">
                                {pub.owner.avatarUrl ? (
                                  <img src={pub.owner.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                                    {pub.owner.displayName?.charAt(0) || pub.owner.username.charAt(0)}
                                  </div>
                                )}
                                <span className="text-xs text-zinc-500">
                                  by {pub.owner.displayName || pub.owner.username}
                                </span>
                              </div>
                            </div>

                            {/* Latest post title (13px, 2 lines) */}
                            {pub.latestPost ? (
                              <div className="p-3 rounded-xl bg-zinc-950/45 border border-zinc-850">
                                <span className="text-[10px] font-mono text-zinc-600 font-bold uppercase tracking-wider block mb-0.5">
                                  LATEST RELEASE
                                </span>
                                <p className="text-xs text-zinc-350 font-medium line-clamp-2 leading-relaxed">
                                  {pub.latestPost.title}
                                </p>
                              </div>
                            ) : (
                              <div className="p-3 rounded-xl bg-zinc-950/20 border border-zinc-900/40 text-center">
                                <span className="text-xs text-zinc-600 italic">No releases published yet</span>
                              </div>
                            )}
                          </div>
                        </Link>

                        {/* Footer */}
                        <div className="px-5 pb-5 pt-3 border-t border-zinc-800/40 bg-zinc-900/5 flex items-center justify-between text-[11px] font-sans">
                          <span className="text-zinc-500">
                            {pub.subscriberCount} subscribers
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full border tracking-wide uppercase text-emerald-500 border-emerald-500/20 bg-emerald-500/5">
                            {pub.monthlyPriceUsdc > 0 ? `$${pub.monthlyPriceUsdc} USDC` : 'Free'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination load more button */}
                {hasMore && (
                  <div className="flex justify-center pt-6">
                    <Button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="font-bold border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-200 px-6 h-10 rounded-xl flex items-center gap-1.5 shadow-lg select-none"
                    >
                      {loadingMore ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load more'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right sidebar block (desktop, 280px wide) (span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-10">
          {/* Trending this week posts (1-5) */}
          {trendingPosts.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono border-b border-zinc-900 pb-2 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-violet-400" /> Trending this week
              </h3>
              <div className="flex flex-col gap-2">
                {trendingPosts.map((post, index) => (
                  <Link
                    key={post.id}
                    href={`/${post.pubSlug}/${post.slug}`}
                    className="flex gap-3.5 p-3 rounded-xl border border-zinc-900/50 bg-zinc-950/10 hover:bg-zinc-900/10 hover:border-zinc-850 transition duration-300 items-start select-none cursor-pointer"
                  >
                    <span className="text-2xl font-black text-zinc-700/60 leading-none shrink-0 w-6 text-center">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-zinc-200 line-clamp-2 leading-tight group-hover:text-white transition">
                        {post.title}
                      </h4>
                      <span className="text-[11px] text-zinc-500 block truncate mt-1">
                        {post.pubName}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* New this month (4 small cards) */}
          {newPublications.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono border-b border-zinc-900 pb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-400" /> New this month
              </h3>
              <div className="flex flex-col gap-3">
                {newPublications.map((pub) => (
                  <Link key={pub.id} href={`/${pub.slug}`}>
                    <div className="p-3.5 rounded-xl border border-zinc-850 bg-zinc-950/15 hover:bg-zinc-900/10 hover:border-zinc-800 transition duration-300 flex items-center gap-3">
                      {pub.coverImageUrl ? (
                        <img
                          src={pub.coverImageUrl}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-zinc-800"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-850 flex items-center justify-center font-bold text-zinc-500 text-sm">
                          {pub.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <span className="text-xs font-bold text-zinc-200 truncate group-hover:text-violet-400 transition">
                          {pub.name}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {pub.subscriberCount} subscribers
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
