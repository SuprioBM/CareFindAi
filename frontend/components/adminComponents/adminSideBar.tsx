'use client';

import type { Section } from '../../types/types';

type Props = {
  active: Section;
  onNavigate: (section: Section) => void;
};

const mainNav: { section: Section; icon: string; label: string }[] = [
  { section: 'dashboard',      icon: 'dashboard',       label: 'Dashboard' },
  { section: 'doctors',        icon: 'stethoscope',     label: 'Doctors' },
  { section: 'specializations',icon: 'category',        label: 'Specializations' },
  { section: 'suggestions',    icon: 'pending_actions', label: 'Doctor Suggestions' },
  { section: 'patients',       icon: 'group',           label: 'Patients' },
  { section: 'appointments',   icon: 'calendar_month',  label: 'Appointments' },
];

const systemNav: { section: Section; icon: string; label: string }[] = [
  { section: 'chambers', icon: 'apartment', label: 'Chambers' },
  { section: 'reports',  icon: 'analytics', label: 'Reports' },
];

export default function AdminSidebar({ active, onNavigate }: Props) {
  return (
    <aside className="w-64 shrink-0 bg-card border-r border-border flex flex-col h-full overflow-y-auto z-20">
      {/* Logo */}
      <div className="px-6 py-5 flex items-center gap-3 border-b border-border">
        <div className="size-8 flex items-center justify-center bg-primary/10 rounded-lg text-primary">
          <span className="material-symbols-outlined text-[22px]">local_hospital</span>
        </div>
        <h2 className="text-text-base text-lg font-bold tracking-tight">
          CareFind <span className="text-primary">Admin</span>
        </h2>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-4 py-5 flex flex-col gap-1">
        {mainNav.map(({ section, icon, label }) => {
          const isActive = active === section;
          return (
            <button
              key={section}
              onClick={() => onNavigate(section)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors group relative text-left ${
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-text-muted hover:text-primary hover:bg-primary/5'
              }`}
            >
              {isActive && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-primary rounded-full" />
              )}
              <span
                className="material-symbols-outlined text-[22px] transition-transform group-hover:scale-110"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {icon}
              </span>
              <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
            </button>
          );
        })}

        <div className="pt-5 pb-2">
          <p className="px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">System</p>
        </div>

        {systemNav.map(({ section, icon, label }) => {
          const isActive = active === section;
          return (
            <button
              key={section}
              onClick={() => onNavigate(section)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors group text-left ${
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-text-muted hover:text-primary hover:bg-primary/5'
              }`}
            >
              <span className="material-symbols-outlined text-[22px] transition-transform group-hover:scale-110">
                {icon}
              </span>
              <span className="text-sm font-medium">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom: Settings + Logout */}
      <div className="p-4 border-t border-border flex flex-col gap-1">
        <button
          onClick={() => onNavigate('settings')}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-text-muted hover:text-primary hover:bg-primary/5 transition-colors group text-left"
        >
          <span className="material-symbols-outlined text-[22px] transition-transform group-hover:scale-110">settings</span>
          <span className="text-sm font-medium">Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-text-muted hover:text-error hover:bg-error/5 transition-colors group text-left">
          <span className="material-symbols-outlined text-[22px] transition-transform group-hover:scale-110">logout</span>
          <span className="text-sm font-medium">Log out</span>
        </button>
      </div>
    </aside>
  );
}
