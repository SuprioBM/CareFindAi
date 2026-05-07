'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/dashboard/previous_searches', icon: 'history', label: 'Previous Searches' },
  { href: '/dashboard/saved_items', icon: 'favorite', label: 'Saved Items' },
  { href: '/symptoms', icon: 'monitoring', label: 'Symptom Analyzer' },
  { href: '/dashboard/manual', icon: 'travel_explore', label: 'Manual Search' },
  { href: '/dashboard/doctor_add', icon: 'person_add', label: 'Add Doctor' },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="
        w-full lg:w-64
        shrink-0

        bg-surface

        border-b lg:border-b-0
        lg:border-r
        border-border

        overflow-x-auto lg:overflow-y-auto

        lg:h-screen
        sticky top-0 lg:top-auto
        z-30
      "
    >
      {/* Mobile Horizontal Nav */}
      <div className="flex lg:hidden gap-2 px-3 py-3 min-w-max">
        {navItems.map(({ href, icon, label }) => {
          const active = pathname === href;

          return (
            <Link
              key={label}
              href={href}
              className={`
                flex flex-col items-center justify-center
                min-w-[88px]
                px-3 py-2
                rounded-xl
                transition-all
                border

                ${
                  active
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'border-border bg-card text-text-muted'
                }
              `}
            >
              <span className="material-symbols-outlined text-[22px] mb-1">
                {icon}
              </span>

              <span
                className={`text-[11px] text-center leading-tight ${
                  active ? 'font-bold' : 'font-medium'
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col justify-between h-full py-6">
        <div className="flex flex-col gap-8 px-4">
          <div className="flex flex-col gap-2">
            <p className="px-3 text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
              Menu
            </p>

            {navItems.map(({ href, icon, label }) => {
              const active = pathname === href;

              return (
                <Link
                  key={label}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    active
                      ? 'bg-linear-to-r from-primary/20 to-transparent border-l-2 border-primary text-primary'
                      : 'text-text-muted hover:bg-white/5 hover:text-text-base'
                  }`}
                >
                  <span className="material-symbols-outlined">{icon}</span>

                  <span
                    className={`text-sm ${
                      active ? 'font-bold' : 'font-medium'
                    }`}
                  >
                    {label}
                  </span>
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
      </div>
    </aside>
  );
}