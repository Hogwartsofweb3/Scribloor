import React from 'react';
import PublicHeader from '@/components/layout/PublicHeader';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
