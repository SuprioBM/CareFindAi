'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import ThemeToggle from '../../components/Themes/ThemeToggle';

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
const DoctorMap = dynamic(() => import('../../components/Map/map'), {
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

      {/* ── Header ────────────────────────────────────────── */}
      <header className="flex items-center justify-between border-b border-border px-6 lg:px-10 py-3 bg-card shrink-0 z-20">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3 text-primary">
            <div className="size-6">
              <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z" />
                <path clipRule="evenodd" d="M10.4485 13.8519C10.4749 13.9271 10.6203 14.246 11.379 14.7361C12.298 15.3298 13.7492 15.9145 15.6717 16.3735C18.0007 16.9296 20.8712 17.2655 24 17.2655C27.1288 17.2655 29.9993 16.9296 32.3283 16.3735C34.2508 15.9145 35.702 15.3298 36.621 14.7361C37.3796 14.246 37.5251 13.9271 37.5515 13.8519C37.5287 13.7876 37.4333 13.5973 37.0635 13.2931C36.5266 12.8516 35.6288 12.3647 34.343 11.9175C31.79 11.0295 28.1333 10.4437 24 10.4437C19.8667 10.4437 16.2099 11.0295 13.657 11.9175C12.3712 12.3647 11.4734 12.8516 10.9365 13.2931C10.5667 13.5973 10.4713 13.7876 10.4485 13.8519ZM37.5563 18.7877C36.3176 19.3925 34.8502 19.8839 33.2571 20.2642C30.5836 20.9025 27.3973 21.2655 24 21.2655C20.6027 21.2655 17.4164 20.9025 14.7429 20.2642C13.1498 19.8839 11.6824 19.3925 10.4436 18.7877V34.1275C10.4515 34.1545 10.5427 34.4867 11.379 35.027C12.298 35.6207 13.7492 36.2054 15.6717 36.6644C18.0007 37.2205 20.8712 37.5564 24 37.5564C27.1288 37.5564 29.9993 37.2205 32.3283 36.6644C34.2508 36.2054 35.702 35.6207 36.621 35.027C37.4573 34.4867 37.5485 34.1546 37.5563 34.1275V18.7877ZM41.5563 13.8546V34.1455C41.5563 36.1078 40.158 37.5042 38.7915 38.3869C37.3498 39.3182 35.4192 40.0389 33.2571 40.5551C30.5836 41.1934 27.3973 41.5564 24 41.5564C20.6027 41.5564 17.4164 41.1934 14.7429 40.5551C12.5808 40.0389 10.6502 39.3182 9.20848 38.3869C7.84205 37.5042 6.44365 36.1078 6.44365 34.1455L6.44365 13.8546C6.44365 12.2684 7.37223 11.0454 8.39581 10.2036C9.43325 9.3505 10.8137 8.67141 12.343 8.13948C15.4203 7.06909 19.5418 6.44366 24 6.44366C28.4582 6.44366 32.5797 7.06909 35.657 8.13948C37.1863 8.67141 38.5667 9.3505 39.6042 10.2036C40.6278 11.0454 41.5563 12.2684 41.5563 13.8546Z" fillRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-text-base text-xl font-bold tracking-tight">CareFind</h2>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center rounded-full h-10 min-w-40 max-w-96 w-full border border-border bg-surface focus-within:border-primary transition-colors">
            <span className="material-symbols-outlined text-text-muted pl-4 text-[20px]">search</span>
            <input
              className="flex w-full min-w-0 flex-1 bg-transparent text-text-base focus:outline-none border-none h-full placeholder:text-text-muted px-3 text-sm"
              placeholder="Search doctors, specialties, or symptoms…"
            />
          </div>
        </div>

        <div className="flex flex-1 justify-end items-center gap-6">
          <nav className="hidden lg:flex items-center gap-5">
            <a href="#" className="text-primary font-bold text-sm border-b-2 border-primary pb-0.5">Doctors</a>
            <a href="#" className="text-text-sub hover:text-primary transition-colors text-sm font-medium">Symptom Checker</a>
            <a href="#" className="text-text-sub hover:text-primary transition-colors text-sm font-medium">Appointments</a>
          </nav>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full text-text-muted hover:bg-section-teal transition-colors relative">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-2 right-2 size-2 bg-error rounded-full" />
            </button>
            <ThemeToggle />
            <div
              className="size-10 rounded-full border-2 border-primary/20 bg-cover bg-center cursor-pointer shrink-0"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDKjomBTCUwxiSxqnlfZjJFSfpfBMb3xmOJpD4cegzGuCsacDyO5C5HcMEiaOLuCzFqs19JEXlTsiRwL4FcMjNvHI3LdzTA8TG_ltiwLlIxZZhEm5T57vGnIodHURHI2Kfq0ttXHdzquZflohk_f3ILFbFcHXkLvwpWHS3qv7x9ab1nUpDl8-gH5AN6mUM7_Wvje5-ssIcbxFNe98r2UDeJ5XZ4hKnTOA5jL35S1sawsvHgh_igWbItQHmn8n1P_ZDS-6k8ZZBiEpc')`,
              }}
            />
          </div>
        </div>
      </header>

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
