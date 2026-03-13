'use client';

import { useState } from 'react';

type Suggestion = {
  id: number;
  initials: string;
  name: string;
  specialization: string;
  submittedBy: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected';
};

const initialSuggestions: Suggestion[] = [
  { id: 1, initials: 'EC', name: 'Dr. Emily Chen',    specialization: 'Cardiology',  submittedBy: 'User123', location: 'New York, NY',    status: 'pending' },
  { id: 2, initials: 'JS', name: 'Dr. James Smith',   specialization: 'Pediatrics',  submittedBy: 'User456', location: 'Los Angeles, CA', status: 'pending' },
  { id: 3, initials: 'SJ', name: 'Dr. Sarah Johnson', specialization: 'Dermatology', submittedBy: 'User789', location: 'Chicago, IL',     status: 'pending' },
  { id: 4, initials: 'MB', name: 'Dr. Michael Brown', specialization: 'Neurology',   submittedBy: 'User012', location: 'Houston, TX',     status: 'pending' },
];

const statusBadge: Record<Suggestion['status'], string> = {
  pending:  'bg-warning/10 text-warning border-warning/20',
  approved: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-error/10 text-error border-error/20',
};
const statusDot: Record<Suggestion['status'], string> = {
  pending: 'bg-warning', approved: 'bg-success', rejected: 'bg-error',
};

export default function DoctorSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initialSuggestions);
  const [search, setSearch] = useState('');

  const handleApprove = (id: number) => setSuggestions((p) => p.map((s) => s.id === id ? { ...s, status: 'approved' } : s));
  const handleReject  = (id: number) => setSuggestions((p) => p.map((s) => s.id === id ? { ...s, status: 'rejected' } : s));
  const handleUndo    = (id: number) => setSuggestions((p) => p.map((s) => s.id === id ? { ...s, status: 'pending'  } : s));

  const filtered = suggestions.filter((s) =>
    [s.name, s.specialization, s.location].some((v) => v.toLowerCase().includes(search.toLowerCase()))
  );
  const pendingCount = suggestions.filter((s) => s.status === 'pending').length;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end gap-4 p-6 bg-card rounded-xl border border-border mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-base">Doctor Suggestions</h2>
          <p className="text-text-muted text-sm mt-1">
            Review pending doctor additions from users.
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-warning/10 text-warning text-xs font-semibold border border-warning/20">
                {pendingCount} pending
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[18px]">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 w-48 md:w-64 placeholder:text-text-muted"
            />
          </div>
          <button className="flex items-center justify-center h-10 w-10 bg-surface border border-border rounded-lg text-text-muted hover:text-primary hover:border-primary transition-colors">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-left min-w-200">
          <thead>
            <tr className="bg-section-teal border-b border-border">
              <th className="px-6 py-4 text-text-sub text-sm font-semibold tracking-wide">Doctor Name</th>
              <th className="px-6 py-4 text-text-sub text-sm font-semibold tracking-wide">Specialization</th>
              <th className="px-6 py-4 text-text-sub text-sm font-semibold tracking-wide">Submitted By</th>
              <th className="px-6 py-4 text-text-sub text-sm font-semibold tracking-wide">Location</th>
              <th className="px-6 py-4 text-text-sub text-sm font-semibold tracking-wide">Status</th>
              <th className="px-6 py-4 text-text-sub text-sm font-semibold tracking-wide text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-text-muted text-sm">No suggestions found.</td></tr>
            )}
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-section-teal/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3 text-text-base text-sm font-medium">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">{s.initials}</div>
                    {s.name}
                  </div>
                </td>
                <td className="px-6 py-4 text-text-muted text-sm">{s.specialization}</td>
                <td className="px-6 py-4 text-text-muted text-sm">{s.submittedBy}</td>
                <td className="px-6 py-4 text-text-muted text-sm">{s.location}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge[s.status]}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${statusDot[s.status]}`} />
                    {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    {s.status === 'pending' ? (
                      <>
                        <button onClick={() => handleApprove(s.id)} title="Approve" className="h-8 w-8 flex items-center justify-center rounded-lg bg-success/10 text-success hover:bg-success hover:text-white border border-success/20 transition-all">
                          <span className="material-symbols-outlined text-sm">check</span>
                        </button>
                        <button onClick={() => handleReject(s.id)} title="Reject" className="h-8 w-8 flex items-center justify-center rounded-lg bg-error/10 text-error hover:bg-error hover:text-white border border-error/20 transition-all">
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleUndo(s.id)} className="h-8 px-3 flex items-center gap-1 rounded-lg bg-section-teal text-text-muted hover:text-text-base border border-transparent transition-all text-xs font-medium">
                        <span className="material-symbols-outlined text-sm">undo</span>Undo
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-1 py-3 mt-4">
        <p className="text-sm text-text-muted">
          Showing <span className="font-medium text-text-base">1</span> to <span className="font-medium text-text-base">{filtered.length}</span> of <span className="font-medium text-text-base">12</span> results
        </p>
        <nav className="flex items-center gap-1">
          <button className="flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-card text-text-muted hover:bg-section-teal transition-colors">
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <button className="flex items-center justify-center h-9 w-9 rounded-lg border border-primary bg-primary/10 text-primary text-sm font-medium">1</button>
          <button className="flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-card text-text-muted hover:bg-section-teal text-sm font-medium transition-colors">2</button>
          <button className="flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-card text-text-muted hover:bg-section-teal text-sm font-medium transition-colors">3</button>
          <button className="flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-card text-text-muted hover:bg-section-teal transition-colors">
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
