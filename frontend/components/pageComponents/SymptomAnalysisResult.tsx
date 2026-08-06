'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnalysisResponse } from '@/types/types';
import { fetchNearbyDoctors } from '@/lib/findnearByDoctors';
import { 
  Brain, 
  MapPin, 
  Search, 
  ShieldAlert, 
  Check, 
  Activity, 
  CheckCircle,
  Lightbulb,
  Compass,
  AlertTriangle
} from "lucide-react";

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
      <div className="border-t border-border pt-8 mt-6">
        <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-4">
          <Brain className="w-4 h-4 text-primary animate-pulse" />
          <span>Triage Results Formulation</span>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-2xl animate-pulse space-y-6">
          <div className="h-4 w-28 bg-primary/10 rounded" />
          <div className="h-8 w-56 bg-primary/10 rounded" />
          <div className="h-8 w-24 bg-primary/10 rounded" />
          <div className="bg-primary/5 rounded-xl p-4 border border-border space-y-3">
            <div className="h-4 w-40 bg-primary/10 rounded" />
            <div className="h-4 w-full bg-primary/10 rounded" />
            <div className="h-4 w-[92%] bg-primary/10 rounded" />
          </div>
          <div className="h-11 w-full bg-primary/10 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="border-t border-border pt-8 mt-6 space-y-4">
      <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
        <Brain className="w-4 h-4 text-primary" />
        <span>Clinical Consultation Referral</span>
      </div>

      <div className="bg-card p-6 rounded-2xl border border-border shadow-xl flex flex-col gap-6 transition-colors duration-300">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
              AI Triage Assessment
            </p>
          </div>

          {analysis.urgency && (
            <div
              className={`rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${urgencyTone}`}
            >
              {analysis.urgency} urgency
            </div>
          )}
        </div>

        {specialtyList.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-text-sub uppercase tracking-wider">
              Recommended Specialties (Select one to proceed)
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
                        ? 'border-primary bg-primary/5 shadow-inner scale-[1.01]'
                        : 'border-border hover:border-text-muted bg-surface'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-primary bg-primary' : 'border-border bg-card'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="font-bold text-sm md:text-base text-text-base">
                        {spec}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-[10px] md:text-xs font-bold text-text-muted">
                        Match Score:
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
            <p className="text-[10px] font-bold text-text-sub uppercase tracking-wider mb-2">
              Extracted Symptoms
            </p>
            <div className="flex flex-wrap gap-2">
              {analysis.matchedSymptoms.map((symptom, index) => (
                <span
                  key={`${symptom}-${index}`}
                  className="rounded-lg bg-primary/10 text-primary px-3 py-1 text-xs font-bold border border-primary/10"
                >
                  {symptom}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="bg-primary/5 rounded-xl p-4 border border-primary/20 space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <Lightbulb className="w-4 h-4 text-primary shrink-0" />
            <span>Clinical Explanation</span>
          </div>

          <p className="text-xs text-text-sub leading-relaxed font-semibold">
            {analysis.explanation || 'No explanation was returned by the backend.'}
          </p>
        </div>

        {analysis.warningMessage && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                  Urgent Precaution Warning
                </p>
                <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-200 font-semibold">
                  {analysis.warningMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {localError && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3.5 text-xs text-red-500 font-semibold">
            {localError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={handleFindNearbySpecialist}
            disabled={findingDoctors || !selectedSpecialty}
            className={`flex items-center justify-center rounded-xl h-12 px-5 text-xs font-bold uppercase tracking-wider transition-all shadow-lg ${
              selectedSpecialty && !findingDoctors
                ? 'bg-primary text-white hover:bg-primary-hover shadow-primary/25 hover:scale-[1.01]'
                : 'bg-primary/5 border border-border text-text-muted cursor-not-allowed opacity-50 shadow-none'
            }`}
          >
            {findingDoctors ? (
              <Activity className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4 mr-2" />
            )}
            {findingDoctors ? 'Formulating Directory...' : 'See Nearby Specialist'}
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(
                `/manual-search?specialist=${encodeURIComponent(selectedSpecialty || "")}`
              )
            }
            disabled={!selectedSpecialty}
            className={`flex items-center justify-center rounded-xl h-12 px-5 text-xs font-bold uppercase tracking-wider transition-all shadow-lg ${
              selectedSpecialty
                ? 'bg-primary text-white hover:bg-primary-hover shadow-primary/25 hover:scale-[1.01]'
                : 'bg-primary/5 border border-border text-text-muted cursor-not-allowed opacity-50 shadow-none'
            }`}
          >
            <Search className="w-4 h-4 mr-2" />
            <span>Manual Specialist Search</span>
          </button>
        </div>
      </div>
    </div>
  );
}