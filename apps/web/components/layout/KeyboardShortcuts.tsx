'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/lib/stores/uiStore';

export default function KeyboardShortcuts() {
  const router = useRouter();
  const gPressedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Skip if typing in inputs, textareas, or contenteditables
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.getAttribute('contenteditable') === 'true');

      // ESC: Close modals (always allow escaping, even from inputs to dismiss palette/modals)
      if (e.key === 'Escape') {
        const { activeModal, subscribePublication, commandPaletteOpen, closeModal, closeSubscribeSheet, closeCommandPalette } = useUIStore.getState();
        if (activeModal || subscribePublication || commandPaletteOpen) {
          e.preventDefault();
          closeModal();
          closeSubscribeSheet();
          closeCommandPalette();
          return;
        }
      }

      if (isInput) return;

      // Cmd+K or Ctrl+K: Command Palette (handled inside CommandPalette, but let's make sure it doesn't double-fire)
      
      // Cmd+/ or Ctrl+/: Search page navigation
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        router.push('/explore?focusSearch=true');
        return;
      }

      // Vim-style navigation: G then D / G then E
      const key = e.key.toLowerCase();
      if (key === 'g') {
        gPressedRef.current = true;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          gPressedRef.current = false;
        }, 1000); // 1-second window to press the next key
      } else if (gPressedRef.current) {
        if (key === 'd') {
          e.preventDefault();
          gPressedRef.current = false;
          router.push('/dashboard');
        } else if (key === 'e') {
          e.preventDefault();
          gPressedRef.current = false;
          router.push('/explore');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [router]);

  return null;
}
