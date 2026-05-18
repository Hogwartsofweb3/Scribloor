"use client";

import { useUser } from '@/hooks/useUser';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';

function LoginContent() {
  const { isAuthenticated, isLoading, login } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/dashboard';

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, isLoading, router, redirectUrl]);

  if (isLoading) {
    return (
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-primary/20"></div>
        <div className="h-4 w-32 bg-primary/20 rounded"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 border border-border rounded-xl bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-4 text-center">
        <h1 className="text-3xl font-bold text-primary tracking-tight">Solscribe</h1>
        <p className="text-muted-foreground">
          Sign in to access your crypto-native newsletter platform.
        </p>
        <Button 
          onClick={() => login()} 
          className="w-full mt-8 bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-lg font-semibold"
        >
          Connect & Sign In
        </Button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
      <Suspense fallback={<div className="animate-pulse h-12 w-12 rounded-full bg-primary/20"></div>}>
        <LoginContent />
      </Suspense>
    </main>
  );
}
