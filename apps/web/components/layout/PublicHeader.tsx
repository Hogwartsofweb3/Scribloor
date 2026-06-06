'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useUIStore } from '@/lib/stores/uiStore';

// Custom Tabler Menu-2 Icon SVG
const Menu2Icon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6 stroke-current"
    viewBox="0 0 24 24"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M4 6l16 0" />
    <path d="M4 12l16 0" />
    <path d="M4 18l12 0" />
  </svg>
);

const navItems = [
  { label: 'Features', id: 'features' },
  { label: 'The Vault', id: 'vault' },
  { label: 'Pricing', id: 'pricing' },
  { label: 'For Creators', id: 'creators' },
];

export default function PublicHeader() {
  const pathname = usePathname();
  const { ready, authenticated, login } = usePrivy();
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const [isScrolled, setIsScrolled] = useState(false);

  // Monitor scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHomepage = pathname === '/';

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (isHomepage) {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 safe-area-top h-[60px]',
          isScrolled
            ? 'bg-white/95 dark:bg-[#111110]/95 border-b-[0.5px] border-[var(--color-border)] shadow-sm backdrop-blur-md'
            : 'bg-transparent border-b-0'
        )}
      >
        <div className="max-w-[1200px] mx-auto h-full px-4 md:px-10 flex items-center justify-between">
          {/* Logo Left */}
          <Link href="/" className="font-serif font-bold text-xl text-foreground tracking-tight select-none">
            Sol<span className="text-[var(--color-brand-500)]">scribe</span>
          </Link>

          {/* Nav Center (Desktop Only) */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={isHomepage ? `#${item.id}` : `/#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <ThemeToggle />

            {ready && authenticated ? (
              <Link href="/dashboard">
                <button className="hidden md:block px-4 py-2 rounded-[var(--radius-md)] bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white text-sm font-semibold transition-colors shadow-sm">
                  Dashboard
                </button>
              </Link>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={login}
                  className="px-4 py-2 rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Sign in
                </button>
                <button
                  onClick={login}
                  className="px-4 py-2 rounded-[var(--radius-md)] bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white text-sm font-semibold transition-colors shadow-sm"
                >
                  Start writing
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu2Icon />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-down Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[60px] z-40 md:hidden bg-white dark:bg-[#111110] border-b border-[var(--color-border)] shadow-xl flex flex-col p-6 gap-6 safe-area-bottom"
          >
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={isHomepage ? `#${item.id}` : `/#${item.id}`}
                  onClick={(e) => handleNavClick(e, item.id)}
                  className="text-base font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors py-1"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <hr className="border-[var(--color-border)]" />

            <div className="flex flex-col gap-2.5">
              {ready && authenticated ? (
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full py-3 rounded-[var(--radius-md)] bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white font-bold text-sm shadow transition-colors">
                    Dashboard
                  </button>
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      login();
                    }}
                    className="w-full py-3 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] text-[var(--color-text-primary)] font-bold text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      login();
                    }}
                    className="w-full py-3 rounded-[var(--radius-md)] bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white font-bold text-sm shadow transition-colors"
                  >
                    Start writing
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
