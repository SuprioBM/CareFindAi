'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Clock, 
  FileText, 
  CheckCircle, 
  RefreshCw, 
  ArrowLeft,
  ChevronRight,
  Activity,
  History,
  AlertTriangle
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/authContext/authContext';

type LocalJob = {
  jobId: string;
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: number;
};

type ServerJob = {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt: string | null;
  error?: string | null;
};

export default function PrescriptionHistoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unifiedHistory, setUnifiedHistory] = useState<any[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login?redirectTo=/dashboard/prescriptions');
      return;
    }

    fetchPrescriptionHistory();
  }, [authLoading, user]);

  const fetchPrescriptionHistory = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Fetch server history
      const resHistory = await apiFetch('/prescription/history');
      let historyList: ServerJob[] = [];
      if (resHistory.ok) {
        const data = await resHistory.json();
        historyList = data.jobs || [];
      } else {
        throw new Error("Failed to fetch prescription history from the server.");
      }

      // 2. Load from localStorage cache
      const localJobsStr = localStorage.getItem('carefind_prescription_jobs');
      const localJobs: LocalJob[] = localJobsStr ? JSON.parse(localJobsStr) : [];

      // 3. Merge both sets, deduplicated by jobId
      const mergedMap = new Map<string, any>();

      // Server history first
      historyList.forEach(sj => {
        mergedMap.set(sj.jobId, {
          jobId: sj.jobId,
          fileName: "Prescription Scan", // Fallback name
          status: sj.status,
          createdAt: new Date(sj.createdAt).getTime(),
          completedAt: sj.completedAt ? new Date(sj.completedAt).getTime() : null,
          error: sj.error || null,
          source: 'server'
        });
      });

      // Override or add local jobs
      localJobs.forEach(lj => {
        const existing = mergedMap.get(lj.jobId);
        mergedMap.set(lj.jobId, {
          jobId: lj.jobId,
          fileName: lj.fileName || (existing?.fileName ?? "Prescription Scan"),
          status: lj.status || (existing?.status ?? "pending"),
          createdAt: lj.createdAt || (existing?.createdAt ?? Date.now()),
          completedAt: existing?.completedAt ?? null,
          error: lj.status === 'failed' ? (existing?.error ?? 'Analysis failed') : null,
          source: 'local'
        });
      });

      const mergedList = Array.from(mergedMap.values());
      // Sort by date (newest first)
      mergedList.sort((a, b) => b.createdAt - a.createdAt);
      setUnifiedHistory(mergedList);

    } catch (err: any) {
      console.error("fetchPrescriptionHistory error:", err);
      setError(err?.message || "Failed to load prescription history.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-text-sub gap-4">
        <Activity className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-semibold tracking-wider">Loading prescription logs...</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 md:px-12 py-6 md:py-10 flex justify-center min-h-[80vh]">
      <div className="flex flex-col w-full max-w-[800px] space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 text-text-muted hover:text-text-base transition-colors text-xs font-bold uppercase tracking-wider w-max"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Prescription Scans
            </h1>
            <p className="text-text-muted text-sm md:text-base">
              Manage your background prescription parsing history, BDT pricing audits, and bioequivalent drug alternatives.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3.5 text-sm text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Unified scan history list */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-border pb-3">
            <History className="w-5 h-5 text-primary shrink-0" />
            <span>All Scans ({unifiedHistory.length})</span>
          </h2>

          {unifiedHistory.length === 0 ? (
            <div className="py-16 text-center space-y-4 max-w-sm mx-auto">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-white">No scans found</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  You haven&apos;t uploaded any prescriptions yet. Go to the Prescription Analyzer page to get started.
                </p>
              </div>
              <button
                onClick={() => router.push('/prescription-analyzer')}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider transition-all"
              >
                <span>New Analysis</span>
                <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border pr-2 space-y-3">
              {unifiedHistory.map((job) => (
                <div key={job.jobId} className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-text-muted border border-border shrink-0">
                      <FileText className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{job.fileName}</p>
                      <div className="flex items-center gap-3 text-[10px] text-text-muted mt-1">
                        <span>Started: {new Date(job.createdAt).toLocaleString()}</span>
                        {job.completedAt && (
                          <span className="text-[#2dd4bf] font-bold">
                            Completed: {new Date(job.completedAt).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                      {job.error && (
                        <p className="text-red-400 text-[10px] mt-1 italic font-medium">
                          Error: {job.error}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {job.status === 'completed' ? (
                      <button
                        onClick={() => router.push(`/prescription-analyzer?jobId=${job.jobId}`)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-bold transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>View Report</span>
                      </button>
                    ) : job.status === 'failed' ? (
                      <span className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-bold">
                        Failed
                      </span>
                    ) : (
                      <button
                        onClick={() => router.push(`/prescription-analyzer?jobId=${job.jobId}`)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary font-bold transition-colors animate-pulse"
                      >
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Scanning...</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
