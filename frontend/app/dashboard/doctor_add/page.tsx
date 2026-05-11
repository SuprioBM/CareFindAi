'use client';

import { useEffect, useRef, useState } from 'react';
import SuggestDoctorModal from '@/components/ModalComponent/SuggestedDoctor';
import { apiFetch } from '@/lib/api';

type Suggestion = {
  _id: string;
  fullName: string;
  specialization: any;
  hospitalOrClinic: string;
  city: string;
  status: 'pending' | 'approved' | 'rejected';
};

export default function SuggestDoctorPage() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Suggestion[]>([]);
  const tableScrollRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = async () => {
    try {
      const res = await apiFetch('/doctor-join-requests');
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  useEffect(() => {
    const el = tableScrollRef.current;
    if (!el) return;
    // after animation ends, switch to normal scrollable
    const onEnd = () => {
      el.style.overflowX = 'auto';
      el.classList.remove('animate-table-reveal');
    };
    el.addEventListener('animationend', onEnd, { once: true });
    return () => el.removeEventListener('animationend', onEnd);
  }, []);

  return (
    <div className="p-6 lg:p-10">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Doctor Suggestions</h1>
          <p className="text-text-muted text-sm">
            Track your submitted doctor requests
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="px-5 py-2.5 bg-primary text-white rounded-lg"
        >
          + Suggest Doctor
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div
          ref={tableScrollRef}
          className="animate-table-reveal"
          onScroll={(e) => {
            const el = e.currentTarget;
            el.classList.toggle('scrolled', el.scrollLeft > 2);
          }}
        >
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-section-teal">
              <tr>
                <th className="sticky-col relative sticky left-0 z-10 bg-section-teal p-4 text-left font-semibold text-text-muted">
                  Name
                </th>
                <th className="p-4 text-left font-semibold text-text-muted">Specialization</th>
                <th className="p-4 text-left font-semibold text-text-muted">Hospital</th>
                <th className="p-4 text-left font-semibold text-text-muted">City</th>
                <th className="p-4 text-left font-semibold text-text-muted">Status</th>
              </tr>
            </thead>

            <tbody>
              {data.map((d) => (
                <tr
                  key={d._id}
                  className="border-t border-border hover:bg-section-teal/50 transition-colors group"
                >
                  {/* sticky Name cell — bg must match sibling tds exactly */}
                  <td className="sticky-col relative sticky left-0 z-10 bg-card group-hover:bg-section-teal/50 p-4 text-text-base">
                    {d.fullName}
                  </td>
                  {/* all other tds get bg-card too so colour is identical */}
                  <td className="p-4 bg-card group-hover:bg-section-teal/50 text-text-base">
                    {d.specialization?.name || 'N/A'}
                  </td>
                  <td className="p-4 bg-card group-hover:bg-section-teal/50 text-text-base">
                    {d.hospitalOrClinic}
                  </td>
                  <td className="p-4 bg-card group-hover:bg-section-teal/50 text-text-base">
                    {d.city}
                  </td>
                  <td className="p-4 bg-card group-hover:bg-section-teal/50">
                    <StatusBadge status={d.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      <SuggestDoctorModal
        open={open}
        onClose={() => {
          setOpen(false);
          fetchSuggestions();
        }}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: any = {
    pending: 'bg-warning/10 text-warning',
    approved: 'bg-success/10 text-success',
    rejected: 'bg-error/10 text-error',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${map[status]}`}>
      {status}
    </span>
  );
}