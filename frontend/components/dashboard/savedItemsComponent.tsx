'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { SavedLocation } from '@/types/types';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/authContext/authContext';

// ── Types ─────────────────────────────────────────────────────
interface BookmarkedDoctor {
  bookmarkId: string;
  doctorId: string;
  fullName: string;
  specializationName: string;
  profileImage: string;
  city: string;
  fees: number;
  consultation: string;
}

// ── Saved Locations mock (untouched) ─────────────────────────
const savedLocationsMock: SavedLocation[] = [
  {
    id: 101,
    tag: 'Home Clinic',
    name: 'Seattle Downtown Medical Center',
    addressLine1: '1200 5th Ave Suite 200',
    addressLine2: 'Seattle, WA 98101',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDiY6Aku8gxxxb_z2Qj1PZWNO5Rqmwp5k0JUkhX5eHIKZCWe2hOEtStStlTKUlHqbretyglNuowdO0kBPnczvOIadGtxLgfUv7gWymytiT9FlageBjrIdDjOpQLr133kvIOY1gkqEsoKmT4e9LQ_Qv1BAPjSza3zAoDDiSgDJ2bv6hKvwhlr8XmHw3FFfuY2YciIxJcBhanFFqBYxknPH6EoomKmZagZGHDEQJziH2LY2GaawZGzQeydbcXarwE4VgaA8DMcmJG1e0',
    lat: 47.6101,
    lng: -122.3365,
  },
  {
    id: 102,
    tag: 'Office Nearby',
    name: 'Bellevue Eastside Specialists',
    addressLine1: '10400 NE 4th St',
    addressLine2: 'Bellevue, WA 98004',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBCTq0S3Z5lilWU9dmFbfRp5UAEKiyI2BKFAz-nxQcOOobCL-UE8i6rnDybeegVHRa3tg2pcq7C02bSK2Uh1W6PLlekEbu4NxHAiQi20pfPJLFwi5vO2AeXG-GzCzdp8a0RWd3KA_IIs4zC_qOZmDxdXsEJpppR_lXhNJ4wtx2NT-DojaxQ5nnDzUfe1V2GefWDxk05gs6GxTotBmYCB0HveZNNNbg4D4y_Gr9UsJQGFRBFbdWjczl1F6nIjI2c85NxJaKDEo4Awo4',
    lat: 47.6148,
    lng: -122.2001,
  },
];

// ── Dynamic map (untouched) ───────────────────────────────────
const DoctorMap = dynamic(() => import('../../components/Map/map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-surface text-text-muted text-sm">
      Loading map...
    </div>
  ),
});

const DEFAULT_USER_LOCATION: [number, number] = [47.6062, -122.3321];
const DEFAULT_PHOTO = '/default-doctor.png';

