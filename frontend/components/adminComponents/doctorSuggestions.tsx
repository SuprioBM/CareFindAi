'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import ReviewDoctorModal from '@/components/ModalComponent/ReviewModal';

type Request = {
  _id: string;
  fullName: string;
  specialization: any;
  city: string;
  hospitalOrClinic: string;
  status: 'pending' | 'approved' | 'rejected';
};

export default function AdminDoctorSuggestionsPage() {
  const [data, setData] = useState<Request[]>([]);
  const [selected, setSelected] = useState<Request | null>(null);

  // fetch once
  const fetchData = async () => {
    try {
      const res = await apiFetch('/doctor-join-requests');
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔥 INSTANT UPDATE HANDLER
  const handleUpdate = (id: string, newStatus: Request['status']) => {
    setData((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, status: newStatus } : item
      )
    );
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        Doctor Join Requests
      </h1>

      {/* EMPTY STATE */}
      {data.length === 0 ? (
        <div className="p-10 text-center text-text-muted border border-border rounded-xl">
          No doctor requests found
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-section-teal">
              <tr>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">City</th>
                <th className="p-4 text-left">Hospital</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {data.map((d) => (
                <tr key={d._id} className="border-t border-border">

                  <td className="p-4 font-medium">{d.fullName}</td>
                  <td className="p-4">{d.city}</td>
                  <td className="p-4">{d.hospitalOrClinic}</td>

                  <td className="p-4">
                    <StatusBadge status={d.status} />
                  </td>

                  <td className="p-4 text-right">
                    {d.status === 'pending' ? (
                      <button
                        onClick={() => setSelected(d)}
                        className="px-3 py-1 bg-primary text-white rounded"
                      >
                        Review
                      </button>
                    ) : (
                      <span className="text-text-muted text-xs">
                        Locked
                      </span>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL */}
      <ReviewDoctorModal
        request={selected}
        onClose={() => setSelected(null)}
        onUpdated={(id: string, status: Request['status']) => {
          handleUpdate(id, status);   // 🔥 instant UI update
        }}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: any = {
    pending: 'text-yellow-500',
    approved: 'text-green-500',
    rejected: 'text-red-500',
  };

  return (
    <span className={`font-medium ${map[status]}`}>
      {status}
    </span>
  );
}