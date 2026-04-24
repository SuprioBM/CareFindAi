/**
 * Main Dashboard Page
 *
 * Shows a preview of the user's previous symptom searches (up to 6 chips)
 *        with a "View all" link to the full Previous Searches history page.
 *
 * Shows a preview of the user's saved/bookmarked doctors (up to 6 cards)
 *        with a "Manage" link to the full Saved Items page.
 *
 * Each saved doctor card links to /doctors/:id — the full doctor profile page
 *        showing specialization, chamber info, and contact details.
 *
 * This page loads both datasets in parallel on mount using Promise.all(),
 * so the dashboard appears quickly without waiting for sequential API calls.
 */
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import DashboardSidebar from '../../components/dashboard/dashBoardsidebar';
import { useAuth } from '@/authContext/authContext';
import { apiFetch } from '@/lib/api';

// A single symptom search record (partial shape — only fields needed for dashboard chips)
type SymptomSearchItem = {
  _id: string;                             // Used as React key and for linking
  symptomsText: string;                    // Displayed as the chip label (what the user typed)
  recommendedSpecializationName?: string;  // Fallback label if symptomsText is missing
};

type SymptomSearchesResponse = {
  success: boolean;
  data: SymptomSearchItem[];
  message?: string;
};

// A single bookmark item (partial shape — only fields needed for dashboard preview cards)
type BookmarkItem = {
  _id: string;      // Bookmark record ID
  doctor?: {
    _id?: string;               // Doctor's ID — used to build the profile link (/doctors/:id)
    fullName?: string;          // Doctor's display name
    specializationName?: string; // Specialty shown under the name
    profileImage?: string;      // Photo shown on the card
    city?: string;              // Location shown under the name
  };
};

type BookmarkResponse = {
  success: boolean;
  data: BookmarkItem[];
  message?: string;
};

type PreviousSearchChip = {
  id: string;
  icon: string;
  label: string;
};

type SavedDoctorCard = {
  bookmarkId: string;
  doctorId: string;
  name: string;
  specialty: string;
  location: string;
  photo: string;
};

const DEFAULT_DOCTOR_PHOTO = '/default-doctor.png';

