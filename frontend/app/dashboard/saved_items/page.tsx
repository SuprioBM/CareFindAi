/**
 * Users can save/bookmark doctors for quick future reference.
 * Users can save frequently used locations (home, office) for quick future searches.
 * Users can view detailed doctor profiles from the dashboard.
 *
 * This is the "Saved Items" page, accessible from the dashboard sidebar.
 * It acts as a container/shell page that renders the <SavedItemsContent> component,
 * which contains the actual bookmarked doctors list and saved locations list.
 *
 * Layout structure:
 *   - DashboardSidebar (left sidebar navigation)
 *   - Main content area → SavedItemsContent (handles both doctors & locations)
 */

'use client'; // Must run on the client (browser) since it uses React components with state

import Link from 'next/link';
import ThemeToggle from '../../../components/Themes/ThemeToggle';
import DashboardSidebar from '../../../components/dashboard/dashBoardsidebar';

// The main component that renders the saved doctors () and saved locations () sections
import SavedItemsContent from '../../../components/dashboard/savedItemsComponent';

/**
 * SavedItemsPage — Shell/layout page for the Saved Items section.
 *
 * This page simply wraps the SavedItemsContent component inside the
 * standard dashboard layout (sidebar + scrollable main area).
 * All the actual logic (API calls, state, rendering cards) lives inside SavedItemsContent.
 */
export default function SavedItemsPage() {
  return (
    <div className="bg-surface text-text-base h-screen flex flex-col overflow-hidden antialiased">

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — shared navigation across all dashboard pages */}
        <DashboardSidebar />

        {/* Main scrollable content area */}
        <main className="flex-1 overflow-y-auto bg-surface">
          <div className="px-8 md:px-12 py-10 flex flex-1 justify-center">
            <div className="flex flex-col max-w-350 flex-1">
              {/*
               * SavedItemsContent handles both:
               *   - "Saved Doctors" section (bookmarked doctors with remove/view buttons)
               *   - "Saved Locations" section (home/office pins with map & directions)
               *   - Each doctor card links to the full doctor profile page
               */}
              <SavedItemsContent />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
