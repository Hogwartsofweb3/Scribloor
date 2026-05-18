import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import type { User } from '@solscribe/db';

export function useUser() {
  const { user: privyUser, ready, authenticated, login, logout } = usePrivy();
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function syncUser() {
      if (!ready) return;
      
      if (authenticated && privyUser) {
        try {
          const res = await fetch('/api/auth/me', { method: 'POST' });
          if (res.ok) {
            const data = await res.json();
            setDbUser(data.user);
          }
        } catch (error) {
          console.error('Failed to sync user', error);
        }
      } else {
        setDbUser(null);
      }
      setIsLoading(false);
    }

    syncUser();
  }, [ready, authenticated, privyUser]);

  return {
    user: privyUser,
    dbUser,
    isLoading: !ready || isLoading,
    isAuthenticated: authenticated,
    login,
    logout,
  };
}
