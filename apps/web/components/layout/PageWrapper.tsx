'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageWrapperProps {
  children: React.ReactNode;
  maxWidth?: '680' | '960' | '1200';
  noPadding?: boolean;
  className?: string;
}

export default function PageWrapper({
  children,
  maxWidth = '1200',
  noPadding = false,
  className,
}: PageWrapperProps) {
  const widthClass = {
    '680': 'max-w-[680px]',
    '960': 'max-w-[960px]',
    '1200': 'max-w-[1200px]',
  }[maxWidth];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'w-full mx-auto min-h-screen flex flex-col flex-1',
        noPadding ? 'px-0' : 'px-5 md:px-10',
        widthClass,
        className
      )}
    >
      {children}
    </motion.div>
  );
}
