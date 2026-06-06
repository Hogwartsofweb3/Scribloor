'use client';

import React from 'react';
import { useUIStore, Toast as ToastItem } from '@/lib/stores/uiStore';
import { AnimatePresence, motion } from 'framer-motion';

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5 stroke-current"
    viewBox="0 0 24 24"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M5 12l5 5l10 -10" />
  </svg>
);

const AlertCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5 stroke-current"
    viewBox="0 0 24 24"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </svg>
);

const InfoCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5 stroke-current"
    viewBox="0 0 24 24"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
    <path d="M12 9h.01" />
    <path d="M11 12h1v4h1" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5 stroke-current"
    viewBox="0 0 24 24"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
    <path d="M5 19h14a2 2 0 0 0 1.84 -2.75l-7.1 -12.25a2 2 0 0 0 -3.5 0l-7.1 12.25a2 2 0 0 0 1.75 2.75" />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4 stroke-current"
    viewBox="0 0 24 24"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M18 6l-12 12" />
    <path d="M6 6l12 12" />
  </svg>
);

export function Toast({ toast }: { toast: ToastItem }) {
  const removeToast = useUIStore((state) => state.removeToast);

  const configs = {
    success: {
      border: 'border-l-emerald-500',
      iconColor: 'text-emerald-500',
      icon: <CheckIcon />,
      bg: 'bg-zinc-900 border-zinc-800 text-zinc-100',
    },
    error: {
      border: 'border-l-rose-500',
      iconColor: 'text-rose-500',
      icon: <AlertCircleIcon />,
      bg: 'bg-zinc-900 border-zinc-800 text-zinc-100',
    },
    info: {
      border: 'border-l-blue-500',
      iconColor: 'text-blue-500',
      icon: <InfoCircleIcon />,
      bg: 'bg-zinc-900 border-zinc-800 text-zinc-100',
    },
    warning: {
      border: 'border-l-amber-500',
      iconColor: 'text-amber-500',
      icon: <AlertTriangleIcon />,
      bg: 'bg-zinc-900 border-zinc-800 text-zinc-100',
    },
  };

  const config = configs[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9, x: 50 }}
      animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.85, x: 100, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`flex items-center gap-3 w-full max-w-sm rounded-xl border border-l-[3px] p-4 shadow-2xl backdrop-blur-md ${config.bg} ${config.border}`}
    >
      <div className={`shrink-0 ${config.iconColor}`}>{config.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-relaxed font-sans">{toast.message}</p>
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              removeToast(toast.id);
            }}
            className="mt-1.5 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors uppercase tracking-wider"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-colors shrink-0"
        aria-label="Dismiss toast"
      >
        <CloseIcon />
      </button>
    </motion.div>
  );
}

export function Toaster() {
  const toasts = useUIStore((state) => state.toasts);

  return (
    <div className="fixed bottom-6 right-6 md:right-6 bottom-safe md:bottom-safe left-6 md:left-auto right-auto md:w-auto w-auto flex flex-col gap-3 z-[99999] select-none pointer-events-none">
      <div className="flex flex-col gap-3 pointer-events-auto">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function useToast() {
  const addToast = useUIStore((state) => state.addToast);

  return {
    success: (msg: string, action?: ToastItem['action']) =>
      addToast({ message: msg, type: 'success', action }),
    error: (msg: string, action?: ToastItem['action']) =>
      addToast({ message: msg, type: 'error', action }),
    info: (msg: string, action?: ToastItem['action']) =>
      addToast({ message: msg, type: 'info', action }),
    warning: (msg: string, action?: ToastItem['action']) =>
      addToast({ message: msg, type: 'warning', action }),
  };
}
