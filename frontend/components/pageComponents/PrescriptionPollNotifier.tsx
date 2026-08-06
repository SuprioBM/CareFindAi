'use client';

import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/authContext/authContext';

type JobItem = {
  jobId: string;
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: number;
};

export default function PrescriptionPollNotifier() {
  const { user } = useAuth();
  const [hasCheckedUnseen, setHasCheckedUnseen] = useState(false);
  
  // Track already notified jobIds in the current page session & cache to prevent duplicates
  const notifiedRefs = useRef<Set<string>>(new Set());

  // Load notified jobs from localStorage
  const getToastedJobs = (): Set<string> => {
    if (typeof window === 'undefined') return new Set();
    const val = localStorage.getItem('carefind_toasted_jobs');
    return val ? new Set(JSON.parse(val)) : new Set();
  };

  const addToastedJob = (jobId: string) => {
    if (typeof window === 'undefined') return;
    const current = getToastedJobs();
    current.add(jobId);
    localStorage.setItem('carefind_toasted_jobs', JSON.stringify(Array.from(current)));
  };

  // 1. Initial unseen check on login / mount
  useEffect(() => {
    if (!user || hasCheckedUnseen) return;

    const checkUnseen = async () => {
      try {
        const res = await apiFetch('/prescription/unseen');
        if (!res.ok) return;

        const data = await res.json();
        const cacheToasted = getToastedJobs();
        
        if (data.jobs && data.jobs.length > 0) {
          // Filter out jobs that we have already notified in this session or in cache
          const unnotifiedJobs = data.jobs.filter((j: any) => 
            !notifiedRefs.current.has(j.jobId) && !cacheToasted.has(j.jobId)
          );

          if (unnotifiedJobs.length === 0) {
            setHasCheckedUnseen(true);
            return;
          }

          const count = unnotifiedJobs.length;
          if (count === 1) {
            const job = unnotifiedJobs[0];
            notifiedRefs.current.add(job.jobId);
            addToastedJob(job.jobId);
            
            toast.info(`🔔 1 Report Awaiting Review`, {
              description: `Click below to review your completed prescription analysis.`,
              action: {
                label: "View Report",
                onClick: () => {
                  window.location.href = `/prescription-analyzer?jobId=${job.jobId}`;
                }
              },
              duration: 15000
            });
          } else {
            unnotifiedJobs.forEach((j: any) => {
              notifiedRefs.current.add(j.jobId);
              addToastedJob(j.jobId);
            });
            
            toast.info(`🔔 ${count} Reports Awaiting Review`, {
              description: `Click below to review your completed prescription analyses.`,
              action: {
                label: "Open Analyzer",
                onClick: () => {
                  window.location.href = `/prescription-analyzer`;
                }
              },
              duration: 15000
            });
          }
        }
        setHasCheckedUnseen(true);
      } catch (err) {
        console.error("Error checking unseen reports in background:", err);
      }
    };

    checkUnseen();
  }, [user, hasCheckedUnseen]);

  // Reset checked states if user changes/logs out
  useEffect(() => {
    if (!user) {
      setHasCheckedUnseen(false);
      notifiedRefs.current.clear();
    }
  }, [user]);

  // 2. Active jobs polling from database history directly (multi-device robust)
  useEffect(() => {
    if (!user) return;

    const pollJobs = async () => {
      try {
        // Fetch all jobs to inspect statuses
        const res = await apiFetch('/prescription/history');
        if (!res.ok) return;

        const data = await res.json();
        const historyList = data.jobs || [];

        // Filter active jobs in history
        const activeJobs = historyList.filter((j: any) => j.status === 'pending' || j.status === 'processing');
        if (activeJobs.length === 0) return;

        const cacheToasted = getToastedJobs();
        let updatedLocal = false;

        await Promise.all(
          activeJobs.map(async (job: any) => {
            try {
              // Retrieve fresh status from server
              const statusRes = await apiFetch(`/prescription/job/${job.jobId}/status`);
              if (!statusRes.ok) return;

              const statusData = await statusRes.json();
              
              if (statusData.status === 'completed') {
                // Trigger completed notification if not already notified
                if (!notifiedRefs.current.has(job.jobId) && !cacheToasted.has(job.jobId)) {
                  notifiedRefs.current.add(job.jobId);
                  addToastedJob(job.jobId);
                  
                  toast.success('Prescription scan complete! 🎉', {
                    description: `AI has completed the analysis report.`,
                    action: {
                      label: "View Results",
                      onClick: () => {
                        window.location.href = `/prescription-analyzer?jobId=${job.jobId}`;
                      }
                    },
                    duration: 12000
                  });
                }
                updatedLocal = true;
              } else if (statusData.status === 'failed') {
                // Trigger failed notification if not already notified
                if (!notifiedRefs.current.has(job.jobId) && !cacheToasted.has(job.jobId)) {
                  notifiedRefs.current.add(job.jobId);
                  addToastedJob(job.jobId);

                  toast.error('Prescription analysis failed ❌', {
                    description: statusData.error || 'Unknown error occurred.',
                    duration: 8000
                  });
                }
                updatedLocal = true;
              }
            } catch (err) {
              console.error(`Error polling active job ${job.jobId}:`, err);
            }
          })
        );

        if (updatedLocal) {
          // Synchronize localStorage cache for consistency
          const currentJobsStr = localStorage.getItem('carefind_prescription_jobs');
          if (currentJobsStr) {
            const currentJobs: JobItem[] = JSON.parse(currentJobsStr);
            const syncList = currentJobs.map(cj => {
              // Find matching active job update
              const match = activeJobs.find((j: any) => j.jobId === cj.jobId);
              if (match) {
                // Update local storage status
                return {
                  ...cj,
                  status: match.status === 'processing' || match.status === 'pending' ? 'completed' : match.status
                };
              }
              return cj;
            });
            localStorage.setItem('carefind_prescription_jobs', JSON.stringify(syncList));
          }
        }

      } catch (error) {
        console.error('PrescriptionPollNotifier background error:', error);
      }
    };

    pollJobs();
    const interval = setInterval(pollJobs, 8000);

    return () => clearInterval(interval);
  }, [user]);

  return null;
}
