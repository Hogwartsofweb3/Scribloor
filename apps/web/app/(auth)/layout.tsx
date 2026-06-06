import React from 'react';
import AppHeader from '@/components/layout/AppHeader';
import DashboardSidebar from '@/components/layout/DashboardSidebar';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar - hidden on mobile, animated width transition on desktop */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background pb-16 md:pb-0">
        <AppHeader />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
