'use client';

import { useEffect, useState } from 'react';
import { UploadButton } from '@/lib/uploadthings';
import { apiFetch } from '@/lib/api';

type Specialization = {
  _id: string;
  name: string;
};

export default function SuggestDoctorModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);

  const [selectedSpec, setSelectedSpec] = useState('');

  // fetch specializations
  useEffect(() => {
    if (!open) return;

    (async () => {
      try {
        const res = await apiFetch('/specializations');
        const data = await res.json();
        if (data.success) setSpecializations(data.data);
      } catch (err) {
        console.error('Failed to load specializations', err);
      }
    })();
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.target as HTMLFormElement);
    const payload = Object.fromEntries(form.entries());

    try {
      await apiFetch('/doctor-join-requests', {
        method: 'POST',
        body: JSON.stringify({
          ...payload,
          specialization: selectedSpec, // 👈 IMPORTANT: sending ID
          documents: imageUrl ? [imageUrl] : [],
        }),
      });

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card w-full max-w-3xl p-6 rounded-xl overflow-y-auto max-h-[90vh]">

        {/* HEADER */}
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-bold">Suggest Doctor</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* BASIC INFO */}
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Full Name" name="fullName" />
            <Input label="Email" name="email" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">

            {/* SPECIALIZATION DROPDOWN */}
            <div>
              <label className="text-sm text-text-muted">
                Specialization
              </label>

              <select
                className="w-full mt-1 px-3 py-2 rounded border border-border bg-surface"
                value={selectedSpec}
                onChange={(e) => setSelectedSpec(e.target.value)}
                required
              >
                <option value="">Select specialization</option>
                {specializations.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <Input label="Experience Years" name="experienceYears" />
          </div>

          {/* LOCATION */}
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="City" name="city" />
            <Input label="Area" name="area" />
          </div>

          <Input label="Hospital / Clinic" name="hospitalOrClinic" />
          <Input label="Chamber Address" name="chamberAddress" />

          {/* CONTACT */}
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Phone" name="phone" />
            <Input label="Appointment Website" name="appointmentWebsite" />
          </div>

          {/* UPLOADTHING */}
          <div>
            <p className="text-sm mb-2">Upload Documents</p>

            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                setImageUrl(res?.[0]?.url || '');
              }}
            />
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose}>
              Cancel
            </button>

            <button
              disabled={loading}
              className="px-5 py-2 bg-primary text-white rounded"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* INPUT COMPONENT */
function Input({ label, name }: any) {
  return (
    <div>
      <label className="text-sm text-text-muted">{label}</label>
      <input
        name={name}
        className="w-full mt-1 px-3 py-2 rounded border border-border bg-surface"
      />
    </div>
  );
}