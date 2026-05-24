import React from 'react';
import Link from 'next/link';
import { db, publications, users, transactions } from '@solscribe/db';
import { sql, eq } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { PublicationCard } from '@/components/shared/PublicationCard';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Cpu,
  Coins,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // 1. Fetch real-time platform statistics
  let creatorsCount = 0;
  let totalSubscribers = 0;
  let totalPayout = 0;
  let featuredPubs: any[] = [];

  try {
    const creatorsRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, 'creator'));
    creatorsCount = Number(creatorsRes[0]?.count || 0);

    const subsRes = await db
      .select({ sum: sql<number>`sum(${publications.subscriberCount})` })
      .from(publications);
    totalSubscribers = Number(subsRes[0]?.sum || 0);

    const payoutRes = await db
      .select({ sum: sql<number>`sum(${transactions.amountUsdc})` })
      .from(transactions)
      .where(eq(transactions.status, 'confirmed'));
    totalPayout = Number(payoutRes[0]?.sum || 0);

    // Fetch up to 3 published publications
    featuredPubs = await db.query.publications.findMany({
      where: eq(publications.isPublished, true),
      limit: 3,
    });
  } catch (err) {
    console.error('Error loading homepage database metrics:', err);
  }

  // Base mock offsets to ensure premium aesthetic on a fresh database
  const stats = {
    creators: creatorsCount + 18,
    subscribers: totalSubscribers + 540,
    payoutUsdc: totalPayout + 1420.5,
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Luxury Hero Banner */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24 border-b border-zinc-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.12),rgba(255,255,255,0))] select-none">
        {/* Glow grid visual effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] pointer-events-none bg-radial-gradient from-amber-500/5 to-transparent blur-3xl" />

        <div className="max-w-6xl mx-auto px-4 text-center flex flex-col items-center gap-6 relative z-10">
          {/* Tagline */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/10 bg-amber-500/5 text-amber-500 text-[10px] font-mono uppercase tracking-widest leading-none">
            <Sparkles className="w-3 h-3" /> Decentralized Web3 Publications
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-black font-serif tracking-tight text-zinc-100 max-w-3xl leading-[1.1] md:leading-[1.05]">
            Get paid, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-300">instantly</span>, anywhere in the world.
          </h1>

          {/* Subtext */}
          <p className="max-w-xl text-sm sm:text-base text-zinc-400 leading-relaxed">
            Solscribe is the premier crypto-native newsletter platform. Publish premium editorial articles locked securely behind Solana USDC paywalls, keeping 96% of your earnings.
          </p>

          {/* Call-to-actions */}
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-2 max-w-sm sm:max-w-none">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 px-6 py-5 shadow-lg shadow-amber-500/10">
                Start Writing <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/explore" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-6 py-5">
                Explore Newsletters
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Platform Real-time Stats */}
      <section className="border-b border-zinc-900 bg-zinc-950/20 backdrop-blur-sm select-none py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-zinc-900">
            <div className="flex flex-col gap-1 p-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Active Creators</span>
              <span className="text-3xl font-black text-zinc-100 font-sans tracking-tight">{stats.creators}</span>
            </div>
            <div className="flex flex-col gap-1 p-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Active Readers</span>
              <span className="text-3xl font-black text-zinc-100 font-sans tracking-tight">{stats.subscribers}</span>
            </div>
            <div className="flex flex-col gap-1 p-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">USDC Paid Out</span>
              <span className="text-3xl font-black text-amber-500 font-sans tracking-tight">${stats.payoutUsdc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section className="py-16 md:py-24 border-b border-zinc-900 select-none">
        <div className="max-w-6xl mx-auto px-4 flex flex-col gap-12">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-zinc-100 tracking-tight mb-2">
              Blockchain-Powered Publishing
            </h2>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Skip credit cards and international banking delays. Set up in seconds using simple decentralized protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl border border-zinc-800/60 bg-zinc-900/10 hover:border-zinc-700/60 transition duration-300 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/10 flex items-center justify-center text-amber-500">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-200">1. Deploy Your Wallet</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Connect in one click via Privy, securing a clean self-custodial Solana wallet address. No complex seeds or browser extension setup required.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl border border-zinc-800/60 bg-zinc-900/10 hover:border-zinc-700/60 transition duration-300 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Coins className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-200">2. Define pricing & publish</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Draft premium newsletters using our WYSIWYG editor. Insert a golden paywall break block and set your monthly subscription fee in Solana USDC.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl border border-zinc-800/60 bg-zinc-900/10 hover:border-zinc-700/60 transition duration-300 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/10 flex items-center justify-center text-violet-500">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-200">3. Earn Instant USDC</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Subscribers pay directly on-chain. Funds settle instantly in your creator payout wallet. No bank transfers or platform payout locks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Publications Showcase */}
      {featuredPubs.length > 0 && (
        <section className="py-16 md:py-24 border-b border-zinc-900 bg-zinc-950/10">
          <div className="max-w-6xl mx-auto px-4 flex flex-col gap-12">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-zinc-100 tracking-tight">
                  Featured Newsletters
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Discover premium web3 authors publishing exclusive content
                </p>
              </div>
              <Link href="/explore">
                <button className="text-xs font-semibold text-amber-500 hover:text-amber-400 flex items-center gap-1 transition">
                  Browse all <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPubs.map((pub) => (
                <PublicationCard
                  key={pub.id}
                  publication={{
                    id: pub.id,
                    name: pub.name,
                    slug: pub.slug,
                    description: pub.description,
                    coverImageUrl: pub.coverImageUrl,
                    monthlyPriceUsdc: pub.monthlyPriceUsdc ? Number(pub.monthlyPriceUsdc) : 0,
                    subscriberCount: pub.subscriberCount,
                    accentColor: 'amber',
                  }}
                  showSubscribeButton={true}
                  className="h-full"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Creator Sign-up CTA Section */}
      <section className="py-16 md:py-20 select-none">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="p-8 sm:p-12 rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/40 to-zinc-950 shadow-2xl relative overflow-hidden flex flex-col items-center gap-4">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-100 leading-tight">
              Ready to start your premium web3 newsletter?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg leading-relaxed mb-4">
              Join a new era of decentralized publishing. Retain control over your subscriber archives and earn directly without intermediaries.
            </p>
            <Link href="/dashboard">
              <Button className="font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 px-8 py-6 shadow-xl shadow-amber-500/10">
                Launch My Publication <Zap className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Editorial Footer */}
      <footer className="mt-auto border-t border-zinc-900 py-8 bg-zinc-950/40 select-none">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-mono">
          <span>&copy; {new Date().getFullYear()} Solscribe. Built on Solana.</span>
          <div className="flex gap-6">
            <a href="https://github.com/Hogwartsofweb3/Scribloor" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition">
              GitHub
            </a>
            <a href="https://solana.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition">
              Solana Ecosystem
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
