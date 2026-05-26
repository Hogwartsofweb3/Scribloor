import React from 'react';
import Link from 'next/link';
import { Nav } from '@/components/landing/Nav';
import { Footer } from '@/components/landing/Footer';
import { Trophy, TrendingUp, Users, Crown } from 'lucide-react';

export const metadata = {
  title: 'Leaderboard - Solscribe',
  description: 'Top publications and creators on Solscribe',
};

async function getLeaderboardData() {
  try {
    // Next.js fetch with revalidation (1 hour)
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/leaderboard`, { 
      next: { revalidate: 3600 } 
    });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    return null;
  }
}

export default async function LeaderboardPage() {
  const data = await getLeaderboardData();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Nav />
      
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              The Solscribe <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Leaderboard</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Discover the fastest growing publications and top earning creators building on Solana.
            </p>
          </div>

          {!data ? (
            <div className="text-center py-12 text-slate-500">Leaderboard data is currently unavailable.</div>
          ) : (
            <div className="space-y-12">
              
              {/* Top Publications by Subscribers */}
              <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Top Publications</h2>
                    <p className="text-slate-500">By active subscriber count</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {data.topPublications?.map((pub: any, index: number) => (
                    <Link href={`/${pub.id}`} key={pub.id} className="block group">
                      <div className="flex items-center p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <div className="w-8 text-xl font-black text-slate-300 group-hover:text-indigo-600 transition-colors">
                          {index + 1}
                        </div>
                        <div className="flex-1 ml-4">
                          <h3 className="font-bold text-slate-900 text-lg">{pub.name}</h3>
                          <p className="text-slate-500 text-sm line-clamp-1">{pub.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-indigo-600">{Number(pub.subCount).toLocaleString()}</div>
                          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Subscribers</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {(!data.topPublications || data.topPublications.length === 0) && (
                    <div className="text-center py-8 text-slate-500">No publications found.</div>
                  )}
                </div>
              </section>

              {/* Top Earning Creators */}
              <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mr-4">
                    <Crown className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Top Creators</h2>
                    <p className="text-slate-500">By lifetime USDC earned</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {data.topCreators?.map((creator: any, index: number) => (
                    <div key={creator.id} className="flex items-center p-4 rounded-2xl border border-transparent">
                      <div className="w-8 text-xl font-black text-slate-300">
                        {index + 1}
                      </div>
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 ml-2">
                        {creator.avatarUrl ? (
                          <img src={creator.avatarUrl} alt={creator.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                            {creator.name?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 ml-4">
                        <h3 className="font-bold text-slate-900 text-lg">{creator.name}</h3>
                      </div>
                      <div className="text-right flex items-center">
                        <Trophy className="w-4 h-4 text-emerald-500 mr-2" />
                        <span className="font-mono font-bold text-emerald-600">Confidential</span>
                      </div>
                    </div>
                  ))}
                  {(!data.topCreators || data.topCreators.length === 0) && (
                    <div className="text-center py-8 text-slate-500 italic">Leaderboard updating...</div>
                  )}
                </div>
              </section>

            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
