'use client';

import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Library, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MobileTabBar() {
  const { ready, authenticated } = usePrivy();
  const pathname = usePathname();

  // Only show when Privy is ready, user is authenticated, and we are on a mobile device (handled by CSS)
  if (!ready || !authenticated) {
    return null;
  }

  const navItems = [
    {
      label: 'Home',
      icon: Home,
      href: '/dashboard',
      active: pathname === '/dashboard' || pathname.startsWith('/dashboard/posts'),
    },
    {
      label: 'Explore',
      icon: Compass,
      href: '/explore',
      active: pathname.startsWith('/explore'),
    },
    {
      label: 'Vault',
      icon: Library,
      href: '/vault',
      active: pathname.startsWith('/vault'),
    },
    {
      label: 'Account',
      icon: User,
      href: '/account',
      active: pathname.startsWith('/account'),
    },
  ];

  return (
    <>
      {/* Spacer to prevent content from hiding behind the fixed tab bar */}
      <div className="h-[68px] md:hidden w-full shrink-0" />
      
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border z-40 safe-area-bottom">
        <div className="flex items-center justify-around h-[68px] px-2 pb-safe">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
                  item.active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon size={24} strokeWidth={item.active ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
