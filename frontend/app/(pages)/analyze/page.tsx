'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ThemeToggle from '../../../components/Themes/ThemeToggle';
import { apiFetch } from '@/lib/api';

type AnalysisResponse = {
  specialist?: string;
  explanation?: string;
  urgency?: 'low' | 'medium' | 'high' | string;
  warningMessage?: string;
  matchedSymptoms?: string[];
  canShowDoctors?: boolean;
};

export default function SymptomsPage() {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('analysis state changed:', analysis);
  }, [analysis]);

  async function analyzeSymptoms() {
    if (!symptoms.trim()) {
      setError('Please describe your symptoms first.');
      setAnalysis(null);
      return;
    }

    try {
      setLoading(true);
      setError('');
      setAnalysis(null);

      const res = await apiFetch('/ai/analyze', {
        method: 'POST',
        body: JSON.stringify({ symptoms }),
      });


      const rawText = await res.text();

      let parsed: any = null;

      try {
        parsed = rawText ? JSON.parse(rawText) : null;
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Frontend could not parse backend response.');
      }

      if (!res.ok) {
        throw new Error(parsed?.message || 'Failed to analyze symptoms.');
      }

      const finalData: AnalysisResponse = parsed?.data ?? parsed;


      setAnalysis(finalData);
    } catch (err: any) {
      console.error('Analyze symptoms error:', err);
      setError(err?.message || 'Failed to analyze symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function clearAll() {
    setSymptoms('');
    setAnalysis(null);
    setError('');
  }

  const urgencyTone =
    analysis?.urgency === 'high'
      ? 'border-red-500/20 bg-red-500/10 text-red-500'
      : analysis?.urgency === 'medium'
      ? 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400'
      : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';

  return (
    <div className="bg-surface text-text-base min-h-screen">
      <header className="flex items-center justify-between border-b border-primary/20 px-10 py-3 bg-surface sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-primary text-2xl">
            health_and_safety
          </span>
          <h2 className="text-lg font-bold tracking-tight">CareFind</h2>
        </div>

        <div className="flex flex-1 justify-end items-center gap-8">
          <nav className="hidden md:flex items-center gap-6">
            {[
              ['Home', '/'],
              ['Doctors', '#'],
              ['Appointments', '#'],
              ['Records', '#'],
            ].map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className="text-sm font-medium text-text-sub hover:text-primary transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex gap-2 items-center">
            <ThemeToggle />

            <Link
              href="/login"
              className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-xl h-10 px-4 bg-primary hover:bg-primary-hover text-white text-sm font-bold transition-colors"
            >
              Sign In
            </Link>

            <button className="flex cursor-pointer items-center justify-center rounded-xl h-10 bg-primary/10 hover:bg-primary/20 text-primary w-10 transition-colors">
              <span className="material-symbols-outlined text-xl">
                notifications
              </span>
            </button>

            <button className="flex cursor-pointer items-center justify-center rounded-xl h-10 bg-primary/10 hover:bg-primary/20 text-primary w-10 transition-colors">
              <span className="material-symbols-outlined text-xl">person</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[960px] mx-auto px-4 py-6">
        <div className="flex flex-wrap justify-between gap-3 px-4 py-6">
          <div className="flex min-w-72 flex-col gap-3">
            <p className="text-4xl font-black leading-tight tracking-tight">
              Describe your symptoms
            </p>
            <p className="text-text-muted text-base leading-normal">
              Our AI will analyze your symptoms and recommend the most relevant
              specialist for your case.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-4 py-3">
          <label className="flex flex-col w-full relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-700 pointer-events-none" />
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="E.g. I have had a continuous headache, mild fever, and fatigue for the last two days..."
              className="relative flex w-full resize-none overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-primary border border-primary/20 bg-card min-h-40 placeholder:text-text-muted p-5 text-lg font-normal leading-relaxed"
            />
            <div className="absolute bottom-4 right-4">
              <button
                type="button"
                title="Use Microphone"
                className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-xl">mic</span>
              </button>
            </div>
          </label>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-500">
              {error}
            </div>
          )}
        </div>

        <div className="flex flex-1 gap-4 flex-wrap px-4 py-3 mb-8">
          <button
            onClick={analyzeSymptoms}
            disabled={loading}
            className="flex min-w-[120px] cursor-pointer items-center justify-center rounded-xl h-12 px-6 bg-primary hover:bg-primary-hover disabled:opacity-70 disabled:cursor-not-allowed text-white text-base font-bold shadow-lg shadow-primary/30 transition-all hover:scale-[1.02]"
          >
            <span className="material-symbols-outlined mr-2">
              {loading ? 'hourglass_top' : 'auto_awesome'}
            </span>
            {loading ? 'Analyzing...' : 'Analyze Symptoms'}
          </button>

          <button
            type="button"
            onClick={clearAll}
            className="flex min-w-[100px] cursor-pointer items-center justify-center rounded-xl h-12 px-6 bg-primary/10 hover:bg-primary/20 text-text-sub text-base font-bold transition-colors"
          >
            Clear
          </button>
        </div>

        {loading && (
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
        )}

        {!loading && analysis && (
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
                  <div
                    className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide ${urgencyTone}`}
                  >
                    {analysis.urgency} urgency
                  </div>
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

              <button className="flex w-full items-center justify-center rounded-xl h-11 px-5 bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined mr-2 text-[18px]">
                  location_on
                </span>
                See Nearby Specialist
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}