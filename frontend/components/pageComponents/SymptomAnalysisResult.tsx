'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnalysisResponse } from '@/types/types';
import { fetchNearbyDoctors } from '@/lib/findnearByDoctors';

type SymptomAnalysisResultProps = {
  analysis: AnalysisResponse | null;
  loading: boolean;
  searchedSymptoms?: string;
};

export default function SymptomAnalysisResult({
  analysis,
  loading,
  searchedSymptoms = '',
}: SymptomAnalysisResultProps) {
  const router = useRouter();
  const [findingDoctors, setFindingDoctors] = useState(false);
  const [localError, setLocalError] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

  const specialtyList = analysis?.specialists && analysis.specialists.length > 0
    ? analysis.specialists
    : analysis?.specialist
    ? [analysis.specialist]
    : [];

  const urgencyTone =
    analysis?.urgency === 'high'
      ? 'border-red-500/20 bg-red-500/10 text-red-500'
      : analysis?.urgency === 'medium'
      ? 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400'
      : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';

  function getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      });
    });
  }

  async function handleFindNearbySpecialist() {
    try {
      if (!selectedSpecialty) {
        setLocalError('Please select a recommended specialist first.');
        return;
      }

      setFindingDoctors(true);
      setLocalError('');

      const position = await getCurrentPosition();

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        radius: '20',
        specialization: selectedSpecialty.trim(),
      });
      
      await fetchNearbyDoctors({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        specialization: selectedSpecialty.trim(),
      });
      router.push('/find_nearby_doctors');

      
    } catch (err: any) {
      console.error('Find nearby specialist error:', err);

      if (err?.code === 1) {
        setLocalError('Location permission was denied. Please allow location access.');
      } else if (err?.code === 2) {
        setLocalError('Could not detect your location. Please try again.');
      } else if (err?.code === 3) {
        setLocalError('Location request timed out. Please try again.');
      } else {
        setLocalError(err?.message || 'Failed to find nearby doctors.');
      }
    } finally {
      setFindingDoctors(false);
    }
  }

  if (loading) {
    return (
      <div className="px-4 border-t border-primary/10 pt-8 mt-4">
        <h2 className="text-[22px] font-bold leading-tight pb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            psychology
          </span>
          Recommended Specialist
        </h2>

        <div className="bg-card p-6 rounded-2xl border border-primary/10 shadow-sm animate-pulse">
          <div className="h-4 w-28 bg-primary/10 rounded mb-4" />
          <div className="h-8 w-56 bg-primary/10 rounded mb-6" />
          <div className="h-8 w-24 bg-primary/10 rounded mb-6" />
          <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 space-y-3">
            <div className="h-4 w-40 bg-primary/10 rounded" />
            <div className="h-4 w-full bg-primary/10 rounded" />
            <div className="h-4 w-[92%] bg-primary/10 rounded" />
          </div>
          <div className="h-16 w-full bg-primary/10 rounded-xl mt-5" />
          <div className="h-11 w-full bg-primary/10 rounded-xl mt-5" />
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="px-4 border-t border-primary/10 pt-8 mt-4">
      <h2 className="text-[22px] font-bold leading-tight pb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">
          psychology
        </span>
        Recommended Specialist
      </h2>

      <div className="bg-card p-6 rounded-2xl border border-primary/10 shadow-sm flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-primary/10 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">
              AI Triage Assessment
            </p>
          </div>

          {analysis.urgency && (
            <div
              className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide ${urgencyTone}`}
            >
              {analysis.urgency} urgency
            </div>
          )}
        </div>

        {specialtyList.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-text-sub">
              Recommended Specialties (Select one to search doctors)
            </p>
            <div className="flex flex-col gap-3">
              {specialtyList.map((spec, index) => {
                const score = index === 0 
                  ? (analysis.score || 85) 
                  : Math.max(40, (analysis.score || 85) - (index * 15));
                const isSelected = selectedSpecialty === spec;
                
                return (
                  <div
                    key={`${spec}-${index}`}
                    onClick={() => setSelectedSpecialty(spec)}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm scale-[1.01]'
                        : 'border-primary/10 hover:border-primary/30 bg-surface'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined text-[20px] ${
                        isSelected ? 'text-primary' : 'text-text-muted'
                      }`}>
                        {isSelected ? 'radio_button_checked' : 'radio_button_unchecked'}
                      </span>
                      <span className="font-bold text-sm md:text-base text-text-base">
                        {spec}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-[10px] md:text-xs font-bold text-text-muted">
                        Match Accuracy:
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                        isSelected ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                      }`}>
                        {score}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {analysis.matchedSymptoms && analysis.matchedSymptoms.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-text-sub mb-3">
              Matched Symptoms
            </p>
            <div className="flex flex-wrap gap-2">
              {analysis.matchedSymptoms.map((symptom, index) => (
                <span
                  key={`${symptom}-${index}`}
                  className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold border border-primary/10"
                >
                  {symptom}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
          <div className="flex items-center gap-2 text-primary font-semibold mb-3">
            <span className="material-symbols-outlined text-[18px]">
              lightbulb
            </span>
            Why this specialist?
          </div>

          <p className="text-sm text-text-sub leading-relaxed">
            {analysis.explanation || 'No explanation was returned by the backend.'}
          </p>
        </div>

        {analysis.warningMessage && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">
                warning
              </span>
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-1">
                  Important Warning
                </p>
                <p className="text-sm leading-relaxed text-amber-700/90 dark:text-amber-200">
                  {analysis.warningMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {localError && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-500">
            {localError}
          </div>
        )}

        <button
          type="button"
          onClick={handleFindNearbySpecialist}
          disabled={findingDoctors || !selectedSpecialty}
          className={`flex w-full items-center justify-center rounded-xl h-11 px-5 text-sm font-bold transition-all shadow-lg ${
            selectedSpecialty && !findingDoctors
              ? 'bg-primary text-white hover:bg-primary-hover shadow-primary/20 hover:scale-[1.01]'
              : 'bg-primary/5 border border-primary/10 text-text-muted cursor-not-allowed opacity-50 shadow-none'
          }`}
        >
          <span className="material-symbols-outlined mr-2 text-[18px]">
            {findingDoctors ? 'progress_activity' : 'location_on'}
          </span>
          {findingDoctors ? 'Finding Nearby Doctors...' : 'See Nearby Specialist'}
        </button>

        <button
          type="button"
          onClick={() =>
            router.push(
              `/manual-search?specialist=${encodeURIComponent(selectedSpecialty || "")}`
            )
          }
          disabled={!selectedSpecialty}
          className={`flex w-full items-center justify-center rounded-xl h-11 px-5 text-sm font-bold transition-all shadow-lg ${
            selectedSpecialty
              ? 'bg-primary text-white hover:bg-primary-hover shadow-primary/20 hover:scale-[1.01]'
              : 'bg-primary/5 border border-primary/10 text-text-muted cursor-not-allowed opacity-50 shadow-none'
          }`}
        >
          <span className="material-symbols-outlined mr-2 text-[18px]">
            search
          </span>
          Manual Search
        </button>
      </div>
    </div>
  );
}