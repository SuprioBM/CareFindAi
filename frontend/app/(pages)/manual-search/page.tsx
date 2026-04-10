'use client';

import { useMemo, useState } from 'react';
import { useSearchParams, useRouter } from "next/navigation";
import { fetchNearbyDoctors } from '@/lib/findnearByDoctors';

type LocationResult = {
  code: string;
  area: string;
  details: string;
  value: string;
};

const locationResults: LocationResult[] = [
  {
    code: 'DH',
    area: 'Dhanmondi',
    details: '8 Clinics, 3 General Hospitals nearby',
    value: 'dhanmondi',
  },
  {
    code: 'GU',
    area: 'Gulshan',
    details: '12 Clinics, 5 Specialty Centers nearby',
    value: 'gulshan',
  },
  {
    code: 'BA',
    area: 'Banani',
    details: '6 Clinics, 2 Diagnostic Centers nearby',
    value: 'banani',
  },
];

export default function ManualSearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const specialist = searchParams.get("specialist") || "";

  // ✅ structured inputs (NEW)
  const [city, setCity] = useState("Dhaka");
  const [areaInput, setAreaInput] = useState("");
  const [zip, setZip] = useState("");

  const [selectedLocation, setSelectedLocation] = useState('dhanmondi');

  const selectedLocationLabel = useMemo(() => {
    const item = locationResults.find((location) => location.value === selectedLocation);
    return item ? `${item.area}, Bangladesh` : 'Select an area';
  }, [selectedLocation]);

  // ✅ OpenStreetMap geocoding
  async function getCoordinates(address: string) {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`
    );

    const data = await res.json();

    if (!data?.length) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  }

  // ✅ CONTINUE FLOW
  const handleContinue = async () => {
  const selected = locationResults.find(
    (loc) => loc.value === selectedLocation
  );

  if (!selected) return;

  const address = [
    areaInput || selected.area,
    city,
    zip,
    "Bangladesh",
  ]
    .filter(Boolean)
    .join(", ");

  try {

    // ⚠️ we still need geocoding (important)
    const coords = await getCoordinates(address);

    if (!coords) {
      console.log("Location not found");
      return;
    }

    // 🔁 second call with real coords
    await fetchNearbyDoctors({
      latitude: coords.lat,
      longitude: coords.lng,
      radius: 20,
      specialization: specialist,
    });

    router.push("/find_nearby_doctors");
  } catch (err) {
    console.error(err);
  }
};

  return (
    <div className="min-h-screen bg-surface text-text-base px-4 sm:px-6 lg:px-8 py-8">

      {/* HEADER (UNCHANGED STYLE) */}
      <section className="w-full max-w-4xl mx-auto mb-8">
        <div className="bg-amber-900/20 border border-amber-500/50 rounded-xl p-4 flex items-center gap-4 text-amber-200">
          <span className="material-symbols-outlined text-amber-400">info</span>
          <p className="text-sm font-medium">
            <span className="font-bold">Manual location required.</span>{' '}
            Please provide your area details to find nearby doctors and hospitals.
          </p>
        </div>
      </section>

      {/* TITLE (UNCHANGED) */}
      <header className="text-center mb-10 max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Choose Your Location
        </h1>
        <p className="mt-3 text-text-sub max-w-lg mx-auto">
          Help us connect you with the right healthcare professionals.
        </p>
      </header>

      <main className="w-full max-w-4xl mx-auto space-y-8">

        {/* ✅ STRUCTURED INPUT (REPLACED OLD SEARCH UI) */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-2xl space-y-4">

          <input
            className="block w-full p-4 bg-surface border border-border rounded-xl"
            placeholder="City (e.g. Dhaka)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <input
            className="block w-full p-4 bg-surface border border-border rounded-xl"
            placeholder="Area (e.g. Dhanmondi, Gulshan)"
            value={areaInput}
            onChange={(e) => setAreaInput(e.target.value)}
          />

          <input
            className="block w-full p-4 bg-surface border border-border rounded-xl"
            placeholder="ZIP Code (optional)"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
          />
        </div>

        {/* LOCATION LIST (UNCHANGED CORE UX) */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">location_on</span>
            Suggested Areas
          </h3>

          <div className="space-y-3">
            {locationResults.map((result) => {
              const isSelected = selectedLocation === result.value;

              return (
                <label
                  key={result.value}
                  className={`flex items-center justify-between p-4 bg-card border rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary shadow-[0_0_0_1px_rgba(20,184,166,0.35)]'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-surface rounded-lg flex items-center justify-center">
                      <span className="text-secondary font-bold">{result.code}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{result.area}</p>
                      <p className="text-xs text-text-muted">{result.details}</p>
                    </div>
                  </div>

                  <input
                    checked={isSelected}
                    className="h-5 w-5 accent-primary"
                    type="radio"
                    onChange={() => setSelectedLocation(result.value)}
                  />
                </label>
              );
            })}
          </div>
        </section>

        {/* SELECTED LOCATION (UNCHANGED UI) */}
        <div className="bg-primary/10 border-2 border-primary border-dashed rounded-2xl p-6 flex justify-between items-center">
          <div>
            <p className="text-xs uppercase text-primary font-bold">
              Selected Location
            </p>
            <p className="text-lg font-bold">{selectedLocationLabel}</p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end">
          <button
            onClick={handleContinue}
            className="px-10 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold"
          >
            Continue
          </button>
        </div>

      </main>

      <footer className="mt-16 text-center text-text-muted text-sm">
        <p>© 2026 CareFind Health-Tech Solutions. All rights reserved.</p>
      </footer>
    </div>
  );
}