'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageWrapperProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  narrow?: boolean;
}

export default function PageWrapper({
  children,
  title,
  subtitle,
  className,
  narrow = false,
}: PageWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={cn(
        'w-full mx-auto px-4 py-6 md:py-10 flex-1 flex flex-col',
        narrow ? 'max-w-2xl' : 'max-w-6xl',
        className
      )}
    >
      {(title || subtitle) && (
        <div className="mb-6 md:mb-10 space-y-2">
          {title && (
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground font-sans">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </motion.div>
  );
}
