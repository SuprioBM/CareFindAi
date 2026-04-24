/**
 * User shall view their previous symptom searches along with the AI-recommended specialists.
 *
 * This is the "Previous Searches" page, accessible from the user dashboard.
 * It fetches all past AI symptom analyses the user has made and displays them
 * in a timeline-style list (newest first).
 *
 * When the user clicks a search in the list, the full AI result is shown below —
 * including the recommended specialist, urgency level, AI explanation, and matched symptoms.
 *
 * Features implemented on this page:
 *   1. Fetch the full symptom search history from the backend API
 *   2. Display searches in a paginated timeline with icons and urgency-based colors
 *   3. Show the full AI analysis of whichever search is currently selected
 *   4. Handle loading states (skeleton cards) and empty states gracefully
 */

'use client'; // This component uses React hooks — must run on the client (browser), not the server

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import DashboardSidebar from '../../../components/dashboard/dashBoardsidebar';
import SymptomAnalysisResult from '@/components/pageComponents/SymptomAnalysisResult';
import Pagination from '@/components/pageComponents/Pagination';
import { apiFetch } from '@/lib/api';
import { AnalysisResponse } from '@/types/types';
import { useAuth } from '@/authContext/authContext';

// ── TypeScript Types ──────────────────────────────────────────────────────────

/**
 * Represents a single symptom search record returned by the backend API.
 * This matches the structure of documents in the SymptomSearch MongoDB collection.
 */
type SymptomSearchItem = {
  _id: string;                                           // Unique MongoDB document ID
  symptomsText: string;                                  // What the user typed (e.g., "fever and headache")
  recommendedSpecializationName: string;                 // Which specialist AI recommended (e.g., "Neurology")
  analysisReason: string;                                // AI's explanation of its recommendation
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency'; // How urgent the AI thinks the situation is
  warningMessage: string;                                // Optional urgent warning from AI
  matchedSymptoms: string[];                             // Keywords AI identified in the input
  canShowDoctors: boolean;                               // Whether to show matching doctor results
  retrievalQuery: string;                                // Internal query used to find relevant doctors
  createdAt: string;                                     // ISO date string — when the search was made
};

/**
 * Represents the API response structure from GET /api/symptom-searches.
 * Contains the success flag, total count, and array of search history items.
 */
type SymptomSearchesResponse = {
  success: boolean;
  count: number;
  data: SymptomSearchItem[];
  message?: string;
};

// ── Utility Functions ─────────────────────────────────────────────────────────

/**
 * Converts an ISO timestamp string to a readable date and time.
 * Used to display "when" each search was made on the timeline.
 * Example: "2024-01-15T10:30:00Z" → { date: "Jan 15, 2024", time: "10:30 AM" }
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
 * Maps a specialist name to an appropriate Google Material Symbol icon name.
 * Used to display a relevant icon next to each search in the timeline.
 * Example: "Cardiologist" → "cardiology" icon
 * Falls back to "medical_services" for unrecognized specialties.
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

  return 'medical_services'; // Default icon for any unrecognized specialist
}

/**
 * Determines the accent color scheme for a search card based on its urgency level.
 * Low urgency → primary (teal/green) color
 * Medium, High, or Emergency → blue color (to signal caution/attention)
 */
function getAccentFromUrgency(
  urgency: 'low' | 'medium' | 'high' | 'emergency'
): 'primary' | 'blue' {
  return urgency === 'medium' || urgency === 'high' || urgency === 'emergency'
    ? 'blue'
    : 'primary';
}

// ── Main Page Component ───────────────────────────────────────────────────────

/**
 * Previous Searches Page Component
 *
 * This page shows the user a full history of all their past AI symptom analyses.
 * The layout has two sections:
 *   LEFT: A vertical timeline of past searches (paginated, 5 per page)
 *   BELOW: The full AI analysis result of whichever timeline item is selected
 *
 * The user can click any item in the timeline to load its full analysis below.
 */
