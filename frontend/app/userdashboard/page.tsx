'use client';

import Link from 'next/link';
import ThemeToggle from '../../components/Themes/ThemeToggle';
import DashboardSidebar from '../../components/dashboard/dashBoardsidebar';

const previousSearches = [
  { icon: 'search', label: 'Cardiologist in NY' },
  { icon: 'healing', label: 'Skin rash symptoms' },
  { icon: 'child_care', label: 'Pediatrician nearby' },
  { icon: 'monitor_heart', label: 'Knee pain analysis' },
];

const savedDoctors = [
  {
    name: 'Dr. Emily Chen',
    specialty: 'Cardiology',
    rating: '4.9',
    reviews: 124,
    distance: '2.3 mi away',
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAO_RlGzdRc9gfEiZz9-cr36_UBH7g_LUc9z6flk7KXgfvH6HV3XsktfLoGA11DMaG4TyNrcAtMDTUwm_P6yRngBOgPJG7qAhPBARV0rcNghybRaV7_n4Ths6mk9y3ydTOMdPKy8gnX0wAkFKB7LQbnDmS_tSoyglZI1v1IOllWsVaGTiGrU1H7L3vyvmmXM811GJm_fw2nUFpEpacOTers21JUpnJSomTz6hlzCzyL_otUPqKtYc1hXWCzoYoUOUiUi_3edbZ7MiQ',
  },
  {
    name: 'Dr. James Wilson',
    specialty: 'Dermatology',
    rating: '4.7',
    reviews: 89,
    distance: '5.1 mi away',
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNBypTGqwh83owuP2v6-5LhDqvhh9CG5-mrpG3wqH1xpbLMHsfsmOcAPbHEOxdFxPH53khm7vbwNsHX4UiEPbBx1Td8nHoxAUhDeBUyIqf8NL_NxqciZph-As6Gk-m_UsAMoyE_LRo4wNhkwAbhlhuLhTOdG0asE-OE8XxHp_q8OycWdZ488b5Wxcbw02Zudv3zjA6zy8tDZwIWEBy4uaN540vpPZO36efdVqxtcCFGRSR5m1aRBMYaiq7ANyeMZG_egp6yIF3PQY',
  },
];

export default function DashboardPage() {
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
            <Link href="/dashboard" className="text-primary font-bold text-sm border-b-2 border-primary py-1">Dashboard</Link>
            <Link href="/symptoms" className="text-text-muted hover:text-primary transition-colors text-sm font-medium py-1">Find Doctors</Link>
            <Link href="#" className="text-text-muted hover:text-primary transition-colors text-sm font-medium py-1">Appointments</Link>
            <Link href="#" className="text-text-muted hover:text-primary transition-colors text-sm font-medium py-1">Messages</Link>
          </nav>
          <div className="w-px h-6 bg-border mx-2" />
          <ThemeToggle />
          <button className="flex cursor-pointer items-center justify-center rounded-full h-10 w-10 bg-card border border-border text-text-sub hover:text-primary hover:border-primary/50 transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full border-2 border-surface shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
          </button>
          <button
            className="w-10 h-10 rounded-full bg-cover bg-center border-2 border-border hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuALIbtxG5dgreIPyyA9EO_WA_EuPh9AoV0veDI92q7BKCXqUeBPmJZXrNLCtz_vUOhkRSg3BU86bnSqk_Dq62JIdwYD32_jz9Dj3s83yhsgTdmNDZw1-TAqIJQ-8ZrmkGV2koT4BqErgNNDLdtNWdgXELrChCn0Pfzmfg43iyArT4NocY4UNWY9LUnxOovcQVc3D-sEiV0n88si2ytehIeuh57vUbNoI8e5SPmjmq7jlqAACNVINdFCOYqV4KwDJFj_HOV-CaXmIDA')` }}
          />
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar />

        <main className="flex-1 overflow-y-auto bg-surface p-6 md:p-10">
          <div className="max-w-6xl mx-auto flex flex-col gap-10">

            {/* Welcome */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, Sarah</h1>
              <p className="text-text-muted">Here&apos;s what&apos;s happening with your health journey today.</p>
            </div>

            {/* Previous Searches */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">history</span>
                  Previous Searches
                </h2>
                <Link href="/dashboard/previous-searches" className="text-sm font-medium text-primary hover:underline">View all</Link>
              </div>
              <div className="flex gap-3 flex-wrap">
                {previousSearches.map(({ icon, label }) => (
                  <button
                    key={label}
                    className="flex items-center justify-center gap-2 rounded-full border border-border bg-card/50 backdrop-blur-md hover:border-primary/50 hover:bg-card transition-all px-4 py-2 text-sm font-medium text-text-base"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary">{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            </section>

            {/* Saved Doctors */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">favorite</span>
                  Saved Doctors
                </h2>
                <button className="text-sm font-medium text-primary hover:underline">Manage</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedDoctors.map((doc) => (
                  <div
                    key={doc.name}
                    className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all relative group"
                  >
                    <button className="absolute top-4 right-4 text-error opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                    </button>
                    <div className="flex items-start gap-4">
                      <div
                        className="w-14 h-14 rounded-full bg-cover bg-center border border-border flex-shrink-0"
                        style={{ backgroundImage: `url('${doc.photo}')` }}
                      />
                      <div>
                        <h3 className="font-bold text-text-base text-base">{doc.name}</h3>
                        <p className="text-primary text-sm font-medium">{doc.specialty}</p>
                        <div className="flex items-center gap-1 mt-1 text-text-muted text-xs">
                          <span className="material-symbols-outlined text-[14px]">star</span>
                          <span className="font-medium text-text-sub">{doc.rating}</span>
                          <span>({doc.reviews} reviews)</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-1 text-text-muted text-sm">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        <span>{doc.distance}</span>
                      </div>
                      <Link
                        href={`/doctors/1`}
                        className="text-sm font-bold text-white bg-primary hover:bg-primary-hover shadow-[0_0_15px_rgba(20,184,166,0.3)] rounded-lg px-4 py-2 transition-all"
                      >
                        Book
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}
