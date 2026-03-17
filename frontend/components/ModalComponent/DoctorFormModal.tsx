'use client';

import type {
  Doctor,
  DoctorFormState,
  SpecializationOption,
} from '../../types/types';

type Props = {
  open: boolean;
  editingDoctor: Doctor | null;
  form: DoctorFormState;
  formError: string;
  loading: boolean;
  specializations: SpecializationOption[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: <K extends keyof DoctorFormState>(
    key: K,
    value: DoctorFormState[K]
  ) => void;
  onSpecializationChange: (value: string) => void;
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
      <div className="w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-text-base">{title}</h3>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-lg border border-border text-text-muted hover:text-text-base hover:bg-section-teal transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(92vh-72px)]">{children}</div>
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-text-sub mb-2">{children}</label>;
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-border bg-section-teal px-3 py-2.5 text-sm text-text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${props.className || ''}`}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
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

export default function DoctorFormModal({
  open,
  editingDoctor,
  form,
  formError,
  loading,
  specializations,
  onClose,
  onSubmit,
  onChange,
  onSpecializationChange,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingDoctor ? 'Edit Doctor' : 'Add Doctor'}
    >
      <form onSubmit={onSubmit} className="p-6 space-y-6">
        {formError && (
          <div className="rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
            {formError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FieldLabel>Full Name *</FieldLabel>
            <TextInput
              value={form.fullName}
              onChange={(e) => onChange('fullName', e.target.value)}
              placeholder="Dr. Example Name"
            />
          </div>

          <div>
            <FieldLabel>Specialization *</FieldLabel>
            <SelectBox
              value={form.specialization}
              onChange={(e) => onSpecializationChange(e.target.value)}
            >
              <option value="">Select specialization</option>
              {specializations.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </SelectBox>
          </div>

          <div>
            <FieldLabel>Qualifications</FieldLabel>
            <TextInput
              value={form.qualifications}
              onChange={(e) => onChange('qualifications', e.target.value)}
              placeholder="MBBS, FCPS"
            />
          </div>

          <div>
            <FieldLabel>Experience Years</FieldLabel>
            <TextInput
              type="number"
              min={0}
              value={form.experienceYears}
              onChange={(e) => onChange('experienceYears', e.target.value)}
            />
          </div>

          <div>
            <FieldLabel>Gender</FieldLabel>
            <SelectBox
              value={form.gender}
              onChange={(e) =>
                onChange('gender', e.target.value as DoctorFormState['gender'])
              }
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </SelectBox>
          </div>

          <div>
            <FieldLabel>Hospital / Clinic</FieldLabel>
            <TextInput
              value={form.hospitalOrClinic}
              onChange={(e) => onChange('hospitalOrClinic', e.target.value)}
              placeholder="Hospital or clinic name"
            />
          </div>

          <div className="md:col-span-2">
            <FieldLabel>Chamber Address *</FieldLabel>
            <TextArea
              rows={3}
              value={form.chamberAddress}
              onChange={(e) => onChange('chamberAddress', e.target.value)}
              placeholder="Full chamber address"
            />
          </div>

          <div>
            <FieldLabel>Area</FieldLabel>
            <TextInput
              value={form.area}
              onChange={(e) => onChange('area', e.target.value)}
            />
          </div>

          <div>
            <FieldLabel>City *</FieldLabel>
            <TextInput
              value={form.city}
              onChange={(e) => onChange('city', e.target.value)}
            />
          </div>

          <div>
            <FieldLabel>District</FieldLabel>
            <TextInput
              value={form.district}
              onChange={(e) => onChange('district', e.target.value)}
            />
          </div>

          <div>
            <FieldLabel>Country</FieldLabel>
            <TextInput
              value={form.country}
              onChange={(e) => onChange('country', e.target.value)}
            />
          </div>

          <div>
            <FieldLabel>Latitude *</FieldLabel>
            <TextInput
              type="number"
              step="any"
              value={form.latitude}
              onChange={(e) => onChange('latitude', e.target.value)}
              placeholder="23.8103"
            />
          </div>

          <div>
            <FieldLabel>Longitude *</FieldLabel>
            <TextInput
              type="number"
              step="any"
              value={form.longitude}
              onChange={(e) => onChange('longitude', e.target.value)}
              placeholder="90.4125"
            />
          </div>

          <div>
            <FieldLabel>Consultation</FieldLabel>
            <TextInput
              value={form.consultation}
              onChange={(e) => onChange('consultation', e.target.value)}
              placeholder="Sat - Thu, 5PM - 9PM"
            />
          </div>

          <div>
            <FieldLabel>Off Day</FieldLabel>
            <TextInput
              value={form.offday}
              onChange={(e) => onChange('offday', e.target.value)}
              placeholder="Friday"
            />
          </div>

          <div>
            <FieldLabel>Fees</FieldLabel>
            <TextInput
              type="number"
              min={0}
              value={form.fees}
              onChange={(e) => onChange('fees', e.target.value)}
            />
          </div>

          <div>
            <FieldLabel>Appointment Phone(s)</FieldLabel>
            <TextInput
              value={form.appointmentPhone}
              onChange={(e) => onChange('appointmentPhone', e.target.value)}
              placeholder="017..., 018..."
            />
          </div>

          <div>
            <FieldLabel>Appointment Website</FieldLabel>
            <TextInput
              value={form.appointmentWebsite}
              onChange={(e) => onChange('appointmentWebsite', e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <FieldLabel>Profile Image URL</FieldLabel>
            <TextInput
              value={form.profileImage}
              onChange={(e) => onChange('profileImage', e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="md:col-span-2">
            <FieldLabel>Bio</FieldLabel>
            <TextArea
              rows={4}
              value={form.bio}
              onChange={(e) => onChange('bio', e.target.value)}
              placeholder="Short doctor biography..."
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="isActive"
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => onChange('isActive', e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <label htmlFor="isActive" className="text-sm text-text-sub">
              Active
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="isApproved"
              type="checkbox"
              checked={form.isApproved}
              onChange={(e) => onChange('isApproved', e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <label htmlFor="isApproved" className="text-sm text-text-sub">
              Approved
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-text-sub hover:bg-section-teal transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-60 px-5 py-2 text-sm font-semibold text-white transition-colors"
          >
            {loading
              ? editingDoctor
                ? 'Updating...'
                : 'Creating...'
              : editingDoctor
              ? 'Update Doctor'
              : 'Create Doctor'}
          </button>
        </div>
      </form>
    </Modal>
  );
}