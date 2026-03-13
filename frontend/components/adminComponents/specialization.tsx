/**
 * Specialization Management Component
 *
 * Implements Feature 2: The system shall allow administrators to manage medical
 * specializations and categories used by the AI recommendation system.
 *
 * This component provides an interface for administrators to view, add, and manage
 * medical specializations that are used throughout the system for doctor categorization
 * and AI-driven recommendations.
 *
 * Sections:
 * - Header with add button
 * - Filters and search
 * - Specialization cards grid
 * - Pagination
 */

const specializations = [
  { name: 'Cardiologist', icon: 'favorite',   description: 'Heart and cardiovascular system specialists dealing with complex disorders.',         doctorCount: 24, active: true  },
  { name: 'Neurologist',  icon: 'neurology',  description: 'Specialists treating diseases of the brain, spinal cord, and nervous system.',      doctorCount: 18, active: true  },
  { name: 'Pediatrician', icon: 'child_care', description: 'Medical care providers for infants, children, and adolescents.',                    doctorCount: 32, active: true  },
  { name: 'Dermatologist',icon: 'face',       description: 'Specialists for skin, hair, and nail conditions and treatments.',                   doctorCount: 15, active: false },
];

// Specialization Card component
/**
 * Displays a single specialization with its details, status, and actions
 */
function SpecializationCard({ name, icon, description, doctorCount, active }: (typeof specializations)[number]) {
  return (
    <div className={`bg-card rounded-2xl p-6 border transition-all relative overflow-hidden group flex flex-col h-full ${active ? 'border-border hover:border-primary/50' : 'border-border opacity-75 hover:opacity-100'}`}>
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 ${active ? 'bg-primary/10' : 'bg-section-teal'}`} />
      <div className="flex justify-between items-start mb-5 relative z-10">
        <div className={`size-14 rounded-2xl flex items-center justify-center shadow-inner border border-border bg-surface ${active ? 'text-primary' : 'text-text-muted group-hover:text-primary transition-colors'}`}>
          <span className="material-symbols-outlined text-[32px]">{icon}</span>
        </div>
        <div className="flex gap-2 items-center">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider border ${active ? 'bg-primary/20 text-primary border-primary/30' : 'bg-section-teal text-text-muted border-border'}`}>
            {active ? 'ACTIVE' : 'INACTIVE'}
          </span>
          <button className="text-text-muted hover:text-primary transition-colors size-6 flex items-center justify-center rounded-full hover:bg-surface">
            <span className="material-symbols-outlined text-[20px]">more_vert</span>
          </button>
        </div>
      </div>
      <div className="flex-1">
        <h3 className={`text-xl font-bold text-text-base mb-2 transition-colors ${active ? 'group-hover:text-primary' : ''}`}>{name}</h3>
        <p className="text-sm text-text-muted mb-6 leading-relaxed">{description}</p>
      </div>
      <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
        <div className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-lg border border-border">
          <span className={`material-symbols-outlined text-[18px] ${active ? 'text-primary' : 'text-text-muted'}`}>group</span>
          <span className={`text-sm font-bold ${active ? 'text-text-base' : 'text-text-muted'}`}>{doctorCount}</span>
        </div>
        <button className="text-sm font-bold text-primary hover:text-primary-hover transition-colors flex items-center gap-1 group/btn">
          {active ? 'View' : 'Manage'}
          {active && <span className="material-symbols-outlined text-[18px] group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>}
        </button>
      </div>
    </div>
  );
}

// Specializations component
/**
 * Main component for managing medical specializations and categories
 */
export default function Specializations() {
  return (
    <div className="p-6 lg:p-8">
      // Header
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-base">Specialization Management</h2>
          <p className="text-sm text-text-muted mt-1">Configure categories and assignments.</p>
        </div>
        <button className="flex items-center justify-center rounded-xl h-10 px-5 bg-primary hover:bg-primary-hover text-white text-sm font-bold transition-colors shadow-lg shadow-primary/20 self-start sm:self-auto">
          <span className="material-symbols-outlined mr-2 text-[20px]">add</span>Add Specialization
        </button>
      </div>

      // Filters
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-card rounded-2xl border border-border mb-8">
        <div className="relative w-full md:w-auto flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">search</span>
          <input type="text" placeholder="Search specializations..." className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-surface text-text-base text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-text-muted" />
        </div>
        <div className="flex gap-3">
          <select className="h-11 px-4 rounded-xl border border-border bg-surface text-text-base text-sm focus:ring-2 focus:ring-primary outline-none appearance-none min-w-35 cursor-pointer">
            <option>All Statuses</option><option>Active</option><option>Inactive</option>
          </select>
          <button className="flex items-center justify-center rounded-xl h-11 px-5 bg-surface border border-border text-text-base hover:border-primary hover:text-primary transition-colors text-sm font-medium gap-2">
            <span className="material-symbols-outlined text-[20px]">sort</span>
            <span className="hidden sm:inline">Sort By</span>
          </button>
        </div>
      </div>

      // Cards
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {specializations.map((spec) => <SpecializationCard key={spec.name} {...spec} />)}
        <div className="bg-surface rounded-2xl p-6 border-2 border-dashed border-border hover:border-primary/50 hover:bg-card transition-all flex flex-col items-center justify-center text-center min-h-65 cursor-pointer group h-full">
          <div className="size-16 rounded-full bg-card text-primary border border-primary/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-primary/10">
            <span className="material-symbols-outlined text-[36px]">add</span>
          </div>
          <h3 className="text-lg font-bold text-text-base group-hover:text-primary transition-colors mb-1">Add New Category</h3>
          <p className="text-sm text-text-muted max-w-50">Create and configure a new medical specialization</p>
        </div>
      </div>

      // Pagination
      {/* Pagination */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
        <span className="text-sm text-text-muted">
          Showing <span className="text-text-base font-medium">1</span> to <span className="text-text-base font-medium">12</span> of <span className="text-text-base font-medium">48</span> results
        </span>
        <div className="flex items-center gap-2">
          <button disabled className="flex size-10 items-center justify-center rounded-xl bg-card border border-border text-text-muted disabled:opacity-50">
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <button className="text-sm font-bold flex size-10 items-center justify-center text-white rounded-xl bg-primary shadow-sm shadow-primary/30">1</button>
          <button className="text-sm font-medium flex size-10 items-center justify-center text-text-base rounded-xl bg-card border border-border hover:border-primary hover:text-primary transition-colors">2</button>
          <button className="text-sm font-medium flex size-10 items-center justify-center text-text-base rounded-xl bg-card border border-border hover:border-primary hover:text-primary transition-colors">3</button>
          <span className="text-text-muted px-1">...</span>
          <button className="text-sm font-medium flex size-10 items-center justify-center text-text-base rounded-xl bg-card border border-border hover:border-primary hover:text-primary transition-colors">12</button>
          <button className="flex size-10 items-center justify-center rounded-xl bg-card border border-border text-text-base hover:border-primary hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
