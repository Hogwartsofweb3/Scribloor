import React from 'react';
import MigrationClient from '@/components/migration/MigrationClient';

export const metadata = {
  title: 'Subscribers Migration | Solscribe Dashboard',
  description: 'Migrate paid subscriber email archives from Substack, Beehiiv, or Ghost to Solscribe.',
};

export default function MigrationPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 border-b border-zinc-800 pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100 mb-1">
          Subscribers Migration
        </h1>
        <p className="text-sm text-zinc-400">
          Onboard subscriber lists from external newsletters to digital USDC memberships.
        </p>
      </div>

      <MigrationClient />
    </div>
  );
}
