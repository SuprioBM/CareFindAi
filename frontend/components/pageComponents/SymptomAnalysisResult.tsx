'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { AnalysisResponse, NearbyDoctorsResponse } from '@/types/types';

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
      if (!analysis?.specialist?.trim()) {
        setLocalError('No recommended specialist found yet.');
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
        specialization: analysis.specialist.trim(),
      });
      

      const res = await apiFetch(`/doctors/nearby/search?${params.toString()}`, {
        method: 'GET',
      });
     console.log(res);
     
      const rawText = await res.text();

      let parsed: NearbyDoctorsResponse | null = null;

      try {
        parsed = rawText ? JSON.parse(rawText) : null;
      } catch (parseError) {
        console.error('Nearby doctors JSON parse error:', parseError);
        throw new Error('Frontend could not parse nearby doctors response.');
      }

      if (!res.ok) {
        throw new Error(parsed?.message || 'Failed to fetch nearby doctors.');
      }

      const nearbyDoctorsData = parsed;

      sessionStorage.setItem(
        'carefind_nearby_doctors',
        JSON.stringify({
          userLocation: {
            latitude,
            longitude,
          },
          specialization: nearbyDoctorsData?.specialization ?? analysis.specialist ?? null,
          doctors: nearbyDoctorsData?.data ?? [],
          fromSymptomsPage: true,
          searchedSymptoms,
        })
      );

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
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70 mb-2">
              AI Recommendation
            </p>

            <h3 className="font-bold text-3xl text-primary">
              {analysis.specialist || 'No specialist found'}
            </h3>
          </div>

          {analysis.urgency && (
            <div></div>
            // <div
            //   className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide ${urgencyTone}`}
            // >
            //   {analysis.urgency} urgency
            // </div>
          )}
        </div>

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

        {/* <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
          <div className="flex items-center gap-2 text-primary font-semibold mb-3">
            <span className="material-symbols-outlined text-[18px]">
              lightbulb
            </span>
            Why this specialist?
          </div>

          <p className="text-sm text-text-sub leading-relaxed">
            {analysis.explanation || 'No explanation was returned by the backend.'}
          </p>
        </div> */}

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
          disabled={findingDoctors || !analysis?.specialist}
          className="flex w-full items-center justify-center rounded-xl h-11 px-5 bg-primary text-white text-sm font-bold hover:bg-primary-hover disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined mr-2 text-[18px]">
            {findingDoctors ? 'progress_activity' : 'location_on'}
          </span>
          {findingDoctors ? 'Finding Nearby Doctors...' : 'See Nearby Specialist'}
        </button>
      </div>
    </div>
  );
}