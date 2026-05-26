'use client';

import React, { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';

export function RevenueAlert() {
  const router = useRouter();
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryCount = useRef(0);

  useEffect(() => {
    const connectSSE = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const sse = new EventSource('/api/notifications/stream');
      eventSourceRef.current = sse;

      sse.onopen = () => {
        console.log('[SSE] Connected');
        retryCount.current = 0; // reset backoff
      };

      sse.addEventListener('ping', () => {
        // Keep-alive received
      });

      sse.addEventListener('new_subscription', (e) => {
        try {
          const data = JSON.parse(e.data);
          toast.success(`New subscriber! +${data.amountUsdc} USDC to your wallet 💰`, {
            duration: 5000,
            position: 'top-right',
          });
          // Optionally trigger a light confetti for every sub
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#4f46e5', '#10b981', '#f59e0b']
          });
          // Refresh the router to update server components (wallet balance)
          router.refresh();
        } catch (err) {
          console.error('[SSE] parse error', err);
        }
      });

      sse.addEventListener('milestone_achieved', (e) => {
        try {
          const data = JSON.parse(e.data);
          toast.success(`Goal Reached: ${data.label}! 🎉`, {
            duration: 8000,
            position: 'top-center',
            icon: '🏆'
          });
          
          // Full screen celebration for milestones
          const duration = 3 * 1000;
          const animationEnd = Date.now() + duration;
          const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

          const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) {
              return clearInterval(interval);
            }
            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } }));
          }, 250);

          router.refresh();
        } catch (err) {
          console.error('[SSE] parse error', err);
        }
      });

      sse.onerror = (err) => {
        console.error('[SSE] Connection error, retrying...', err);
        sse.close();
        
        // Exponential backoff up to 30s
        const backoff = Math.min(1000 * Math.pow(2, retryCount.current), 30000);
        retryCount.current += 1;
        
        setTimeout(connectSSE, backoff);
      };
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [router]);

  return null; // Invisible global listener
}
