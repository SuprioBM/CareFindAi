'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';

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
  insurance: string;
  availability: 'today' | 'tomorrow' | string;
  lat: number;
  lng: number;
  distanceMiles: number;
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

const DEFAULT_LOCATION: [number, number] = [23.8103, 90.4125]; // Dhaka fallback
const DEFAULT_PHOTO = '/default-doctor.png';

// ── Dynamic Leaflet map (no SSR) ─────────────────────────────
const DoctorMap = dynamic(() => import('../../../components/Map/map'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex flex-col items-center justify-center bg-surface gap-3 text-text-muted">
      <span className="material-symbols-outlined text-[52px] text-primary/30 animate-pulse">map</span>
      <p className="text-sm">Loading map…</p>
    </div>
  ),
});

// ── Page ──────────────────────────────────────────────────────
export default function DoctorDiscoveryPage() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locLoading, setLocLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [routeToId, setRouteToId] = useState<string | number | null>(null);
  const [favorites, setFavorites] = useState<Set<string | number>>(new Set());
  const [sessionDoctors, setSessionDoctors] = useState<SessionDoctor[]>([]);
  const [sessionSpecialization, setSessionSpecialization] = useState('');
  const [sessionLoaded, setSessionLoaded] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('carefind_nearby_doctors');

    if (stored) {
      try {
        const parsed = JSON.parse(stored);

        if (parsed?.userLocation?.latitude && parsed?.userLocation?.longitude) {
          setUserLocation([
            Number(parsed.userLocation.latitude),
            Number(parsed.userLocation.longitude),
          ]);
          setLocLoading(false);
        }

        if (Array.isArray(parsed?.doctors)) {
          setSessionDoctors(parsed.doctors);
        }

        if (parsed?.specialization) {
          setSessionSpecialization(parsed.specialization);
        }
      } catch (error) {
        console.error('Failed to parse session doctors data:', error);
      }
    }

    setSessionLoaded(true);
  }, []);

  // fallback geolocation only if sessionStorage did not provide location
  useEffect(() => {
    if (!sessionLoaded || userLocation) return;

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
        setUserLocation(DEFAULT_LOCATION);
        setLocLoading(false);
      },
      { timeout: 8000, maximumAge: 60_000 }
    );
  }, [sessionLoaded, userLocation]);

  const doctors: Doctor[] = useMemo(() => {
    const [userLat, userLng] = userLocation ?? DEFAULT_LOCATION;

    return sessionDoctors
      .map((doc, index) => {
        const lat =
          typeof doc.latitude === 'number'
            ? doc.latitude
            : Array.isArray(doc.location?.coordinates)
            ? Number(doc.location.coordinates[1])
            : null;

        const lng =
          typeof doc.longitude === 'number'
            ? doc.longitude
            : Array.isArray(doc.location?.coordinates)
            ? Number(doc.location.coordinates[0])
            : null;

        if (lat == null || lng == null) return null;

        const distanceMiles =
          typeof doc.distanceKm === 'number'
            ? Number((doc.distanceKm * 0.621371).toFixed(2))
            : Number(haversineMiles(userLat, userLng, lat, lng).toFixed(2));

        return {
          id: doc._id || doc.id || `doctor-${index + 1}`,
          name: doc.fullName || doc.name || 'Unknown Doctor',
          specialty: doc.specializationName || doc.specialty || sessionSpecialization || 'Specialist',
          rating: 4.8,
          reviews: 0,
          photo: doc.profileImage || DEFAULT_PHOTO,
          insurance: doc.appointmentWebsite ? 'Online Appointment Available' : 'Call for Appointment',
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

  const toggleFav = (id: string | number) =>
    setFavorites((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });

  const routeToDoctor = doctors.find((d) => d.id === routeToId);
  const routeTo: [number, number] | null = routeToDoctor
    ? [routeToDoctor.lat, routeToDoctor.lng]
    : null;

  const effectiveLoc = userLocation ?? DEFAULT_LOCATION;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-surface text-text-base">
      <main className="flex flex-1 overflow-hidden">
        <div className="flex flex-col w-full lg:w-[620px] xl:w-[680px] shrink-0 border-r border-border bg-card z-10 flex-1 lg:flex-none">
          <div className="p-5 border-b border-border shrink-0">
            <h1 className="text-2xl font-bold text-text-base mb-1">Find a Doctor</h1>
            <p className="text-text-muted text-sm mb-4">
              {locLoading
                ? 'Detecting your location…'
                : 'Discover top-rated healthcare professionals near you.'}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {sessionSpecialization ? (
                <button className="flex h-8 items-center gap-1 rounded-full border border-primary bg-primary/10 text-primary px-3 text-sm font-medium hover:bg-primary/20 transition-colors">
                  {sessionSpecialization}
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              ) : null}

              {['Specialty', 'Availability', 'Insurance'].map((f) => (
                <button
                  key={f}
                  className="flex h-8 items-center gap-1 rounded-full border border-border bg-surface text-text-sub px-4 text-sm font-medium hover:bg-section-teal transition-colors"
                >
                  {f}
                  <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted font-medium">{doctors.length} doctors found</span>
              <button className="flex items-center gap-1.5 text-text-sub hover:text-primary transition-colors font-medium">
                <span className="material-symbols-outlined text-[18px]">sort</span>
                Sort by: Recommended
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {doctors.length > 0 ? (
              doctors.map((doc) => (
                <DoctorCard
                  key={doc.id}
                  doc={doc}
                  isSelected={selectedId === doc.id}
                  isFavorited={favorites.has(doc.id)}
                  isRouting={routeToId === doc.id}
                  onSelect={() => {
                    setSelectedId(doc.id);
                    setRouteToId(doc.id);
                  }}
                  onFavorite={() => toggleFav(doc.id)}
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

        <div className="hidden lg:flex flex-1 relative overflow-hidden">
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
            <div className="flex-1 flex flex-col items-center justify-center bg-surface gap-3 text-text-muted">
              <span className="material-symbols-outlined text-[52px] text-primary/30 animate-pulse">
                location_searching
              </span>
              <p className="text-sm">Detecting your location…</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Doctor Card ───────────────────────────────────────────────
interface CardProps {
  doc: Doctor;
  isSelected: boolean;
  isFavorited: boolean;
  isRouting: boolean;
  onSelect: () => void;
  onFavorite: () => void;
  onGetDirections: () => void;
}

function DoctorCard({
  doc,
  isSelected,
  isFavorited,
  isRouting,
  onSelect,
  onFavorite,
  onGetDirections,
}: CardProps) {
  return (
    <div
      onClick={onSelect}
      className={`group flex gap-4 rounded-xl border p-4 transition-all cursor-pointer relative overflow-hidden ${
        isSelected
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-border bg-surface hover:border-primary/50 hover:shadow-sm'
      }`}
    >
      <div
        className={`absolute top-0 left-0 w-1 h-full bg-primary transition-opacity rounded-l-xl ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
        }`}
      />

      <div
        className="rounded-lg w-20 h-20 shrink-0 bg-cover bg-center border border-border"
        style={{ backgroundImage: `url('${doc.photo}')` }}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h2
            className={`text-lg font-bold truncate transition-colors pr-2 ${
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
            <span
              className="material-symbols-outlined text-[20px]"
              style={isFavorited ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              favorite
            </span>
          </button>
        </div>

        <p className="text-primary text-sm font-medium mb-1">{doc.specialty}</p>

        <div className="flex items-center gap-1 text-sm text-text-muted mb-2">
          <span
            className="material-symbols-outlined text-[16px] text-amber-400"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
          <span className="font-bold text-text-base">{doc.rating.toFixed(1)}</span>
          <span>({doc.reviews} reviews)</span>
          <span className="mx-1">•</span>
          <span>{doc.distanceMiles.toFixed(1)} mi away</span>
        </div>

        <div className="flex items-center flex-wrap gap-2 mt-auto">
          {doc.availability === 'today' ? (
            <span className="inline-flex items-center gap-1 rounded bg-success/10 px-2 py-1 text-xs font-medium text-success border border-success/20">
              <span className="size-1.5 rounded-full bg-success" /> Available Today
            </span>
          ) : (
            <span className="inline-flex items-center rounded bg-section-teal px-2 py-1 text-xs font-medium text-text-sub border border-border">
              Next: {doc.availability === 'tomorrow' ? 'Tomorrow' : doc.availability}
            </span>
          )}

          <span className="inline-flex items-center rounded bg-section-teal px-2 py-1 text-xs font-medium text-text-sub border border-border">
            {doc.insurance}
          </span>

          {isSelected && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onGetDirections();
              }}
              className={`hidden lg:inline-flex items-center gap-1 ml-auto rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                isRouting
                  ? 'bg-primary text-white shadow-sm shadow-primary/30'
                  : 'bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">
                {isRouting ? 'route' : 'directions'}
              </span>
              {isRouting ? 'Route active' : 'Get Directions'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}