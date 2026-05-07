'use client';

import React from 'react';
import DashboardSidebar from '@/components/dashboard/dashBoardsidebar';
import Header from '@/components/pageComponents/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <> 
    <Header />
    <div className="bg-surface text-text-base flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden mt-[80px]">
      {/* Sidebar - Sticky on mobile, scrollable on desktop */}
      <div className="sticky top-0 z-20 lg:sticky lg:z-auto lg:h-screen lg:overflow-y-auto shrink-0">
        <DashboardSidebar />
      </div>

      {/* Main Content Area - Full height on desktop */}
      <div className="flex-1 flex flex-col lg:h-screen">
        {/* Scrollable Content Container */}
        <main className="flex-1 overflow-y-auto bg-surface">
          {children}
        </main>

        {/* Footer - Always at bottom */}
        <footer className="border-t border-border bg-surface px-6 py-4 text-center text-sm text-text-muted">
          <p>© 2024 CareFind. All rights reserved.</p>
        </footer>
      </div>
    </div>
    </>
  );
}
