'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import ThemeToggle from '../../../components/Themes/ThemeToggle';

// ── Types ─────────────────────────────────────────────────────
interface DoctorTemplate {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  photo: string;
  insurance: string;
  availability: 'today' | 'tomorrow' | string;
  latOffset: number;
  lngOffset: number;
}
interface Doctor extends DoctorTemplate {
  lat: number;
  lng: number;
  distanceMiles: number;
}

// ── Mock data ─────────────────────────────────────────────────
const DOCTORS_RAW: DoctorTemplate[] = [
  {
    id: 1,
    name: 'Dr. Sarah Chen, MD',
    specialty: 'Cardiologist',
    rating: 4.9,
    reviews: 120,
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCu0jWneb5XWqzh_xosVra8RVHeAzJTUKZP0UMb9FL5tLPmypnQrccfFgIL5SE0x_uRkm266kBlSmlCmLFV7s835pnWBARvD9gg4vgpbjQLAG7x_YeGDGJy00U7Gx1ST47c-xeNXqDY6OCk-BJ_QBQ8ALN5eMsMjysJe3mc0AnvElZu088PxkFbns-AGmUsLYkqB_Mo7RNTaMN-w0bgxLmkLoixGFVXXjEJKH4PGdLlaSQ4Y64LcMbd8upH72FbXraOTa2bmQQlFQg',
    insurance: 'Aetna, Cigna +5',
    availability: 'today',
    latOffset:  0.0080,
    lngOffset: -0.0050,
  },
  {
    id: 2,
    name: 'Dr. Marcus Johnson, MD',
    specialty: 'Interventional Cardiologist',
    rating: 4.8,
    reviews: 85,
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_RwjpYXFvrcU-wC9fcGDVEbKhw2B3xUE-_ruaL5KqUl_LXqEDTF7VmRHJdw_JTWtTM5mgjoSP3YgGXET4MVajXKuX3TR-VJ3xjZgm4clFISdn982TTlO3TiDOQLYXVFY2Qmrl7Fs25EcWuImN-ktHZhqGumEvwxVcCPPIQDx65UkGUcGoTHVBP5Zd5-nEu5b8W5EzUfcNoWyTiAxe4nsGyvwUFKxNYQpQHObeKpDWoWcurvbmIbbb8wrJeh9tGHnq_3Zzc8pDnng',
    insurance: 'BlueCross, UHC +3',
    availability: 'tomorrow',
    latOffset: -0.0040,
    lngOffset:  0.0090,
  },
  {
    id: 3,
    name: 'Dr. Elena Rodriguez, DO',
    specialty: 'Pediatric Cardiologist',
    rating: 5.0,
    reviews: 210,
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPm9lhDklQVmU4FttLTilDXml8bz6Eg_rL_a7-dByXJo1BJzow1UiHIIZQ5vqoVSzJpC10ZZyIBWo3K79--SH9uWRgA84Qp0OJfon5WnSWxTAfEhZXzqGOXuaI7IY0B7ZOPHzSsfvwBeOd7G-sUONR44KITuWIx9LYAHheri2fIfNLiPK59IPJoMSdM5JRTqKc87ndtXceIMcyyJ9PHJpvjtPVI_5NcqqTbppClbNERnRHUbNCBatGhKEfPRa83PpV5GbG9QI',
    insurance: 'All Major Insurances',
    availability: 'today',
    latOffset:  0.0020,
    lngOffset:  0.0120,
  },
  {
    id: 4,
    name: 'Dr. James Park, MD',
    specialty: 'Neurologist',
    rating: 4.7,
    reviews: 95,
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDO_is0yd9AnwT8j9cc6aloIH3lseaW2Lg_feN9NIAgwPHmpQ_HzEWWTbbCdOxkt7_7OZZOpWHgvS-Cjzn0sDOlHmJZ-XRZQaTw4wyotNhNiODreItEIsekQLlKJdRUUYZNJpgqa_24Ln_0mYsEQjzk9rESngb3mCcFJkJG27PUlIvoQ1WKjZjdoDBWetUdiYZwczftn2uNiIQQyvF7r8r-X6-SyEBoIHe5LmHAHxjTE9JJ4VCLEOVy_MaQ6npCrJmvGOS2wJIoZEQ',
    insurance: 'Cigna, Aetna +2',
    availability: 'today',
    latOffset: -0.0090,
    lngOffset: -0.0060,
  },
  {
    id: 5,
    name: 'Dr. Priya Patel, MBBS',
    specialty: 'Dermatologist',
    rating: 4.6,
    reviews: 143,
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNXtVZTyMs6HtHwt0MDHzz1VNhuxWvUw0G69If65UBnHEYpb4ZP1EJO5i7RQbp_OzGfCLhmLvCKNvKeyp8xTEZ61WAyAgMaz_ei99dnMRt2k58s0NcxpG_LtqF0OEZpRzPiBSBj42tNZpnHMqitXTJ_2jbkUMzYRUZA7vmtGMQgcsYM7gvjzv6jEyVee_KpCQl9M_HF4pZ5OZTgJ_lyLmg7MbcORKP_i8yVLE_3fr-p2j3uApsocrXSG-6EYIY-IBsPT1xC_Qbgjk',
    insurance: 'UHC, Medicare +4',
    availability: 'Fri, Mar 20',
    latOffset:  0.0110,
    lngOffset:  0.0030,
  },
  {
    id: 6,
    name: 'Dr. Alan Lee, MD',
    specialty: 'Orthopedic Surgeon',
    rating: 4.9,
    reviews: 178,
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbRS4xf1yNh4QZiGTwnPR4FJ7EEQEBrlmJ9GklDvTYg0zxTWfpHaKm9yVQfm-WmgGa7bMrKwVNqN90lZgsVSD3d49O9woeYlGKAVArAVgTNc8tBiTH9o0zbYkKyqsC_gQHZkFNYnW2Qazo-AJBrIpS8thg3peCKugzkG_oweh7HhjyLvyX4-OqCgTc3GAn9NguVeS61DpnziRKQ760YzHOOm6jVHv71bTlLiLaLlwv_GlFx_wj6NzPrAx129oFVCPQf_ZdVncEWds',
    insurance: 'BlueCross, Aetna +6',
    availability: 'tomorrow',
    latOffset: -0.0060,
    lngOffset:  0.0150,
  },
];

