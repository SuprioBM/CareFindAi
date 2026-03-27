'use client'; // This makes the component run on the client side (Next.js App Router)

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import DashboardSidebar from '../../../components/dashboard/dashBoardsidebar';
import SymptomAnalysisResult from '@/components/pageComponents/SymptomAnalysisResult';
import Pagination from '@/components/pageComponents/Pagination';
import { apiFetch } from '@/lib/api';
import { AnalysisResponse } from '@/types/types';
import { useAuth } from '@/authContext/authContext';

/**
 * Type for a single symptom search item returned from backend
 */

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
};

/**
 * API response type for fetching searches
 */

type SymptomSearchesResponse = {
  success: boolean;
  count: number;
  data: SymptomSearchItem[];
  message?: string;
};

/**
 * Utility: formats ISO date string into readable date & time
 */

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

/**
 * Utility: maps specialist name to a material icon
 */

function getIconFromSpecialist(name: string) {
  const lower = name.toLowerCase();

  if (lower.includes('neuro')) return 'neurology';
  if (lower.includes('ortho')) return 'orthopedics';
  if (lower.includes('pulmo')) return 'pulmonology';
  if (lower.includes('cardio')) return 'cardiology';
  if (lower.includes('ent')) return 'hearing';
  if (lower.includes('uro')) return 'urology';
  if (lower.includes('derma')) return 'dermatology';
  if (lower.includes('gastro')) return 'gastroenterology';
  if (lower.includes('pedia')) return 'pediatrics';
  if (lower.includes('eye') || lower.includes('ophthal')) return 'visibility';

  return 'medical_services';
}

/**
 * Utility: determines accent color based on urgency level
 */


function getAccentFromUrgency(
  urgency: 'low' | 'medium' | 'high' | 'emergency'
): 'primary' | 'blue' {
  return urgency === 'medium' || urgency === 'high' || urgency === 'emergency'
    ? 'blue'
    : 'primary';
}

/**
 * Main Component: Previous Searches Page
 */

