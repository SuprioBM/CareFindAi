'use client';

import { apiFetch } from '@/lib/api';

export default function ReviewDoctorModal({
  request,
  onClose,
  onUpdated,
}: any) {
  if (!request) return null;

  const approve = async () => {
    try {
      await apiFetch(`/doctor-join-requests/${request._id}/review`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'approved' }),
      });

      onUpdated(request._id, 'approved'); // 🔥 instant update
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const reject = async () => {
    const reason = prompt('Rejection reason (optional)');

    try {
      await apiFetch(`/doctor-join-requests/${request._id}/review`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'rejected',
          rejectionReason: reason || '',
        }),
      });

      onUpdated(request._id, 'rejected'); // 🔥 instant update
      onClose();
    } catch (err) {
      console.error(err);
    }
  };
 const spec =
    typeof request.specialization === 'object'
      ? request.specialization?.name
      : request.specialization;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card w-full max-w-3xl p-4 sm:p-6 rounded-xl max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="text-xl font-bold">Review Doctor Request</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* FULL DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border border-border p-4 rounded-lg">

          <p><b>Name:</b> {request.fullName || '-'}</p>
          <p><b>Email:</b> {request.email || '-'}</p>
          <p><b>Phone:</b> {request.phone || '-'}</p>

          <p><b>Specialization:</b> {spec || '-'}</p>
          <p><b>Experience:</b> {request.experienceYears ?? '-'}</p>
          <p><b>Qualifications:</b> {request.qualifications || '-'}</p>

          <p><b>Hospital:</b> {request.hospitalOrClinic || '-'}</p>
          <p><b>Chamber:</b> {request.chamberAddress || '-'}</p>

          <p><b>City:</b> {request.city || '-'}</p>
          <p><b>Area:</b> {request.area || '-'}</p>
          <p><b>District:</b> {request.district || '-'}</p>
          <p><b>Country:</b> {request.country || '-'}</p>

          <p><b>Appointment Phone:</b> {request.appointmentPhone || '-'}</p>
          <p><b>Website:</b> {request.appointmentWebsite || '-'}</p>

          <p><b>Status:</b> {request.status}</p>
          <p><b>Rejection Reason:</b> {request.rejectionReason || '-'}</p>

        </div>

        {/* DOCUMENTS */}
        {request.documents?.length > 0 && (
          <div className="mt-4">
            <p className="font-semibold mb-2">Documents</p>
            <div className="flex gap-3 flex-wrap">
              {request.documents.map((url: string, i: number) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  className="text-blue-500 underline text-sm"
                >
                  Doc {i + 1}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded w-full sm:w-auto">
            Cancel
          </button>

          {request.status === 'pending' && (
            <>
              <button
                onClick={reject}
                className="px-4 py-2 bg-red-500 text-white rounded w-full sm:w-auto"
              >
                Reject
              </button>

              <button
                onClick={approve}
                className="px-4 py-2 bg-green-600 text-white rounded w-full sm:w-auto"
              >
                Approve
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}