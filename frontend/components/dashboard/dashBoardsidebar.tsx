'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/dashboard/previous-searches', icon: 'history', label: 'Previous Searches' },
  { href: '#', icon: 'favorite', label: 'Saved Doctors' },
  { href: '#', icon: 'location_on', label: 'Saved Locations' },
  { href: '/symptoms', icon: 'monitoring', label: 'Symptom Analyzer' },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 flex-col justify-between bg-surface border-r border-border hidden lg:flex py-6 overflow-y-auto">
      <div className="flex flex-col gap-8 px-4">
        <div className="flex flex-col gap-2">
          <p className="px-3 text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Menu</p>
          {navItems.map(({ href, icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  active
                    ? 'bg-gradient-to-r from-primary/20 to-transparent border-l-2 border-primary text-primary'
                    : 'text-text-muted hover:bg-white/5 hover:text-text-base'
                }`}
              >
                <span className="material-symbols-outlined">{icon}</span>
                <span className={`text-sm ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="px-4 mt-auto pt-6">
        <Link
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-muted hover:bg-white/5 hover:text-text-base transition-colors"
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="text-sm font-medium">Settings</span>
        </Link>
      </div>
    </aside>
  );
}