// ── Component ─────────────────────────────────────────────────
export default function SavedItemsContent() {
  const { user, loading } = useAuth();

  // ── Bookmark state ────────────────────────────────────────
  const [doctors, setDoctors] = useState<BookmarkedDoctor[]>([]);
  const [fetching, setFetching] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  // ── Location state (untouched) ────────────────────────────
  const [userLocation, setUserLocation] = useState<[number, number]>(DEFAULT_USER_LOCATION);
  const [activeRouteLocationId, setActiveRouteLocationId] = useState<number | null>(null);

  // ── Fetch bookmarks ───────────────────────────────────────
  useEffect(() => {
    if (loading || !user) return;

    async function loadBookmarks() {
      try {
        setFetching(true);
        const res = await apiFetch('/bookmarks');
        const data = await res.json();
        if (!data.success) return;

        setDoctors(
          data.data.map((b: any) => ({
            bookmarkId: b._id,
            doctorId: b.doctor._id,
            fullName: b.doctor.fullName,
            specializationName: b.doctor.specializationName,
            profileImage: b.doctor.profileImage || DEFAULT_PHOTO,
            city: b.doctor.city,
            fees: b.doctor.fees,
            consultation: b.doctor.consultation,
          }))
        );
      } catch (e) {
        console.error('Failed to load bookmarks:', e);
      } finally {
        setFetching(false);
      }
    }

    loadBookmarks();
  }, [loading, user]);

  // ── Remove bookmark (optimistic) ─────────────────────────
  const removeBookmark = async (bookmarkId: string) => {
    setRemoving(bookmarkId);
    setDoctors((prev) => prev.filter((d) => d.bookmarkId !== bookmarkId));

    try {
      const res = await apiFetch(`/bookmarks/${bookmarkId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
    } catch (e) {
      console.error('Remove failed, reverting:', e);
      const res = await apiFetch('/api/v1/bookmarks');
      const data = await res.json();
      if (data.success) {
        setDoctors(
          data.data.map((b: any) => ({
            bookmarkId: b._id,
            doctorId: b.doctor._id,
            fullName: b.doctor.fullName,
            specializationName: b.doctor.specializationName,
            profileImage: b.doctor.profileImage || DEFAULT_PHOTO,
            city: b.doctor.city,
            fees: b.doctor.fees,
            consultation: b.doctor.consultation,
          }))
        );
      }
    } finally {
      setRemoving(null);
    }
  };

  // ── Geolocation (untouched) ───────────────────────────────
  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      () => {
        setUserLocation(DEFAULT_USER_LOCATION);
      },
      { timeout: 8000, maximumAge: 60_000 },
    );
  }, []);

  // ── Map helpers (untouched) ───────────────────────────────
  const mapMarkers = useMemo(
    () =>
      savedLocationsMock.map((location) => ({
        id: location.id,
        name: location.name,
        specialty: location.tag,
        lat: location.lat,
        lng: location.lng,
        photo: location.image,
        isSelected: activeRouteLocationId === location.id,
      })),
    [activeRouteLocationId],
  );

  const routeTo = useMemo<[number, number] | null>(() => {
    if (!activeRouteLocationId) return null;
    const location = savedLocationsMock.find((item) => item.id === activeRouteLocationId);
    return location ? [location.lat, location.lng] : null;
  }, [activeRouteLocationId]);

  const activeLocation = useMemo(
    () => savedLocationsMock.find((item) => item.id === activeRouteLocationId) ?? null,
    [activeRouteLocationId],
  );

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight text-text-base">Saved Items</h1>
        <p className="text-text-muted text-base">
          Manage your preferred healthcare professionals and facilities.
        </p>
      </div>

      {/* ── Saved Doctors ── */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">stethoscope</span>
            <h2 className="text-2xl font-bold text-text-base">Saved Doctors</h2>
          </div>
          {!fetching && (
            <span className="bg-card text-primary px-3 py-1 rounded-full text-sm font-bold border border-primary/20">
              {doctors.length} Saved
            </span>
          )}
        </div>

        {/* loading skeletons */}
        {fetching && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-xl border border-border overflow-hidden shadow-sm animate-pulse"
              >
                <div className="w-full aspect-4/3 bg-border" />
                <div className="p-5 flex flex-col gap-3">
                  <div className="h-4 bg-border rounded w-3/4" />
                  <div className="h-3 bg-border rounded w-1/2" />
                  <div className="h-9 bg-border rounded mt-2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* empty state */}
        {!fetching && doctors.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-text-muted border border-dashed border-border rounded-xl">
            <span className="material-symbols-outlined text-5xl text-primary/30">favorite</span>
            <p className="text-base font-medium">No saved doctors yet</p>
            <Link href="/symptoms" className="text-sm text-primary font-semibold hover:underline">
              Find doctors near you →
            </Link>
          </div>
        )}

        {/* doctor cards */}
        {!fetching && doctors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {doctors.map((doctor) => (
              <article
                key={doctor.bookmarkId}
                className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
              >
                <div
                  className="w-full aspect-4/3 bg-center bg-no-repeat bg-cover relative"
                  style={{
                    backgroundImage: `url('${doctor.profileImage}')`,
                    backgroundColor: 'var(--color-border)',
                  }}
                >
                  <button
                    onClick={() => removeBookmark(doctor.bookmarkId)}
                    disabled={removing === doctor.bookmarkId}
                    className="absolute top-3 right-3 size-8 bg-card/90 rounded-full flex items-center justify-center text-error hover:scale-110 transition-transform shadow-sm disabled:opacity-50"
                  >
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      favorite
                    </span>
                  </button>
                </div>

                <div className="p-5 flex flex-col gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-text-base mb-1">{doctor.fullName}</h3>
                    <p className="text-text-muted text-sm font-medium">{doctor.specializationName}</p>
                  </div>

                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <span className="material-symbols-outlined text-yellow-400 text-[18px]">star</span>
                    <span className="text-text-base">—</span>
                    <span className="text-text-muted ml-1">No ratings yet</span>
                  </div>

                  <Link
                    href={`/doctors/${doctor.doctorId}`}
                    className="w-full py-2.5 bg-surface text-primary font-bold rounded-lg border border-primary/20 hover:bg-primary hover:text-white transition-colors mt-2 text-sm text-center"
                  >
                    Book Appointment
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ── Saved Locations (untouched) ── */}
      <section className="flex flex-col gap-6 bg-card p-8 rounded-2xl border border-border">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">location_on</span>
            <h2 className="text-2xl font-bold text-text-base">Saved Locations</h2>
          </div>
          <span className="bg-surface text-primary px-3 py-1 rounded-full text-sm font-bold border border-primary/20">
            {savedLocationsMock.length} Saved
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {savedLocationsMock.map((location) => {
            const isRouting = activeRouteLocationId === location.id;

            return (
              <article
                key={location.name}
                className="bg-surface rounded-xl border border-border overflow-hidden flex flex-col sm:flex-row shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className="w-full sm:w-2/5 h-48 sm:h-auto bg-center bg-no-repeat bg-cover relative"
                  style={{ backgroundImage: `url('${location.image}')` }}
                >
                  <button className="absolute top-3 right-3 size-8 bg-card/90 rounded-full flex items-center justify-center text-error hover:scale-110 transition-transform shadow-sm sm:hidden">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      favorite
                    </span>
                  </button>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between relative">
                  <button className="absolute top-4 right-4 size-8 bg-card rounded-full hidden sm:flex items-center justify-center text-error hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      favorite
                    </span>
                  </button>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        {location.tag}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-text-base mb-2">{location.name}</h3>
                    <p className="text-text-muted text-sm leading-relaxed mb-4">
                      {location.addressLine1}
                      <br />
                      {location.addressLine2}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setActiveRouteLocationId(location.id)}
                      className={`flex-1 py-2 font-bold rounded-lg transition-colors text-sm flex items-center justify-center gap-2 ${
                        isRouting ? 'bg-primary-hover text-white' : 'bg-primary text-white hover:bg-primary-hover'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{isRouting ? 'route' : 'directions'}</span>
                      {isRouting ? 'Route Active' : 'Directions'}
                    </button>
                    <button className="px-4 py-2 bg-card text-text-base font-semibold rounded-lg border border-border hover:border-primary transition-colors text-sm">
                      Details
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {activeLocation && (
          <section className="mt-2 bg-surface border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between gap-4 p-4 border-b border-border">
              <div>
                <p className="text-xs uppercase tracking-wider text-primary font-bold mb-1">Directions Preview</p>
                <p className="text-sm text-text-base font-semibold">{activeLocation.name}</p>
              </div>
              <button
                onClick={() => setActiveRouteLocationId(null)}
                className="h-9 px-3 rounded-lg border border-border text-text-sub hover:text-error hover:border-error/40 transition-colors text-sm font-medium"
              >
                Close Route
              </button>
            </div>

            <div className="h-90 w-full">
              <DoctorMap
                userLocation={userLocation}
                doctors={mapMarkers}
                onDoctorClick={(id) => setActiveRouteLocationId(id)}
                routeTo={routeTo}
                onClearRoute={() => setActiveRouteLocationId(null)}
              />
            </div>
          </section>
        )}
      </section>
    </div>
  );
}