export default function PreviousSearchesPage() {

  // ── State Variables ───────────────────────────────────────────────────────

  // Full list of all the user's past symptom searches (fetched from backend)
  const [searches, setSearches] = useState<SymptomSearchItem[]>([]);

  // The search item currently selected/highlighted in the timeline
  // Its full analysis is shown in the bottom panel
  const [selectedSearch, setSelectedSearch] = useState<SymptomSearchItem | null>(null);

  // Whether the page is currently fetching data from the backend
  const [loading, setLoading] = useState(true);

  // Error message to show if the API call fails
  const [error, setError] = useState('');

  // Current pagination page number (1-indexed)
  const [page, setPage] = useState(1);

  // Get the currently logged-in user and the auth loading state from context
  const { user, loading: authLoading } = useAuth();

  // How many searches to show per page in the timeline
  const PAGE_SIZE = 5;

  // ── Data Fetching ─────────────────────────────────────────────────────────

  /**
   * Wait for auth to finish loading before fetching data.
   * This ensures we don't make API calls before we know if the user is logged in.
   * Once auth is ready and user exists, call fetchSearches().
   */
  useEffect(() => {
    if (authLoading) return; // Wait — auth hasn't finished checking the token yet
    if (!user) return;       // Not logged in — don't fetch anything

    fetchSearches();
  }, [authLoading, user]);

  /**
   * Fetches all previous symptom searches for the logged-in user from the backend.
   * Calls GET /api/symptom-searches which returns the user's full search history.
   * On success: updates the searches list and selects the newest entry by default.
   * On failure: sets an error message to display to the user.
   */
  async function fetchSearches() {
    try {
      setLoading(true);
      setError('');

      // Call the backend API endpoint for symptom search history
      const res = await apiFetch(`/symptom-searches`, {
        method: 'GET',
      });

      // Read the raw response text before parsing (safer for debugging parse errors)
      const rawText = await res.text();

      let parsed: SymptomSearchesResponse | null = null;

      try {
        // Parse the JSON response (only if there's content)
        parsed = rawText ? JSON.parse(rawText) : null;
      } catch (parseError) {
        console.error('Previous searches JSON parse error:', parseError);
        throw new Error('Frontend could not parse previous searches response.');
      }

      // If the HTTP status code indicates failure, throw an error with the API's message
      if (!res.ok) {
        throw new Error(parsed?.message || 'Failed to fetch previous searches.');
      }

      const items = parsed?.data || [];
      setSearches(items);              // Store all fetched searches in state
      setSelectedSearch(items[0] || null); // Auto-select the newest search (first in list)
      setPage(1);                      // Reset to page 1 after fresh data load
    } catch (err: any) {
      console.error('Fetch previous searches error:', err);
      setError(err?.message || 'Failed to load previous searches.');
    } finally {
      setLoading(false); // Always stop the loading spinner regardless of success/failure
    }
  }

  // ── Pagination Logic ──────────────────────────────────────────────────────

  /**
   * Calculate how many pages are needed based on total searches and page size.
   * Always at least 1 page (even if empty) to avoid division-by-zero / edge cases.
   */
  const totalPages = Math.max(1, Math.ceil(searches.length / PAGE_SIZE));

  /**
   * Slice the full searches array to get only the items for the current page.
   * useMemo prevents recalculating this slice on every render (performance optimization).
   * Only recalculates when searches list or current page number changes.
   */
  const paginatedSearches = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE; // First item index for current page
    const end = start + PAGE_SIZE;         // Last item index (exclusive)
    return searches.slice(start, end);
  }, [searches, page]);

  /**
   * If the user was on page 3 and then data reloads with fewer results,
   * this corrects the page to the new maximum so the user isn't on a blank page.
   */
  useEffect(() => {
    if (!loading && page > totalPages) {
      setPage(totalPages);
    }
  }, [loading, page, totalPages]);

  /**
   * Ensures the selected search is always visible on the current page.
   * If the user navigates to a different page where the currently selected item
   * doesn't appear, auto-select the first item on the new page instead.
   */
  useEffect(() => {
    if (!paginatedSearches.length) {
      setSelectedSearch(null); // No items on this page — clear selection
      return;
    }

    // Check if the currently selected item is still visible on the current page
    const stillVisible = paginatedSearches.some(
      (item) => item._id === selectedSearch?._id
    );

    // If not visible (user changed page), select the first item on the new page
    if (!stillVisible) {
      setSelectedSearch(paginatedSearches[0]);
    }
  }, [paginatedSearches, selectedSearch]);

  /**
   * Converts the selected SymptomSearchItem into the AnalysisResponse format
   * that the <SymptomAnalysisResult> component expects for rendering.
   * This is a format transformation — same data, different shape.
   * useMemo ensures this conversion only runs when selectedSearch changes.
   */
  const selectedAnalysis: AnalysisResponse | null = useMemo(() => {
    if (!selectedSearch) return null;

    return {
      specialist: selectedSearch.recommendedSpecializationName, // Which specialist was recommended
      explanation: selectedSearch.analysisReason,               // AI's reasoning text
      urgency: selectedSearch.urgencyLevel,                     // Urgency level for color coding
      warningMessage: selectedSearch.warningMessage,            // Optional warning from AI
      matchedSymptoms: selectedSearch.matchedSymptoms || [],    // Keywords AI found
      canShowDoctors: selectedSearch.canShowDoctors,            // Whether to show doctor results
      retrievalQuery: selectedSearch.retrievalQuery,            // Internal query for doctor search
    };
  }, [selectedSearch]);

  // ── JSX Rendering ─────────────────────────────────────────────────────────

  return (
    <div className="bg-surface text-text-base h-screen flex flex-col overflow-hidden antialiased">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar navigation — shared across all dashboard pages */}
        <DashboardSidebar />

        <div className="flex-1 overflow-y-auto bg-surface no-scrollbar">
          <div className="px-8 md:px-12 py-10 flex flex-1 justify-center">
            <div className="flex flex-col max-w-[800px] flex-1">

              {/* Page Header */}
              <div className="flex flex-col gap-3 mb-10">
                <h1 className="text-4xl font-bold tracking-tight">Previous Searches</h1>
                <p className="text-text-muted text-base">
                  Review your past symptom assessments and AI specialist recommendations.
                </p>
              </div>

              {/* Error Banner — shown if the API call failed */}
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-500 mb-6">
                  {error}
                </div>
              )}

              {/*
               * Timeline Grid Layout
               * Uses a 2-column grid: [icon column] [content column]
               * Each search entry has:
               *   - Left: specialty icon + vertical connecting line
               *   - Right: clickable card showing symptom text, specialist, date, and time
               * Clicking a card updates selectedSearch to show its full AI analysis below.
               */}
              <div className="grid grid-cols-[40px_1fr] gap-x-4 bg-card p-8 rounded-xl shadow-sm border border-border">
                {loading ? (
                  // ── Loading Skeletons — shown while API data is being fetched ──────
                  // Renders 4 placeholder shimmer cards to indicate content is loading
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
                  // ── Empty State — shown when user has no search history yet ─────────
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
                  // ── Search Timeline Cards — rendered for each paginated search item ─
                  paginatedSearches.map((item, i) => {
                    // Determine the color scheme based on urgency level
                    const accent = getAccentFromUrgency(item.urgencyLevel);
                    const isBlue = accent === 'blue';

                    // Icon and hover border styles based on urgency color
                    const iconClass = isBlue
                      ? 'text-blue-400 bg-blue-400/10'
                      : 'text-primary bg-primary/10';
                    const hoverBorder = isBlue
                      ? 'group-hover:border-blue-400/20'
                      : 'group-hover:border-primary/20';

                    const isLast = i === paginatedSearches.length - 1; // Is this the last card? (no connecting line below)
                    const isSelected = selectedSearch?._id === item._id; // Is this the currently selected card?
                    const { date, time } = formatDateTime(item.createdAt); // Format the timestamp for display

                    return (
                      <div key={item._id} className="contents">
                        {/* Left column: specialty icon + vertical timeline line */}
                        <div className="flex flex-col items-center gap-2 pt-3">
                          <div className={`p-2 rounded-full flex items-center justify-center ${iconClass}`}>
                            <span className="material-symbols-outlined text-[20px]">
                              {getIconFromSpecialist(item.recommendedSpecializationName)}
                            </span>
                          </div>
                          {/* Vertical connecting line between timeline entries (hidden for last item) */}
                          {!isLast && (
                            <div className="w-[2px] bg-border grow my-1 rounded-full" />
                          )}
                        </div>

                        {/* Right column: clickable search summary card */}
                        <div className={`flex flex-col py-3 ${!isLast ? 'pb-8' : ''} group`}>
                          <button
                            type="button"
                            onClick={() => setSelectedSearch(item)} // Select this search to view full analysis
                            className="text-left"
                          >
                            {/* Card changes style when selected (highlighted border + slight background) */}
                            <div
                              className={`bg-white/5 backdrop-blur-sm p-4 rounded-lg transition-colors border ${
                                isSelected
                                  ? isBlue
                                    ? 'border-blue-400/30 bg-white/10'
                                    : 'border-primary/30 bg-white/10'
                                  : `border-transparent ${hoverBorder} group-hover:bg-white/10`
                              }`}
                            >
                              {/* The symptom text the user originally entered */}
                              <p className="text-text-base text-lg font-semibold leading-normal mb-1">
                                {item.symptomsText}
                              </p>

                              {/* Metadata row: recommended specialist, date, and time */}
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

              {/* Pagination controls — only shown when there's more than one page of results */}
              {!loading && searches.length > 0 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  className="mt-8"
                />
              )}

              {/*
               * Full AI Analysis Panel ()
               * Shown below the timeline when a search is selected.
               * Displays the complete AI analysis result including:
               *   - The original symptom text
               *   - Recommended specialist name, date and time
               *   - Full AI explanation, urgency badge, matched symptoms
               *   - Matching doctor results (if canShowDoctors is true)
               */}
              {selectedSearch && (
                <div className="mt-8">
                  {/* Selected search header card — shows the symptom text and metadata */}
                  <div className="bg-card p-6 rounded-xl shadow-sm border border-border mb-6">
                    <div className="flex flex-col gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">
                        Selected Search
                      </p>

                      {/* The symptom text — headline of the selected analysis */}
                      <h2 className="text-2xl font-bold tracking-tight">
                        {selectedSearch.symptomsText}
                      </h2>

                      {/* Metadata: specialist, date, time */}
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

                  {/*
                   * The full AI analysis result component.
                   * Renders the specialist recommendation, urgency level badge,
                   * AI explanation text, matched symptoms list, and related doctor cards.
                   * loading={false} because data is already fetched — no need to show spinner here.
                   */}
                  <SymptomAnalysisResult
                    analysis={selectedAnalysis}
                    loading={false}
                    searchedSymptoms={selectedSearch.symptomsText}
                  />
                </div>
              )}

              {/* Footer */}
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