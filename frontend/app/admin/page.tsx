'use client';

import { useState } from 'react';
import type { Section } from '../../types/types';
import AdminSidebar from '../../components/adminComponents/adminSideBar';
import AdminDashboard from '../../components/adminComponents/adminDashboard';
import DoctorManagement from '../../components/adminComponents/doctorManagement';
import AddDoctor from '../../components/adminComponents/addDoctor';
import Specializations from '../../components/adminComponents/specialization';
import DoctorSuggestions from '../../components/adminComponents/doctorSuggestions';
import ThemeToggle from '../../components/Themes/ThemeToggle';

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');

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

  function renderSection() {
    switch (activeSection) {
      case 'dashboard':       return <AdminDashboard />;
      case 'doctors':         return <DoctorManagement onNavigate={setActiveSection} />;
      case 'add-doctor':      return <AddDoctor onNavigate={setActiveSection} />;
      case 'specializations': return <Specializations />;
      case 'suggestions':     return <DoctorSuggestions />;
      default:
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
    <div className="flex h-screen overflow-hidden bg-surface">
      <AdminSidebar active={activeSection} onNavigate={setActiveSection} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 px-6 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-md z-10 sticky top-0 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-sm">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none text-[20px]">
                search
              </span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-text-base placeholder:text-text-muted transition-all"
                placeholder="Search doctors, patients, or records..."
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full text-text-muted hover:text-text-base hover:bg-section-teal transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1.5 right-2 size-2 bg-error rounded-full border-2 border-card" />
            </button>
            <div className="h-6 w-px bg-border" />
            <ThemeToggle />
            <div className="h-9 w-9 rounded-full bg-section-teal border border-border overflow-hidden shrink-0">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDO_is0yd9AnwT8j9cc6aloIH3lseaW2Lg_feN9NIAgwPHmpQ_HzEWWTbbCdOxkt7_7OZZOpWHgvS-Cjzn0sDOlHmJZ-XRZQaTw4wyotNhNiODreItEIsekQLlKJdRUUYZNJpgqa_24Ln_0mYsEQjzk9rESngb3mCcFJkJG27PUlIvoQ1WKjZjdoDBWetUdiYZwczftn2uNiIQQyvF7r8r-X6-SyEBoIHe5LmHAHxjTE9JJ4VCLEOVy_MaQ6npCrJmvGOS2wJIoZEQ"
                alt="Admin User"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* Section Content */}
        <main className="flex-1 overflow-y-auto">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