export default function PreviousSearchesPage() {
  // ---------------- STATE ----------------
  const [searches, setSearches] = useState<SymptomSearchItem[]>([]);
  const [selectedSearch, setSelectedSearch] = useState<SymptomSearchItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  // Auth context
  const { user, loading: authLoading } = useAuth();

  const PAGE_SIZE = 5;

  /**
   * Fetch searches when auth is ready and user exists
   */

useEffect(() => {
  if (authLoading) return;
  if (!user) return;

  fetchSearches();
}, [authLoading, user]);

  /**
   * Fetch previous symptom searches from backend
   */

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

  /**
   * Calculate total pages
   */

  const totalPages = Math.max(1, Math.ceil(searches.length / PAGE_SIZE));

  /**
   * Memoized pagination slice (performance optimization)
   */

  const paginatedSearches = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return searches.slice(start, end);
  }, [searches, page]);

   /**
   * Fix page if it exceeds total pages (edge case)
   */

  useEffect(() => {
    if (!loading && page > totalPages) {
      setPage(totalPages);
    }
  }, [loading, page, totalPages]);
  
  /**
   * Ensure selected item is always visible in current page
   */

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


  /**
   * Convert selected search into AnalysisResponse format
   */
  const selectedAnalysis: AnalysisResponse | null = useMemo(() => {
    if (!selectedSearch) return null;

    // ---------------- UI ----------------
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
    <div className="bg-surface text-text-base h-screen flex flex-col overflow-hidden antialiased">
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar />

        <div className="flex-1 overflow-y-auto bg-surface no-scrollbar">
          <div className="px-8 md:px-12 py-10 flex flex-1 justify-center">
            <div className="flex flex-col max-w-[800px] flex-1">
              <div className="flex flex-col gap-3 mb-10">
                <h1 className="text-4xl font-bold tracking-tight">Previous Searches</h1>
                <p className="text-text-muted text-base">
                  Review your past symptom assessments and AI specialist recommendations.
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-500 mb-6">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-[40px_1fr] gap-x-4 bg-card p-8 rounded-xl shadow-sm border border-border">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="contents">
                      <div className="flex flex-col items-center gap-2 pt-3">
                        <div className="p-2 rounded-full flex items-center justify-center text-primary bg-primary/10">
                          <span className="material-symbols-outlined text-[20px]">
                            medical_services
                          </span>
                        </div>
                        {i !== 3 && <div className="w-[2px] bg-border grow my-1 rounded-full" />}
                      </div>

                      <div className={`flex flex-col py-3 ${i !== 3 ? 'pb-8' : ''}`}>
                        <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-transparent animate-pulse">
                          <div className="h-5 w-2/3 rounded bg-primary/10 mb-3" />
                          <div className="h-4 w-1/2 rounded bg-primary/10" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : searches.length === 0 ? (
                  <>
                    <div />
                    <div className="py-4">
                      <div className="bg-white/5 backdrop-blur-sm p-6 rounded-lg border border-transparent">
                        <p className="text-text-base text-lg font-semibold mb-2">
                          No previous searches yet
                        </p>
                        <p className="text-text-muted text-sm">
                          Once you analyze symptoms, your history will appear here.
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  paginatedSearches.map((item, i) => {
                    const accent = getAccentFromUrgency(item.urgencyLevel);
                    const isBlue = accent === 'blue';
                    const iconClass = isBlue
                      ? 'text-blue-400 bg-blue-400/10'
                      : 'text-primary bg-primary/10';
                    const hoverBorder = isBlue
                      ? 'group-hover:border-blue-400/20'
                      : 'group-hover:border-primary/20';
                    const isLast = i === paginatedSearches.length - 1;
                    const isSelected = selectedSearch?._id === item._id;
                    const { date, time } = formatDateTime(item.createdAt);

                    return (
                      <div key={item._id} className="contents">
                        <div className="flex flex-col items-center gap-2 pt-3">
                          <div className={`p-2 rounded-full flex items-center justify-center ${iconClass}`}>
                            <span className="material-symbols-outlined text-[20px]">
                              {getIconFromSpecialist(item.recommendedSpecializationName)}
                            </span>
                          </div>
                          {!isLast && (
                            <div className="w-[2px] bg-border grow my-1 rounded-full" />
                          )}
                        </div>

                        <div className={`flex flex-col py-3 ${!isLast ? 'pb-8' : ''} group`}>
                          <button
                            type="button"
                            onClick={() => setSelectedSearch(item)}
                            className="text-left"
                          >
                            <div
                              className={`bg-white/5 backdrop-blur-sm p-4 rounded-lg transition-colors border ${
                                isSelected
                                  ? isBlue
                                    ? 'border-blue-400/30 bg-white/10'
                                    : 'border-primary/30 bg-white/10'
                                  : `border-transparent ${hoverBorder} group-hover:bg-white/10`
                              }`}
                            >
                              <p className="text-text-base text-lg font-semibold leading-normal mb-1">
                                {item.symptomsText}
                              </p>

                              <div className="flex items-center gap-2 text-text-muted text-sm font-medium flex-wrap">
                                <span className="material-symbols-outlined text-[16px]">
                                  stethoscope
                                </span>
                                <span>{item.recommendedSpecializationName}</span>

                                <span className="w-1 h-1 bg-border rounded-full mx-1" />

                                <span className="material-symbols-outlined text-[16px]">
                                  calendar_today
                                </span>
                                <span>{date}</span>

                                <span className="w-1 h-1 bg-border rounded-full mx-1" />

                                <span className="material-symbols-outlined text-[16px]">
                                  schedule
                                </span>
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

              {!loading && searches.length > 0 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  className="mt-8"
                />
              )}

              {selectedSearch && (
                <div className="mt-8">
                  <div className="bg-card p-6 rounded-xl shadow-sm border border-border mb-6">
                    <div className="flex flex-col gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">
                        Selected Search
                      </p>

                      <h2 className="text-2xl font-bold tracking-tight">
                        {selectedSearch.symptomsText}
                      </h2>

                      <div className="flex items-center gap-3 flex-wrap text-sm text-text-muted font-medium">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px]">
                            stethoscope
                          </span>
                          <span>{selectedSearch.recommendedSpecializationName}</span>
                        </div>

                        <span className="w-1 h-1 bg-border rounded-full" />

                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px]">
                            calendar_today
                          </span>
                          <span>{formatDateTime(selectedSearch.createdAt).date}</span>
                        </div>

                        <span className="w-1 h-1 bg-border rounded-full" />

                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px]">
                            schedule
                          </span>
                          <span>{formatDateTime(selectedSearch.createdAt).time}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <SymptomAnalysisResult
                    analysis={selectedAnalysis}
                    loading={false}
                    searchedSymptoms={selectedSearch.symptomsText}
                  />
                </div>
              )}

              <footer className="flex flex-col gap-6 py-12 mt-8 text-center border-t border-border">
                <div className="flex flex-wrap items-center justify-center gap-8">
                  {['Privacy Policy', 'Terms of Service', 'Support'].map((label) => (
                    <Link
                      key={label}
                      href="#"
                      className="text-text-muted hover:text-text-base transition-colors text-sm font-medium"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
                <p className="text-text-muted text-sm">© 2024 CareFind. All rights reserved.</p>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}