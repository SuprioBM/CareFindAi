import type { Section } from '../../types/types';

type Props = { onNavigate: (section: Section) => void };

const doctors = [
  {
    id: 'DOC-4921',
    name: 'Dr. John Smith',
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNXtVZTyMs6HtHwt0MDHzz1VNhuxWvUw0G69If65UBnHEYpb4ZP1EJO5i7RQbp_OzGfCLhmLvCKNvKeyp8xTEZ61WAyAgMaz_ei99dnMRt2k58s0NcxpG_LtqF0OEZpRzPiBSBj42tNZpnHMqitXTJ_2jbkUMzYRUZA7vmtGMQgcsYM7gvjzv6jEyVee_KpCQl9M_HF4pZ5OZTgJ_lyLmg7MbcORKP_i8yVLE_3fr-p2j3uApsocrXSG-6EYIY-IBsPT1xC_Qbgjk',
    specialization: 'Cardiology',
    specializationColor: 'text-blue-400 bg-blue-900/30 border-blue-800/50',
    location: 'New York, NY',
    chamber: 'City Heart Clinic',
    schedule: 'Mon, Wed, Fri (9AM–2PM)',
    active: true,
  },
  {
    id: 'DOC-4922',
    name: 'Dr. Jane Doe',
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzzm22cR2_LN_E_B3SQH6wAjuRYdDU_nAF8ObSUsir6J5XshZ3xdJu0i216PzHpWZWt9K37wB4r2a8Rhxh81VVRAWycJx_SK7Vg7rMTWQpE6kmJ8RL-FD6Deb8eKMxWDCMNKhqNTAHoTGm8WEJx-ua5PGCg2SOFsskqj2v1F9pyNFu_uEL7XGVou940AD2hY1WSZDwdW2zGxkETfMgChKroq9C-DZKQa6abXOKaGzHL7qHGsA6vbhzxsRSZpaUuBtS3gEZ6zFgd5c',
    specialization: 'Dermatology',
    specializationColor: 'text-purple-400 bg-purple-900/30 border-purple-800/50',
    location: 'Los Angeles, CA',
    chamber: 'Skin Care Center',
    schedule: 'Tue, Thu, Sat (10AM–4PM)',
    active: false,
  },
  {
    id: 'DOC-4923',
    name: 'Dr. Alan Lee',
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbRS4xf1yNh4QZiGTwnPR4FJ7EEQEBrlmJ9GklDvTYg0zxTWfpHaKm9yVQfm-WmgGa7bMrKwVNqN90lZgsVSD3d49O9woeYlGKAVArAVgTNc8tBiTH9o0zbYkKyqsC_gQHZkFNYnW2Qazo-AJBrIpS8thg3peCKugzkG_oweh7HhjyLvyX4-OqCgTc3GAn9NguVeS61DpnziRKQ760YzHOOm6jVHv71bTlLiLaLlwv_GlFx_wj6NzPrAx129oFVCPQf_ZdVncEWds',
    specialization: 'Neurology',
    specializationColor: 'text-indigo-400 bg-indigo-900/30 border-indigo-800/50',
    location: 'Chicago, IL',
    chamber: 'Neuro Health Hub',
    schedule: 'Mon–Fri (8AM–12PM)',
    active: true,
  },
];

export default function DoctorManagement({ onNavigate }: Props) {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-base">Doctor Management</h2>
          <p className="text-sm text-text-muted mt-1">Manage doctor profiles, specializations, and chamber assignments.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center justify-center rounded-lg h-9 px-4 bg-card border border-border text-text-sub hover:bg-section-teal text-sm font-medium transition-colors">
            <span className="material-symbols-outlined text-[18px] mr-2">filter_list</span>Filter
          </button>
          <button className="flex items-center justify-center rounded-lg h-9 px-4 bg-card border border-border text-text-sub hover:bg-section-teal text-sm font-medium transition-colors">
            <span className="material-symbols-outlined text-[18px] mr-2">download</span>Export
          </button>
          <button
            onClick={() => onNavigate('add-doctor')}
            className="flex items-center justify-center rounded-lg h-9 px-5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-colors shadow-sm shadow-primary/20"
          >
            <span className="material-symbols-outlined text-[18px] mr-2">add</span>Add Doctor
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-section-teal border-b border-border">
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Specialization</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Chamber Details</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {doctors.map((doc) => (
                <tr key={doc.id} className="hover:bg-section-teal/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={doc.photo} alt={doc.name} className="h-10 w-10 rounded-full object-cover border border-border" />
                      <div>
                        <div className="text-sm font-semibold text-text-base">{doc.name}</div>
                        <div className="text-xs text-text-muted">ID: {doc.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${doc.specializationColor}`}>
                      {doc.specialization}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-text-sub">
                      <span className="material-symbols-outlined text-[16px] mr-1 text-text-muted">location_on</span>
                      {doc.location}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-text-base">{doc.chamber}</span>
                      <span className="text-xs text-text-muted">{doc.schedule}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {doc.active ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-success/10 text-success text-xs font-semibold border border-success/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-success mr-1.5" />Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-warning/10 text-warning text-xs font-semibold border border-warning/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-warning mr-1.5" />Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="Edit">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button className="p-1.5 text-text-muted hover:text-error hover:bg-error/10 rounded-md transition-colors" title="Delete">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-section-teal/30">
          <span className="text-sm text-text-muted">Showing 1 to 3 of 42 doctors</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded-md text-text-muted cursor-not-allowed text-sm font-medium">Previous</button>
            <button className="px-3 py-1 rounded-md bg-primary text-white text-sm font-medium shadow-sm">1</button>
            <button className="px-3 py-1 rounded-md text-text-muted hover:bg-section-teal hover:text-text-base text-sm font-medium transition-colors">2</button>
            <button className="px-3 py-1 rounded-md text-text-muted hover:bg-section-teal hover:text-text-base text-sm font-medium transition-colors">3</button>
            <span className="px-2 py-1 text-text-muted">...</span>
            <button className="px-3 py-1 rounded-md text-text-muted hover:bg-section-teal hover:text-text-base text-sm font-medium transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
