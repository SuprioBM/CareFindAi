'use client';

import { useState } from 'react';
import Link from 'next/link';
import ThemeToggle from '../../components/Themes/ThemeToggle';

const doctors = [
  {
    id: 1,
    name: 'Dr. Sarah Jenkins',
    specialty: 'Neurologist',
    rating: 4.9,
    location: 'Downtown Medical Center • 2.4 miles',
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCG5aq-DDGsY5T-lJ-Pl6sNSCpun6PoX7gL3NiJH8ST0mBXDELXP881d2kqSTNDtKo0HZTyoglqlh_KcbVhYzxTGghA5Rn_T_0lEI3qlEr1rn4wb14S-B3yvBYtlsystagGBqoerU2lIoOh8v-hMV6w8AU_kmzUuKQ6VOdVn9iROl3kajnOibzmIyW14oy1pbKLqyNogQbSFV6F1cTRYlItyxV4tdoXYOkifwr2hEnbgEdVB_Jv6l3GZzEVPYRVyeCnOhQlRGf6uUQ',
    aiReason: 'Specializes in chronic headaches and migraines. High success rate with patients reporting similar symptom clusters.',
  },
  {
    id: 2,
    name: 'Dr. Michael Chen',
    specialty: 'General Practitioner',
    rating: 4.8,
    location: 'Westside Clinic • 1.1 miles',
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXK_oJvG4WixRRfV9oafGR1EbowVfMEMjhKjkapOjGShFFvjfPmV9uRKiCbBvWjxYslvZHHgCVP9wxIMe5XzZaJz6NPhGYIqejgta49n_Ra7i131OeiihVZ7JTGlEyv4HEcip6TCNcmgltfwrzjbN1lvsQ-2fKlFHKQNlnR85Cf-tUyMPiDd8KDT_KrasMDluuR1-5TncyiUmUt73DDMHR5SP1Y_01nmpymFBkS9O7tsUOVHpyx0UzwxAROYBM6YEi5_M0WbnIVtA',
    aiReason: 'Excellent for initial diagnosis of general fatigue and fever. Can provide immediate care and targeted referrals if necessary.',
  },
];

export default function SymptomsPage() {
  const [symptoms, setSymptoms] = useState('');

  return (
    <div className="bg-surface text-text-base min-h-screen">

      {/* ── Header ── */}
      <header className="flex items-center justify-between border-b border-primary/20 px-10 py-3 bg-surface sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-primary text-2xl">health_and_safety</span>
          <h2 className="text-lg font-bold tracking-tight">CareFind</h2>
        </div>
        <div className="flex flex-1 justify-end items-center gap-8">
          <nav className="hidden md:flex items-center gap-6">
            {[['Home', '/'], ['Doctors', '#'], ['Appointments', '#'], ['Records', '#']].map(([label, href]) => (
              <Link key={label} href={href} className="text-sm font-medium text-text-sub hover:text-primary transition-colors">
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex gap-2 items-center">
            <ThemeToggle />
            <Link
              href="/login"
              className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-xl h-10 px-4 bg-primary hover:bg-primary-hover text-white text-sm font-bold transition-colors"
            >
              Sign In
            </Link>
            <button className="flex cursor-pointer items-center justify-center rounded-xl h-10 bg-primary/10 hover:bg-primary/20 text-primary w-10 transition-colors">
              <span className="material-symbols-outlined text-xl">notifications</span>
            </button>
            <button className="flex cursor-pointer items-center justify-center rounded-xl h-10 bg-primary/10 hover:bg-primary/20 text-primary w-10 transition-colors">
              <span className="material-symbols-outlined text-xl">person</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[960px] mx-auto px-4 py-6">

        {/* ── Title ── */}
        <div className="flex flex-wrap justify-between gap-3 px-4 py-6">
          <div className="flex min-w-72 flex-col gap-3">
            <p className="text-4xl font-black leading-tight tracking-tight">Describe your symptoms</p>
            <p className="text-text-muted text-base leading-normal">
              Our AI will analyze your symptoms and connect you with the right specialists.
            </p>
          </div>
        </div>

        {/* ── Textarea ── */}
        <div className="flex flex-col gap-4 px-4 py-3">
          <label className="flex flex-col w-full relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-700 pointer-events-none" />
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="E.g. I have had a continuous headache, mild fever, and fatigue for the last two days. The pain is mostly localized around my temples..."
              className="relative flex w-full resize-none overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-primary border border-primary/20 bg-card min-h-40 placeholder:text-text-muted p-5 text-lg font-normal leading-relaxed"
            />
            <div className="absolute bottom-4 right-4">
              <button
                type="button"
                title="Use Microphone"
                className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-xl">mic</span>
              </button>
            </div>
          </label>
        </div>

        {/* ── Actions ── */}
        <div className="flex flex-1 gap-4 flex-wrap px-4 py-3 mb-8">
          <button className="flex min-w-[120px] cursor-pointer items-center justify-center rounded-xl h-12 px-6 bg-primary hover:bg-primary-hover text-white text-base font-bold shadow-lg shadow-primary/30 transition-all hover:scale-[1.02]">
            <span className="material-symbols-outlined mr-2">auto_awesome</span>
            Analyze Symptoms
          </button>
          <button
            type="button"
            onClick={() => setSymptoms('')}
            className="flex min-w-[100px] cursor-pointer items-center justify-center rounded-xl h-12 px-6 bg-primary/10 hover:bg-primary/20 text-text-sub text-base font-bold transition-colors"
          >
            Clear
          </button>
        </div>

        {/* ── Suggested Specialists ── */}
        <div className="px-4 border-t border-primary/10 pt-8 mt-4">
          <h2 className="text-[22px] font-bold leading-tight pb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person_search</span>
            Suggested Specialists
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col gap-4 bg-card p-5 rounded-2xl border border-primary/10 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-16 h-16 rounded-full flex-shrink-0 bg-cover bg-center bg-primary/20"
                    style={{ backgroundImage: `url('${doc.photo}')` }}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{doc.name}</h3>
                      <div className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-md text-xs font-bold">
                        <span className="material-symbols-outlined text-[14px]">star</span>
                        {doc.rating}
                      </div>
                    </div>
                    <p className="text-primary font-medium text-sm mb-1">{doc.specialty}</p>
                    <p className="text-text-muted text-xs flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      {doc.location}
                    </p>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-lg p-3 text-sm border border-primary/10">
                  <div className="flex items-center gap-2 text-primary font-medium mb-1">
                    <span className="material-symbols-outlined text-[16px]">info</span>
                    AI Match Reason
                  </div>
                  <p className="text-text-sub text-xs">{doc.aiReason}</p>
                </div>

                <div className="mt-2 flex gap-2">
                  <Link
                    href={`/doctors/${doc.id}`}
                    className="flex-1 bg-primary text-white rounded-lg h-9 text-sm font-bold hover:bg-primary-hover transition-colors flex items-center justify-center"
                  >
                    Book Now
                  </Link>
                  <button className="w-9 h-9 flex items-center justify-center bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-sm">chat</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
