'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

function KpiCard({ icon, bgIcon, title, value, trend, up, color }: any) {
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
        <span className="text-3xl font-bold text-text-base">{value ?? 0}</span>

        <div
          className={`flex items-center text-xs font-medium px-1.5 py-0.5 rounded ${
            up ? 'text-success bg-success/10' : 'text-error bg-error/10'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">
            {up ? 'trending_up' : 'trending_down'}
          </span>
          {trend}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await apiFetch('/analytics');
        console.log('ANALYTICS RESPONSE:', res);
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  // ✅ SAFE GUARDS (prevents blank screen crash)
  if (loading) {
    return <div className="p-6">Loading analytics...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!data) {
    return <div className="p-6">No data available</div>;
  }

  // ✅ SAFE EXTRACTION
  const kpis = data?.kpis ?? {};
  const topSymptoms = data?.topSymptoms ?? [];
  const topSpecialists = data?.topSpecialists ?? [];
  const patientGrowth = data?.patientGrowth ?? [];
  const revenueByDept = data?.revenueByDept ?? [];

  // ✅ KPI CARDS (FULLY SAFE)
  const kpiCards = [
    {
      id: 'total-patients',
      icon: 'person_add',
      bgIcon: 'group',
      title: 'Total Patients',
      value: kpis.totalPatients ?? 0,
      trend: '+0%',
      up: true,
      color: 'primary',
    },
    {
      id: 'active-providers',
      icon: 'badge',
      bgIcon: 'medical_services',
      title: 'Active Providers',
      value: kpis.activeProviders ?? 0,
      trend: '+0%',
      up: true,
      color: 'primary',
    },
    {
      id: 'appointments-today',
      icon: 'calendar_clock',
      bgIcon: 'event',
      title: 'Appointments Today',
      value: kpis.appointmentsToday ?? 0,
      trend: '-2.1%',
      up: false,
      color: 'error',
    },
    {
      id: 'revenue-mtd',
      icon: 'payments',
      bgIcon: 'account_balance_wallet',
      title: 'Revenue (MTD)',
      value: `$${kpis.revenueMTD ?? 0}`,
      trend: '+8.4%',
      up: true,
      color: 'primary',
    },
  ];

  return (
    <div className="p-6 lg:p-8">

      {/* HEADER (UNCHANGED) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-base mb-1">
            Overview Diagnostics
          </h2>
          <p className="text-sm text-text-muted">
            Real-time performance metrics and system health.
          </p>
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

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
        {kpiCards.map((card) => (
          <KpiCard key={card.id} {...card} />
        ))}
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LINE CHART (UNCHANGED UI) */}
        <div className="xl:col-span-2 bg-card border border-border rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-text-base">
                Patient Growth Velocity
              </h3>
              <p className="text-sm text-text-muted">
                New registrations vs returning visitors
              </p>
            </div>

            <button className="p-2 hover:bg-section-teal rounded-lg text-text-muted transition-colors">
              <span className="material-symbols-outlined">more_horiz</span>
            </button>
          </div>

          {/* SAFE LABEL VIEW */}
          <div className="text-xs text-text-muted mb-2">
            {patientGrowth.map((p: any) => (
              <span key={p.label} className="mr-2">
                {p.label}: {p.value}
              </span>
            ))}
          </div>

          {/* KEEP ORIGINAL GRAPH PLACEHOLDER */}
{/* LINE CHART (REAL CURVED + BREATHING GLOW + BACKEND DATA) */}
<div className="xl:col-span-2 bg-card border border-border rounded-xl p-6 flex flex-col relative overflow-hidden">

  {/* Header */}
  <div className="flex items-center justify-between mb-6">
    <div>
      <h3 className="text-lg font-bold text-text-base">
        Patient Growth Velocity
      </h3>
      <p className="text-sm text-text-muted">
        New registrations vs returning visitors
      </p>
    </div>

    <button className="p-2 hover:bg-section-teal rounded-lg text-text-muted transition-colors">
      <span className="material-symbols-outlined">more_horiz</span>
    </button>
  </div>

  {/* CHART AREA */}
  <div className="flex-1 relative min-h-[260px]">

    {/* GRID LINES */}
    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
      <div className="border-t border-border border-dashed" />
      <div className="border-t border-border border-dashed" />
      <div className="border-t border-border border-dashed" />
      <div className="border-t border-border border-dashed" />
      <div className="border-t border-border" />
    </div>

    {/* Y AXIS LABELS */}
    <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-[11px] text-text-muted">
      <span>100%</span>
      <span>75%</span>
      <span>50%</span>
      <span>25%</span>
      <span>0%</span>
    </div>

    {/* SVG GRAPH */}
    <div className="absolute left-10 right-0 top-0 bottom-0">
{(() => {
  const chartData = data?.patientGrowth ?? [];

  if (!chartData.length) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted">
        No growth data
      </div>
    );
  }

  const maxValue = Math.max(...chartData.map((d: any) => d.value), 1);

  const points = chartData.map((d: { value: number }, i: number) => {
    const x = (i / (chartData.length - 1)) * 1000;
    const y = 200 - (d.value / maxValue) * 180;
    return { x, y };
  });

  const path = points
    .map((p: { x: number; y: number }, i: number) =>
      i === 0
        ? `M ${p.x} ${p.y}`
        : `C ${(points[i - 1].x + p.x) / 2} ${points[i - 1].y}, ${(points[i - 1].x + p.x) / 2} ${p.y}, ${p.x} ${p.y}`
    )
    .join(" ");

  const areaPath = `${path} L 1000 200 L 0 200 Z`;

  return (
    <svg
      className="w-full h-full"
      viewBox="0 0 1000 200"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="lineGrad">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>

        <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>

        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* AREA */}
      <path d={areaPath} fill="url(#areaGrad)" />

      {/* LINE */}
      <path
        d={path}
        fill="none"
        stroke="url(#lineGrad)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
        className="animate-pulse"
      />

      {/* POINTS */}
      {points.map((p: { x: number; y: number }, i: number) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="5"
          fill="var(--card)"
          stroke="#22c55e"
          strokeWidth="2"
        />
      ))}
    </svg>
  );
})()}
  
    </div>

    {/* X LABELS */}
    <div className="absolute left-10 right-0 bottom-0 flex justify-between text-[11px] text-text-muted">
      {(data?.patientGrowth || []).map((d: any) => (
        <span key={d.label}>{d.label}</span>
      ))}
    </div>

  </div>
</div>   
        </div>

        {/* BAR CHART (FULL FIXED) */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-text-base">
              Revenue Source
            </h3>
            <p className="text-sm text-text-muted">
              By top departments
            </p>
          </div>

          <div className="flex-1 relative h-48 border-b border-border">
            <div className="w-full h-full flex items-end justify-between px-2 gap-2">

              {revenueByDept.length === 0 ? (
                <div className="text-sm text-text-muted m-auto">
                  No data available
                </div>
              ) : (
                revenueByDept.map((bar: any, i: number) => (
                  <div
                    key={bar.label}
                    className="w-1/4 relative group flex flex-col justify-end items-center h-full"
                  >
                    <div
                      className="w-full rounded-t-sm transition-all duration-500 ease-out"
                      style={{
                        height: `${bar.height}%`,
                        background:
                          'linear-gradient(to top, var(--primary), var(--accent))',
                        opacity: 1 - i * 0.1,
                      }}
                    />

                    <span className="absolute -bottom-6 text-[10px] font-medium text-text-muted truncate w-full text-center">
                      {bar.label}
                    </span>

                    <div className="absolute -top-8 bg-card border border-border text-text-base text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      {bar.value}
                    </div>
                  </div>
                ))
              )}

            </div>
          </div>

          {/* LEGEND */}
          <div className="mt-8 flex flex-col gap-2">
            {revenueByDept.map((bar: any, i: number) => (
              <div key={bar.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-sm"
                    style={{
                      background: 'var(--primary)',
                      opacity: 1 - i * 0.1,
                    }}
                  />
                  <span className="text-text-sub">{bar.label}</span>
                </div>
                <span className="font-semibold text-text-base">{bar.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* TOP SYMPTOMS */}
<div className="mt-6 bg-card border border-border rounded-xl p-6">
  <h3 className="text-lg font-bold text-text-base mb-4">
    Top Symptoms
  </h3>

  <div className="flex flex-col gap-3">
    {topSymptoms.length === 0 ? (
      <div className="text-sm text-text-muted">No symptoms found</div>
    ) : (
      topSymptoms.map((s: any) => (
        <div
          key={s.name}
          className="flex items-center justify-between"
        >
          <span className="text-text-sub">{s.name}</span>
          <span className="font-semibold text-text-base">
            {s.count}
          </span>
        </div>
      ))
    )}
  </div>
</div>

    </div>
  );
}