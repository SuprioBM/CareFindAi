'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { AnalysisResponse } from '@/types/types';
import SymptomAnalysisResult from '@/components/pageComponents/SymptomAnalysisResult';

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

  return (
    <div className="bg-surface text-text-base min-h-screen">
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
            disabled={loading}
            className="flex min-w-[100px] cursor-pointer items-center justify-center rounded-xl h-12 px-6 bg-primary/10 hover:bg-primary/20 disabled:opacity-70 disabled:cursor-not-allowed text-text-sub text-base font-bold transition-colors"
          >
            Clear
          </button>
        </div>

        <SymptomAnalysisResult
          analysis={analysis}
          loading={loading}
          searchedSymptoms={symptoms}
        />
      </div>
    </div>
  );
}