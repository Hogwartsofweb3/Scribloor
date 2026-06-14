'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { useUser } from '@/hooks/useUser';

// Mail Icon
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 stroke-current" viewBox="0 0 24 24" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" />
    <path d="M3 7l9 6l9 -6" />
  </svg>
);

// Wallet Icon
const WalletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 stroke-current" viewBox="0 0 24 24" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M17 8v-3a1 1 0 0 0 -1 -1h-10a2 2 0 0 0 0 4h12a1 1 0 0 1 1 1v3m0 4v3a1 1 0 0 1 -1 1h-12a2 2 0 0 1 -2 -2v-12" />
    <path d="M20 12v4h-4a2 2 0 0 1 0 -4h4" />
  </svg>
);

// Google Icon
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

// X / Twitter Icon
const XIcon = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

function LoginContent() {
  const { isAuthenticated, isLoading, dbUser } = useUser();
  // Use usePrivy directly to access granular loginMethods
  const { login } = usePrivy();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/dashboard';
  const [checkingPub, setCheckingPub] = useState(false);

  useEffect(() => {
    async function checkOnboardingAndRedirect() {
      if (isAuthenticated && !isLoading && dbUser) {
        setCheckingPub(true);
        try {
          const res = await fetch('/api/publications');
          if (res.ok) {
            const data = await res.json();
            if (data.publication) {
              router.push(redirectUrl);
            } else {
              router.push('/onboarding');
            }
          } else {
            router.push('/onboarding');
          }
        } catch {
          router.push('/onboarding');
        } finally {
          setCheckingPub(false);
        }
      }
    }
    checkOnboardingAndRedirect();
  }, [isAuthenticated, isLoading, dbUser, router, redirectUrl]);

  if (isLoading || checkingPub) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-t-transparent border-[var(--color-brand-500)] animate-spin" />
        <span className="text-xs text-[var(--color-text-muted)] animate-pulse uppercase tracking-wider font-mono">
          Authenticating...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[420px] p-8 border border-[var(--color-border)] rounded-[var(--radius-lg)] bg-white dark:bg-[#111110] shadow-xl">
      {/* Top Logo */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-[96px] h-[96px] rounded-3xl bg-[var(--color-brand-50)] dark:bg-zinc-900 border border-[var(--color-border-strong)] flex items-center justify-center text-[var(--color-brand-500)] text-4xl font-serif font-black shadow-inner mb-4 select-none">
          S
        </div>
        <h1 className="font-serif font-bold text-[28px] text-[var(--color-text-primary)] leading-tight">
          Welcome to Solscribe
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Sign in or create your account
        </p>
      </div>

      {/* Auth Stack */}
      <div className="flex flex-col gap-2">
        {/* Email */}
        <button
          id="login-email"
          onClick={() => login({ loginMethods: ['email'] })}
          className="flex items-center justify-center gap-3 w-full h-12 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-white dark:bg-zinc-900 text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-all text-sm font-semibold"
        >
          <MailIcon />
          Continue with email
        </button>

        {/* Google — passes loginMethods so Privy skips straight to Google OAuth */}
        <button
          id="login-google"
          onClick={() => login({ loginMethods: ['google'] })}
          className="flex items-center justify-center gap-3 w-full h-12 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-white dark:bg-zinc-900 text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-all text-sm font-semibold"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* Twitter / X — passes loginMethods so Privy skips straight to Twitter OAuth */}
        <button
          id="login-twitter"
          onClick={() => login({ loginMethods: ['twitter'] })}
          className="flex items-center justify-center gap-3 w-full h-12 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-white dark:bg-zinc-900 text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-all text-sm font-semibold"
        >
          <XIcon />
          Continue with Twitter / X
        </button>

        {/* Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-x-0 h-[1px] bg-[var(--color-border)]" />
          <span className="relative bg-white dark:bg-[#111110] px-3 text-xs text-[var(--color-text-muted)] select-none">
            or
          </span>
        </div>

        {/*
          Wallet connect — uses loginMethods: ['wallet'] so Privy opens the wallet
          selection screen (showing Phantom, Solflare, Backpack etc. detected in
          the browser) without showing the generic email/social modal first.
        */}
        <button
          id="login-wallet"
          onClick={() => login({ loginMethods: ['wallet'] })}
          className="flex items-center justify-center gap-3 w-full h-12 rounded-[var(--radius-md)] border border-[var(--color-brand-500)] text-[var(--color-brand-500)] hover:bg-[var(--color-brand-50)] dark:hover:bg-[var(--color-brand-500)]/10 transition-all text-sm font-semibold bg-transparent"
        >
          <WalletIcon />
          Connect a Solana wallet
        </button>
      </div>

      {/* Footer Disclaimer */}
      <p className="text-[10px] text-center text-[var(--color-text-muted)] mt-6 leading-relaxed">
        By continuing you agree to our{' '}
        <Link href="/terms" className="hover:text-[var(--color-text-primary)] underline transition-colors">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="hover:text-[var(--color-text-primary)] underline transition-colors">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg-secondary)] p-6">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-t-transparent border-[var(--color-brand-500)] animate-spin" />
        </div>
      }>
        <LoginContent />
      </Suspense>
    </main>
  );
}
