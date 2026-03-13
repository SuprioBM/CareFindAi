'use client';

import Link from 'next/link';
import ThemeToggle from '../../../components/Themes/ThemeToggle';
import DashboardSidebar from '../../../components/dashboard/dashBoardsidebar';

const searches = [
  {
    icon: 'neurology',
    title: 'Severe Migraine and Nausea',
    specialist: 'Neurologist',
    date: 'Oct 24, 2023',
    accent: 'primary' as const,
  },
  {
    icon: 'orthopedics',
    title: 'Lower Back Pain with Numbness',
    specialist: 'Orthopedic Specialist',
    date: 'Sep 12, 2023',
    accent: 'blue' as const,
  },
  {
    icon: 'pulmonology',
    title: 'Persistent Dry Cough',
    specialist: 'Pulmonologist',
    date: 'Aug 05, 2023',
    accent: 'primary' as const,
  },
  {
    icon: 'podiatry',
    title: 'Sprained Ankle Swelling',
    specialist: 'Podiatrist',
    date: 'Jul 18, 2023',
    accent: 'blue' as const,
  },
];

export default function PreviousSearchesPage() {
  return (
    <div className="bg-surface text-text-base h-screen flex flex-col overflow-hidden antialiased">

      {/* ── Header ── */}
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
              placeholder="Search doctors, symptoms, or locations"
            />
          </div>
        </div>
        <div className="flex flex-1 justify-end gap-6 items-center">
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-text-muted hover:text-primary transition-colors text-sm font-medium py-1">Dashboard</Link>
            <Link href="/symptoms" className="text-text-muted hover:text-primary transition-colors text-sm font-medium py-1">Find Doctors</Link>
            <Link href="#" className="text-text-muted hover:text-primary transition-colors text-sm font-medium py-1">Appointments</Link>
            <Link href="#" className="text-text-muted hover:text-primary transition-colors text-sm font-medium py-1">Messages</Link>
          </nav>
          <div className="w-px h-6 bg-border mx-2" />
          <ThemeToggle />
          <button
            className="w-10 h-10 rounded-full bg-cover bg-center border-2 border-border hover:border-primary transition-colors focus:outline-none"
            style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBBG-K40lqIGcoihVGGxo7vmIcYnelVFsubH3ULYcWBOslmckp2Dq6KycrPAiltrIRBresiH9WjGOWum0m-kTuGblVO5Qnzw1_fYKztjJeYZVB5e6Qdl-NOo5rqydNiCt7o_vZrCs6lYSVYtY7sB3N7GxzNR39DVfST5080pnuDeFEmzbryb16FQcRy8_4zeTfkvcOdoyZymtq4gLBhJZgp3sreTE6lafs8kF7ZhbeEpNtXQovxKHoLYyylJztmmHZ9_Ggh7Z0LuYg')` }}
          />
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar />

        <div className="flex-1 overflow-y-auto bg-surface">
          <div className="px-8 md:px-12 py-10 flex flex-1 justify-center">
            <div className="flex flex-col max-w-[800px] flex-1">

              {/* Page heading */}
              <div className="flex flex-col gap-3 mb-10">
                <h1 className="text-4xl font-bold tracking-tight">Previous Searches</h1>
                <p className="text-text-muted text-base">Review your past symptom assessments and AI specialist recommendations.</p>
              </div>

              {/* Timeline */}
              <div className="grid grid-cols-[40px_1fr] gap-x-4 bg-card p-8 rounded-xl shadow-sm border border-border">
                {searches.map((item, i) => {
                  const isBlue = item.accent === 'blue';
                  const iconClass = isBlue
                    ? 'text-blue-400 bg-blue-400/10'
                    : 'text-primary bg-primary/10';
                  const hoverBorder = isBlue ? 'group-hover:border-blue-400/20' : 'group-hover:border-primary/20';
                  const isLast = i === searches.length - 1;

                  return (
                    <>
                      {/* Icon col */}
                      <div key={`icon-${i}`} className="flex flex-col items-center gap-2 pt-3">
                        <div className={`p-2 rounded-full flex items-center justify-center ${iconClass}`}>
                          <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                        </div>
                        {!isLast && (
                          <div className="w-[2px] bg-border grow my-1 rounded-full" />
                        )}
                      </div>

                      {/* Content col */}
                      <div key={`content-${i}`} className={`flex flex-col py-3 ${!isLast ? 'pb-8' : ''} group cursor-pointer`}>
                        <Link href="/symptoms">
                          <div className={`bg-white/5 backdrop-blur-sm p-4 rounded-lg group-hover:bg-white/10 transition-colors border border-transparent ${hoverBorder}`}>
                            <p className="text-text-base text-lg font-semibold leading-normal mb-1">{item.title}</p>
                            <div className="flex items-center gap-2 text-text-muted text-sm font-medium flex-wrap">
                              <span className="material-symbols-outlined text-[16px]">stethoscope</span>
                              <span>{item.specialist}</span>
                              <span className="w-1 h-1 bg-border rounded-full mx-1" />
                              <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                              <span>{item.date}</span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </>
                  );
                })}
              </div>

              {/* Footer */}
              <footer className="flex flex-col gap-6 py-12 mt-8 text-center border-t border-border">
                <div className="flex flex-wrap items-center justify-center gap-8">
                  {['Privacy Policy', 'Terms of Service', 'Support'].map((label) => (
                    <Link key={label} href="#" className="text-text-muted hover:text-text-base transition-colors text-sm font-medium">
                      {label}
                    </Link>
                  ))}
                </div>
                <p className="text-text-muted text-sm">© 2024 CareFind. All rights reserved.</p>
              </footer>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
