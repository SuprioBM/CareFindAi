/**
 * User shall view their previous symptom searches along with the AI-recommended specialists.
 *
 * This is the "Previous Searches" page, accessible from the user dashboard.
 * It fetches all past AI symptom assessments the user has made and displays them
 * in a timeline-style list (newest first).
 *
 * When the user clicks a search in the list, the full AI result is shown below —
 * including the recommended specialist, urgency level, AI explanation, and matched symptoms.
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import SymptomAnalysisResult from '@/components/pageComponents/SymptomAnalysisResult';
import Pagination from '@/components/pageComponents/Pagination';
import { apiFetch } from '@/lib/api';
import { AnalysisResponse } from '@/types/types';
import { useAuth } from '@/authContext/authContext';
import { 
  Stethoscope, 
  Brain, 
  Activity, 
  Heart, 
  Eye, 
  Baby, 
  AlertTriangle, 
  ChevronRight, 
  Clock, 
  ArrowLeft,
  Calendar,
  MessageSquare
} from 'lucide-react';

// ── TypeScript Types ──────────────────────────────────────────────────────────

type SymptomSearchItem = {
  _id: string;
  symptomsText: string;
  recommendedSpecializationName: string;
  analysisReason: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  warningMessage: string;
  matchedSymptoms: string[];
  canShowDoctors: boolean;
  retrievalQuery: string;
  createdAt: string;
  qaHistory?: {
    question: string;
    answer: string;
    timestamp?: string;
  }[];
};

type SymptomSearchesResponse = {
  success: boolean;
  count: number;
  data: SymptomSearchItem[];
  message?: string;
};

// ── Utility Functions ─────────────────────────────────────────────────────────

function formatDateTime(dateString: string) {
  const date = new Date(dateString);

  return {
    date: date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }),
    time: date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }),
  };
}

function getIconFromSpecialist(name: string): React.ComponentType<{ className?: string }> {
  const lower = name.toLowerCase();

  if (lower.includes('neuro')) return Brain;
  if (lower.includes('eye') || lower.includes('ophthal')) return Eye;
  if (lower.includes('cardio')) return Heart;
  if (lower.includes('pedia')) return Baby;
  if (
    lower.includes('ortho') || 
    lower.includes('pulmo') || 
    lower.includes('ent') || 
    lower.includes('uro') || 
    lower.includes('derma') || 
    lower.includes('gastro')
  ) {
    return Activity;
  }

  return Stethoscope;
}

function getAccentFromUrgency(
  urgency: 'low' | 'medium' | 'high' | 'emergency'
): 'primary' | 'blue' {
  return urgency === 'medium' || urgency === 'high' || urgency === 'emergency'
    ? 'blue'
    : 'primary';
}

export default function PreviousSearchesPage() {
  const [searches, setSearches] = useState<SymptomSearchItem[]>([]);
  const [selectedSearch, setSelectedSearch] = useState<SymptomSearchItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const { user, loading: authLoading } = useAuth();
  const PAGE_SIZE = 5;

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    fetchSearches();
  }, [authLoading, user]);

  async function fetchSearches() {
    try {
      setLoading(true);
      setError('');

      const res = await apiFetch(`/symptom-searches`, {
        method: 'GET',
      });

      const rawText = await res.text();
      let parsed: SymptomSearchesResponse | null = null;

      try {
        parsed = rawText ? JSON.parse(rawText) : null;
      } catch (parseError) {
        console.error('Previous searches JSON parse error:', parseError);
        throw new Error('Frontend could not parse previous searches response.');
      }

      if (!res.ok) {
        throw new Error(parsed?.message || 'Failed to fetch previous searches.');
      }

      const items = parsed?.data || [];
      setSearches(items);
      setSelectedSearch(items[0] || null);
      setPage(1);
    } catch (err: any) {
      console.error('Fetch previous searches error:', err);
      setError(err?.message || 'Failed to load previous searches.');
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(searches.length / PAGE_SIZE));

  const paginatedSearches = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return searches.slice(start, end);
  }, [searches, page]);

  useEffect(() => {
    if (!loading && page > totalPages) {
      setPage(totalPages);
    }
  }, [loading, page, totalPages]);

  useEffect(() => {
    if (!paginatedSearches.length) {
      setSelectedSearch(null);
      return;
    }

    const stillVisible = paginatedSearches.some(
      (item) => item._id === selectedSearch?._id
    );

    if (!stillVisible) {
      setSelectedSearch(paginatedSearches[0]);
    }
  }, [paginatedSearches, selectedSearch]);

  const selectedAnalysis: AnalysisResponse | null = useMemo(() => {
    if (!selectedSearch) return null;

    return {
      specialist: selectedSearch.recommendedSpecializationName,
      explanation: selectedSearch.analysisReason,
      urgency: selectedSearch.urgencyLevel,
      warningMessage: selectedSearch.warningMessage,
      matchedSymptoms: selectedSearch.matchedSymptoms || [],
      canShowDoctors: selectedSearch.canShowDoctors,
      retrievalQuery: selectedSearch.retrievalQuery,
    };
  }, [selectedSearch]);

  return (
    <div className="px-4 sm:px-6 md:px-12 py-6 md:py-10 flex justify-center bg-surface min-h-screen text-text-base transition-colors duration-300">
      <div className="flex flex-col w-full max-w-[800px] space-y-6">

            {/* Back to Dashboard */}
            <div className="flex items-center">
              <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary hover:underline">
                <ArrowLeft className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            </div>

            {/* Page Header */}
            <div className="flex flex-col gap-2 border-b border-border pb-5">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-text-base">
                Triage Search History
              </h1>
              <p className="text-text-muted text-sm font-semibold">
                Review your past symptom assessments, dynamic AI question flows, and recommended BMDC specialist paths.
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3.5 text-sm text-red-500 font-semibold flex items-center gap-2 animate-fade-in">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Timeline List */}
            <div className="grid grid-cols-[36px_1fr] md:grid-cols-[44px_1fr] gap-x-4 bg-card p-4 md:p-8 rounded-2xl shadow-xl border border-border transition-colors duration-300">

              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="contents animate-pulse">
                    <div className="flex flex-col items-center gap-2 pt-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary" />
                      {i !== 3 && <div className="w-[2px] bg-border grow my-1 rounded-full" />}
                    </div>

                    <div className={`flex flex-col py-3 ${i !== 3 ? 'pb-8' : ''}`}>
                      <div className="bg-surface p-4 rounded-xl border border-border space-y-2">
                        <div className="h-5 w-2/3 rounded bg-primary/10" />
                        <div className="h-4 w-1/2 rounded bg-primary/10" />
                      </div>
                    </div>
                  </div>
                ))
              ) : searches.length === 0 ? (
                <div className="col-span-full py-8 text-center space-y-2">
                  <p className="text-text-base text-lg font-bold">No previous triage reports</p>
                  <p className="text-text-muted text-sm font-semibold">Describe your symptoms on the analyze page to generate your first triage record.</p>
                </div>
              ) : (
                paginatedSearches.map((item, i) => {
                  const accent = getAccentFromUrgency(item.urgencyLevel);
                  const isBlue = accent === 'blue';
                  const Icon = getIconFromSpecialist(item.recommendedSpecializationName);

                  const iconClass = isBlue
                    ? 'text-blue-500 bg-blue-500/10 border-blue-500/20'
                    : 'text-primary bg-primary/10 border-primary/20';

                  const hoverBorder = isBlue
                    ? 'group-hover:border-blue-400/30'
                    : 'group-hover:border-primary/30';

                  const isLast = i === paginatedSearches.length - 1;
                  const isSelected = selectedSearch?._id === item._id;
                  const { date, time } = formatDateTime(item.createdAt);

                  return (
                    <div key={item._id} className="contents">

                      {/* Timeline Icon */}
                      <div className="flex flex-col items-center gap-2 pt-3">
                        <div className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 ${iconClass}`}>
                          <Icon className="w-4.5 h-4.5" />
                        </div>

                        {!isLast && <div className="w-[2px] bg-border grow my-1 rounded-full" />}
                      </div>

                      {/* Search Card */}
                      <div className={`flex flex-col py-3 ${!isLast ? 'pb-8' : ''} group`}>
                        <button
                          type="button"
                          onClick={() => setSelectedSearch(item)}
                          className="text-left w-full focus:outline-none"
                        >
                          <div
                            className={`bg-surface p-4 rounded-xl border transition-all ${
                              isSelected
                                ? isBlue
                                  ? 'border-blue-500 bg-blue-500/5 shadow-md'
                                  : 'border-primary bg-primary/5 shadow-md'
                                : `border-border ${hoverBorder} hover:bg-card`
                            }`}
                          >
                            <p className="text-text-base text-sm md:text-base font-bold leading-relaxed mb-3 break-words">
                              {item.symptomsText}
                            </p>

                            <div className="flex items-center gap-2.5 text-text-muted text-xs font-bold uppercase tracking-wider flex-wrap">
                              <Stethoscope className="w-3.5 h-3.5 text-primary" />
                              <span>{item.recommendedSpecializationName}</span>
                              <span className="w-1.5 h-1.5 bg-border rounded-full" />
                              <Calendar className="w-3.5 h-3.5 text-primary" />
                              <span>{date}</span>
                              <span className="w-1.5 h-1.5 bg-border rounded-full" />
                              <Clock className="w-3.5 h-3.5 text-primary" />
                              <span>{time}</span>
                            </div>
                          </div>
                        </button>
                      </div>

                    </div>
                  );
                })
              )}

            </div>

            {/* Pagination */}
            {!loading && searches.length > 0 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                className="mt-4"
              />
            )}

            {/* Selected Analysis Panel */}
            {selectedSearch && (
              <div className="mt-8 space-y-6 animate-fade-in">
                
                {/* Header Summary */}
                <div className="bg-card p-5 md:p-6 rounded-2xl shadow-xl border border-border flex flex-col gap-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                    Selected Historical Report
                  </p>
                  <h2 className="text-xl md:text-2xl font-black tracking-tight break-words text-text-base">
                    {selectedSearch.symptomsText}
                  </h2>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-sub">
                    <Stethoscope className="w-4 h-4 text-primary shrink-0" />
                    <span>Recommended Referral: {selectedSearch.recommendedSpecializationName}</span>
                  </div>
                </div>

                {/* Paired QA Dialogue Accordion */}
                {selectedSearch.qaHistory && selectedSearch.qaHistory.length > 0 && (
                  <div className="bg-card p-5 md:p-6 rounded-2xl shadow-xl border border-border space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-base flex items-center gap-2 border-b border-border pb-3">
                      <MessageSquare className="w-4 h-4 text-primary shrink-0" />
                      <span>AI Triage Dialogue Log</span>
                    </h3>
                    
                    <div className="space-y-4 font-semibold text-sm">
                      {selectedSearch.qaHistory.map((qa, index) => (
                        <div key={index} className="flex flex-col gap-2 bg-surface p-4 rounded-xl border border-border">
                          <div className="flex items-start gap-2">
                            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-black uppercase shrink-0 mt-0.5">
                              Question
                            </span>
                            <p className="text-text-sub text-xs leading-relaxed font-bold">{qa.question}</p>
                          </div>
                          
                          <div className="flex items-start gap-2 border-t border-border/60 pt-2.5 mt-1">
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded font-black uppercase shrink-0 mt-0.5">
                              User Response
                            </span>
                            <p className="text-text-base text-sm leading-relaxed">{qa.answer}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Main Clinical Output Results */}
                <SymptomAnalysisResult
                  analysis={selectedAnalysis}
                  loading={false}
                  searchedSymptoms={selectedSearch.symptomsText}
                />
              </div>
            )}

            {/* Footer */}
            <footer className="flex flex-col gap-6 py-12 mt-8 text-center border-t border-border text-xs font-bold uppercase tracking-wider text-text-muted">
              <div className="flex flex-wrap items-center justify-center gap-8">
                {['Privacy Policy', 'Terms of Service', 'Support'].map((label) => (
                  <Link
                    key={label}
                    href="#"
                    className="hover:text-text-base transition-colors"
                  >
                    {label}
                  </Link>
                ))}
              </div>
              <p className="normal-case text-text-muted text-xs">
                © 2026 CareFind. All rights reserved. Registered BMDC Triage Navigator.
              </p>
            </footer>
      </div>
    </div>
  );
}