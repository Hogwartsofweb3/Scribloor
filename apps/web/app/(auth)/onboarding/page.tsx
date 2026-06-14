'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Wallet,
  BookOpen,
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  DollarSign,
  Compass,
  AlertCircle,
  Loader2,
  Copy,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/useUser';

// Tabler Circle Check Icon SVG
const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4 stroke-current"
    viewBox="0 0 24 24"
    strokeWidth="2.5"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M5 12l5 5l10 -10" />
  </svg>
);

export default function OnboardingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: privyUser, ready, createWallet, linkWallet } = usePrivy();
  const { dbUser, isLoading: userLoading } = useUser();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states for Step 1: Profile
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Form states for Step 2: Wallet
  const [walletLoading, setWalletLoading] = useState(false);

  // Form states for Step 3: Publication
  const [pubName, setPubName] = useState('');
  const [pubSlug, setPubSlug] = useState('');
  const [pubDesc, setPubDesc] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [pubPrice, setPubPrice] = useState('5.00');
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  // Success states for Step 4
  const [copiedLink, setCopiedLink] = useState(false);

  // Check if they are already fully onboarded
  useEffect(() => {
    if (ready && dbUser && dbUser.hasCompletedOnboarding) {
      router.push('/dashboard');
    }
  }, [ready, dbUser, router]);

  // Set initial display name
  useEffect(() => {
    if (dbUser) {
      if (dbUser.displayName) setDisplayName(dbUser.displayName);
      if (dbUser.username) setUsername(dbUser.username);
    }
  }, [dbUser]);

  // Auto-populate username from display name
  useEffect(() => {
    if (step === 1 && displayName && !username) {
      setUsername(
        displayName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  }, [displayName, username, step]);

  // Real-time username availability check
  useEffect(() => {
    if (!username || username.length < 2) {
      setUsernameAvailable(null);
      return;
    }
    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_-]+/g, '');
    if (cleanUsername !== username) {
      setUsername(cleanUsername);
    }

    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const res = await fetch(`/api/account/check-username?username=${cleanUsername}`);
        if (res.ok) {
          const data = await res.json();
          setUsernameAvailable(data.available);
        } else {
          setUsernameAvailable(false);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingUsername(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  // Auto-generate publication slug from publication name
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

  // Real-time publication slug check
  useEffect(() => {
    if (!pubSlug) {
      setSlugAvailable(null);
      return;
    }
    const cleanSlug = pubSlug.toLowerCase().replace(/[^a-z0-9-]+/g, '');
    if (cleanSlug !== pubSlug) {
      setPubSlug(cleanSlug);
    }

    const timer = setTimeout(async () => {
      setCheckingSlug(true);
      try {
        const res = await fetch(`/api/publications/check-slug?slug=${cleanSlug}`);
        if (res.ok) {
          const data = await res.json();
          setSlugAvailable(data.available);
        } else {
          setSlugAvailable(false);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingSlug(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [pubSlug]);

  const activeWallet = privyUser?.wallet?.address;
  const isEmbeddedWallet = privyUser?.wallet?.walletClientType === 'embedded';

  const handleCreateEmbeddedWallet = async () => {
    setWalletLoading(true);
    try {
      await createWallet();
    } catch (err) {
      console.error('Wallet creation error:', err);
    } finally {
      setWalletLoading(false);
    }
  };

  const triggerConfetti = () => {
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#534AB7', '#1D9E75', '#BA7517'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#534AB7', '#1D9E75', '#BA7517'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  // Step 1: Submit Profile
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !username.trim()) return;
    if (usernameAvailable === false) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, username }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Track step 1 progress
      await fetch('/api/onboarding/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'profile_created' }),
      });

      setStep(2);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit Wallet
  const handleWalletSubmit = async () => {
    if (!activeWallet) return;

    setLoading(true);
    try {
      await fetch('/api/onboarding/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'wallet_connected' }),
      });
      setStep(3);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Submit Publication (or Skip)
  const handlePublicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubName.trim() || !pubSlug.trim()) return;
    if (slugAvailable === false) return;

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
          monthlyPriceUsdc: isPaid ? parseFloat(pubPrice) : 0,
          // Only send payoutWallet if the user has a real wallet connected
          ...(activeWallet ? { payoutWallet: activeWallet } : {}),
          freeTierEnabled: !isPaid,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create publication');
      }

      // Track step 3 progress
      await fetch('/api/onboarding/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'publication_created' }),
      });

      // Fetch progress check
      await queryClient.invalidateQueries({ queryKey: ['creator-publication'] });

      setStep(4);
      triggerConfetti();
    } catch (err: any) {
      setError(err.message || 'Failed to create publication');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipPublication = async () => {
    setLoading(true);
    try {
      // Mark onboarding as complete in database directly
      await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hasCompletedOnboarding: true }),
      });
      setStep(4);
      triggerConfetti();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const slug = pubSlug || 'my-pub';
    const link = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!ready || userLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand-500)] mb-4" />
        <span className="text-xs font-mono uppercase tracking-widest animate-pulse">
          Loading Onboarding wizard...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] flex flex-col justify-center items-center py-10 px-4 relative overflow-hidden select-none">
      {/* Decorative gradient blur in background */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[var(--color-brand-500)]/5 blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[var(--color-teal-400)]/5 blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      {/* Progress Dots Header */}
      <div className="flex items-center gap-2 mb-8 z-10">
        {[1, 2, 3, 4].map((s) => (
          <React.Fragment key={s}>
            <div
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 border',
                step === s
                  ? 'bg-[var(--color-brand-500)] border-[var(--color-brand-500)] text-white scale-110 shadow-lg'
                  : step > s
                  ? 'bg-[var(--color-brand-50)] border-[var(--color-brand-500)]/20 text-[var(--color-brand-500)]'
                  : 'bg-zinc-200 dark:bg-zinc-900 border-transparent text-zinc-400 dark:text-zinc-650'
              )}
            >
              {step > s ? <CheckIcon /> : s}
            </div>
            {s < 4 && (
              <div
                className={cn(
                  'w-10 sm:w-16 h-[1px] transition-all duration-300',
                  step > s ? 'bg-[var(--color-brand-500)]/55' : 'bg-zinc-350 dark:bg-zinc-800'
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Card Container */}
      <div className="w-full max-w-[500px] bg-white dark:bg-[#111110] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-8 shadow-xl z-10 min-h-[420px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {/* STEP 1: Tell us about yourself */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <h2 className="font-serif font-bold text-2xl text-[var(--color-text-primary)]">
                  Tell us about yourself
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Configure your primary display name and choose a unique username handle.
                </p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                {error && (
                  <div className="flex gap-2.5 items-center p-3 bg-red-500/5 border border-[var(--color-error)]/20 text-[var(--color-error)] text-xs rounded-xl">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Display Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Satoshi Nakamoto"
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg-secondary)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-500)] transition"
                  />
                </div>

                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      placeholder="satoshi"
                      className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg-secondary)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-500)] transition pr-10"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                      {checkingUsername ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[var(--color-text-muted)]" />
                      ) : usernameAvailable !== null && username.length >= 2 ? (
                        usernameAvailable ? (
                          <span className="text-[var(--color-teal-400)] text-xs font-bold">Available</span>
                        ) : (
                          <span className="text-[var(--color-error)] text-xs font-bold">Taken</span>
                        )
                      ) : null}
                    </div>
                  </div>
                  <p className="text-[10px] text-[var(--color-text-muted)]">
                    Format: lowercase letters, numbers, hyphens, and underscores.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || checkingUsername || usernameAvailable === false || !displayName.trim()}
                  className="w-full h-12 rounded-[var(--radius-md)] bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white text-sm font-semibold transition shadow disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Continue
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 2: Set up your wallet */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <h2 className="font-serif font-bold text-2xl text-[var(--color-text-primary)]">
                  Set up your wallet
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Your wallet receives subscription payments directly in USDC.
                </p>
              </div>

              <div className="space-y-4">
                {activeWallet ? (
                  <div className="rounded-[var(--radius-lg)] border border-[var(--color-teal-400)]/20 bg-[var(--color-teal-50)]/30 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[var(--color-teal-400)] shrink-0" />
                        <span className="text-sm font-bold text-[var(--color-text-primary)]">Your wallet is ready ✓</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-[var(--color-teal-800)] bg-[var(--color-teal-50)] px-2 py-0.5 rounded">
                        {isEmbeddedWallet ? 'Embedded' : 'External'}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-[var(--color-text-secondary)] break-all">
                      {activeWallet}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleCreateEmbeddedWallet}
                      disabled={walletLoading}
                      className="w-full py-5 rounded-[var(--radius-md)] bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white text-sm font-semibold transition flex flex-col items-center justify-center gap-1.5 shadow"
                    >
                      {walletLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Wallet className="w-5 h-5" />
                          <span>Create your wallet</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={linkWallet}
                      className="w-full h-12 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition text-sm font-semibold"
                    >
                      Connect an external wallet
                    </button>
                  </div>
                )}

                <div className="flex flex-col items-center gap-4 pt-4 border-t border-[var(--color-border)]">
                  <button
                    onClick={handleWalletSubmit}
                    disabled={!activeWallet || loading}
                    className="w-full h-12 rounded-[var(--radius-md)] bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white text-sm font-semibold transition shadow disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    Continue
                  </button>

                  {!activeWallet && (
                    <button
                      onClick={() => setStep(3)}
                      className="text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition underline"
                    >
                      I'll connect a wallet later
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Create your publication */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <h2 className="font-serif font-bold text-2xl text-[var(--color-text-primary)]">
                  Create your publication
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Configure your primary publication parameters (optional at onboarding).
                </p>
              </div>

              <form onSubmit={handlePublicationSubmit} className="space-y-4">
                {error && (
                  <div className="flex gap-2.5 items-center p-3 bg-red-500/5 border border-[var(--color-error)]/20 text-[var(--color-error)] text-xs rounded-xl">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Publication Name
                  </label>
                  <input
                    type="text"
                    required
                    value={pubName}
                    onChange={(e) => setPubName(e.target.value)}
                    placeholder="e.g. The Solana Sentinel"
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg-secondary)] px-4 py-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-500)] transition"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Slug URL
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={pubSlug}
                      onChange={(e) => setPubSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="solana-sentinel"
                      className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg-secondary)] px-4 py-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-500)] transition pr-10"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {checkingSlug ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[var(--color-text-muted)]" />
                      ) : pubSlug && slugAvailable !== null ? (
                        slugAvailable ? (
                          <span className="text-[var(--color-teal-400)] text-xs font-bold">Available</span>
                        ) : (
                          <span className="text-[var(--color-error)] text-xs font-bold">Taken</span>
                        )
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Description
                  </label>
                  <textarea
                    value={pubDesc}
                    onChange={(e) => setPubDesc(e.target.value)}
                    placeholder="Tell your readers what your publication covers..."
                    rows={2}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg-secondary)] px-4 py-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-500)] transition resize-none"
                  />
                </div>

                {/* Pricing: Free vs Paid Toggle */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Subscription Pricing</span>
                    <div className="flex items-center gap-1 bg-[var(--color-bg-secondary)] border border-[var(--color-border-strong)] p-0.5 rounded-[var(--radius-sm)]">
                      <button
                        type="button"
                        onClick={() => setIsPaid(false)}
                        className={cn(
                          'px-2.5 py-1 text-xs font-bold rounded',
                          !isPaid ? 'bg-white dark:bg-zinc-800 text-[var(--color-brand-500)] shadow-sm' : 'text-[var(--color-text-muted)]'
                        )}
                      >
                        Free
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsPaid(true)}
                        className={cn(
                          'px-2.5 py-1 text-xs font-bold rounded',
                          isPaid ? 'bg-white dark:bg-zinc-800 text-[var(--color-brand-500)] shadow-sm' : 'text-[var(--color-text-muted)]'
                        )}
                      >
                        Paid
                      </button>
                    </div>
                  </div>

                  {isPaid && (
                    <div className="flex items-center gap-2 p-3 rounded-[var(--radius-md)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-strong)] animate-fade-in">
                      <DollarSign className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
                      <input
                        type="number"
                        min="0.5"
                        step="0.01"
                        value={pubPrice}
                        onChange={(e) => setPubPrice(e.target.value)}
                        placeholder="5.00"
                        className="bg-transparent border-none w-full text-sm font-bold text-[var(--color-text-primary)] focus:outline-none font-mono"
                      />
                      <span className="text-xs font-bold text-[var(--color-text-secondary)] whitespace-nowrap">USDC / Mo</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={loading || checkingSlug || slugAvailable === false || !pubName.trim() || !pubSlug.trim()}
                    className="w-full h-12 rounded-[var(--radius-md)] bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white text-sm font-semibold transition shadow disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Create publication
                  </button>

                  <button
                    type="button"
                    onClick={handleSkipPublication}
                    disabled={loading}
                    className="text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition underline"
                  >
                    Skip for now
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 4: You're all set */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="space-y-6 text-center"
            >
              <div className="inline-flex w-16 h-16 rounded-full bg-[var(--color-teal-50)] dark:bg-emerald-500/10 border-2 border-[var(--color-teal-400)]/20 items-center justify-center text-[var(--color-teal-400)] mx-auto mb-2 animate-bounce">
                <CheckIcon />
              </div>

              <div className="space-y-1.5">
                <h2 className="font-serif font-bold text-2xl text-[var(--color-text-primary)]">
                  You're all set
                </h2>
                {pubName ? (
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Your publication is live at{' '}
                    <span className="font-mono font-bold text-[var(--color-brand-500)]">
                      solscribe.app/{pubSlug}
                    </span>
                  </p>
                ) : (
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Your Solscribe creator profile has been initialized!
                  </p>
                )}
              </div>

              {/* Checklist */}
              <div className="text-left border border-[var(--color-border)] rounded-[var(--radius-lg)] bg-[var(--color-bg-secondary)] p-4 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  Next Steps Checklist
                </p>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded border border-[var(--color-border-strong)] flex items-center justify-center text-[8px] text-[var(--color-text-muted)] mt-0.5 shrink-0 select-none">
                      [ ]
                    </span>
                    <div>
                      <Link href="/dashboard/posts/new" className="font-bold text-[var(--color-text-primary)] hover:underline">
                        Write your first post
                      </Link>
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                        Draft and publish your first newsletter issue.
                      </p>
                    </div>
                  </div>

                  {pubName && (
                    <div className="flex items-start gap-2.5 border-t border-[var(--color-border)] pt-2.5">
                      <button
                        onClick={handleCopyLink}
                        className="w-4 h-4 rounded border border-[var(--color-border-strong)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] mt-0.5 shrink-0"
                      >
                        {copiedLink ? <CheckIcon /> : <Copy className="w-2.5 h-2.5" />}
                      </button>
                      <div>
                        <button onClick={handleCopyLink} className="font-bold text-[var(--color-text-primary)] hover:underline text-left">
                          {copiedLink ? 'Copied link!' : 'Share your publication'}
                        </button>
                        <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                          Copy the link to share on Twitter / Farcaster.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2.5 border-t border-[var(--color-border)] pt-2.5">
                    <span className="w-4 h-4 rounded border border-[var(--color-border-strong)] flex items-center justify-center text-[8px] text-[var(--color-text-muted)] mt-0.5 shrink-0 select-none">
                      [ ]
                    </span>
                    <div>
                      <Link href="/dashboard/settings" className="font-bold text-[var(--color-text-primary)] hover:underline">
                        Set up payout wallet
                      </Link>
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                        Ensure your payout destination wallet is configured.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push('/dashboard')}
                className="w-full h-12 rounded-[var(--radius-md)] bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white text-sm font-semibold transition shadow flex items-center justify-center gap-2"
              >
                Go to your dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
