'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from "next/navigation";
import { fetchNearbyDoctors } from '@/lib/findnearByDoctors';
import { apiFetch } from '@/lib/api';
import SavedLocationModal from '@/components/ModalComponent/SavedLocationModal';
import { SpecializationOption, SpecializationResponse } from '@/types/types';

type SavedLocation = {
  _id: string;
  label: "home" | "office" | "other";
  customLabel?: string;
  address: string;
  latitude: number;
  longitude: number;
};

export default function ManualSearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const specialistFromUrl = searchParams.get("specialist") || "";

  // ── SPECIALIZATION STATE ──────────────
  const [specialist, setSpecialist] = useState("");
  const [specializations, setSpecializations] = useState<SpecializationOption[]>([]);
  const [loadingSpecializations, setLoadingSpecializations] = useState(true);

  // ── MANUAL INPUTS ─────────────────────
  const [area, setArea] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [division, setDivision] = useState("");
  const [country, setCountry] = useState("Bangladesh");

  // ── SAVED LOCATIONS ───────────────────
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);

  // ── MODAL STATE (FIXED MISSING) ───────
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCoords, setModalCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [modalAddress, setModalAddress] = useState("");

  // ── FETCH SPECIALIZATIONS ─────────────
  useEffect(() => {
    async function loadSpecializations() {
      try {
        setLoadingSpecializations(true);
        const res = await apiFetch('/specializations');
        const data: SpecializationResponse = await res.json();
        if (data.success) {
          setSpecializations(data.data);
        }
      } catch (err) {
        console.error('Failed to load specializations:', err);
      } finally {
        setLoadingSpecializations(false);
      }
    }
    loadSpecializations();
  }, []);

  // ── AUTO-SELECT FROM URL ──────────────
  useEffect(() => {
    if (specialistFromUrl && specializations.length > 0) {
      // Try to find specialization by exact name match from URL
      const foundSpec = specializations.find(
        (spec) => spec.name === specialistFromUrl
      );
      if (foundSpec) {
        setSpecialist(foundSpec.name);
      } else {
        // Fallback: if not found, keep as is
        setSpecialist(specialistFromUrl);
      }
    }
  }, [specialistFromUrl, specializations]);

  // ── LOAD SAVED LOCATIONS ──────────────
  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch('/saved-locations');
        const data = await res.json();
        if (data.success) setSavedLocations(data.data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  // ── OPENSTREETMAP GEOCODING ───────────
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

  // ── MANUAL CONTINUE ────────────────────
  const handleContinue = async () => {
    const address = [area, zipcode, division, country]
      .filter(Boolean)
      .join(", ");

    const coords = await getCoordinates(address);
    if (!coords) return;

    await fetchNearbyDoctors({
      latitude: coords.lat,
      longitude: coords.lng,
      radius: 20,
      specialization: specialist,
    });

    router.push("/find_nearby_doctors");
  };

  // ── CLICK SAVED LOCATION ───────────────
  const handleSavedLocationClick = async (loc: SavedLocation) => {
    await fetchNearbyDoctors({
      latitude: loc.latitude,
      longitude: loc.longitude,
      radius: 20,
      specialization: specialist,
    });

    router.push("/find_nearby_doctors");
  };

  // ── SAVE LOCATION ───────────────────────
  const handleSaveLocation = async (data: any) => {
    const res = await apiFetch('/saved-locations', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (json.success) {
      setSavedLocations(prev => [json.data, ...prev]);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-text-base px-4 py-8">

      {/* HEADER */}
      <header className="text-center mb-10 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold">Choose Your Location</h1>
        <p className="mt-3 text-text-sub">
          Use saved location or enter manually
        </p>
      </header>

      <main className="max-w-4xl mx-auto space-y-8">

        {/* ── SAVED LOCATIONS ───────────────── */}
        {savedLocations.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold mb-3">Saved Locations</h3>

            <div className="space-y-3">
              {savedLocations.map((loc) => (
                <button
                  key={loc._id}
                  onClick={() => handleSavedLocationClick(loc)}
                  className="w-full text-left p-4 rounded-xl border border-border bg-card hover:border-primary transition"
                >
                  <div className="flex items-center gap-2 font-semibold">
                    <span>
                      {loc.label === "home"
                        ? "🏠 Home"
                        : loc.label === "office"
                        ? "🏢 Office"
                        : "📍 Other"}
                    </span>
                  </div>

                  <p className="text-sm text-text-muted mt-1">
                    {loc.customLabel ? `${loc.customLabel} - ` : ""}
                    {loc.address}
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── MANUAL INPUT ──────────────────── */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-4">

          {/* Specialization Dropdown */}
          <select
            className="input bg-card"
            value={specialist}
            onChange={(e) => setSpecialist(e.target.value)}
            disabled={loadingSpecializations}
          >
            <option value="">
              {loadingSpecializations ? "Loading specialties..." : "Select Speciality"}
            </option>
            {specializations.map((spec) => (
              <option key={spec._id} value={spec.name}>
                {spec.name}
              </option>
            ))}
          </select>

          <input
            className="input"
            placeholder="Area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          />

          <input
            className="input"
            placeholder="ZIP Code"
            value={zipcode}
            onChange={(e) => setZipcode(e.target.value)}
          />

          <input
            className="input"
            placeholder="Division"
            value={division}
            onChange={(e) => setDivision(e.target.value)}
          />

          <input
            className="input"
            placeholder="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </section>

        {/* ── SAVE LOCATION BUTTON ───────────── */}
        <button
          onClick={async () => {
            const address = [area, zipcode, division, country]
              .filter(Boolean)
              .join(", ");

            const coords = await getCoordinates(address);
            if (!coords) return;

            setModalCoords(coords);
            setModalAddress(address);
            setModalOpen(true);
          }}
          className="w-full bg-section-teal border border-primary text-primary py-3 rounded-xl"
        >
          Save This Location
        </button>

        {/* ── CONTINUE ──────────────────────── */}
        <button
          onClick={handleContinue}
          className="w-full bg-primary text-white py-3 rounded-xl font-semibold"
        >
          Continue with Manual Location
        </button>

      </main>

      {/* ── MODAL ─────────────────────────── */}
      {modalCoords && (
        <SavedLocationModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          address={modalAddress}
          latitude={modalCoords.lat}
          longitude={modalCoords.lng}
          onSave={handleSaveLocation}
        />
      )}

    </div>
  );
}