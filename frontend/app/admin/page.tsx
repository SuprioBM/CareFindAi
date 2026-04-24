'use client';

/**
 * Admin Dashboard Page
 * 
 * Main administrative interface for managing:
 * - Doctor profiles and specializations
 * - Patient requests and suggestions
 * - System configuration and settings
 * 
 * Features:
 * - Multi-section interface with sidebar navigation
 * - User authentication and session management
 * - Theme toggling
 * - Responsive design with admin guards
 */

import { useState } from 'react';
import type { Section } from '../../types/types';
import AdminSidebar from '../../components/adminComponents/adminSideBar';
import AdminDashboard from '../../components/adminComponents/adminDashboard';
import DoctorManagement from '../../components/adminComponents/doctorManagement';
import AddDoctor from '../../components/adminComponents/addDoctor';
import Specializations from '../../components/adminComponents/specialization';
import DoctorSuggestions from '../../components/adminComponents/doctorSuggestions';
import ThemeToggle from '../../components/Themes/ThemeToggle';
import Link from 'next/link';
import { useAuth } from '@/authContext/authContext';
import { useRouter } from 'next/navigation';
import AdminPageGuard from '@/components/adminComponents/AdminPageGuard';



/**
 * AdminPage Component
 * 
 * Renders the main admin dashboard with navigation and content areas.
 * Protected by AdminPageGuard to ensure only authenticated admins can access.
 */
export default function AdminPage() {
  // Current active section to display in the main content area
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  // Get current user and logout function from auth context
  const { user, logout } = useAuth();
  // Router for navigation after logout
  const router = useRouter();

  /** Handles user logout and redirects to home page */
  const handleLogout = () => {
    logout();
    router.push('/');
  };




  /**
   * Mapping of section keys to display titles
   * Used for header and navigation labels
   */
  const sectionTitles: Record<Section, string> = {
    dashboard:       'Dashboard',
    doctors:         'Doctor Management',
    'add-doctor':    'Add New Doctor',
    specializations: 'Specializations',
    suggestions:     'Doctor Suggestions',
    patients:        'Patients',
    appointments:    'Appointments',
    chambers:        'Chambers',
    reports:         'Reports',
    settings:        'Settings',
  };

  /**
   * Renders the active section component based on activeSection state
   * Shows a "Coming Soon" message for unimplemented sections
   * @returns The component for the active section
   */
  function renderSection() {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'doctors':
        return <DoctorManagement onNavigate={setActiveSection} />;
      case 'add-doctor':
        return <AddDoctor onNavigate={setActiveSection} />;
      case 'specializations':
        // Specialization management - allows admins to configure medical specialization categories
        return <Specializations />;
      case 'suggestions':
        return <DoctorSuggestions />;
      default:
        // Display placeholder for unimplemented sections
        return (
          <div className="flex flex-col items-center justify-center flex-1 text-text-muted gap-3 p-12">
            <span className="material-symbols-outlined text-[48px] text-text-muted/40">construction</span>
            <p className="text-lg font-medium">{sectionTitles[activeSection]}</p>
            <p className="text-sm">This section is coming soon.</p>
          </div>
        );
    }
  }

  return (
    // Guard to ensure only authenticated admins can access this page
    <AdminPageGuard>
      {/* Main container - flexbox layout with sidebar and content area */}
      <div className="flex h-screen overflow-hidden bg-surface">
        {/* Sidebar Navigation */}
        <AdminSidebar active={activeSection} onNavigate={setActiveSection} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header Bar with user info and controls */}
          <header className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-md z-10 sticky top-0 shrink-0">
            {/* Left Section - Back button */}
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg h-9 px-3 bg-card border border-border text-text-sub hover:bg-section-teal hover:text-text-base text-sm font-medium transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span className="hidden sm:inline">Return Home</span>
              </Link>
            </div>

            {/* Right Section - User info, theme toggle, and logout */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* User info - Name and email (hidden on mobile) */}
              <div className="hidden md:flex flex-col items-end min-w-0 mr-1">
                <span className="text-sm font-semibold text-text-base truncate max-w-[180px] lg:max-w-[240px]">
                  {user?.name?.trim() || user?.email?.split('@')[0] || 'Admin User'}
                </span>
                {user?.email ? (
                  <span className="text-xs text-text-muted truncate max-w-[180px] lg:max-w-[240px]">
                    {user.email}
                  </span>
                ) : null}
              </div>

              {/* Vertical divider */}
              <div className="h-6 w-px bg-border hidden sm:block" />
              
              {/* Theme toggle button */}
              <ThemeToggle />

              {/* User avatar - shows profile image or initials */}
              <div
                className="h-9 w-9 rounded-full bg-section-teal border border-border overflow-hidden shrink-0 flex items-center justify-center text-sm font-semibold text-text-base"
                title={user?.name || 'Admin User'}
              >
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user?.name || 'Admin User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>
                    {(user?.name?.trim() || user?.email?.charAt(0) || 'A').toUpperCase()}
                  </span>
                )}
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-lg h-9 px-3 bg-card border border-border text-text-sub hover:bg-error/10 hover:text-error text-sm font-medium transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </header>

          {/* Main Content Area - Displays active section */}
          <main className="flex-1 overflow-y-auto">
            {renderSection()}
          </main>
        </div>
      </div>
    </AdminPageGuard>
  );
}