// ── Haversine distance (miles) ────────────────────────────────
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

const DEFAULT_LOCATION: [number, number] = [40.7128, -74.006]; // NYC fallback

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
  const [locLoading, setLocLoading]     = useState(true);
  const [selectedId, setSelectedId]     = useState<number | null>(1);
  const [routeToId,   setRouteToId]      = useState<number | null>(null);
  const [favorites,  setFavorites]      = useState<Set<number>>(new Set([3]));

  // Request geolocation once on mount
  useEffect(() => {
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
      { timeout: 8000, maximumAge: 60_000 },
    );
  }, []);

  // Derive doctor objects with real-ish coordinates near user
  const doctors: Doctor[] = useMemo(() => {
    const [lat, lng] = userLocation ?? DEFAULT_LOCATION;
    return DOCTORS_RAW.map((d) => {
      const dLat = lat + d.latOffset;
      const dLng = lng + d.lngOffset;
      return { ...d, lat: dLat, lng: dLng, distanceMiles: haversineMiles(lat, lng, dLat, dLng) };
    });
  }, [userLocation]);

  const toggleFav = (id: number) =>
    setFavorites((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });

  // Derive routeTo coords from the routeToId
  const routeToDoctor = doctors.find((d) => d.id === routeToId);
  const routeTo: [number, number] | null = routeToDoctor
    ? [routeToDoctor.lat, routeToDoctor.lng]
    : null;

  const effectiveLoc = userLocation ?? DEFAULT_LOCATION;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-surface text-text-base">

      {/* ── Split layout ──────────────────────────────────── */}
      <main className="flex flex-1 overflow-hidden">

        {/* ── Left panel — doctor list ── */}
        <div className="flex flex-col w-full lg:w-[620px] xl:w-[680px] shrink-0 border-r border-border bg-card z-10 flex-1 lg:flex-none">

          {/* Filter / stats bar */}
          <div className="p-5 border-b border-border shrink-0">
            <h1 className="text-2xl font-bold text-text-base mb-1">Find a Doctor</h1>
            <p className="text-text-muted text-sm mb-4">
              {locLoading
                ? 'Detecting your location…'
                : 'Discover top-rated healthcare professionals near you.'}
            </p>

            {/* Filter chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button className="flex h-8 items-center gap-1 rounded-full border border-primary bg-primary/10 text-primary px-3 text-sm font-medium hover:bg-primary/20 transition-colors">
                Cardiology
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
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

          {/* Scrollable cards */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {doctors.map((doc) => (
              <DoctorCard
                key={doc.id}
                doc={doc}
                isSelected={selectedId === doc.id}
                isFavorited={favorites.has(doc.id)}
                isRouting={routeToId === doc.id}
                onSelect={() => { setSelectedId(doc.id); setRouteToId(doc.id); }}
                onFavorite={() => toggleFav(doc.id)}
                onGetDirections={() => { setSelectedId(doc.id); setRouteToId(doc.id); }}
              />
            ))}
          </div>
        </div>

        {/* ── Right panel — Leaflet map ── */}
        <div className="hidden lg:flex flex-1 relative overflow-hidden">
          {userLocation ? (
            <DoctorMap
              userLocation={effectiveLoc}
              doctors={doctors.map((d) => ({
                id: d.id,
                name: d.name,
                specialty: d.specialty,
                lat: d.lat,
                lng: d.lng,
                photo: d.photo,
                isSelected: selectedId === d.id,
              }))}
              onDoctorClick={(id) => { setSelectedId(id); setRouteToId(id); }}
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

function DoctorCard({ doc, isSelected, isFavorited, isRouting, onSelect, onFavorite, onGetDirections }: CardProps) {
  return (
    <div
      onClick={onSelect}
      className={`group flex gap-4 rounded-xl border p-4 transition-all cursor-pointer relative overflow-hidden ${
        isSelected
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-border bg-surface hover:border-primary/50 hover:shadow-sm'
      }`}
    >
      {/* Accent bar */}
      <div
        className={`absolute top-0 left-0 w-1 h-full bg-primary transition-opacity rounded-l-xl ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
        }`}
      />

      {/* Photo */}
      <div
        className="rounded-lg w-20 h-20 shrink-0 bg-cover bg-center border border-border"
        style={{ backgroundImage: `url('${doc.photo}')` }}
      />

      {/* Info */}
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
            onClick={(e) => { e.stopPropagation(); onFavorite(); }}
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

          {/* Route indicator — visible when card is selected */}
          {isSelected && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isRouting) onGetDirections(); // acts as toggle-off handled by parent
                else onGetDirections();
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
