'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronRight
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
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [step, setStep] = useState<'idle' | 'analyzing' | 'results'>('idle');
  const [backgroundProcessingInfo, setBackgroundProcessingInfo] = useState(false);

  // Persistence States
  const [unseenReports, setUnseenReports] = useState<any[]>([]);
  const [historyJobs, setHistoryJobs] = useState<any[]>([]);
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

  // Load and Polling Hook
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

  // Fetch Unseen and History and Merge
  const fetchPersistenceData = async () => {
    if (!user) return;
    try {
      // 1. Fetch unseen reports
      const resUnseen = await apiFetch('/prescription/unseen');
      let unseenList = [];
      if (resUnseen.ok) {
        const data = await resUnseen.json();
        unseenList = data.jobs || [];
        setUnseenReports(unseenList);
      }

      // 2. Fetch history from server
      const resHistory = await apiFetch('/prescription/history');
      let historyList: ServerJob[] = [];
      if (resHistory.ok) {
        const data = await resHistory.json();
        historyList = data.jobs || [];
        setHistoryJobs(historyList);
      }

      // 3. Load from localStorage cache
      const localJobsStr = localStorage.getItem('carefind_prescription_jobs');
      const localJobs: LocalJob[] = localJobsStr ? JSON.parse(localJobsStr) : [];

      // 4. Merge server history and localStorage to form unified list
      const mergedMap = new Map<string, any>();

      // Put server entries first
      historyList.forEach(sj => {
        mergedMap.set(sj.jobId, {
          jobId: sj.jobId,
          fileName: "Prescription Scan", // Fallback name
          status: sj.status,
          createdAt: new Date(sj.createdAt).getTime(),
          completedAt: sj.completedAt ? new Date(sj.completedAt).getTime() : null,
          source: 'server'
        });
      });

      // Override or add local entries (to get custom fileNames and precise times)
      localJobs.forEach(lj => {
        const existing = mergedMap.get(lj.jobId);
        mergedMap.set(lj.jobId, {
          jobId: lj.jobId,
          fileName: lj.fileName || (existing?.fileName ?? "Prescription Scan"),
          status: lj.status || (existing?.status ?? "pending"),
          createdAt: lj.createdAt || (existing?.createdAt ?? Date.now()),
          completedAt: existing?.completedAt ?? null,
          source: 'local'
        });
      });

      const mergedList = Array.from(mergedMap.values());
      // Sort newest first
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
    setBackgroundProcessingInfo(true);

    let attempts = 0;
    const maxAttempts = 120; // 6 minutes limit (3s interval)

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
          setStep('results');
          setLoading(false);

          // Mark report as viewed on database
          await markReportAsViewed(jobId);
          return true; // Stop polling
        } else if (data.status === 'failed') {
          setError(data.error || "Prescription analysis failed.");
          setStep('idle');
          setLoading(false);
          return true; // Stop polling
        }
        
        return false; // Keep polling
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
      
      // Update local storage status cache as well
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
    setShowAlternatives(false);
    setBackgroundProcessingInfo(true);

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

      // Save to localStorage cache
      const existingJobs = JSON.parse(localStorage.getItem('carefind_prescription_jobs') || '[]');
      existingJobs.push({
        jobId,
        fileName: file.name,
        status: parsed.status || 'pending',
        createdAt: Date.now()
      });
      localStorage.setItem('carefind_prescription_jobs', JSON.stringify(existingJobs));

      // Push jobId to router URL query params
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

  // ── AUTHENTICATION CHECK GATE ────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#070b13] flex flex-col items-center justify-center text-text-sub gap-4">
        <Activity className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-semibold tracking-wider">Verifying security keys...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dark bg-[#070b13] text-[#f1f5f9] min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#0d1525] border border-white/10 rounded-2xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 rounded-full blur-[40px] pointer-events-none" />
          
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-white">Sign In Required</h2>
            <p className="text-sm text-text-muted leading-relaxed">
              To securely analyze prescriptions, save scans across devices, and retrieve historical data, please sign in to your CareFind account.
            </p>
          </div>

          <button
            onClick={() => router.push(`/login?redirectTo=/prescription-analyzer`)}
            className="w-full flex items-center justify-center gap-2 rounded-xl h-12 bg-primary hover:bg-primary-hover text-white text-sm font-black tracking-wider uppercase transition-colors shadow-lg shadow-primary/20"
          >
            <span>Sign In to Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dark bg-[#070b13] text-[#f1f5f9] min-h-screen py-10 px-4 md:px-8">
      <div className="max-w-[1100px] mx-auto space-y-10">
        
        {/* Header Title */}
        <div className="flex flex-col gap-2 border-b border-primary/10 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider w-max">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Prescription Intelligence</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            Prescription Analyzer & Alternatives
          </h1>
          <p className="text-text-muted text-sm md:text-base max-w-2xl leading-normal">
            Upload your prescription. Our background queue parsing checks BDT prices and lists Square, Incepta, and Beximco alternatives safely.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3.5 text-sm text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ── UNSEEN REPORT NOTIFICATION CARDS ────────────────────── */}
        {step === 'idle' && unseenReports.length > 0 && (
          <div className="bg-[#0f192e] border border-primary/30 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-primary font-black text-sm uppercase tracking-wider">
              <Clock className="w-5 h-5 animate-pulse" />
              <span>Pending Reviews</span>
            </div>
            
            <h3 className="text-lg font-bold text-white">
              🔔 You have {unseenReports.length} completed prescription analyses waiting to be reviewed.
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unseenReports.map((job) => (
                <div key={job.jobId} className="bg-[#070b13] border border-white/5 p-4 rounded-xl flex items-center justify-between gap-4 text-xs font-semibold">
                  <div>
                    <p className="text-white font-bold">Prescription Analysis</p>
                    <p className="text-[10px] text-text-muted mt-0.5">Finished: {new Date(job.completedAt || job.updatedAt).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => router.push(`/prescription-analyzer?jobId=${job.jobId}`)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-[11px] font-bold tracking-wide transition-colors"
                  >
                    <span>View Report</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeScans.length > 0 && (
              <div className="mt-8 bg-[#0d1525] border border-primary/20 rounded-2xl p-6 space-y-4 shadow-xl max-w-3xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                  <Activity className="w-4 h-4 text-primary shrink-0 animate-pulse" />
                  <span>⏳ Active Analyses in Progress</span>
                </h3>
                <div className="divide-y divide-white/5 space-y-3">
                  {activeScans.map((job) => (
                    <div key={job.jobId} className="pt-2 flex items-center justify-between gap-4 text-xs font-semibold">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#070b13] flex items-center justify-center border border-white/5 shrink-0">
                          <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                        </div>
                        <div>
                          <p className="text-white font-bold">{job.fileName}</p>
                          <p className="text-[10px] text-text-muted mt-0.5">Started: {new Date(job.createdAt).toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/prescription-analyzer?jobId=${job.jobId}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary font-bold transition-colors"
                      >
                        <span>View Live Progress</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
       


        {/* ── SCREEN 1: UPLOAD & INPUT ──────────────────────────── */}
        {step === 'idle' && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Upload Zone */}
              <div className="lg:col-span-2 space-y-6">
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/10 hover:border-primary/50 bg-[#0d1525]/50 hover:bg-[#0d1525]/80 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[300px] group shadow-inner"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8" />
                  </div>
                  
                  <h3 className="font-bold text-lg text-white mb-2">
                    Drag and drop prescription image
                  </h3>
                  <p className="text-xs text-text-muted max-w-sm leading-relaxed mb-6">
                    Supports JPEG, PNG, or mobile camera snapshots.
                  </p>
                  <span className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-black tracking-wider uppercase transition-colors shadow-lg shadow-primary/20">
                    Select File
                  </span>
                </div>
              </div>

              {/* Sidebar Preview */}
              <div className="lg:col-span-1 bg-[#0d1525] border border-white/10 rounded-2xl p-6 space-y-5">
                <h3 className="text-base font-bold flex items-center gap-2 text-primary border-b border-white/5 pb-3">
                  <FileText className="w-4 h-4" /> Selected Image
                </h3>
                
                {previewUrl ? (
                  <div className="space-y-4">
                    <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border border-white/10 bg-[#070b13]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Prescription preview"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAnalyze}
                        className="flex-1 flex items-center justify-center rounded-xl h-11 bg-primary hover:bg-primary-hover text-white text-xs font-black tracking-wider uppercase transition-colors shadow-lg shadow-primary/25"
                      >
                        Analyze Prescription
                      </button>
                      <button
                        onClick={handleReset}
                        className="px-4 h-11 border border-white/10 hover:bg-white/5 rounded-xl text-text-muted hover:text-white transition-colors"
                        title="Clear image"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 rounded-xl border border-dashed border-white/5 bg-[#070b13]/50 flex items-center justify-center text-xs italic text-text-muted">
                    No image selected yet
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── SCREEN 2: ANALYZING STATE ─────────────────────────── */}
        {step === 'analyzing' && (
          <div className="max-w-xl mx-auto py-16 flex flex-col items-center justify-center gap-6 text-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
              <div className="w-16 h-16 rounded-full border-t-2 border-primary animate-spin" />
              <Activity className="w-7 h-7 text-primary absolute animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-white">Analyzing Prescription</h3>
              <p className="text-xs text-text-muted font-bold tracking-wider animate-pulse">
                {loadingMessages[loadingPhase]}
              </p>
            </div>

            {backgroundProcessingInfo && (
              <div className="bg-[#0b1220] border border-primary/20 rounded-2xl p-5 text-sm text-text-sub max-w-md flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>Processing in Background</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  You can safely browse other pages, book doctors, or close this tab. Our queue system is running. Once complete, a global toast notification will show on your screen to direct you back here!
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── SCREEN 3: RESULTS VIEW ────────────────────────────── */}
        {step === 'results' && (
          <div className="space-y-10">
            
            {/* Section Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0d1525] p-5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-base text-white">Clinical Scan Completed</h3>
                  <p className="text-xs text-text-muted">{prescribedData.length} medications identified on prescription.</p>
                </div>
              </div>
              
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 h-11 border border-white/10 hover:bg-white/5 rounded-xl text-xs font-bold uppercase tracking-wider text-text-sub hover:text-white transition-colors self-stretch sm:self-auto justify-center"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Scan Another
              </button>
            </div>

            {/* Prescribed Medications Card Grid */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                <FileText className="w-5 h-5 text-primary" /> Extracted Medications
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {prescribedData.map((med, index) => (
                  <div key={index} className="bg-[#0d1525] border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-primary/20 transition-all gap-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] pointer-events-none" />
                    
                    <div className="space-y-4">
                      {/* Name Header */}
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-[10px] font-black tracking-widest text-primary uppercase">Prescribed Brand</span>
                          <h4 className="font-black text-xl text-white mt-0.5">{med.medicineName}</h4>
                          <p className="text-xs font-bold text-text-muted mt-0.5">{med.strength}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider bg-white/5 border border-white/10 text-white">
                          {med.priceBDT}
                        </span>
                      </div>

                      {/* Dosage details */}
                      <div className="bg-[#070b13] p-3 rounded-xl border border-white/5 text-xs font-semibold text-text-sub space-y-1">
                        <span className="text-[9px] font-black uppercase text-primary tracking-widest block">Dosage & Instructions</span>
                        <p className="text-white leading-relaxed">{med.dosage}</p>
                      </div>

                      {/* Generic and Manufacturer */}
                      <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                        <div>
                          <span className="text-[9px] text-text-muted uppercase tracking-wider block">Generic Group</span>
                          <span className="text-white flex items-center gap-1 mt-0.5">
                            <Layers className="w-3.5 h-3.5 text-primary shrink-0" />
                            {med.genericName}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-text-muted uppercase tracking-wider block">Manufacturer</span>
                          <span className="text-white flex items-center gap-1 mt-0.5">
                            <Building className="w-3.5 h-3.5 text-[#2dd4bf] shrink-0" />
                            {med.manufacturer}
                          </span>
                        </div>
                      </div>

                      {/* Clinical description */}
                      <div className="text-xs leading-relaxed text-text-sub space-y-2 border-t border-white/5 pt-4">
                        <p className="font-semibold text-white">Clinical Indications</p>
                        <p>{med.description}</p>
                      </div>

                      {/* Side effects */}
                      <div className="text-xs leading-relaxed text-text-sub space-y-1 bg-red-500/[0.02] border border-red-500/10 p-3 rounded-xl">
                        <p className="font-bold text-red-400">Core Side Effects</p>
                        <p className="text-red-400/90">{med.sideEffects}</p>
                      </div>
                    </div>

                    {/* Packaging references */}
                    <div className="border-t border-white/5 pt-4 text-xs text-text-muted flex items-center gap-2">
                      <Eye className="w-4 h-4 text-primary shrink-0" />
                      <span>{med.packagingRef}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Gate: See Alternative Medicines */}
            <div className="flex flex-col items-center justify-center py-6 border-t border-white/5">
              <button
                onClick={() => setShowAlternatives(!showAlternatives)}
                className={`flex items-center justify-center gap-2.5 px-8 h-14 rounded-2xl font-black text-base transition-all shadow-xl ${
                  showAlternatives 
                    ? "bg-[#0b1220] border border-white/10 text-white"
                    : "bg-primary hover:bg-primary-hover text-white shadow-primary/25 hover:scale-[1.01]"
                }`}
              >
                <span>{showAlternatives ? "Hide Alternative Medicines" : "See Alternative Medicines (Same Generic Group)"}</span>
                <TrendingDown className="w-5 h-5 shrink-0" />
              </button>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-3">
                Pre-fetched in background • Categorized by generic group
              </p>
            </div>

            {/* Section 2: Alternative Brand Suggestions */}
            <AnimatePresence>
              {showAlternatives && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6 overflow-hidden"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-5 h-5 text-[#2dd4bf]" />
                    <h3 className="text-xl font-bold text-white">Suggested Local Alternatives</h3>
                  </div>

                  <div className="space-y-8">
                    {alternativesData.map((group, groupIdx) => (
                      <div key={groupIdx} className="bg-[#0b1220] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6">
                        
                        {/* Generic Header */}
                        <div className="border-b border-white/5 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                          <div>
                            <span className="text-[9px] font-black uppercase text-primary tracking-widest">Generic Family</span>
                            <h4 className="font-black text-lg md:text-xl text-white mt-0.5">{group.genericName}</h4>
                          </div>
                          <div className="text-left sm:text-right">
                            <span className="text-[9px] font-black uppercase text-text-muted tracking-widest block">Replacing Prescribed</span>
                            <span className="text-xs font-bold text-white bg-white/5 px-2.5 py-1 rounded border border-white/10 mt-1 inline-block">
                              {group.prescribedName}
                            </span>
                          </div>
                        </div>

                        {/* List of alternative cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {group.alternatives.map((alt, altIdx) => (
                            <div key={altIdx} className="bg-[#0d1525] border border-white/5 rounded-xl p-5 hover:border-[#2dd4bf]/30 transition-all flex flex-col justify-between gap-4">
                              <div className="space-y-3">
                                
                                {/* Header */}
                                <div className="flex justify-between items-start gap-4">
                                  <div>
                                    <h5 className="font-bold text-base text-white">{alt.brandName}</h5>
                                    <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1 font-semibold">
                                      <Building className="w-3.5 h-3.5 text-primary shrink-0" />
                                      {alt.manufacturer}
                                    </p>
                                  </div>
                                  <span className="text-xs font-bold text-[#2dd4bf]">
                                    {alt.priceBDT}
                                  </span>
                                </div>

                                {/* Description */}
                                <p className="text-xs text-text-sub leading-relaxed font-semibold">
                                  {alt.description}
                                </p>
                              </div>

                              {/* Savings / Value Indicator */}
                              <div className="bg-[#070b13] p-3 rounded-lg border border-[#2dd4bf]/20 flex items-center justify-between text-xs font-bold text-[#2dd4bf]">
                                <span className="flex items-center gap-1">
                                  <TrendingDown className="w-4 h-4 animate-bounce" />
                                  <span>Value Profile</span>
                                </span>
                                <span>{alt.savingsInfo}</span>
                              </div>

                            </div>
                          ))}
                        </div>

                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}

      </div>
    </div>
  );
}

export default function PrescriptionAnalyzerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070b13] flex items-center justify-center text-white">Loading Prescription Intelligence...</div>}>
      <PrescriptionAnalyzerContent />
    </Suspense>
  );
}
