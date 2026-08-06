'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Upload, 
  Sparkles, 
  Check, 
  TrendingDown, 
  Info, 
  Layers, 
  Building, 
  Activity, 
  ArrowRight,
  RefreshCw,
  Eye,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  History,
  Lock,
  ChevronRight,
  ShieldCheck,
  FileImage,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Camera,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/authContext/authContext';

type PrescribedMedication = {
  medicineName: string;
  strength: string;
  dosage: string;
  genericName: string;
  manufacturer: string;
  priceBDT: string;
  description: string;
  sideEffects: string;
  packagingRef: string;
};

type AlternativeBrand = {
  brandName: string;
  manufacturer: string;
  priceBDT: string;
  description: string;
  savingsInfo: string;
};

type AlternativeGroup = {
  prescribedName: string;
  genericName: string;
  alternatives: AlternativeBrand[];
};

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
  image?: string | null;
  result?: any | null;
  viewedAt?: string | null;
};

function PrescriptionAnalyzerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeJobId = searchParams.get('jobId');
  const { user, loading: authLoading } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [error, setError] = useState('');
  
  const [prescribedData, setPrescribedData] = useState<PrescribedMedication[]>([]);
  const [alternativesData, setAlternativesData] = useState<AlternativeGroup[]>([]);
  const [activeTab, setActiveTab] = useState<'medicines' | 'advice'>('medicines');
  const [step, setStep] = useState<'idle' | 'analyzing' | 'results'>('idle');
  const [analysisDate, setAnalysisDate] = useState<string>('');
  
  // Track expanded alternative details (stores "medIdx-altIdx" string key)
  const [expandedAltKey, setExpandedAltKey] = useState<string | null>(null);

  // Track whether to show all alternatives (past the first 3) per medicine index
  const [showAllAlternatives, setShowAllAlternatives] = useState<{ [medIdx: number]: boolean }>({});

  // Queue Dashboard Active Tab Selection
  const [activeHistoryTab, setActiveHistoryTab] = useState<'needsReview' | 'processing' | 'reviewed'>('needsReview');

  // Persistence States
  const [unseenReports, setUnseenReports] = useState<any[]>([]);
  const [unifiedHistory, setUnifiedHistory] = useState<any[]>([]);
  const [activeScans, setActiveScans] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingMessages = [
    "Uploading prescription image to clinical queue...",
    "Queue job accepted. Parsing handwriting...",
    "Querying Google Search Grounding for live BDT prices in Bangladesh...",
    "Comparing local alternative brands and price savings...",
    "Finalizing clinical report and saving to database..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingPhase((prev) => (prev + 1) % loadingMessages.length);
      }, 3500);
    } else {
      setLoadingPhase(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (!user) return;

    if (activeJobId) {
      pollJobStatus(activeJobId);
    } else {
      setStep('idle');
      setPrescribedData([]);
      setAlternativesData([]);
      fetchPersistenceData();
    }
  }, [activeJobId, user]);

  const fetchPersistenceData = async () => {
    if (!user) return;
    try {
      const resUnseen = await apiFetch('/prescription/unseen');
      let unseenList = [];
      if (resUnseen.ok) {
        const data = await resUnseen.json();
        unseenList = data.jobs || [];
        setUnseenReports(unseenList);
      }

      const resHistory = await apiFetch('/prescription/history');
      let historyList: ServerJob[] = [];
      if (resHistory.ok) {
        const data = await resHistory.json();
        historyList = data.jobs || [];
      }

      const localJobsStr = localStorage.getItem('carefind_prescription_jobs');
      const localJobs: LocalJob[] = localJobsStr ? JSON.parse(localJobsStr) : [];

      const mergedMap = new Map<string, any>();

      historyList.forEach(sj => {
        mergedMap.set(sj.jobId, {
          jobId: sj.jobId,
          fileName: sj.result?.prescribedMedications?.length 
            ? sj.result.prescribedMedications.map((m: any) => m.medicineName).slice(0, 2).join(', ') + (sj.result.prescribedMedications.length > 2 ? '...' : '')
            : "Prescription Scan",
          status: sj.status,
          createdAt: new Date(sj.createdAt).getTime(),
          completedAt: sj.completedAt ? new Date(sj.completedAt).getTime() : null,
          image: sj.image || null,
          result: sj.result || null,
          viewedAt: sj.viewedAt || null,
          source: 'server'
        });
      });

      localJobs.forEach(lj => {
        const existing = mergedMap.get(lj.jobId);
        mergedMap.set(lj.jobId, {
          jobId: lj.jobId,
          fileName: lj.fileName || (existing?.fileName ?? "Prescription Scan"),
          status: lj.status || (existing?.status ?? "pending"),
          createdAt: lj.createdAt || (existing?.createdAt ?? Date.now()),
          completedAt: existing?.completedAt ?? null,
          image: existing?.image || null,
          result: existing?.result || null,
          viewedAt: existing?.viewedAt || null,
          source: 'local'
        });
      });

      const mergedList = Array.from(mergedMap.values());
      mergedList.sort((a, b) => b.createdAt - a.createdAt);
      setUnifiedHistory(mergedList);

      const running = mergedList.filter(job => job.status === 'pending' || job.status === 'processing');
      setActiveScans(running);

    } catch (err) {
      console.error("Error loading prescription persistence data:", err);
    }
  };

  useEffect(() => {
    if (step !== 'idle' || activeScans.length === 0 || !user) return;
    const interval = setInterval(() => {
      fetchPersistenceData();
    }, 6000);
    return () => clearInterval(interval);
  }, [step, activeScans.length, user]);

  const pollJobStatus = async (jobId: string) => {
    setLoading(true);
    setStep('analyzing');
    setError('');

    let attempts = 0;
    const maxAttempts = 120;

    const checkStatus = async () => {
      try {
        const res = await apiFetch(`/prescription/job/${jobId}/status`);
        if (!res.ok) {
          throw new Error("Failed to fetch job status.");
        }
        
        const data = await res.json();
        
        if (data.status === 'completed') {
          setPrescribedData(data.result?.prescribedMedications || []);
          setAlternativesData(data.result?.alternativeMedications || []);
          
          // Format current date
          const dateObj = new Date();
          setAnalysisDate(dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          }) + ' • ' + dateObj.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          }));

          setStep('results');
          setLoading(false);

          // Toast completion
          toast.success("Prescription scan complete! 🎉", {
            description: "Handwriting digitized and generic equivalents identified successfully."
          });

          await markReportAsViewed(jobId);
          return true;
        } else if (data.status === 'failed') {
          const failMsg = data.error || "Prescription analysis failed.";
          setError(failMsg);
          setStep('idle');
          setLoading(false);

          toast.error("Prescription scan failed ❌", {
            description: failMsg
          });
          return true;
        }
        
        return false;
      } catch (err: any) {
        console.error(err);
        setError("Error connecting to server. Polling queue status...");
        return false;
      }
    };

    const finished = await checkStatus();
    if (finished) return;

    const interval = setInterval(async () => {
      attempts++;
      const done = await checkStatus();
      if (done || attempts >= maxAttempts) {
        clearInterval(interval);
        if (attempts >= maxAttempts) {
          setError("Job execution took too long. Please refresh to load status.");
          setLoading(false);
        }
      }
    }, 3000);
  };

  const markReportAsViewed = async (jobId: string) => {
    try {
      await apiFetch(`/prescription/${jobId}/viewed`, {
        method: 'POST'
      });
      
      const localJobsStr = localStorage.getItem('carefind_prescription_jobs');
      if (localJobsStr) {
        const localJobs: LocalJob[] = JSON.parse(localJobsStr);
        const match = localJobs.find(j => j.jobId === jobId);
        if (match) {
          match.status = 'completed';
          localStorage.setItem('carefind_prescription_jobs', JSON.stringify(localJobs));
        }
      }
    } catch (err) {
      console.error("Error setting viewed status:", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setError('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setError('');
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select or drop a prescription image first.");
      return;
    }

    setLoading(true);
    setError('');
    setStep('analyzing');

    try {
      const base64 = await convertToBase64(file);
      
      const res = await apiFetch('/prescription/analyze', {
        method: 'POST',
        body: JSON.stringify({ image: base64 }),
      });

      const parsed = await res.json();
      if (!res.ok) {
        throw new Error(parsed?.message || "Failed to submit prescription.");
      }

      const jobId = parsed.jobId;

      const existingJobs = JSON.parse(localStorage.getItem('carefind_prescription_jobs') || '[]');
      existingJobs.push({
        jobId,
        fileName: file.name,
        status: parsed.status || 'pending',
        createdAt: Date.now()
      });
      localStorage.setItem('carefind_prescription_jobs', JSON.stringify(existingJobs));

      router.push(`/prescription-analyzer?jobId=${jobId}`);

    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Something went wrong while submitting the image. Please try again.");
      setStep('idle');
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setPrescribedData([]);
    setAlternativesData([]);
    setStep('idle');
    setError('');
    router.push('/prescription-analyzer');
  };

  const toggleExpandAlternative = (key: string) => {
    setExpandedAltKey(prev => (prev === key ? null : key));
  };

  const toggleShowAllAlternatives = (medIdx: number) => {
    setShowAllAlternatives(prev => ({
      ...prev,
      [medIdx]: !prev[medIdx]
    }));
  };

  // Partitioned lists based on workflow statuses
  const processingList = unifiedHistory.filter(job => job.status === 'pending' || job.status === 'processing');
  const needsReviewList = unifiedHistory.filter(job => job.status === 'completed' && !job.viewedAt);
  const reviewedList = unifiedHistory.filter(job => job.status === 'completed' && job.viewedAt);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-text-sub gap-4">
        <Activity className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-semibold tracking-wider">Verifying security keys...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-surface text-text-base min-h-screen flex items-center justify-center p-6 transition-colors duration-300">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 rounded-full blur-[40px] pointer-events-none" />
          
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-text-base">Sign In Required</h2>
            <p className="text-sm text-text-muted leading-relaxed">
              To securely analyze prescriptions, save scans across devices, and retrieve historical data, please sign in to your CareFind account.
            </p>
          </div>

          <button
            onClick={() => router.push(`/login?redirectTo=/prescription-analyzer`)}
            className="w-full flex items-center justify-center gap-2 rounded-xl h-12 bg-primary hover:bg-primary-hover text-white text-sm font-bold tracking-wider uppercase transition-all shadow-lg shadow-primary/20"
          >
            <span>Sign In to Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-text-base min-h-screen py-12 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-[1000px] mx-auto space-y-10">
        
        {/* ── HEADER BANNER ────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-border pb-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold uppercase tracking-wider w-max">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Powered</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-text-base leading-tight">
              Prescription Analyzer
            </h1>
            <p className="text-text-muted text-sm md:text-base font-semibold leading-relaxed">
              Upload your prescription and we&apos;ll analyze medicines by their generic name to provide details, uses, side effects and affordable alternatives with price comparison.
            </p>
            
            {/* Security Assurance */}
            <div className="flex items-center gap-1.5 text-xs text-text-muted font-bold uppercase tracking-wider pt-2">
              <Lock className="w-4 h-4 text-primary shrink-0" />
              <span>Your data is secure & private</span>
            </div>
          </div>

          {/* Three Benefit Circular Badges */}
          <div className="flex flex-col gap-3 shrink-0 font-bold text-xs text-text-sub">
            {[
              { label: "AI Reading Handwritten Rx", icon: <FileText className="w-4 h-4 text-emerald-500" />, bg: "bg-emerald-500/10 border-emerald-500/20" },
              { label: "Generic Name Search", icon: <Layers className="w-4 h-4 text-blue-500" />, bg: "bg-blue-500/10 border-blue-500/20" },
              { label: "Alternatives & Price Comparison", icon: <TrendingDown className="w-4 h-4 text-amber-500" />, bg: "bg-amber-500/10 border-amber-500/20" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${item.bg}`}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3.5 text-sm text-red-500 font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
              {/* ── ACTIVE SCANS & UNVIEWED REPORTS LISTS ────────────── */}
            {(activeScans.length > 0 || unseenReports.length > 0) && (
              <div className="space-y-6">
                
                {/* Active Scans in Progress */}
                {activeScans.length > 0 && (
                  <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-4">
                    <h3 className="text-sm font-bold text-text-base flex items-center gap-2 border-b border-border pb-2.5">
                      <Clock className="w-4 h-4 text-primary shrink-0 animate-pulse" />
                      <span>Active Analyses in Progress ({activeScans.length})</span>
                    </h3>
                    <div className="divide-y divide-border/60 space-y-4">
                      {activeScans.map(job => (
                        <div key={job.jobId} className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-semibold">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl border border-border overflow-hidden bg-surface flex items-center justify-center shrink-0">
                              {job.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={job.image} alt="Prescription" className="w-full h-full object-cover" />
                              ) : (
                                <FileImage className="w-5 h-5 text-text-muted" />
                              )}
                            </div>
                            <div>
                              <p className="text-text-base font-bold text-sm">{job.fileName}</p>
                              <p className="text-[10px] text-text-muted mt-0.5 font-bold flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-primary animate-pulse" />
                                <span>Started: {new Date(job.createdAt).toLocaleTimeString()}</span>
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => router.push(`/prescription-analyzer?jobId=${job.jobId}`)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-xs font-black uppercase tracking-wider transition-colors animate-pulse"
                          >
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Scanning...</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pending Reviews / Unviewed Reports */}
                {unseenReports.length > 0 && (
                  <div className="bg-[#fefaf0] dark:bg-[#1a1608] border border-amber-500/10 rounded-3xl p-6 shadow-xl space-y-4">
                    <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2 border-b border-amber-500/20 pb-2.5">
                      <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Pending Reviews / Unviewed Reports ({unseenReports.length})</span>
                    </h3>
                    <div className="divide-y divide-amber-500/10 space-y-4">
                      {unseenReports.map(job => (
                        <div key={job.jobId} className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-semibold">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl border border-amber-500/20 overflow-hidden bg-surface flex items-center justify-center shrink-0">
                              {job.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={job.image} alt="Prescription" className="w-full h-full object-cover" />
                              ) : (
                                <FileImage className="w-5 h-5 text-text-muted" />
                              )}
                            </div>
                            <div>
                              <p className="text-amber-900 dark:text-amber-200 font-bold text-sm">
                                {job.result?.prescribedMedications?.length 
                                  ? job.result.prescribedMedications.map((m: any) => m.medicineName).slice(0, 2).join(', ') + (job.result.prescribedMedications.length > 2 ? '...' : '')
                                  : "Prescription Scan"}
                              </p>
                              <p className="text-[10px] text-amber-700/80 dark:text-amber-400 mt-0.5 font-bold flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                                <span>Completed: {new Date(job.completedAt || job.createdAt).toLocaleString()}</span>
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => router.push(`/prescription-analyzer?jobId=${job.jobId}`)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider transition-colors shadow-md shadow-amber-500/25"
                          >
                            <span>View Report</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

        {/* ── STEP 1: UPLOAD & QUEUE DASHBOARD AREA ──────────────── */}
        {step === 'idle' && (
          <div className="space-y-10">
            
            {/* File upload zone container */}
            <div className="bg-card border border-border rounded-3xl p-8 shadow-xl flex flex-col items-center justify-center">
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="w-full max-w-2xl border-2 border-dashed border-border hover:border-primary/50 bg-surface/50 hover:bg-surface rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[260px] group shadow-inner"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                  className="hidden"
                />

                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5 group-hover:scale-105 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>

                <h3 className="font-bold text-lg text-text-base mb-1">
                  Upload Prescription
                </h3>
                <p className="text-xs text-text-muted max-w-sm leading-relaxed mb-6 font-semibold">
                  JPG, PNG or PDF • Max 10MB
                </p>

                <button 
                  type="button"
                  className="px-6 h-12 rounded-xl bg-[#009b86] hover:bg-[#008674] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-[#009b86]/20"
                >
                  <Camera className="w-4 h-4" />
                  <span>Upload Image</span>
                </button>

                <p className="text-xs text-text-muted font-bold uppercase tracking-wider mt-4">
                  or drag and drop your file here
                </p>
              </div>

              {/* Uploaded File Indicators */}
              {file && (
                <div className="w-full max-w-2xl mt-6 p-4 bg-surface border border-border rounded-2xl flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg border border-border overflow-hidden bg-black flex items-center justify-center shrink-0">
                      {previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <FileImage className="w-6 h-6 text-text-muted" />
                      )}
                    </div>
                    <div>
                      <p className="text-text-base font-bold text-sm truncate max-w-xs">{file.name}</p>
                      <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                        <span>Uploaded successfully</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleAnalyze}
                      className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-primary/20"
                    >
                      Process Analysis
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-3 py-2 border border-border rounded-xl text-text-muted hover:text-text-base text-xs font-bold uppercase transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

      
          </div>
        )}

        {/* ── STEP 2: ANALYZING LOADING SCREEN ──────────────────── */}
        {step === 'analyzing' && (
          <div className="max-w-xl mx-auto py-16 flex flex-col items-center justify-center gap-6 text-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
              <div className="w-16 h-16 rounded-full border-t-2 border-primary animate-spin" />
              <Activity className="w-7 h-7 text-primary absolute animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-text-base">Analyzing Prescription Handwriting</h3>
              <p className="text-xs text-text-muted font-bold tracking-wider animate-pulse max-w-md mx-auto leading-relaxed">
                {loadingMessages[loadingPhase]}
              </p>
            </div>

            <div className="bg-card border border-border p-5 rounded-2xl max-w-md space-y-2 shadow-xl text-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center justify-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Processing in Background</span>
              </h4>
              <p className="text-xs text-text-muted leading-relaxed font-semibold">
                You can safely navigate away from this page. Our cloud queue handles parsing in the background. Once ready, you will receive a notification to view results.
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 3: RESULTS OVERHAUL OVERLAY ──────────────────── */}
        {step === 'results' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Analysis Complete Status Card */}
            <div className="bg-[#e6fbf7] dark:bg-[#06211e] border border-emerald-500/20 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#c2f6ec] dark:bg-[#0b3d36] flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Check className="w-6 h-6 stroke-[3px]" />
                </div>
                <div>
                  <h3 className="font-black text-base text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <span>Analysis Complete</span>
                    <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                    We found {prescribedData.length} medicines in your prescription (searched by generic name)
                  </p>
                </div>
              </div>

              {/* Timestamp */}
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider self-end sm:self-auto">
                <Calendar className="w-4 h-4" />
                <span>{analysisDate}</span>
              </div>
            </div>

            {/* Medicines Generic info Banner */}
            <div className="bg-[#e6f0fa] dark:bg-[#071c35] border border-blue-500/20 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-blue-900 dark:text-blue-200">
                    Medicines are identified by their generic names
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold mt-0.5 leading-relaxed">
                    Generic medicines contain the same active ingredients and work the same way.
                  </p>
                </div>
              </div>
              
              <button 
                type="button"
                className="px-4 py-2 border border-blue-400/30 hover:bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-all self-stretch sm:self-auto justify-center flex shrink-0"
              >
                Learn more
              </button>
            </div>

            {/* Tabs selector */}
            <div className="flex border-b border-border font-bold text-xs uppercase tracking-wider select-none">
              <button
                onClick={() => setActiveTab('medicines')}
                className={`px-5 py-4 border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'medicines'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-muted hover:text-text-base'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Medicines ({prescribedData.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('advice')}
                className={`px-5 py-4 border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'advice'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-muted hover:text-text-base'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>General Advice</span>
              </button>
            </div>

            {/* Tab: Medicines List */}
            {activeTab === 'medicines' && (
              <div className="space-y-6">
                {prescribedData.map((med, medIdx) => {
                  // Find matching alternative family group
                  const altGroup = alternativesData.find(
                    g => g.prescribedName === med.medicineName || g.genericName === med.genericName
                  );
                  const alternatives = altGroup ? altGroup.alternatives : [];

                  const hasMoreThanThree = alternatives.length > 3;
                  const isShowingAll = !!showAllAlternatives[medIdx];
                  const visibleAlternatives = isShowingAll ? alternatives : alternatives.slice(0, 3);

                  return (
                    <div 
                      key={medIdx} 
                      className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12"
                    >
                      {/* Left Column: Medicine details */}
                      <div className="lg:col-span-6 p-6 flex gap-4 border-r border-border">
                        {/* Number Badge */}
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/25 font-black text-base flex items-center justify-center shrink-0">
                          {medIdx + 1}
                        </div>

                        <div className="space-y-4 flex-1">
                          <div>
                            <h4 className="font-black text-xl text-text-base">{med.medicineName}</h4>
                            <p className="text-xs text-text-muted font-bold uppercase mt-0.5">{med.strength || "Dosage Strength"}</p>
                          </div>

                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded bg-primary/15 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider">
                            Generic Name: {med.genericName}
                          </span>

                          <div className="space-y-1.5 text-xs text-text-sub font-semibold leading-relaxed">
                            <p className="text-text-base font-bold">Clinical Use</p>
                            <p>{med.description}</p>
                          </div>

                          <div className="space-y-1.5 text-xs leading-relaxed border-t border-border pt-4">
                            <p className="font-bold text-red-500 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>Common Side Effects</span>
                            </p>
                            <p className="text-text-muted font-semibold">{med.sideEffects}</p>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Alternative generic substitutes */}
                      <div className="lg:col-span-6 p-6 bg-surface/30 flex flex-col justify-between">
                        <div className="space-y-4">
                          
                          {/* Alternative header */}
                          <div className="flex justify-between items-center border-b border-border pb-3">
                            <h5 className="font-bold text-xs text-text-base uppercase tracking-wider flex items-center gap-1.5">
                              <TrendingDown className="w-4 h-4 text-primary shrink-0 animate-pulse" />
                              <span>Alternative Medicines ({alternatives.length})</span>
                            </h5>
                          </div>

                          {/* Alternatives list */}
                          {alternatives.length === 0 ? (
                            <p className="text-xs text-text-muted italic py-6">No generic substitutes found in registry.</p>
                          ) : (
                            <div className="space-y-2">
                              {visibleAlternatives.map((alt, altIdx) => {
                                const key = `${medIdx}-${altIdx}`;
                                const isExpanded = expandedAltKey === key;

                                return (
                                  <div 
                                    key={altIdx} 
                                    className="border border-border rounded-xl bg-card overflow-hidden transition-all shadow-sm"
                                  >
                                    <div 
                                      onClick={() => toggleExpandAlternative(key)}
                                      className="p-3 flex justify-between items-center cursor-pointer hover:bg-surface/50 select-none text-xs font-bold font-semibold text-text-base"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="text-text-muted">{altIdx + 1}.</span>
                                        <div>
                                          <p className="font-bold text-text-base">{alt.brandName}</p>
                                          <p className="text-[10px] text-text-muted font-medium mt-0.5">{alt.manufacturer}</p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-3">
                                        <span className="text-primary font-black">{alt.priceBDT}</span>
                                        {isExpanded ? (
                                          <ChevronUp className="w-4 h-4 text-text-muted shrink-0" />
                                        ) : (
                                          <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
                                        )}
                                      </div>
                                    </div>

                                    {/* Expanded Details Grid */}
                                    {isExpanded && (
                                      <div className="p-4 border-t border-border bg-surface/50 text-[11px] leading-relaxed text-text-sub font-semibold grid grid-cols-2 gap-3 animate-fade-in">
                                        <div className="col-span-2">
                                          <p className="text-[9px] font-bold uppercase text-text-muted tracking-wider">Generic Equivalency</p>
                                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-500 font-bold mt-0.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                            Same Active Ingredient (Bioequivalent)
                                          </span>
                                        </div>

                                        <div>
                                          <p className="text-[9px] font-bold uppercase text-text-muted tracking-wider">Dosage Form</p>
                                          <p className="text-text-base mt-0.5 font-bold">Capsule/Tablet</p>
                                        </div>

                                        <div>
                                          <p className="text-[9px] font-bold uppercase text-text-muted tracking-wider">Strength</p>
                                          <p className="text-text-base mt-0.5 font-bold">{med.strength || "Standard"}</p>
                                        </div>

                                        <div className="col-span-2 border-t border-border/60 pt-2">
                                          <p className="text-[9px] font-bold uppercase text-text-muted tracking-wider">Savings Profile</p>
                                          <p className="text-primary font-bold text-xs mt-0.5">{alt.savingsInfo}</p>
                                        </div>

                                        <div className="col-span-2">
                                          <p className="text-[9px] font-bold uppercase text-text-muted tracking-wider">Description</p>
                                          <p className="text-text-muted mt-0.5 text-xs font-medium">{alt.description}</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* View more / dropdown controls */}
                        <div className="pt-4 border-t border-border/80 flex items-center justify-between text-xs font-bold text-primary">
                          <span>Verified by pharmaceutical grounding index</span>
                          
                          {hasMoreThanThree && (
                            <button
                              type="button"
                              onClick={() => toggleShowAllAlternatives(medIdx)}
                              className="hover:underline flex items-center gap-0.5 transition-colors"
                            >
                              <span>{isShowingAll ? "Show fewer alternatives" : `View more alternatives (${alternatives.length - 3} more)`}</span>
                              {isShowingAll ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab: General Advice */}
            {activeTab === 'advice' && (
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6 shadow-xl leading-relaxed">
                <h3 className="font-bold text-lg text-text-base border-b border-border pb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary shrink-0" />
                  <span>General Pharmaceutical Guidance</span>
                </h3>

                <div className="space-y-4 text-xs font-semibold text-text-sub">
                  <p>
                    1. **Bioequivalence**: All recommended alternatives share the identical chemical generic active substance as your prescribed medicine. They produce exact bioequivalent therapeutic effects inside the human body.
                  </p>
                  <p>
                    2. **Consult Physician**: Do not alter, swap, or suspend prescribed antibiotics or cardiovascular maintenance regimens without confirming directly with your doctor.
                  </p>
                  <p>
                    3. **Storage Instructions**: Store all medicines in a cool, dry place away from direct sunlight, below 30°C. Keep out of reach of children.
                  </p>
                </div>
              </div>
            )}

            {/* Reset button row */}
            <div className="flex justify-center pt-6 border-t border-border">
              <button
                onClick={handleReset}
                className="flex items-center gap-2.5 px-6 h-12 rounded-xl border border-border bg-card hover:bg-surface text-text-sub hover:text-text-base text-xs font-bold uppercase tracking-wider transition-all shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Upload Another Prescription</span>
              </button>
            </div>

            {/* Bottom Disclaimer Banner */}
            <div className="bg-[#fef9c3] dark:bg-[#25220c] border border-amber-500/25 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200">
                    Disclaimer
                  </h4>
                  <p className="text-xs text-amber-800 dark:text-amber-300 font-semibold mt-0.5 leading-relaxed max-w-2xl">
                    This analysis is for informational purposes only and not a substitute for professional medical advice. Always consult your doctor or pharmacist before making any changes to your medication.
                  </p>
                </div>
              </div>
              
              {/* Decorative Mock Pills container */}
              <div className="hidden lg:flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase text-amber-700 dark:text-amber-300">
                <span>Verified Rx</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default function PrescriptionAnalyzerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center text-text-muted">Loading Prescription Intelligence...</div>}>
      <PrescriptionAnalyzerContent />
    </Suspense>
  );
}
