'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { Section } from '../../types/types';
import DoctorFormModal from '../ModalComponent/DoctorFormModal';
import DeleteDoctorModal from '../ModalComponent/DeleteDoctorModal';
import type {
  Doctor,
  DoctorFormState,
  DoctorListResponse,
  SpecializationOption,
  SpecializationResponse,
} from '../../types/types';
import {
  buildDoctorPayload,
  initialDoctorForm,
  mapDoctorToForm,
} from '../../types/types';

type Props = {
  onNavigate?: (section: Section) => void;
};

function StatusBadge({ active }: { active: boolean }) {
  if (active) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full bg-success/10 text-success text-xs font-semibold border border-success/20">
        <span className="w-1.5 h-1.5 rounded-full bg-success mr-1.5" />
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-1 rounded-full bg-warning/10 text-warning text-xs font-semibold border border-warning/20">
      <span className="w-1.5 h-1.5 rounded-full bg-warning mr-1.5" />
      Inactive
    </span>
  );
}

function ApprovalBadge({ approved }: { approved: boolean }) {
  if (approved) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
        Approved
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-1 rounded-full bg-error/10 text-error text-xs font-semibold border border-error/20">
      Pending
    </span>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-border bg-section-teal px-3 py-2.5 text-sm text-text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${props.className || ''}`}
    />
  );
}

function SelectBox(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-border bg-section-teal px-3 py-2.5 text-sm text-text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${props.className || ''}`}
    />
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-text-sub mb-2">{children}</label>;
}

