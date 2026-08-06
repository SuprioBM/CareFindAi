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
import { useAuth } from '@/authContext/authContext';
import { apiFetch } from '@/lib/api';
import { 
  Heart, 
  Activity, 
  Baby, 
  Brain, 
  Search, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  UserPlus,
  Plus
} from 'lucide-react';

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
  IconComponent: React.ComponentType<{ className?: string }>;
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

function getSearchIcon(label: string): React.ComponentType<{ className?: string }> {
  const text = label.toLowerCase();
  if (text.includes('heart') || text.includes('cardio')) return Heart;
  if (text.includes('skin') || text.includes('derma')) return Activity;
  if (text.includes('child') || text.includes('pedia')) return Baby;
  if (text.includes('neuro') || text.includes('head')) return Brain;
  return Search;
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

    // Fetch both datasets concurrently
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError('');

        const [searchesRes, bookmarksRes] = await Promise.all([
          apiFetch('/triage/history?limit=6'),
          apiFetch('/bookmarks?limit=6')
        ]);

        if (cancelled) return;

        // Parse previous searches
        let searchesList: PreviousSearchChip[] = [];
        if (searchesRes.ok) {
          const body = (await searchesRes.json()) as SymptomSearchesResponse;
          if (body.success && Array.isArray(body.data)) {
            searchesList = body.data.map((item) => {
              const label = item.symptomsText || item.recommendedSpecializationName || 'Symptom Search';
              return {
                id: item._id,
                IconComponent: getSearchIcon(label),
                label: label.length > 24 ? `${label.substring(0, 22)}...` : label
              };
            });
          }
        }

        // Parse saved doctors
        let doctorsList: SavedDoctorCard[] = [];
        if (bookmarksRes.ok) {
          const body = (await bookmarksRes.json()) as BookmarkResponse;
          if (body.success && Array.isArray(body.data)) {
            doctorsList = body.data
              .filter((item) => item.doctor)
              .map((item) => {
                const doc = item.doctor!;
                return {
                  bookmarkId: item._id,
                  doctorId: doc._id || '',
                  name: doc.fullName || 'Doctor Profile',
                  specialty: doc.specializationName || 'Specialist',
                  location: doc.city || 'Dhaka Central',
                  photo: doc.profileImage || DEFAULT_DOCTOR_PHOTO
                };
              });
          }
        }

        if (!cancelled) {
          setPreviousSearches(searchesList);
          setSavedDoctors(doctorsList);
        }
      } catch (err: any) {
        console.error('Dashboard load error:', err);
        if (!cancelled) {
          setError('Failed to load dashboard summaries.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

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
            <Clock className="w-6 h-6" />
          </div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight">Login to see the dashboard</h1>
          <p className="mb-6 text-sm text-text-muted font-semibold">
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
    <div className="p-6 md:p-10 transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex flex-col gap-10">

            {/* Welcome */}
            <div>
              <h1 className="text-3xl font-black tracking-tight mb-2">
                Welcome back, {user?.name || user?.email || 'there'}
              </h1>
              <p className="text-text-muted font-semibold">Here&apos;s what&apos;s happening with your health journey today.</p>
            </div>

            {error && (
              <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error font-semibold">
                {error}
              </div>
            )}

            {/*
             * Previous Searches Section
             * Shows the user's last 6 symptom searches as clickable chips.
             * Each chip displays the symptom text with a relevant medical icon.
             * "View all" links to /dashboard/previous_searches for the full paginated history.
             */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>Previous Triage Reports</span>
                </h2>
                <Link href="/dashboard/previous_searches" className="text-xs font-bold text-primary hover:underline uppercase tracking-wider">
                  View all
                </Link>
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
                  <p className="text-sm text-text-muted font-semibold">No previous searches yet.</p>
                )}

                {!loading &&
                  previousSearches.map(({ id, IconComponent, label }) => (
                    <button
                      key={id}
                      type="button"
                      className="flex items-center justify-center gap-2 rounded-full border border-border bg-card/50 backdrop-blur-md hover:border-primary/50 hover:bg-card transition-all px-4 py-2.5 text-xs font-bold text-text-base uppercase tracking-wider"
                    >
                      <IconComponent className="w-4 h-4 text-primary shrink-0" />
                      <span>{label}</span>
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
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  <span>Saved Doctors</span>
                </h2>
                <Link href="/dashboard/saved_items" className="text-xs font-bold text-primary hover:underline uppercase tracking-wider">
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
                  <div className="col-span-full rounded-xl border border-dashed border-border p-6 text-sm text-text-muted font-semibold">
                    No saved doctors yet. Save doctors from results to see them here.
                  </div>
                )}

                {!loading &&
                  savedDoctors.map((doc) => (
                    <div
                      key={doc.bookmarkId}
                      className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all relative group"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="w-14 h-14 rounded-full bg-cover bg-center border border-border shrink-0"
                          style={{ backgroundImage: `url('${doc.photo}')` }}
                        />
                        <div>
                          <h3 className="font-bold text-text-base text-base">{doc.name}</h3>
                          <p className="text-primary text-xs font-bold uppercase tracking-wider mt-0.5">{doc.specialty}</p>
                          <div className="flex items-center gap-1.5 mt-2 text-text-muted text-xs font-bold uppercase tracking-wider">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <span className="text-text-sub">Saved profile</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-1 text-text-muted text-xs font-bold uppercase tracking-wider">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>{doc.location}</span>
                        </div>
                        <Link
                          href={`/doctors/${doc.doctorId}`}
                          className="text-xs font-bold uppercase tracking-wider text-white bg-primary hover:bg-primary-hover shadow-md rounded-lg px-4 py-2 transition-all"
                        >
                          Book
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-primary" />
                  <span>Verify Physicians</span>
                </h2>
                <Link href="/dashboard/doctor_add" className="text-xs font-bold text-primary hover:underline uppercase tracking-wider">
                  Add Doctor
                </Link>
              </div>
              <div className="rounded-xl border border-border bg-card/60 p-5 shadow-sm">
                <p className="text-xs text-text-muted leading-relaxed font-semibold">
                  Add and manage verified doctor profiles so they appear in patient matches and recommendations. Verified physician entries are immediately run against triage models.
                </p>
              </div>
            </section>

      </div>
    </div>
  );
}
