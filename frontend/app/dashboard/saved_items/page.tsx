'use client';

import Link from 'next/link';
import ThemeToggle from '../../../components/Themes/ThemeToggle';
import DashboardSidebar from '../../../components/dashboard/dashBoardsidebar';
import SavedItemsContent from '../../../components/dashboard/savedItemsComponent';

export default function SavedItemsPage() {
  return (
    <div className="bg-surface text-text-base h-screen flex flex-col overflow-hidden antialiased">
      <header className="flex items-center justify-between border-b border-border bg-surface px-10 py-4 shrink-0 z-10">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-primary">
            <span className="material-symbols-outlined text-3xl">medical_services</span>
            <h2 className="text-xl font-bold tracking-tight text-text-base">CareFind</h2>
          </div>
          <div className="hidden md:flex items-stretch rounded-xl h-10 min-w-40 max-w-96 w-full ml-8 bg-card border border-border focus-within:border-primary transition-colors">
            <div className="text-text-muted flex items-center justify-center pl-4 pr-2">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              className="flex w-full min-w-0 flex-1 rounded-xl bg-transparent text-text-base focus:outline-none border-none h-full placeholder:text-text-muted px-2 text-sm"
              placeholder="Search doctors, locations..."
            />
          </div>
        </div>

        <div className="flex flex-1 justify-end gap-6 items-center">
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-text-muted hover:text-primary transition-colors text-sm font-medium py-1">
              Dashboard
            </Link>
            <Link href="/symptoms" className="text-text-muted hover:text-primary transition-colors text-sm font-medium py-1">
              Find Doctors
            </Link>
            <Link href="#" className="text-text-muted hover:text-primary transition-colors text-sm font-medium py-1">
              Appointments
            </Link>
            <Link href="#" className="text-text-muted hover:text-primary transition-colors text-sm font-medium py-1">
              Messages
            </Link>
          </nav>
          <div className="w-px h-6 bg-border mx-2" />
          <ThemeToggle />
          <button
            className="w-10 h-10 rounded-full bg-cover bg-center border-2 border-border hover:border-primary transition-colors focus:outline-none"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAG1eG1BuVRYA4eabUlwidGl7ygCCVedOJYrMkCbcoKOuixLgNaQP1BnMPz2yhweu_v5gtsn6jIaiJMI5ABe2oTG1EWMRAQ8QDdLwyRD9z1ojZLJtzLQNJKTgTtpROhVyv289nhMABNMozFKTTNG6uHQ5ord8Z7UDMqzYkL7hw_rgPUS81x3aZqn7zgwS9nyT_epkF9aMJfDYcEml9yrZ8RNa2k0ZY3K4EbWjmGeGCEKrvUiYlsteO55MORwhppjfKnPcqcnTqMpEI')",
            }}
          />
        </div>
      </header>

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
