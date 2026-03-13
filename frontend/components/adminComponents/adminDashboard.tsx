const kpiCards = [
  { icon: 'person_add', bgIcon: 'group',                title: 'Total Patients',      value: '12,450', trend: '+5.2%', up: true,  color: 'primary' },
  { icon: 'badge',      bgIcon: 'medical_services',     title: 'Active Providers',    value: '845',    trend: '+1.5%', up: true,  color: 'primary' },
  { icon: 'calendar_clock', bgIcon: 'event',            title: 'Appointments Today',  value: '342',    trend: '-2.1%', up: false, color: 'error'   },
  { icon: 'payments',   bgIcon: 'account_balance_wallet', title: 'Revenue (MTD)',     value: '$45.2k', trend: '+8.4%', up: true,  color: 'primary' },
];

const barData = [
  { label: 'Cardio', height: 85, value: '$38k' },
  { label: 'Neuro',  height: 60, value: '$27k' },
  { label: 'Ortho',  height: 45, value: '$20k' },
  { label: 'Peds',   height: 30, value: '$14k' },
];

function KpiCard({ icon, bgIcon, title, value, trend, up, color }: (typeof kpiCards)[number]) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <span className={`material-symbols-outlined text-6xl! ${color === 'error' ? 'text-error' : 'text-primary'}`}>
          {bgIcon}
        </span>
      </div>
      <div className="flex items-center gap-3 mb-3">
        <div className="size-8 rounded-lg bg-section-teal flex items-center justify-center text-text-sub group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
        <h3 className="text-sm font-medium text-text-muted">{title}</h3>
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-text-base">{value}</span>
        <div className={`flex items-center text-xs font-medium px-1.5 py-0.5 rounded ${up ? 'text-success bg-success/10' : 'text-error bg-error/10'}`}>
          <span className="material-symbols-outlined text-[14px]">{up ? 'trending_up' : 'trending_down'}</span>
          {trend}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-base mb-1">Overview Diagnostics</h2>
          <p className="text-sm text-text-muted">Real-time performance metrics and system health.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium text-text-sub hover:bg-section-teal transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            Last 30 Days
            <span className="material-symbols-outlined text-[18px]">expand_more</span>
          </button>
          <button className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors shadow-lg shadow-primary/20 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
        {kpiCards.map((card) => <KpiCard key={card.title} {...card} />)}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="xl:col-span-2 bg-card border border-border rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-text-base">Patient Growth Velocity</h3>
              <p className="text-sm text-text-muted">New registrations vs returning visitors</p>
            </div>
            <button className="p-2 hover:bg-section-teal rounded-lg text-text-muted transition-colors">
              <span className="material-symbols-outlined">more_horiz</span>
            </button>
          </div>
          <div className="flex-1 min-h-62.5 relative w-full pt-4">
            <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-[11px] text-text-muted font-medium">
              <span>4k</span><span>3k</span><span>2k</span><span>1k</span><span>0</span>
            </div>
            <div className="absolute left-10 right-0 top-2 bottom-8">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                <div className="w-full border-t border-border border-dashed" />
                <div className="w-full border-t border-border border-dashed" />
                <div className="w-full border-t border-border border-dashed" />
                <div className="w-full border-t border-border border-dashed" />
                <div className="w-full border-t border-border" />
              </div>
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 200">
                <defs>
                  <linearGradient id="dash-line-grad" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor="var(--primary)" />
                    <stop offset="100%" stopColor="var(--accent)" />
                  </linearGradient>
                  <linearGradient id="dash-area-grad" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                  </linearGradient>
                  <filter id="dash-glow" width="140%" height="140%" x="-20%" y="-20%">
                    <feGaussianBlur result="blur" stdDeviation="4" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <path d="M0,150 C100,120 200,160 300,100 C400,40 500,110 600,80 C700,50 800,90 900,40 C950,20 1000,30 1000,30 L1000,200 L0,200 Z" fill="url(#dash-area-grad)" />
                <path d="M0,150 C100,120 200,160 300,100 C400,40 500,110 600,80 C700,50 800,90 900,40 C950,20 1000,30 1000,30" fill="none" filter="url(#dash-glow)" stroke="url(#dash-line-grad)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
                <circle cx="300" cy="100" r="5" fill="var(--card)" stroke="var(--primary)" strokeWidth="2.5" />
                <circle cx="600" cy="80"  r="5" fill="var(--card)" stroke="var(--primary)" strokeWidth="2.5" />
                <circle cx="900" cy="40"  r="5" fill="var(--card)" stroke="var(--primary)" strokeWidth="2.5" />
              </svg>
            </div>
            <div className="absolute left-10 right-0 bottom-0 flex justify-between text-[11px] text-text-muted font-medium">
              <span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-text-base">Revenue Source</h3>
            <p className="text-sm text-text-muted">By top departments</p>
          </div>
          <div className="flex-1 relative h-48 border-b border-border">
            <div className="w-full h-full flex items-end justify-between px-2 gap-2">
              {barData.map((bar, i) => (
                <div key={bar.label} className="w-1/4 relative group flex flex-col justify-end items-center h-full">
                  <div className="w-full bg-section-teal rounded-t-sm h-full absolute inset-0 -z-10" />
                  <div
                    className="w-full rounded-t-sm transition-all duration-500 ease-out group-hover:opacity-90"
                    style={{ height: `${bar.height}%`, background: 'linear-gradient(to top, var(--primary), var(--accent))', opacity: 1 - i * 0.15 }}
                  />
                  <span className="absolute -bottom-6 text-[10px] font-medium text-text-muted truncate w-full text-center">{bar.label}</span>
                  <div className="absolute -top-8 bg-card border border-border text-text-base text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {bar.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-2">
            {barData.map((bar, i) => (
              <div key={bar.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm" style={{ background: 'var(--primary)', opacity: 1 - i * 0.15 }} />
                  <span className="text-text-sub">{bar.label}</span>
                </div>
                <span className="font-semibold text-text-base">{bar.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