function getSearchIcon(label: string): string {
  const text = label.toLowerCase();
  if (text.includes('heart') || text.includes('cardio')) return 'monitor_heart';
  if (text.includes('skin') || text.includes('derma')) return 'healing';
  if (text.includes('child') || text.includes('pedia')) return 'child_care';
  if (text.includes('neuro') || text.includes('head')) return 'neurology';
  return 'search';
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();

  // Stores the 6 most recent symptom searches shown as clickable chips
  const [previousSearches, setPreviousSearches] = useState<PreviousSearchChip[]>([]);

  // Stores up to 6 bookmarked doctor cards shown on the dashboard
  const [savedDoctors, setSavedDoctors] = useState<SavedDoctorCard[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setPreviousSearches([]);
      setSavedDoctors([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch BOTH datasets simultaneously (parallel) to speed up dashboard load time.
        // GET /symptom-searches → user's previous symptom searches
        // GET /bookmarks        → user's saved/bookmarked doctors
        const [searchRes, bookmarkRes] = await Promise.all([
          apiFetch('/symptom-searches', { method: 'GET' }),
          apiFetch('/bookmarks', { method: 'GET' }),
        ]);

        // Parse both responses; .catch(() => null) prevents one failure from breaking both
        const [searchJson, bookmarkJson] = await Promise.all([
          searchRes.json().catch(() => null),
          bookmarkRes.json().catch(() => null),
        ]);

        const searchData = (searchJson as SymptomSearchesResponse | null)?.data ?? [];
        const bookmarkData = (bookmarkJson as BookmarkResponse | null)?.data ?? [];

        // Map the 6 most recent searches into chip display objects.
        // Each chip shows the symptom text + a relevant icon based on specialty keywords.
        const mappedSearches = searchData.slice(0, 6).map((item) => {
          // Use symptom text as chip label; fall back to specialization name if empty
          const label =
            item.symptomsText?.trim() ||
            item.recommendedSpecializationName?.trim() ||
            'Symptom analysis';

          return {
            id: item._id,
            icon: getSearchIcon(label), // Pick icon based on keywords in the label
            label,
          };
        });

        // Map the 6 most recently saved doctors into card display objects.
        // Each card shows: photo, name, specialty, city, and a Book button → doctor profile ()
        const mappedDoctors = bookmarkData.slice(0, 6).map((item) => {
          const doctor = item.doctor;
          return {
            bookmarkId: item._id,
            doctorId: doctor?._id || item._id,          // Used in href="/doctors/:id" ()
            name: doctor?.fullName || 'Unknown Doctor',
            specialty: doctor?.specializationName || 'General Medicine',
            location: doctor?.city || 'Location unavailable',
            photo: doctor?.profileImage || DEFAULT_DOCTOR_PHOTO,
          };
        });

        if (!cancelled) {
          setPreviousSearches(mappedSearches);
          setSavedDoctors(mappedDoctors);

          if (!searchRes.ok && !bookmarkRes.ok) {
            setError('Could not load dashboard data right now.');
          }
        }
      } catch {
        if (!cancelled) {
          setPreviousSearches([]);
          setSavedDoctors([]);
          setError('Could not load dashboard data right now.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  if (authLoading) {
    return (
      <div className="bg-surface text-text-base min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
        <p className="text-sm text-text-muted">Checking your session...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-surface text-text-base min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="material-symbols-outlined">lock</span>
          </div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight">Login to see the dashboard</h1>
          <p className="mb-6 text-sm text-text-muted">
            Please sign in to access your health insights, saved doctors, and search history.
          </p>
          <Link
            href={`/login?redirect=${encodeURIComponent('/dashboard')}`}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-text-base min-h-screen flex flex-col antialiased">

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar />

        <main className="flex-1 overflow-y-auto bg-surface p-6 md:p-10">
          <div className="max-w-6xl mx-auto flex flex-col gap-10">

            {/* Welcome */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                Welcome back, {user?.name || user?.email || 'there'}
              </h1>
              <p className="text-text-muted">Here&apos;s what&apos;s happening with your health journey today.</p>
            </div>

            {error && (
              <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                {error}
              </div>
            )}

            {/*
             * Previous Searches Section
             * Shows the user's last 6 symptom searches as clickable chips.
             * Each chip displays the symptom text with a relevant medical icon.
             * "View all" links to /dashboard/previous_searches for the full paginated history.
             */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">history</span>
                  Previous Searches
                </h2>
                <Link href="/dashboard/previous_searches" className="text-sm font-medium text-primary hover:underline">View all</Link>
              </div>
              <div className="flex gap-3 flex-wrap">
                {loading &&
                  Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={`search-skeleton-${index}`}
                      className="h-10 w-44 animate-pulse rounded-full border border-border bg-card/50"
                    />
                  ))}

                {!loading && previousSearches.length === 0 && (
                  <p className="text-sm text-text-muted">No previous searches yet.</p>
                )}

                {!loading &&
                  previousSearches.map(({ id, icon, label }) => (
                    <button
                      key={id}
                      type="button"
                      className="flex items-center justify-center gap-2 rounded-full border border-border bg-card/50 backdrop-blur-md hover:border-primary/50 hover:bg-card transition-all px-4 py-2 text-sm font-medium text-text-base"
                    >
                      <span className="material-symbols-outlined text-[18px] text-primary">{icon}</span>
                      {label}
                    </button>
                  ))}
              </div>
            </section>

            {/*
             * Saved Doctors Section
             * Shows a preview of up to 6 bookmarked doctors as cards.
             * Each card has: doctor photo, name, specialization, city, and a "Book" button.
             * The "Book" button links to /doctors/:id — the full doctor profile page ()
             * which shows specialization, chamber address, phone, and contact details.
             * "Manage" links to /dashboard/saved_items for the full saved items page.
             */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">favorite</span>
                  Saved Doctors
                </h2>
                <Link href="/dashboard/saved_items" className="text-sm font-medium text-primary hover:underline">
                  Manage
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading &&
                  Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={`doctor-skeleton-${index}`}
                      className="h-44 animate-pulse rounded-xl border border-border bg-card/60"
                    />
                  ))}

                {!loading && savedDoctors.length === 0 && (
                  <div className="col-span-full rounded-xl border border-dashed border-border p-6 text-sm text-text-muted">
                    No saved doctors yet. Save doctors from results to see them here.
                  </div>
                )}

                {!loading &&
                  savedDoctors.map((doc) => (
                    <div
                      key={doc.bookmarkId}
                      className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all relative group"
                    >
                      <button className="absolute top-4 right-4 text-error opacity-0 group-hover:opacity-100 transition-opacity" type="button" aria-label="Saved doctor">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                      </button>
                      <div className="flex items-start gap-4">
                        <div
                          className="w-14 h-14 rounded-full bg-cover bg-center border border-border shrink-0"
                          style={{ backgroundImage: `url('${doc.photo}')` }}
                        />
                        <div>
                          <h3 className="font-bold text-text-base text-base">{doc.name}</h3>
                          <p className="text-primary text-sm font-medium">{doc.specialty}</p>
                          <div className="flex items-center gap-1 mt-1 text-text-muted text-xs">
                            <span className="material-symbols-outlined text-[14px]">verified</span>
                            <span className="font-medium text-text-sub">Saved profile</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-1 text-text-muted text-sm">
                          <span className="material-symbols-outlined text-[16px]">location_on</span>
                          <span>{doc.location}</span>
                        </div>
                        <Link
                          href={`/doctors/${doc.doctorId}`}
                          className="text-sm font-bold text-white bg-primary hover:bg-primary-hover shadow-[0_0_15px_rgba(20,184,166,0.3)] rounded-lg px-4 py-2 transition-all"
                        >
                          Book
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">group_add</span>
                  Add Doctors
                </h2>
                <Link href="/dashboard/doctor_add" className="text-sm font-medium text-primary hover:underline">
                  Add Doctor
                </Link>
              </div>
              <div className="rounded-xl border border-border bg-card/60 p-4">
                <p className="text-sm text-text-muted">
                  Add and manage verified doctor profiles so they appear in patient matches and recommendations.
                </p>
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}
