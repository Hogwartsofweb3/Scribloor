'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Wallet,
  BookOpen,
  ArrowRight,
  CheckCircle,
  FileText,
  DollarSign,
  Compass,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, linkWallet, ready } = usePrivy();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states for Step 3: Create Publication
  const [pubName, setPubName] = useState('');
  const [pubSlug, setPubSlug] = useState('');
  const [pubDesc, setPubDesc] = useState('');
  const [pubPrice, setPubPrice] = useState('5.00');
  const [coverUrl, setCoverUrl] = useState('');
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);

  // Fetch current publication state to see if they're already onboarded
  const { data: pubData, isLoading: pubLoading } = useQuery({
    queryKey: ['my-publication'],
    queryFn: async () => {
      const res = await fetch('/api/publications');
      if (!res.ok) throw new Error('Failed to fetch publication');
      return res.json();
    },
    enabled: ready && !!user,
  });

  // Redirect to dashboard if they already have a publication
  useEffect(() => {
    if (pubData?.publication) {
      router.push('/dashboard');
    }
  }, [pubData, router]);

  // Autogenerate slug from name
  useEffect(() => {
    if (step === 3 && pubName && !pubSlug) {
      setPubSlug(
        pubName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  }, [pubName, pubSlug, step]);

  // Check slug uniqueness
  useEffect(() => {
    if (!pubSlug) return;
    const timer = setTimeout(async () => {
      setIsCheckingSlug(true);
      setSlugError(null);
      try {
        const res = await fetch(`/api/publications/check-slug?slug=${pubSlug}`);
        const data = await res.json();
        if (!data.available) {
          setSlugError('This URL slug is already taken.');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsCheckingSlug(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [pubSlug]);

  const walletAddress = user?.wallet?.address;

  // Confetti celebration on completion
  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#534AB7', '#14F195', '#F59E0B'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#534AB7', '#14F195', '#F59E0B'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (walletAddress) {
        setStep(3);
      } else {
        linkWallet();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) {
      setError('Please connect your Solana wallet first.');
      return;
    }
    if (!pubName.trim() || !pubSlug.trim()) {
      setError('Publication name and URL slug are required.');
      return;
    }
    if (slugError) {
      setError('Please resolve the URL slug conflict.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/publications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: pubName,
          slug: pubSlug,
          description: pubDesc,
          monthlyPriceUsdc: parseFloat(pubPrice),
          payoutWallet: walletAddress,
          coverImageUrl: coverUrl || null,
          freeTierEnabled: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to launch publication');
      }

      setStep(4);
      triggerConfetti();
    } catch (err: any) {
      setError(err.message || 'An error occurred creating your publication.');
    } finally {
      setLoading(false);
    }
  };

  if (!ready || pubLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
          Loading Onboarding wizard...
        </span>
      </div>
    );
  }

  // Animation variants
  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center bg-zinc-950 py-10 px-4 min-h-screen relative overflow-hidden">
      {/* Dynamic colorful decorative background rings */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-teal-500/5 blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      {/* Progress Indicators */}
      <div className="flex items-center gap-2 mb-8 z-10">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border',
                step === s
                  ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110'
                  : step > s
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              )}
            >
              {step > s ? <CheckCircle className="w-4 h-4" /> : s}
            </div>
            {s < 4 && (
              <div
                className={cn(
                  'w-8 sm:w-16 h-0.5 transition-all duration-300',
                  step > s ? 'bg-emerald-500/30' : 'bg-zinc-800'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Wizard Card Container */}
      <div className="w-full max-w-xl bg-zinc-900/40 border border-zinc-800 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-2xl z-10 min-h-[400px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {/* STEP 1: Welcome Screen */}
          {step === 1 && (
            <motion.div
              key="step-1"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 shadow-sm">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-black tracking-tight text-zinc-100 font-sans leading-tight">
                  Welcome to Solscribe
                </h1>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  The crypto-native publishing platform where creators build sovereign newsletters paid directly in USDC on Solana. Let's get your premium publication launched.
                </p>
              </div>

              <div className="space-y-3 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 text-xs text-zinc-400">
                <div className="flex gap-3">
                  <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-zinc-300 block mb-0.5">Premium Newsletters</span>
                    Write insights, gate articles with subscription paywalls, and build a dedicated reader roster.
                  </div>
                </div>
                <div className="flex gap-3 border-t border-zinc-800/60 pt-3">
                  <DollarSign className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-zinc-300 block mb-0.5">Instant Payouts</span>
                    Readers subscribe using USDC. Payments go directly to your self-custody Solana wallet. No middlemen.
                  </div>
                </div>
              </div>

              <Button
                onClick={handleNextStep}
                className="w-full h-12 bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow-lg shadow-primary/20"
              >
                Let's Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* STEP 2: Connect Wallet */}
          {step === 2 && (
            <motion.div
              key="step-2"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4 shadow-sm">
                  <Wallet className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-black tracking-tight text-zinc-100 font-sans leading-tight">
                  Connect Solana Wallet
                </h1>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  We use your Solana wallet to route monthly subscriber payments directly to your self-custody wallet. Connect your wallet to proceed.
                </p>
              </div>

              {walletAddress ? (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Wallet Linked</p>
                      <p className="text-sm font-mono text-zinc-200">
                        {walletAddress.substring(0, 8)}...{walletAddress.substring(walletAddress.length - 8)}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={linkWallet}
                    variant="outline"
                    className="h-8 text-xs font-semibold border-zinc-800 hover:bg-zinc-800 text-zinc-400"
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <button
                  onClick={linkWallet}
                  className="w-full py-8 border-2 border-dashed border-zinc-800 hover:border-primary/50 bg-zinc-950/40 rounded-2xl flex flex-col items-center justify-center gap-3 group transition"
                >
                  <div className="p-3 bg-zinc-900 rounded-xl group-hover:scale-110 transition duration-350">
                    <Wallet className="w-6 h-6 text-zinc-500 group-hover:text-primary" />
                  </div>
                  <p className="text-sm font-bold text-zinc-300">Link Solana Wallet</p>
                  <p className="text-xs text-zinc-500 max-w-xs text-center px-4">
                    Supports Phantom, Solflare, Ledger, or your Privy embedded wallet
                  </p>
                </button>
              )}

              <Button
                onClick={handleNextStep}
                disabled={!walletAddress}
                className="w-full h-12 bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {walletAddress ? 'Continue Onboarding' : 'Link Wallet to Continue'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* STEP 3: Create Publication */}
          {step === 3 && (
            <motion.div
              key="step-3"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4 shadow-sm">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-black tracking-tight text-zinc-100 font-sans leading-tight">
                  Launch Your Publication
                </h1>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Configure your primary publication parameters. This sets up your landing page and subscription structure.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex gap-2.5 items-start p-3 bg-rose-950/20 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Name */}
                <div className="space-y-1.5">
                  <label htmlFor="pub-name" className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Publication Name *
                  </label>
                  <input
                    id="pub-name"
                    type="text"
                    required
                    value={pubName}
                    onChange={(e) => setPubName(e.target.value)}
                    placeholder="e.g. The Solana Sentinel"
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 transition"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-1.5">
                  <label htmlFor="pub-slug" className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Custom URL Slug *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-sm text-zinc-650 font-mono">
                      solscribe.app/
                    </span>
                    <input
                      id="pub-slug"
                      type="text"
                      required
                      value={pubSlug}
                      onChange={(e) =>
                        setPubSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]+/g, '')
                        )
                      }
                      placeholder="solana-sentinel"
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 pl-[106px] pr-10 py-3 text-sm text-zinc-200 placeholder:text-zinc-650 font-mono focus:outline-none focus:border-primary/50 transition"
                    />
                    {isCheckingSlug && (
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-500 absolute right-3 top-3.5" />
                    )}
                  </div>
                  {slugError && (
                    <p className="text-[10px] text-rose-400 font-mono">{slugError}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label htmlFor="pub-desc" className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Description / Bio
                  </label>
                  <textarea
                    id="pub-desc"
                    value={pubDesc}
                    onChange={(e) => setPubDesc(e.target.value)}
                    placeholder="Provide a short description detailing what your newsletter covers..."
                    rows={2}
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 transition resize-none"
                  />
                </div>

                {/* Price & Cover (Side-by-side) */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Monthly price */}
                  <div className="space-y-1.5 col-span-1">
                    <label htmlFor="pub-price" className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Price (USDC)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-sm text-zinc-500">$</span>
                      <input
                        id="pub-price"
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={pubPrice}
                        onChange={(e) => setPubPrice(e.target.value)}
                        placeholder="5.00"
                        className="w-full rounded-xl bg-zinc-950 border border-zinc-800 pl-6 pr-3 py-3 text-sm text-zinc-200 focus:outline-none focus:border-primary/50 transition font-mono"
                      />
                    </div>
                  </div>

                  {/* Cover image URL */}
                  <div className="space-y-1.5 col-span-2">
                    <label htmlFor="pub-cover" className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Cover Image URL
                    </label>
                    <input
                      id="pub-cover"
                      type="url"
                      value={coverUrl}
                      onChange={(e) => setCoverUrl(e.target.value)}
                      placeholder="https://example.com/cover.jpg"
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-650 focus:outline-none focus:border-primary/50 transition"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={loading || isCheckingSlug || !!slugError}
                    className="w-full h-12 bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Launching Publication...
                      </>
                    ) : (
                      <>
                        Launch Your Publication <Sparkles className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 4: Success Screen */}
          {step === 4 && (
            <motion.div
              key="step-4"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6 text-center"
            >
              <div className="inline-flex w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 items-center justify-center text-emerald-400 mx-auto mb-2 animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight text-zinc-100 font-sans leading-tight">
                  Publication Launched!
                </h1>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-sm mx-auto">
                  Congratulations! Your premium publication has been successfully launched on Solscribe. Your subscriber portal is active.
                </p>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 max-w-sm mx-auto space-y-2 text-left">
                <div className="flex justify-between items-center text-xs border-b border-zinc-800/60 pb-2">
                  <span className="text-zinc-500 font-medium">NAME</span>
                  <span className="text-zinc-200 font-semibold">{pubName}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-zinc-800/60 pb-2">
                  <span className="text-zinc-500 font-medium">URL PORTAL</span>
                  <span className="text-primary font-mono font-semibold">solscribe.app/{pubSlug}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-medium">PRICE</span>
                  <span className="text-teal-400 font-semibold font-mono">${parseFloat(pubPrice).toFixed(2)} USDC / Mo</span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="w-full h-12 bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  Enter Creator Dashboard <Compass className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
