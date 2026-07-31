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
  
  // Track already notified jobIds in the current page session to prevent duplicates
  const notifiedRefs = useRef<Set<string>>(new Set());

  // 1. Initial unseen check on login / mount
  useEffect(() => {
    if (!user || hasCheckedUnseen) return;

    const checkUnseen = async () => {
      try {
        const res = await apiFetch('/prescription/unseen');
        if (!res.ok) return;

        const data = await res.json();
        if (data.jobs && data.jobs.length > 0) {
          // Filter out jobs that we have already notified in this session
          const unnotifiedJobs = data.jobs.filter((j: any) => !notifiedRefs.current.has(j.jobId));
          if (unnotifiedJobs.length === 0) {
            setHasCheckedUnseen(true);
            return;
          }

          const count = unnotifiedJobs.length;
          if (count === 1) {
            const job = unnotifiedJobs[0];
            notifiedRefs.current.add(job.jobId);
            
            toast.info(`🔔 Your prescription analysis is ready.`, {
              description: `Ready to review. Click below to load.`,
              action: {
                label: "View Report",
                onClick: () => {
                  window.location.href = `/prescription-analyzer?jobId=${job.jobId}`;
                }
              },
              duration: 15000
            });
          } else {
            // Mark all as notified
            unnotifiedJobs.forEach((j: any) => notifiedRefs.current.add(j.jobId));
            
            toast.info(`🔔 You have ${count} completed prescription analyses waiting.`, {
              description: `Click to view your history and reports.`,
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

  // 2. Local active jobs polling
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const pollJobs = async () => {
      try {
        const jobsStr = localStorage.getItem('carefind_prescription_jobs');
        if (!jobsStr) return;

        let jobs: JobItem[] = JSON.parse(jobsStr);
        // Only poll jobs that are still pending or processing
        const activeJobs = jobs.filter(j => j.status === 'pending' || j.status === 'processing');
        if (activeJobs.length === 0) return;

        let updated = false;

        await Promise.all(
          activeJobs.map(async (job) => {
            try {
              const res = await apiFetch(`/prescription/job/${job.jobId}/status`);
              if (!res.ok) return;

              const data = await res.json();
              
              if (data.status === 'completed') {
                // Only show toast if not already notified
                if (!notifiedRefs.current.has(job.jobId)) {
                  notifiedRefs.current.add(job.jobId);
                  
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

                // Update state in localStorage
                job.status = 'completed';
                updated = true;
              } else if (data.status === 'failed') {
                // Only show toast if not already notified
                if (!notifiedRefs.current.has(job.jobId)) {
                  notifiedRefs.current.add(job.jobId);

                  toast.error('Prescription analysis failed ❌', {
                    description: data.error || 'Unknown error occurred.',
                    duration: 8000
                  });
                }

                job.status = 'failed';
                updated = true;
              } else if (data.status !== job.status) {
                job.status = data.status;
                updated = true;
              }
            } catch (err) {
              console.error(`Error polling job status for ${job.jobId}:`, err);
            }
          })
        );

        if (updated) {
          // Synchronize localStorage with new status states
          const currentJobs: JobItem[] = JSON.parse(localStorage.getItem('carefind_prescription_jobs') || '[]');
          const synchronizedJobs = currentJobs.map(cj => {
            const match = jobs.find(j => j.jobId === cj.jobId);
            return match ? match : cj;
          });
          
          localStorage.setItem('carefind_prescription_jobs', JSON.stringify(synchronizedJobs));
        }

      } catch (error) {
        console.error('PrescriptionPollNotifier active polling error:', error);
      }
    };

    pollJobs();
    const interval = setInterval(pollJobs, 8000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
