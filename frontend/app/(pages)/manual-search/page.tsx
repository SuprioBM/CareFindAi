'use client';

import { useMemo, useState } from 'react';

type LocationResult = {
  code: string;
  area: string;
  details: string;
  value: string;
};

const manualEntryShortcuts = [
  { icon: 'map', label: 'Map Pin' },
  { icon: 'apartment', label: 'Browse City' },
  { icon: 'pin', label: 'ZIP Code' },
  { icon: 'sync_alt', label: 'Select Region' },
];

const locationResults: LocationResult[] = [
  {
    code: 'DH',
    area: 'Dhanmondi, Dhaka',
    details: '8 Clinics, 3 General Hospitals nearby',
    value: 'dhanmondi',
  },
  {
    code: 'GU',
    area: 'Gulshan, Dhaka',
    details: '12 Clinics, 5 Specialty Centers nearby',
    value: 'gulshan',
  },
  {
    code: 'BA',
    area: 'Banani, Dhaka',
    details: '6 Clinics, 2 Diagnostic Centers nearby',
    value: 'banani',
  },
];

export default function ManualSearchPage() {
  const [query, setQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('dhanmondi');

  const selectedLocationLabel = useMemo(() => {
    const item = locationResults.find((location) => location.value === selectedLocation);
    return item ? `${item.area}, BD` : 'Select an area';
  }, [selectedLocation]);

  return (
    <div className="min-h-screen bg-surface text-text-base px-4 sm:px-6 lg:px-8 py-8">
      <section className="w-full max-w-4xl mx-auto mb-8">
        <div className="bg-amber-900/20 border border-amber-500/50 rounded-xl p-4 flex items-center gap-4 text-amber-200">
          <span className="material-symbols-outlined text-amber-400">info</span>
          <p className="text-sm font-medium">
            <span className="font-bold">Automatic location detection is unavailable.</span>{' '}
            Please search and select your area manually to find nearby doctors and hospitals.
          </p>
        </div>
      </section>

      <header className="text-center mb-10 max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Choose Your Location</h1>
        <p className="mt-3 text-text-sub max-w-lg mx-auto">
          Help us connect you with the right healthcare professionals in your vicinity.
        </p>
      </header>

      <main className="w-full max-w-4xl mx-auto space-y-8">
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-2xl">
          <div className="relative flex flex-col md:flex-row gap-4">
            <div className="relative grow">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </div>
              <input
                className="block w-full pl-11 pr-4 py-4 bg-surface border border-border rounded-xl text-text-base placeholder:text-text-muted focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                id="location-input"
                placeholder="Enter City, Area, or ZIP code..."
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <button className="bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_15px_-3px_rgba(20,184,166,0.3)] flex items-center justify-center gap-2">
              <span>Search Area</span>
            </button>
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {manualEntryShortcuts.map((item) => (
              <button
                key={item.label}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-surface/60 hover:bg-surface hover:border-accent transition-colors group"
              >
                <span className="material-symbols-outlined text-accent mb-2 text-[24px]">{item.icon}</span>
                <span className="text-xs font-medium text-text-sub group-hover:text-text-base">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-text-muted mr-2 uppercase tracking-wider">Refine By:</span>
          <button className="bg-surface hover:bg-border/50 text-text-sub text-xs font-medium px-4 py-2 rounded-full border border-border transition-all flex items-center gap-2">
            Distance: <span className="text-primary">5km</span>
            <span className="material-symbols-outlined text-[14px]">keyboard_arrow_down</span>
          </button>
          <button className="bg-surface hover:bg-border/50 text-text-sub text-xs font-medium px-4 py-2 rounded-full border border-border transition-all flex items-center gap-2">
            Specialization: <span className="text-primary">All</span>
            <span className="material-symbols-outlined text-[14px]">keyboard_arrow_down</span>
          </button>
          <button className="bg-surface hover:bg-border/50 text-text-sub text-xs font-medium px-4 py-2 rounded-full border border-border transition-all flex items-center gap-2">
            Care Type
            <span className="material-symbols-outlined text-[14px]">keyboard_arrow_down</span>
          </button>
        </div>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-text-base flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">location_on</span>
            Suggested Locations
          </h3>

          <div className="space-y-3">
            {locationResults.map((result) => {
              const isSelected = selectedLocation === result.value;

              return (
                <label
                  key={result.value}
                  className={`flex items-center justify-between p-4 bg-card border rounded-xl cursor-pointer transition-all ${
                    isSelected ? 'border-primary shadow-[0_0_0_1px_rgba(20,184,166,0.35)]' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-surface rounded-lg flex items-center justify-center">
                      <span className="text-secondary font-bold">{result.code}</span>
                    </div>
                    <div>
                      <p className="text-text-base font-semibold">{result.area}</p>
                      <p className="text-xs text-text-muted">{result.details}</p>
                    </div>
                  </div>
                  <input
                    checked={isSelected}
                    className="h-5 w-5 accent-primary"
                    name="location-select"
                    type="radio"
                    value={result.value}
                    onChange={() => setSelectedLocation(result.value)}
                  />
                </label>
              );
            })}
          </div>
        </section>

        <div className="bg-primary/10 border-2 border-primary border-dashed rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-full">
              <span className="material-symbols-outlined text-primary">check</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-primary font-bold">Selected Location</p>
              <p className="text-lg font-bold text-text-base">{selectedLocationLabel}</p>
            </div>
          </div>
          <button className="text-text-sub text-sm hover:text-text-base underline underline-offset-4 decoration-primary/50">
            Change Selection
          </button>
        </div>

        <div className="pt-6 border-t border-border flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
          <button className="w-full sm:w-auto px-8 py-3 text-text-sub font-medium hover:text-text-base transition-colors">
            Cancel and Go Back
          </button>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
            <button className="w-full sm:w-auto px-8 py-3 bg-surface text-text-base border border-border rounded-xl font-semibold hover:bg-border/40 transition-all">
              Skip for now
            </button>
            <button className="w-full sm:w-auto px-10 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-[0_0_15px_-3px_rgba(20,184,166,0.3)] transition-all">
              Continue
            </button>
          </div>
        </div>
      </main>

      <footer className="mt-16 text-center text-text-muted text-sm">
        <p>© 2026 CareFind Health-Tech Solutions. All rights reserved.</p>
      </footer>
    </div>
  );
}
