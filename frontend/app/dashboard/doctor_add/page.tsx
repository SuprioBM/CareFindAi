'use client';

import { useEffect, useState } from 'react';
import DashboardSidebar from '@/components/dashboard/dashBoardsidebar';
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

  const fetchSuggestions = async () => {
    try {
      const res = await apiFetch('/doctor-join-requests'); // IMPORTANT: your real API
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  return (
    <div className="bg-surface text-text-base h-screen flex overflow-hidden">

      {/* SIDEBAR */}
      <DashboardSidebar />

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">

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
          <table className="w-full text-sm">
            <thead className="bg-section-teal">
              <tr>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Specialization</th>
                <th className="p-4 text-left">Hospital</th>
                <th className="p-4 text-left">City</th>
                <th className="p-4 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {data.map((d) => (
                <tr key={d._id} className="border-t border-border">
                  <td className="p-4">{d.fullName}</td>
                  <td className="p-4">{d.specialization?.name || 'N/A'}</td>
                  <td className="p-4">{d.hospitalOrClinic}</td>
                  <td className="p-4">{d.city}</td>
                  <td className="p-4">
                    <StatusBadge status={d.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL */}
        <SuggestDoctorModal
          open={open}
          onClose={() => {
            setOpen(false);
            fetchSuggestions();
          }}
        />
      </main>
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