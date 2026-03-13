/**
 * Add Doctor Component
 *
 * Sections:
 * - Breadcrumb navigation
 * - Form with photo upload, personal info, practice details, active toggle, actions
 */

'use client';

import { useState } from 'react';
import type { Section } from '../../types/types';

type Props = { onNavigate: (section: Section) => void };

const specializations = [
  { value: 'cardiology',    label: 'Cardiology' },
  { value: 'dermatology',   label: 'Dermatology' },
  { value: 'neurology',     label: 'Neurology' },
  { value: 'pediatrics',    label: 'Pediatrics' },
  { value: 'orthopedics',   label: 'Orthopedics' },
  { value: 'general',       label: 'General Practice' },
];

const chambers = [
  { value: 'city-heart', label: 'City Heart Clinic' },
  { value: 'skin-care',  label: 'Skin Care Center' },
  { value: 'neuro-hub',  label: 'Neuro Health Hub' },
];

// Add Doctor component
/**
 * Component for adding a new doctor profile
 */
export default function AddDoctor({ onNavigate }: Props) {
  const [isActive, setIsActive] = useState(true);

  return (
    <div className="p-6 lg:p-8">
      // Breadcrumb
      {/* Breadcrumb */}
      <div className="mb-6 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2 text-text-muted mb-3 text-sm">
          <button
            onClick={() => onNavigate('doctors')}
            className="hover:text-text-base transition-colors font-medium"
          >
            Doctors
          </button>
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          <span className="text-primary font-semibold">Add New Doctor</span>
        </div>
        <h2 className="text-3xl font-bold text-text-base tracking-tight">Add New Doctor</h2>
        <p className="text-text-muted text-sm mt-2">Enter the doctor&apos;s details below to register their profile in the system.</p>
      </div>

      // Form Card
      {/* Form Card */}
      <div className="bg-card rounded-2xl border border-border shadow-xl max-w-4xl w-full mx-auto p-8 lg:p-10">
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          // Photo
          {/* Photo */}
          <div className="flex items-center gap-6 pb-8 border-b border-border">
            <div className="h-24 w-24 rounded-full bg-surface border-2 border-dashed border-border flex items-center justify-center text-text-muted cursor-pointer hover:bg-section-teal hover:border-primary/50 hover:text-primary transition-all shrink-0">
              <span className="material-symbols-outlined text-[32px]">add_a_photo</span>
            </div>
            <div>
              <p className="font-semibold text-text-base text-base mb-1">Profile Photo</p>
              <p className="text-text-muted text-sm mb-4">Upload a high-res professional headshot. JPG or PNG under 2MB.</p>
              <button type="button" className="px-5 py-2.5 text-sm font-medium text-text-sub bg-section-teal hover:bg-section-blue rounded-lg transition-colors border border-border">
                Choose Image
              </button>
            </div>
          </div>

          // Personal Info
          {/* Personal Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-text-base">Personal Information</h3>
            <div>
              <label className="block text-sm font-medium text-text-sub mb-2">Full Name</label>
              <input type="text" placeholder="e.g. Dr. Sarah Jenkins" className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-text-muted" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">Specialization</label>
                <div className="relative">
                  <select className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none">
                    <option value="" disabled>Select specialty...</option>
                    {specializations.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-3.5 text-text-muted pointer-events-none text-[20px]">expand_more</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">Phone Number</label>
                <input type="tel" placeholder="+1 (555) 000-0000" className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-text-muted" />
              </div>
            </div>
          </div>

          // Practice Details
          {/* Practice Details */}
          <div className="space-y-6 pt-6 border-t border-border">
            <h3 className="text-lg font-semibold text-text-base">Practice Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">Location</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-3.5 text-text-muted pointer-events-none text-[20px]">location_on</span>
                  <input type="text" placeholder="e.g. New York, NY" className="w-full bg-surface border border-border rounded-xl pl-11 pr-4 py-3 text-sm text-text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-text-muted" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">Primary Chamber</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-3.5 text-text-muted pointer-events-none text-[20px]">apartment</span>
                  <select className="w-full bg-surface border border-border rounded-xl pl-11 pr-4 py-3 text-sm text-text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none">
                    <option value="" disabled>Assign to a chamber...</option>
                    {chambers.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-3.5 text-text-muted pointer-events-none text-[20px]">expand_more</span>
                </div>
              </div>
            </div>
          </div>

          // Active Toggle
          {/* Active Toggle */}
          <div className="pt-6 border-t border-border">
            <label className="flex items-center gap-3 cursor-pointer w-max group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="peer appearance-none rounded-md border-2 border-border bg-surface checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/30 h-5 w-5 transition-all"
                />
                <span className="material-symbols-outlined absolute text-white text-[16px] pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">check</span>
              </div>
              <span className="text-sm text-text-sub font-medium group-hover:text-text-base transition-colors">Set as Active immediately</span>
            </label>
          </div>

          // Actions
          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => onNavigate('doctors')}
              className="px-6 py-3 text-sm font-medium text-text-sub hover:text-text-base hover:bg-section-teal rounded-xl transition-colors border border-transparent hover:border-border"
            >
              Cancel
            </button>
            <button type="submit" className="px-8 py-3 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">save</span>
              Save Doctor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
