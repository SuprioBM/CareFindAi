'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api';
import Pagination from '@/components/pageComponents/Pagination';

// ── Types ─────────────────────────────────────────────────────
interface Specialization {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
  doctorCount: number;
}

interface FormState {
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
}

const EMPTY_FORM: FormState = {
  name: '',
  slug: '',
  description: '',
  icon: 'stethoscope',
  isActive: true,
};

// auto-generate slug from name
function toSlug(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ── Add Modal ─────────────────────────────────────────────────
interface ModalProps {
  onClose: () => void;
  onCreated: (spec: Specialization) => void;
}

function AddSpecializationModal({ onClose, onCreated }: ModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [slugEdited, setSlugEdited] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // auto-sync slug unless user manually edited it
      if (field === 'name' && !slugEdited) {
        next.slug = toSlug(value as string);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      setError('Name and slug are required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await apiFetch('/specializations', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || 'Failed to create specialization.');
        return;
      }

      onCreated(data.data);
      onClose();
    } catch (e) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h3 className="text-lg font-bold text-text-base">Add Specialization</h3>
            <p className="text-sm text-text-muted mt-0.5">Create a new medical specialization category.</p>
          </div>
          <button
            onClick={onClose}
            className="size-9 flex items-center justify-center rounded-xl border border-border text-text-muted hover:text-error hover:border-error/40 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-text-base">
              Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Cardiologist"
              className="h-11 px-4 rounded-xl border border-border bg-surface text-text-base text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none placeholder:text-text-muted transition-all"
            />
          </div>

          {/* Slug */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-text-base">
              Slug <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => {
                setSlugEdited(true);
                set('slug', e.target.value);
              }}
              placeholder="e.g. cardiologist"
              className="h-11 px-4 rounded-xl border border-border bg-surface text-text-base text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none placeholder:text-text-muted transition-all font-mono"
            />
            <p className="text-xs text-text-muted">Auto-generated from name. Lowercase, hyphens only.</p>
          </div>

          {/* Icon */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-text-base">Icon</label>
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-xl border border-border bg-surface flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[24px]">{form.icon || 'stethoscope'}</span>
              </div>
              <input
                type="text"
                value={form.icon}
                onChange={(e) => set('icon', e.target.value)}
                placeholder="material symbol name, e.g. favorite"
                className="flex-1 h-11 px-4 rounded-xl border border-border bg-surface text-text-base text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none placeholder:text-text-muted transition-all"
              />
            </div>
            <p className="text-xs text-text-muted">
              Any{' '}
              <a
                href="https://fonts.google.com/icons"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Material Symbol
              </a>{' '}
              name.
            </p>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-text-base">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Brief description of this specialization..."
              rows={3}
              className="px-4 py-3 rounded-xl border border-border bg-surface text-text-base text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none placeholder:text-text-muted transition-all resize-none"
            />
          </div>

          {/* Status toggle */}
          <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border">
            <div>
              <p className="text-sm font-semibold text-text-base">Active</p>
              <p className="text-xs text-text-muted mt-0.5">Inactive specializations won't appear in doctor search.</p>
            </div>
            <button
              onClick={() => set('isActive', !form.isActive)}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-primary' : 'bg-border'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 size-5 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-error bg-error/10 border border-error/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
        </div>

        {/* Modal footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            disabled={submitting}
            className="h-10 px-5 rounded-xl border border-border text-text-base text-sm font-semibold hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="h-10 px-5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold transition-colors shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">add</span>
                Create
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Modal ────────────────────────────────────────────────
interface EditModalProps {
  spec: Specialization;
  onClose: () => void;
  onUpdated: (spec: Specialization) => void;
}

function EditSpecializationModal({ spec, onClose, onUpdated }: EditModalProps) {
  const [form, setForm] = useState<FormState>({
    name: spec.name,
    slug: spec.slug,
    description: spec.description,
    icon: spec.icon,
    isActive: spec.isActive,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (field: keyof FormState, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      setError('Name and slug are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await apiFetch(`/specializations/${spec._id}`, {
        method: 'PATCH',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message || 'Failed to update.'); return; }
      onUpdated({ ...spec, ...data.data });
      onClose();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h3 className="text-lg font-bold text-text-base">Edit Specialization</h3>
            <p className="text-sm text-text-muted mt-0.5">Update details for <span className="font-semibold text-primary">{spec.name}</span>.</p>
          </div>
          <button onClick={onClose} className="size-9 flex items-center justify-center rounded-xl border border-border text-text-muted hover:text-error hover:border-error/40 transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-text-base">Name <span className="text-error">*</span></label>
            <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)}
              className="h-11 px-4 rounded-xl border border-border bg-surface text-text-base text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none placeholder:text-text-muted transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-text-base">Slug <span className="text-error">*</span></label>
            <input type="text" value={form.slug} onChange={(e) => set('slug', e.target.value)}
              className="h-11 px-4 rounded-xl border border-border bg-surface text-text-base text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none placeholder:text-text-muted transition-all font-mono" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-text-base">Icon</label>
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-xl border border-border bg-surface flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[24px]">{form.icon || 'stethoscope'}</span>
              </div>
              <input type="text" value={form.icon} onChange={(e) => set('icon', e.target.value)}
                placeholder="material symbol name"
                className="flex-1 h-11 px-4 rounded-xl border border-border bg-surface text-text-base text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none placeholder:text-text-muted transition-all" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-text-base">Description</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
              rows={3} className="px-4 py-3 rounded-xl border border-border bg-surface text-text-base text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none placeholder:text-text-muted transition-all resize-none" />
          </div>

          <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border">
            <div>
              <p className="text-sm font-semibold text-text-base">Active</p>
              <p className="text-xs text-text-muted mt-0.5">Inactive specializations won't appear in doctor search.</p>
            </div>
            <button onClick={() => set('isActive', !form.isActive)}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-primary' : 'bg-border'}`}>
              <span className={`absolute top-0.5 left-0.5 size-5 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {error && (
            <p className="text-sm text-error bg-error/10 border border-error/20 rounded-xl px-4 py-3">{error}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button onClick={onClose} disabled={submitting}
            className="h-10 px-5 rounded-xl border border-border text-text-base text-sm font-semibold hover:border-primary hover:text-primary transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            className="h-10 px-5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold transition-colors shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-60">
            {submitting ? (
              <><span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
            ) : (
              <><span className="material-symbols-outlined text-[18px]">save</span>Save Changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────
interface DeleteModalProps {
  spec: Specialization;
  onClose: () => void;
  onDeleted: (id: string) => void;
}

function DeleteSpecializationModal({ spec, onClose, onDeleted }: DeleteModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      const res = await apiFetch(`/specializations/${spec._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) { setError(data.message || 'Failed to delete.'); return; }
      onDeleted(spec._id);
      onClose();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-error/10 border border-error/20 flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[22px]">delete</span>
            </div>
            <h3 className="text-lg font-bold text-text-base">Delete Specialization</h3>
          </div>
          <button onClick={onClose} className="size-9 flex items-center justify-center rounded-xl border border-border text-text-muted hover:text-error hover:border-error/40 transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-text-base text-sm leading-relaxed">
            Are you sure you want to delete{' '}
            <span className="font-bold text-text-base">"{spec.name}"</span>?{' '}
            This action cannot be undone.
          </p>
          {spec.doctorCount > 0 && (
            <div className="mt-4 flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 text-sm">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">warning</span>
              <p><span className="font-bold">{spec.doctorCount} doctor{spec.doctorCount > 1 ? 's' : ''}</span> are assigned to this specialization. Deleting it may affect their profiles.</p>
            </div>
          )}
          {error && (
            <p className="mt-3 text-sm text-error bg-error/10 border border-error/20 rounded-xl px-4 py-3">{error}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button onClick={onClose} disabled={deleting}
            className="h-10 px-5 rounded-xl border border-border text-text-base text-sm font-semibold hover:border-primary hover:text-primary transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="h-10 px-5 rounded-xl bg-error hover:bg-error/90 text-white text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-60">
            {deleting ? (
              <><span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting…</>
            ) : (
              <><span className="material-symbols-outlined text-[18px]">delete</span>Delete</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Specialization Card ───────────────────────────────────────
interface CardProps extends Specialization {
  onEdit: () => void;
  onDelete: () => void;
}

function SpecializationCard({ _id, name, icon, description, doctorCount, isActive, onEdit, onDelete }: CardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <div
      className={`bg-card rounded-2xl p-6 border transition-all relative overflow-hidden group flex flex-col h-full ${
        isActive ? 'border-border hover:border-primary/50' : 'border-border opacity-75 hover:opacity-100'
      }`}
    >
      <div
        className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 ${
          isActive ? 'bg-primary/10' : 'bg-section-teal'
        }`}
      />
      <div className="flex justify-between items-start mb-5 relative z-10">
        <div
          className={`size-14 rounded-2xl flex items-center justify-center shadow-inner border border-border bg-surface ${
            isActive ? 'text-primary' : 'text-text-muted group-hover:text-primary transition-colors'
          }`}
        >
          <span className="material-symbols-outlined text-[32px]">{icon || 'stethoscope'}</span>
        </div>

        <div className="flex gap-2 items-center">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider border ${
              isActive
                ? 'bg-primary/20 text-primary border-primary/30'
                : 'bg-section-teal text-text-muted border-border'
            }`}
          >
            {isActive ? 'ACTIVE' : 'INACTIVE'}
          </span>

          {/* Three-dot menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
              className="text-text-muted hover:text-primary transition-colors size-6 flex items-center justify-center rounded-full hover:bg-surface"
            >
              <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-8 w-40 bg-card border border-border rounded-xl shadow-xl z-30 overflow-hidden">
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-text-base hover:bg-surface hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                  Edit
                </button>
                <div className="h-px bg-border mx-3" />
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-error hover:bg-error/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1">
        <h3
          className={`text-xl font-bold text-text-base mb-2 transition-colors ${
            isActive ? 'group-hover:text-primary' : ''
          }`}
        >
          {name}
        </h3>
        <p className="text-sm text-text-muted mb-6 leading-relaxed">
          {description || 'No description provided.'}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
        <div className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-lg border border-border">
          <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-primary' : 'text-text-muted'}`}>
            group
          </span>
          <span className={`text-sm font-bold ${isActive ? 'text-text-base' : 'text-text-muted'}`}>
            {doctorCount}
          </span>
        </div>
        <button className="text-sm font-bold text-primary hover:text-primary-hover transition-colors flex items-center gap-1 group/btn">
          {isActive ? 'View' : 'Manage'}
          {isActive && (
            <span className="material-symbols-outlined text-[18px] group-hover/btn:translate-x-1 transition-transform">
              arrow_forward
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function Specializations() {
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Specialization | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Specialization | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8; // 8 cards per page (4-col grid × 2 rows), last slot reserved for "Add" card

  useEffect(() => {
    async function load() {
      try {
        setFetching(true);
        const res = await apiFetch('/specializations');
        const data = await res.json();
        if (data.success) setSpecializations(data.data);
      } catch (e) {
        console.error('Failed to load specializations:', e);
      } finally {
        setFetching(false);
      }
    }
    load();
  }, []);

  const handleCreated = (spec: Specialization) => {
    setSpecializations((prev) => [spec, ...prev]);
    setCurrentPage(1);
  };

  const handleUpdated = (updated: Specialization) => {
    setSpecializations((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
  };

  const handleDeleted = (id: string) => {
    setSpecializations((prev) => prev.filter((s) => s._id !== id));
  };

  const filtered = specializations.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'All Statuses' ||
      (statusFilter === 'Active' && s.isActive) ||
      (statusFilter === 'Inactive' && !s.isActive);
    return matchesSearch && matchesStatus;
  });

  // reset to page 1 whenever filters change
  useEffect(() => { setCurrentPage(1); }, [search, statusFilter]);

  const isLastPage = currentPage === Math.ceil(filtered.length / PAGE_SIZE) || filtered.length === 0;
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-base">Specialization Management</h2>
          <p className="text-sm text-text-muted mt-1">Configure categories and assignments.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center rounded-xl h-10 px-5 bg-primary hover:bg-primary-hover text-white text-sm font-bold transition-colors shadow-lg shadow-primary/20 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined mr-2 text-[20px]">add</span>
          Add Specialization
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-card rounded-2xl border border-border mb-8">
        <div className="relative w-full md:w-auto flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search specializations..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-surface text-text-base text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-text-muted"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-4 rounded-xl border border-border bg-surface text-text-base text-sm focus:ring-2 focus:ring-primary outline-none appearance-none min-w-35 cursor-pointer"
          >
            <option>All Statuses</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <button className="flex items-center justify-center rounded-xl h-11 px-5 bg-surface border border-border text-text-base hover:border-primary hover:text-primary transition-colors text-sm font-medium gap-2">
            <span className="material-symbols-outlined text-[20px]">sort</span>
            <span className="hidden sm:inline">Sort By</span>
          </button>
        </div>
      </div>

      {/* Cards */}
      {fetching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-2xl p-6 border border-border animate-pulse h-64">
              <div className="flex justify-between mb-5">
                <div className="size-14 rounded-2xl bg-border" />
                <div className="h-6 w-16 rounded-full bg-border" />
              </div>
              <div className="h-5 bg-border rounded w-2/3 mb-3" />
              <div className="h-3 bg-border rounded w-full mb-2" />
              <div className="h-3 bg-border rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginated.map((spec) => (
            <SpecializationCard
              key={spec._id}
              {...spec}
              onEdit={() => setEditTarget(spec)}
              onDelete={() => setDeleteTarget(spec)}
            />
          ))}

          {/* Add new card — only on last page */}
          {isLastPage && (
            <div
              onClick={() => setShowModal(true)}
              className="bg-surface rounded-2xl p-6 border-2 border-dashed border-border hover:border-primary/50 hover:bg-card transition-all flex flex-col items-center justify-center text-center min-h-65 cursor-pointer group h-full"
            >
              <div className="size-16 rounded-full bg-card text-primary border border-primary/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-primary/10">
                <span className="material-symbols-outlined text-[36px]">add</span>
              </div>
              <h3 className="text-lg font-bold text-text-base group-hover:text-primary transition-colors mb-1">
                Add New Category
              </h3>
              <p className="text-sm text-text-muted max-w-50">
                Create and configure a new medical specialization
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!fetching && filtered.length === 0 && specializations.length > 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-text-muted">
          <span className="material-symbols-outlined text-5xl text-primary/30">search_off</span>
          <p className="text-base font-medium">No specializations match your filters.</p>
        </div>
      )}

      {/* Pagination */}
      {!fetching && filtered.length > 0 && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <span className="text-sm text-text-muted">
            Showing{' '}
            <span className="text-text-base font-medium">
              {Math.min((currentPage - 1) * PAGE_SIZE + 1, filtered.length)}
            </span>{' '}
            –{' '}
            <span className="text-text-base font-medium">
              {Math.min(currentPage * PAGE_SIZE, filtered.length)}
            </span>{' '}
            of{' '}
            <span className="text-text-base font-medium">{filtered.length}</span> results
          </span>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <AddSpecializationModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}

      {/* Edit Modal */}
      {editTarget && (
        <EditSpecializationModal
          spec={editTarget}
          onClose={() => setEditTarget(null)}
          onUpdated={handleUpdated}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <DeleteSpecializationModal
          spec={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}