export default function DoctorManagement({ onNavigate }: Props) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specializations, setSpecializations] = useState<SpecializationOption[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'true' | 'false'>('all');
  const [approvedFilter, setApprovedFilter] = useState<'all' | 'true' | 'false'>('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [form, setForm] = useState<DoctorFormState>(initialDoctorForm);
  const [formError, setFormError] = useState('');

  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  async function fetchDoctors() {
    try {
      setLoading(true);
      setError('');

      const query = new URLSearchParams();
      

      if (cityFilter.trim()) query.set('city', cityFilter.trim());
      if (specializationFilter) query.set('specialization', specializationFilter);
      if (activeFilter !== 'all') query.set('isActive', activeFilter);
      if (approvedFilter !== 'all') query.set('isApproved', approvedFilter);

      const endpoint = `/doctors/${query.toString() ? `?${query.toString()}` : ''}`;

      const res = await apiFetch(endpoint, { method: 'GET' });
      const json: DoctorListResponse = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to load doctors');
      }

      setDoctors(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load doctors');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSpecializations() {
    try {
      const res = await apiFetch('/specializations', { method: 'GET' });

      if (!res.ok) {
        setSpecializations([]);
        return;
      }

      const json: SpecializationResponse = await res.json();

      if (json?.success && Array.isArray(json.data)) {
        setSpecializations(json.data);
      } else {
        setSpecializations([]);
      }
    } catch {
      setSpecializations([]);
    }
  }

  useEffect(() => {
    fetchDoctors();
  }, [cityFilter, specializationFilter, activeFilter, approvedFilter]);

  useEffect(() => {
    fetchSpecializations();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, cityFilter, specializationFilter, activeFilter, approvedFilter]);

  const filteredDoctors = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return doctors;

    return doctors.filter((doc) => {
      const values = [
        doc.fullName,
        doc.specializationName,
        doc.qualifications,
        doc.hospitalOrClinic,
        doc.chamberAddress,
        doc.area,
        doc.city,
        doc.district,
        doc.country,
        doc.consultation,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return values.includes(term);
    });
  }, [doctors, search]);

  const totalPages = Math.max(1, Math.ceil(filteredDoctors.length / pageSize));
  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function openCreateModal() {
    setEditingDoctor(null);
    setForm(initialDoctorForm);
    setFormError('');
    setIsFormOpen(true);
  }

  function openEditModal(doctor: Doctor) {
    setEditingDoctor(doctor);
    setForm(mapDoctorToForm(doctor));
    setFormError('');
    setIsFormOpen(true);
  }

  function closeFormModal() {
    if (actionLoading) return;
    setIsFormOpen(false);
    setEditingDoctor(null);
    setForm(initialDoctorForm);
    setFormError('');
  }

  function updateForm<K extends keyof DoctorFormState>(
    key: K,
    value: DoctorFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSpecializationChange(value: string) {
    const selected = specializations.find((item) => item._id === value);
    setForm((prev) => ({
      ...prev,
      specialization: value,
      specializationName: selected?.name || '',
    }));
  }

  function validateForm() {
    if (!form.fullName.trim()) return 'Doctor name is required.';
    if (!form.specialization) return 'Specialization is required.';
    if (!form.specializationName.trim()) return 'Specialization name is required.';
    if (!form.chamberAddress.trim()) return 'Chamber address is required.';
    if (!form.city.trim()) return 'City is required.';
    if (form.latitude === '' || Number.isNaN(Number(form.latitude))) {
      return 'Valid latitude is required.';
    }
    if (form.longitude === '' || Number.isNaN(Number(form.longitude))) {
      return 'Valid longitude is required.';
    }
    return '';
  }

  async function handleSubmitDoctor(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const payload = buildDoctorPayload(form);

    try {
      setActionLoading(true);

      const endpoint = editingDoctor
        ? `/api/v1/doctors/${editingDoctor._id}`
        : '/api/v1/doctors';

      const method = editingDoctor ? 'PATCH' : 'POST';

      const res = await apiFetch(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to save doctor');
      }

      setSuccessMessage(
        editingDoctor ? 'Doctor updated successfully.' : 'Doctor created successfully.'
      );

      closeFormModal();
      await fetchDoctors();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save doctor');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteDoctor() {
    if (!doctorToDelete) return;

    try {
      setActionLoading(true);
      setError('');
      setSuccessMessage('');

      const res = await apiFetch(`/api/v1/doctors/${doctorToDelete._id}`, {
        method: 'DELETE',
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to delete doctor');
      }

      setSuccessMessage('Doctor deleted successfully.');
      setDoctorToDelete(null);
      await fetchDoctors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete doctor');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleQuickToggleActive(doctor: Doctor) {
    try {
      setActionLoading(true);
      setError('');
      setSuccessMessage('');

      const res = await apiFetch(`/api/v1/doctors/${doctor._id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          isActive: !doctor.isActive,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to update doctor status');
      }

      setSuccessMessage(
        `Doctor ${doctor.isActive ? 'deactivated' : 'activated'} successfully.`
      );
      await fetchDoctors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update doctor status');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-base">
            Doctor Management
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Manage doctor profiles, specializations, and chamber assignments.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={fetchDoctors}
            className="flex items-center justify-center rounded-lg h-9 px-4 bg-card border border-border text-text-sub hover:bg-section-teal text-sm font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] mr-2">refresh</span>
            Refresh
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center justify-center rounded-lg h-9 px-5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-colors shadow-sm shadow-primary/20"
          >
            <span className="material-symbols-outlined text-[18px] mr-2">add</span>
            Add Doctor
          </button>
        </div>
      </div>

      {(error || successMessage) && (
        <div className="mb-5 space-y-3">
          {error && (
            <div className="rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
              {successMessage}
            </div>
          )}
        </div>
      )}

      <div className="bg-card rounded-xl border border-border shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          <div className="xl:col-span-2">
            <FieldLabel>Search</FieldLabel>
            <TextInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by doctor, chamber, city, qualifications..."
            />
          </div>

          <div>
            <FieldLabel>City</FieldLabel>
            <TextInput
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              placeholder="e.g. Dhaka"
            />
          </div>

          <div>
            <FieldLabel>Specialization</FieldLabel>
            <SelectBox
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
            >
              <option value="">All specializations</option>
              {specializations.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </SelectBox>
          </div>

          <div>
            <FieldLabel>Status</FieldLabel>
            <div className="grid grid-cols-2 gap-2">
              <SelectBox
                value={activeFilter}
                onChange={(e) =>
                  setActiveFilter(e.target.value as 'all' | 'true' | 'false')
                }
              >
                <option value="all">All activity</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </SelectBox>

              <SelectBox
                value={approvedFilter}
                onChange={(e) =>
                  setApprovedFilter(e.target.value as 'all' | 'true' | 'false')
                }
              >
                <option value="all">All approval</option>
                <option value="true">Approved</option>
                <option value="false">Pending</option>
              </SelectBox>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-section-teal border-b border-border">
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Specialization
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Chamber Details
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Approval
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-text-muted">
                    Loading doctors...
                  </td>
                </tr>
              ) : paginatedDoctors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-text-muted">
                    No doctors found.
                  </td>
                </tr>
              ) : (
                paginatedDoctors.map((doc) => (
                  <tr
                    key={doc._id}
                    className="hover:bg-section-teal/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {doc.profileImage ? (
                          <img
                            src={doc.profileImage}
                            alt={doc.fullName}
                            className="h-10 w-10 rounded-full object-cover border border-border"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full border border-border bg-section-teal flex items-center justify-center text-text-muted">
                            <span className="material-symbols-outlined text-[18px]">
                              person
                            </span>
                          </div>
                        )}

                        <div>
                          <div className="text-sm font-semibold text-text-base">
                            {doc.fullName}
                          </div>
                          <div className="text-xs text-text-muted">ID: {doc._id}</div>
                          {doc.qualifications && (
                            <div className="text-xs text-text-muted mt-0.5">
                              {doc.qualifications}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border border-primary/20 text-primary bg-primary/10">
                        {doc.specializationName || 'Unknown'}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-sm text-text-sub">
                        <div className="flex items-center">
                          <span className="material-symbols-outlined text-[16px] mr-1 text-text-muted">
                            location_on
                          </span>
                          {[doc.area, doc.city, doc.country].filter(Boolean).join(', ')}
                        </div>
                        <span className="text-xs text-text-muted">
                          Lat: {doc.latitude}, Lng: {doc.longitude}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-text-base">
                          {doc.hospitalOrClinic || 'N/A'}
                        </span>
                        <span className="text-xs text-text-muted">
                          {doc.chamberAddress}
                        </span>
                        {doc.consultation && (
                          <span className="text-xs text-text-muted">
                            Consultation: {doc.consultation}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <ApprovalBadge approved={doc.isApproved} />
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge active={doc.isActive} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleQuickToggleActive(doc)}
                          className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                          title={doc.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {doc.isActive ? 'toggle_off' : 'toggle_on'}
                          </span>
                        </button>

                        <button
                          onClick={() => openEditModal(doc)}
                          className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            edit
                          </span>
                        </button>

                        <button
                          onClick={() => setDoctorToDelete(doc)}
                          className="p-1.5 text-text-muted hover:text-error hover:bg-error/10 rounded-md transition-colors"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 bg-section-teal/30">
          <span className="text-sm text-text-muted">
            Showing {filteredDoctors.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredDoctors.length)} of{' '}
            {filteredDoctors.length} doctors
          </span>

          <div className="flex gap-1 items-center">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-md text-text-muted disabled:cursor-not-allowed disabled:opacity-50 hover:bg-section-teal hover:text-text-base text-sm font-medium transition-colors"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }).slice(0, 5).map((_, index) => {
              const page = index + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-text-muted hover:bg-section-teal hover:text-text-base'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded-md text-text-muted disabled:cursor-not-allowed disabled:opacity-50 hover:bg-section-teal hover:text-text-base text-sm font-medium transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <DoctorFormModal
        open={isFormOpen}
        editingDoctor={editingDoctor}
        form={form}
        formError={formError}
        loading={actionLoading}
        specializations={specializations}
        onClose={closeFormModal}
        onSubmit={handleSubmitDoctor}
        onChange={updateForm}
        onSpecializationChange={handleSpecializationChange}
      />

      <DeleteDoctorModal
        open={Boolean(doctorToDelete)}
        doctor={doctorToDelete}
        loading={actionLoading}
        onClose={() => {
          if (!actionLoading) setDoctorToDelete(null);
        }}
        onConfirm={handleDeleteDoctor}
      />
    </div>
  );
}