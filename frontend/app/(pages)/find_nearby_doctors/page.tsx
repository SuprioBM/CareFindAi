'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/authContext/authContext';
import SavedLocationModal from "@/components/ModalComponent/SavedLocationModal";
import { useSavedLocations,SavedLocation } from "@/lib/useSavedLocations";
import { useRouter } from 'next/navigation';
import { Plus, ArrowUpDown, Heart, Star, Navigation, Phone, ChevronDown, Check } from 'lucide-react';
import { fetchNearbyDoctors } from '@/lib/findnearByDoctors';
import { SpecializationOption, SpecializationResponse } from '@/types/types';

// types for typesctipt
interface SessionDoctor {
  _id?: string;
  id?: string | number;
  fullName?: string;
  name?: string;
  specializationName?: string;
  specialty?: string;
  profileImage?: string;
  latitude?: number;
  longitude?: number;
  location?: {
    type?: string;
    coordinates?: [number, number];
  };
  consultation?: string;
  appointmentPhone?: string[];
  appointmentWebsite?: string;
  fees?: number;
  distanceKm?: number;
}

interface Doctor {
  id: string | number;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  photo: string;
  appointmentPhones: string[];
  appointmentWebsite: string;
  availability: 'today' | 'tomorrow' | string;
  lat: number;
  lng: number;
  distanceMiles: number;
}

function phoneTelHref(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '');
  return `tel:${cleaned || phone.trim()}`;
}

// checking the distance between user and doctor using Haversine formula (in miles)
function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const DEFAULT_LOCATION: [number, number] = [23.8103, 90.4125];
const DEFAULT_PHOTO = '/default-doctor.png';

//  Dynamic Leaflet map component with SSR disabled and a custom loading state
const DoctorMap = dynamic(() => import('../../../components/Map/map'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex flex-col items-center justify-center bg-surface gap-3 text-text-muted">
      <span className="material-symbols-outlined text-[52px] text-primary/30 animate-pulse">
        map
      </span>
      <p className="text-sm">Loading map…</p>
    </div>
  ),
});

// Main Page Component for Doctor Discovery
export default function DoctorDiscoveryPage() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locLoading, setLocLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [routeToId, setRouteToId] = useState<string | number | null>(null);

  // bookmarkedIds = set of doctor _id strings that the current user has bookmarked
  // bookmarkMap   = doctorId -> bookmarkDocumentId  (needed for DELETE)
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [bookmarkMap, setBookmarkMap] = useState<Record<string, string>>({});

  const [sessionDoctors, setSessionDoctors] = useState<SessionDoctor[]>([]);
  const [sessionSpecialization, setSessionSpecialization] = useState('');
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [specializations, setSpecializations] = useState<SpecializationOption[]>([]);
  const [loadingSpecializations, setLoadingSpecializations] = useState(true);
  const [locationFromSession, setLocationFromSession] = useState(false);
  const [locationPromptNeeded, setLocationPromptNeeded] = useState(false);
  const [shouldFetchInitialDoctors, setShouldFetchInitialDoctors] = useState(false);
  const [specMenuOpen, setSpecMenuOpen] = useState(false);
  const specMenuRef = useRef<HTMLDivElement>(null);
  const { user, loading } = useAuth();

  const {
  locations,
  createLocation,
  deleteLocation,
} = useSavedLocations();

const [activeLocationId, setActiveLocationId] = useState<string | null>(null);

