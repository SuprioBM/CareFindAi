'use client';

import Link from 'next/link';
import ThemeToggle from '../../../components/Themes/ThemeToggle';
import DashboardSidebar from '../../../components/dashboard/dashBoardsidebar';
import SavedItemsContent from '../../../components/dashboard/savedItemsComponent';

export default function SavedItemsPage() {
  return (
    <div className="bg-surface text-text-base h-screen flex flex-col overflow-hidden antialiased">

      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar />

        <main className="flex-1 overflow-y-auto bg-surface">
          <div className="px-8 md:px-12 py-10 flex flex-1 justify-center">
            <div className="flex flex-col max-w-350 flex-1">
              <SavedItemsContent />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
