'use client';

import type { Doctor } from '../../types/types';

type Props = {
  open: boolean;
  doctor: Doctor | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-text-base">{title}</h3>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-lg border border-border text-text-muted hover:text-text-base hover:bg-section-teal transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function DeleteDoctorModal({
  open,
  doctor,
  loading,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Modal open={open} onClose={onClose} title="Delete Doctor">
      <div className="p-6">
        <p className="text-sm text-text-sub">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-text-base">{doctor?.fullName}</span>? This
          action cannot be undone.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-text-sub hover:bg-section-teal transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="rounded-xl bg-error hover:bg-error/90 disabled:opacity-60 px-5 py-2 text-sm font-semibold text-white transition-colors"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  );
}