'use client';

import React from 'react';
import { useUIStore } from '@/lib/stores/uiStore';
import { AnimatePresence, motion } from 'framer-motion';

export default function ConfirmModal() {
  const { activeModal, modalProps, closeModal } = useUIStore();

  if (activeModal !== 'confirm_delete') return null;

  const {
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmLabel = 'Delete',
    confirmVariant = 'danger',
    onConfirm,
    onCancel,
  } = modalProps as {
    title?: string;
    message?: string;
    confirmLabel?: string;
    confirmVariant?: 'danger' | 'primary';
    onConfirm?: () => void | Promise<void>;
    onCancel?: () => void;
  };

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    closeModal();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    closeModal();
  };

  const confirmBtnStyles =
    confirmVariant === 'danger'
      ? 'bg-rose-500 hover:bg-rose-600 text-white'
      : 'bg-violet-500 hover:bg-violet-600 text-white';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCancel}
          className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl z-10"
        >
          {/* Header */}
          <h3 className="text-lg font-bold text-zinc-100 mb-2 font-sans">
            {title}
          </h3>

          {/* Body */}
          <p className="text-sm text-zinc-400 leading-relaxed mb-6 font-sans">
            {message}
          </p>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700/60 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition shadow-lg shadow-black/25 ${confirmBtnStyles}`}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