const [modalOpen, setModalOpen] = useState(false);
const [modalData, setModalData] = useState<{
  address: string;
  lat: number;
  lng: number;
} | null>(null);

  // ── Load session data ───────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('carefind_nearby_doctors');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);

        if (parsed?.userLocation?.latitude && parsed?.userLocation?.longitude) {
          setUserLocation([
            Number(parsed.userLocation.latitude),
            Number(parsed.userLocation.longitude),
          ]);
          setLocationFromSession(true);
          setLocLoading(false);
        }

        if (Array.isArray(parsed?.doctors)) {
          setSessionDoctors(parsed.doctors);
        }
        if (parsed?.specialization) setSessionSpecialization(parsed.specialization);

        const hasStoredLocation =
          parsed?.userLocation?.latitude != null &&
          parsed?.userLocation?.longitude != null;
        const hasStoredDoctors =
          Array.isArray(parsed?.doctors) && parsed.doctors.length > 0;
        if (hasStoredLocation && parsed?.specialization && !hasStoredDoctors) {
          setShouldFetchInitialDoctors(true);
        }
      } catch (e) {
        console.error('Failed to parse session doctors data:', e);
      }
    }
    setSessionLoaded(true);
  }, []);

  useEffect(() => {
    async function loadSpecializations() {
      try {
        setLoadingSpecializations(true);
        const res = await apiFetch('/specializations');
        const data: SpecializationResponse = await res.json();
        if (data.success) setSpecializations(data.data);
      } catch (e) {
        console.error('Failed to load specializations:', e);
      } finally {
        setLoadingSpecializations(false);
      }
    }
    loadSpecializations();
  }, []);

  useEffect(() => {
    if (!specMenuOpen) return;

    function handlePointerDown(e: MouseEvent) {
      if (!specMenuRef.current?.contains(e.target as Node)) {
        setSpecMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [specMenuOpen]);

  const requestUserLocation = () => {
    setLocLoading(true);
    setLocationPromptNeeded(false);

    if (!('geolocation' in navigator)) {
      setUserLocation(DEFAULT_LOCATION);
      setLocLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setLocLoading(false);
      },
      () => {
        setLocLoading(false);
        setLocationPromptNeeded(true);
      },
      { timeout: 8000, maximumAge: 60_000 }
    );
  };

  useEffect(() => {
    if (!sessionLoaded || locationFromSession || userLocation) return;
    requestUserLocation();
  }, [sessionLoaded, locationFromSession, userLocation]);

  async function handleSpecializationChange(name: string) {
    setSessionSpecialization(name);
    if (!userLocation || !name.trim()) {
      if (!name.trim()) setSessionDoctors([]);
      return;
    }

    try {
      const doctors = await fetchNearbyDoctors({
        latitude: userLocation[0],
        longitude: userLocation[1],
        radius: 20,
        specialization: name,
      });
      setSessionDoctors(doctors);
    } catch (e) {
      console.error('Failed to fetch nearby doctors:', e);
    }
  }

  useEffect(() => {
    if (!shouldFetchInitialDoctors || !userLocation || !sessionSpecialization.trim()) {
      return;
    }

    let cancelled = false;
    setShouldFetchInitialDoctors(false);

    (async () => {
      try {
        const doctors = await fetchNearbyDoctors({
          latitude: userLocation[0],
          longitude: userLocation[1],
          radius: 20,
          specialization: sessionSpecialization,
        });
        if (!cancelled) setSessionDoctors(doctors);
      } catch (e) {
        console.error('Failed to fetch nearby doctors:', e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shouldFetchInitialDoctors, userLocation, sessionSpecialization]);

function openSaveModal() {
  if (!userLocation) return;

  setModalData({
    address: "Current Location", // later you can replace with reverse geocode
    lat: userLocation[0],
    lng: userLocation[1],
  });

  setModalOpen(true);
}

async function handleSaveLocation(payload: any) {
  await createLocation(payload);
}

function handleSelectSavedLocation(loc: SavedLocation) {
  setUserLocation([loc.latitude, loc.longitude]);
  setActiveLocationId(loc._id);
}

useEffect(() => {
  if (loading || !user) return;

  async function loadBookmarks() {
    try {
      const res = await apiFetch('/bookmarks');
      const data = await res.json();
      if (!data.success) return;

      const ids = new Set<string>();
      const map: Record<string, string> = {};

      for (const b of data.data) {
        const doctorId: string = b.doctor._id ?? b.doctor;
        ids.add(doctorId);
        map[doctorId] = b._id;
      }

      setBookmarkedIds(ids);
      setBookmarkMap(map);
    } catch (e) {
      console.error('Failed to load bookmarks:', e);
    }
  }

  loadBookmarks();
}, [loading, user]); // re-runs when auth resolves

  // ── Toggle bookmark (optimistic) ───────────────────────────
  const toggleBookmark = async (doctorId: string | number) => {
    const id = String(doctorId);
    const alreadyBookmarked = bookmarkedIds.has(id);

    // Optimistic update
    if (alreadyBookmarked) {
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setBookmarkMap((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } else {
      setBookmarkedIds((prev) => new Set(prev).add(id));
    }

    try {
      if (alreadyBookmarked) {
        // DELETE /api/v1/bookmarks/:bookmarkId
        const bookmarkId = bookmarkMap[id];
        if (!bookmarkId) throw new Error('Bookmark ID not found for doctor ' + id);

        const res = await apiFetch(`/bookmarks/${bookmarkId}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
      } else {
        // POST /api/v1/bookmarks
        const res = await apiFetch('/bookmarks', {
          method: 'POST',
          body: JSON.stringify({ doctor: id, savedLocation: null }),
        });
        const data = await res.json();
        console.log(data);
        
        if (!data.success) throw new Error(data.message);

        // Save the new bookmark's _id so we can delete it later
        const newBookmarkId: string = data.data._id;
        setBookmarkMap((prev) => ({ ...prev, [id]: newBookmarkId }));
      }
    } catch (e) {
      console.error('Bookmark toggle failed, reverting:', e);

      // Revert optimistic update on error
      if (alreadyBookmarked) {
        setBookmarkedIds((prev) => new Set(prev).add(id));
      } else {
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setBookmarkMap((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    }
  };

  // ── Build Doctor[] from session data ───────────────────────
  const doctors: Doctor[] = useMemo(() => {
    const [userLat, userLng] = userLocation ?? DEFAULT_LOCATION;

    return sessionDoctors
      .map((doc, index) => {
        const lat =
          typeof doc.latitude === 'number'
            ? doc.latitude
            : Array.isArray(doc.location?.coordinates)
            ? Number(doc.location!.coordinates![1])
            : null;

        const lng =
          typeof doc.longitude === 'number'
            ? doc.longitude
            : Array.isArray(doc.location?.coordinates)
            ? Number(doc.location!.coordinates![0])
            : null;

        if (lat == null || lng == null) return null;

        const distanceMiles =
          typeof doc.distanceKm === 'number'
            ? Number((doc.distanceKm * 0.621371).toFixed(2))
            : Number(haversineMiles(userLat, userLng, lat, lng).toFixed(2));

        return {
          id: doc._id || doc.id || `doctor-${index + 1}`,
          name: doc.fullName || doc.name || 'Unknown Doctor',
          specialty:
            doc.specializationName ||
            doc.specialty ||
            sessionSpecialization ||
            'Specialist',
          rating: 0,
          reviews: 0,
          photo: doc.profileImage || DEFAULT_PHOTO,
          appointmentPhones: Array.isArray(doc.appointmentPhone)
            ? doc.appointmentPhone.map((p) => p.trim()).filter(Boolean)
            : [],
          appointmentWebsite: doc.appointmentWebsite?.trim() || '',
          availability: doc.consultation || 'Check schedule',
          lat,
          lng,
          distanceMiles,
        };
      })
      .filter((doc): doc is Doctor => doc !== null);
  }, [sessionDoctors, userLocation, sessionSpecialization]);

  useEffect(() => {
    if (doctors.length > 0 && selectedId === null) {
      setSelectedId(doctors[0].id);
    }
  }, [doctors, selectedId]);

  const routeToDoctor = doctors.find((d) => d.id === routeToId);
  const routeTo: [number, number] | null = routeToDoctor
    ? [routeToDoctor.lat, routeToDoctor.lng]
    : null;

  const effectiveLoc = userLocation ?? DEFAULT_LOCATION;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-surface text-text-base">
<main className="flex flex-col lg:flex-row flex-1 overflow-hidden">
  
  {/* ── Doctor List Panel ── */}
  <div
    className="
      flex flex-col
      w-full
      lg:w-[620px] xl:w-[680px]
      shrink-0
      border-b lg:border-b-0 lg:border-r
      border-border
      bg-card
      z-10
      h-[70vh] lg:h-auto
    "
  >
    {/* Header */}
    <div className="p-5 border-b border-border shrink-0">

      <h1 className="text-2xl font-bold text-text-base mb-1">
        Find a Doctor
      </h1>

      <p className="text-text-muted text-sm mb-4">
        {locLoading
          ? 'Detecting your location…'
          : locationPromptNeeded
          ? 'Allow location access to find doctors near you.'
          : 'Discover top-rated healthcare professionals near you.'}
      </p>

      {locationPromptNeeded && (
        <button
          type="button"
          onClick={requestUserLocation}
          className="mb-4 inline-flex h-8 items-center rounded-full border border-primary bg-primary/10 px-3 text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/20 transition-colors"
        >
          Use my location
        </button>
      )}

      <div className="flex items-start justify-between gap-3 mb-4">
        <div ref={specMenuRef} className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setSpecMenuOpen((open) => !open)}
            disabled={loadingSpecializations}
            className={`inline-flex h-8 max-w-full items-center gap-2 rounded-full border px-3 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-60 ${
              sessionSpecialization
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border bg-card text-text-sub hover:border-primary/40'
            }`}
          >
            <span className="truncate">
              {loadingSpecializations
                ? 'Loading specialties…'
                : sessionSpecialization || 'Select speciality'}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                specMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {specMenuOpen && !loadingSpecializations && (
            <div className="max-h-52 w-full max-w-sm overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-sm">
              {sessionSpecialization &&
                !specializations.some((s) => s.name === sessionSpecialization) && (
                  <button
                    type="button"
                    onClick={() => {
                      handleSpecializationChange(sessionSpecialization);
                      setSpecMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg border-2 border-primary bg-primary/5 px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-primary"
                  >
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary">
                      <Check className="h-2.5 w-2.5 text-white" />
                    </span>
                    <span className="truncate">{sessionSpecialization}</span>
                  </button>
                )}
              {specializations.map((spec) => {
                const isActive = sessionSpecialization === spec.name;
                return (
                  <button
                    key={spec._id}
                    type="button"
                    onClick={() => {
                      handleSpecializationChange(spec.name);
                      setSpecMenuOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg border-2 px-3 py-2 text-left text-xs font-bold uppercase tracking-wider transition-all ${
                      isActive
                        ? 'border-primary bg-primary/5 text-primary shadow-inner'
                        : 'border-transparent bg-surface text-text-base hover:border-border hover:bg-section-teal'
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                        isActive ? 'border-primary bg-primary' : 'border-border bg-card'
                      }`}
                    >
                      {isActive && <Check className="h-2.5 w-2.5 text-white" />}
                    </span>
                    <span className="truncate">{spec.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
  
        {user && (
          <div className="ml-4">
            <button
              onClick={openSaveModal}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-surface text-xs font-bold uppercase tracking-wider text-text-sub hover:bg-card transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-primary" />
              <span>Save Location</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
        <span className="text-text-muted">
          {doctors.length} doctors found
        </span>

        <button className="flex items-center gap-1.5 text-text-sub hover:text-primary transition-colors">
          <span>Specialist Near Your Area</span>
        </button>
      </div>
    </div>

    {/* Doctor Cards */}
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {doctors.length > 0 ? (
        doctors.map((doc) => (
          <DoctorCard
            key={doc.id}
            doc={doc}
            isSelected={selectedId === doc.id}
            isRouting={routeToId === doc.id}
            isFavorited={bookmarkedIds.has(String(doc.id))}
            onSelect={() => {
              setSelectedId(doc.id);
              setRouteToId(doc.id);
            }}
            onFavorite={() => toggleBookmark(doc.id)}
            onGetDirections={() => {
              setSelectedId(doc.id);
              setRouteToId(doc.id);
            }}
          />
        ))
      ) : (
        <div className="rounded-xl border border-border bg-surface p-6 text-sm text-text-muted">
          No nearby doctors found.
        </div>
      )}
    </div>
  </div>

  {/* ── Map Panel ── */}
  <div
    className="
      w-full
      h-[45vh]
      lg:h-auto
      flex-1
      relative
      overflow-hidden
    "
  >
    {userLocation ? (
      <DoctorMap
        userLocation={effectiveLoc}
        doctors={doctors.map((d, index) => ({
          id: typeof d.id === 'number' ? d.id : index + 1,
          name: d.name,
          specialty: d.specialty,
          lat: d.lat,
          lng: d.lng,
          photo: d.photo,
          isSelected: selectedId === d.id,
        }))}
        onDoctorClick={(id) => {
          setSelectedId(id);
          setRouteToId(id);
        }}
        routeTo={routeTo}
        onClearRoute={() => setRouteToId(null)}
      />
    ) : (
      <div className="flex h-full items-center justify-center bg-surface">
        <p className="text-text-muted">Loading map...</p>
      </div>
    )}
  </div>
</main>
      <SavedLocationModal
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      address={modalData?.address || ""}
      latitude={modalData?.lat || 0}
      longitude={modalData?.lng || 0}
      onSave={handleSaveLocation}
    />
    </div>
  );
}

// ── Doctor Card ───────────────────────────────────────────────
interface CardProps {
  doc: Doctor;
  isSelected: boolean;
  isRouting: boolean;
  isFavorited: boolean; // ← now a prop, not closed-over state
  onSelect: () => void;
  onFavorite: () => void;
  onGetDirections: () => void;
}

function DoctorCard({
  doc,
  isSelected,
  isRouting,
  isFavorited,
  onSelect,
  onFavorite,
  onGetDirections,
}: CardProps) {
  const router = useRouter();
  const [phonePickerOpen, setPhonePickerOpen] = useState(false);
  const primaryPhone = doc.appointmentPhones[0];

  useEffect(() => {
    if (!isSelected) setPhonePickerOpen(false);
  }, [isSelected]);

  return (
    <div
      onClick={onSelect}
      className={`group flex flex-col rounded-xl border p-4 transition-all cursor-pointer relative ${
        isSelected
          ? 'border-primary bg-primary/5 shadow-md scale-[1.01]'
          : 'border-border bg-surface hover:border-primary/50 hover:shadow-sm'
      }`}
    >
      <div
        className={`absolute top-0 left-0 w-1 h-full bg-primary transition-opacity rounded-l-xl pointer-events-none ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
        }`}
      />

      <div className="flex gap-4 min-w-0">
      <div
        className="rounded-lg w-20 h-20 shrink-0 bg-cover bg-center border border-border"
        style={{ backgroundImage: `url('${doc.photo}')` }}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h2
            className={`text-base font-bold truncate transition-colors pr-2 ${
              isSelected ? 'text-primary' : 'text-text-base group-hover:text-primary'
            }`}
          >
            {doc.name}
          </h2>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite();
            }}
            className={`transition-colors shrink-0 ${
              isFavorited ? 'text-rose-500' : 'text-text-muted hover:text-rose-500'
            }`}
          >
            <Heart className={`w-4.5 h-4.5 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        <p className="text-primary text-xs font-bold mb-1 uppercase tracking-wider">{doc.specialty}</p>

        <div className="flex items-center gap-1 text-xs text-text-muted mb-2 font-semibold">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
          <span className="font-bold text-text-base">{doc.rating.toFixed(1)}</span>
          <span>({doc.reviews} reviews)</span>
          <span className="mx-1">•</span>
          <span>{doc.distanceMiles.toFixed(1)} mi away</span>
        </div>

        <div className="flex items-center flex-wrap gap-2 mt-auto">
          {doc.availability === 'today' ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-success/10 px-2.5 py-1 text-xs font-bold text-success border border-success/20 uppercase tracking-wider">
              <span className="size-1.5 rounded-full bg-success" /> Available Today
            </span>
          ) : (
            <span className="inline-flex items-center rounded-lg bg-section-teal px-2.5 py-1 text-xs font-bold text-text-sub border border-border">
              Next: {doc.availability === 'tomorrow' ? 'Tomorrow' : doc.availability}
            </span>
          )}

          {primaryPhone ? (
            doc.appointmentPhones.length === 1 ? (
              <a
                href={phoneTelHref(primaryPhone)}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 rounded-lg bg-section-teal px-2.5 py-1 text-xs font-bold text-text-sub border border-border hover:border-primary/40 hover:text-primary transition-colors"
              >
                <Phone className="w-3 h-3 shrink-0" />
                <span>
                  Call for appointment: <span className="text-text-base">{primaryPhone}</span>
                </span>
              </a>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPhonePickerOpen((open) => !open);
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-section-teal px-2.5 py-1 text-xs font-bold text-text-sub border border-border hover:border-primary/40 hover:text-primary transition-colors text-left"
              >
                <Phone className="w-3 h-3 shrink-0" />
                <span>
                  Call for appointment:{' '}
                  <span className="text-text-base">{primaryPhone}</span>
                  {doc.appointmentPhones.length > 1 && (
                    <span className="text-text-muted font-semibold normal-case">
                      {' '}
                      (+{doc.appointmentPhones.length - 1})
                    </span>
                  )}
                </span>
              </button>
            )
          ) : doc.appointmentWebsite ? (
            <a
              href={doc.appointmentWebsite}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center rounded-lg bg-section-teal px-2.5 py-1 text-xs font-bold text-text-sub border border-border hover:border-primary/40 hover:text-primary transition-colors"
            >
              Online appointment
            </a>
          ) : (
            <span className="inline-flex items-center rounded-lg bg-section-teal px-2.5 py-1 text-xs font-bold text-text-sub border border-border">
              Call for appointment
            </span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/find_nearby_doctors/${doc.id}`);
            }}
            className="px-3 py-1.5 rounded-xl border border-primary/20 bg-primary/5 text-primary text-xs font-bold hover:bg-primary hover:text-white transition-colors"
          >
            Profile
          </button>

          {isSelected && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onGetDirections();
              }}
              className={`hidden lg:inline-flex items-center gap-1 ml-auto rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                isRouting
                  ? 'bg-primary text-white shadow-sm shadow-primary/30'
                  : 'bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-white'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{isRouting ? 'Routing' : 'Directions'}</span>
            </button>
          )}
        </div>
      </div>
      </div>

      {phonePickerOpen && doc.appointmentPhones.length > 1 && (
        <div
          className="mt-3 flex w-full flex-col gap-1.5 border-t border-border pt-3"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Choose a number to call
          </p>
          {doc.appointmentPhones.map((phone) => (
            <a
              key={phone}
              href={phoneTelHref(phone)}
              onClick={() => setPhonePickerOpen(false)}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-section-teal px-3 py-2 text-xs font-semibold text-text-base hover:border-primary/40 hover:text-primary transition-colors"
            >
              <Phone className="w-3.5 h-3.5 shrink-0 text-primary" />
              {phone}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}