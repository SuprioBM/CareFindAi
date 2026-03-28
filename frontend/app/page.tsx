'use client';

import Link from 'next/link';
import Header from '@/components/pageComponents/header';
import Footer from '@/components/pageComponents/footer';

const testimonials = [
  {
    quote:
      "I had a weird rash and was terrified. CareFind's AI calmly analyzed it and booked me with a dermatologist for the next day. It was just a mild allergy. Incredible peace of mind.",
    name: 'Amanda R.',
    location: 'New York, NY',
  },
  {
    quote:
      'Finding an in-network specialist used to take me hours of calling around. With CareFind, I found my new cardiologist and booked an appointment in literally 5 minutes.',
    name: 'David M.',
    location: 'Chicago, IL',
  },
  {
    quote:
      'The symptom analyzer is freakishly accurate. It suggested I might need a neurologist for my chronic migraines, matched me with Dr. Chen, and it changed my life.',
    name: 'Sarah K.',
    location: 'Austin, TX',
  },
];

const steps = [
  { icon: 'edit_note', step: 1, title: 'Describe', desc: "Tell us what you're feeling in plain English. No medical jargon required." },
  { icon: 'auto_awesome', step: 2, title: 'Recommend', desc: 'Our AI analyzes your input and suggests the exact type of specialist you need.' },
  { icon: 'person_search', step: 3, title: 'Find & Book', desc: 'Browse top-rated doctors matching your needs and book instantly.' },
];

const features = [
  { icon: 'psychology', title: 'AI Analysis', desc: 'State-of-the-art symptom checker trained on millions of medical records.' },
  { icon: 'person_search', title: 'Doctor Discovery', desc: 'Discover qualified doctors using intelligent filters and specialties.' },
  { icon: 'map', title: 'Map Search', desc: 'Interactive map to find top-rated specialists in your immediate neighborhood.' },
];

export default function Home() {
  return (
    <div className="bg-surface text-text-base overflow-x-hidden min-h-screen">
      <main>
        <Header />

        {/* ── Hero ───────────────────────────────────────────────── */}
        <section className="relative pt-24 pb-32 overflow-hidden bg-gradient-to-br from-section-teal to-section-blue">
          <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left z-10">
              <h1 className="text-5xl lg:text-7xl font-black text-text-base leading-[1.1] mb-6 tracking-tight">
                Smarter Healthcare Starts With{' '}
                <span className="text-primary">Better Search</span>
              </h1>
              <p className="text-lg lg:text-xl text-text-sub mb-10 max-w-2xl mx-auto lg:mx-0">
                Stop guessing your symptoms. Use our AI to understand what&apos;s wrong and instantly match with the right specialists near you.
              </p>
              <div className="flex max-w-2xl mx-auto lg:mx-0">
                <Link href="/analyze" className="bg-primary hover:bg-primary-hover text-white px-10 h-14 rounded-xl font-bold transition-all shadow-md shadow-primary/20 whitespace-nowrap flex items-center justify-center">
                  Analyze Symptoms
                </Link>
              </div>
              <div className="flex items-center gap-4 mt-6 justify-center lg:justify-start">
                <div className="flex -space-x-3">
                  {[
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuA6_upf-qbfL4xV0goyl6chdz_RGI5C5JrGLEMt__fPvK4Kn_xsuiDoM1vRE_JKiFs3XGw8VQY8NhgFUg4eB7PmD0pPv3RbAiZXTKUjfH_VQn4548wdS1gpRSXt1r6nSsWDwS_ZSWNixMdB1taf75sECCM0Z6zEW-Kp3dlCXsHpK7oLGw53sBy4zHmZ2xUnh9SbAr_mpgt_6-RnqRZZ05dTW7SemK7M2oUVv_7c8GOsEmU95721CqhTSzWQvGpnMD2R_HlLw3MCt7E',
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuBuKuYomVK3_ZH34X2ELoV37NxjmteCKQGguRWX4naMPZgSR6nEkwjhEzG8unRqyGQeAzCdYoCoDTaQQASNxYmv9gfNfP1lWWBnwKGO-7Xpw5QnvtL3o7s9ZETUCwSqv5l5Jcf7KY6h4u5UZMzsfnIfuahd0ggQ61XNwokC89qmYhAprZIxRBw9jpGs2SZ3LcZXjILP9y98AgrWVFlOoNAM-_7IpM4fQgkobOd8NmDRhTlVpaqGk-R-fJnOBjg5v_bmflTi3GE4vsA',
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuAGh2dA1h-P0QKgXABmjJuSrPhf24EST6bl0CG36u_p7z0zfhxyHbY-j-TqPVWPeg6O8T7QXiB2NZzAAkfIuPYj41kMW7_isiysmdYC5GkQGvH00w-H7SCTc5HuMMLaAH4AWFfGn7J9rTrdadOFgNnX95rcEBwEGZQe88itLcG7VJCgtADTU8yKVjBk-wm2Ar-xQYSyjDH-gFG2gowGaVkcgqusNJXRA5q0RlgKdD9Zxv298Fn6q-V23SNbNr4xsEIR7QNVCvc9KTo',
                  ].map((src, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-surface bg-cover bg-center bg-section-teal" style={{ backgroundImage: `url('${src}')` }} />
                  ))}
                </div>
                <p className="text-sm font-medium text-text-muted">Trusted by 10,000+ patients</p>
              </div>
            </div>
            <div className="flex-1 relative z-10 w-full max-w-lg lg:max-w-none">
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-square bg-card border border-border">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAVBtl72kWI5EF3axoOLhM6wEhMpeptUBGm8fsAPSxnS8KmTO6nbHLBw5vAPXvLwHgFGZ13YS-hjN1DD9PFKv-aT3lOrDsR1NVyqX_pDVFzrbYTmuMMnIXOXFPLk-ajjxdh7EKQ2FQ4r3DfSbrJo14BFqDUm69hsVpnItoaZ56effoF7AucXGdSghz9YkZSVfesiN6mSPNjpHG3ABXGGUrkTD026QzzBK-XfXulNLHdJop_IzHsNd1WB8FzARqRhL_-UauDILXf9HY')" }}
                />
                <div className="absolute top-6 left-6 bg-card/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-border flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-2xl">neurology</span>
                  <div>
                    <p className="text-xs font-bold text-text-muted">AI Analysis</p>
                    <p className="text-sm font-bold text-text-base">99% Accuracy</p>
                  </div>
                </div>
                <div className="absolute bottom-6 right-6 bg-card/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-border flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-2xl">verified</span>
                  <div>
                    <p className="text-xs font-bold text-text-muted">Verified Doctors</p>
                    <p className="text-sm font-bold text-text-base">900+ Available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />
        </section>

        {/* ── Old Way vs CareFind ────────────────────────────────── */}
        <section className="py-24 bg-card relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black mb-4">The Old Way vs. CareFind</h2>
              <p className="text-lg text-text-sub max-w-2xl mx-auto">
                We&apos;ve eliminated the frustration of finding the right medical care.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-stretch">

              {/* The Frustration */}
              <div className="bg-section-teal rounded-3xl p-8 lg:p-10 border border-border relative overflow-hidden">
                <div className="flex items-center gap-3 mb-8">
                  <span className="material-symbols-outlined text-error text-3xl">cancel</span>
                  <h3 className="text-2xl font-bold text-text-base">The Old Way</h3>
                </div>
                <ul className="space-y-5">
                  {[
                    'Googling symptoms causes anxiety',
                    "Don't know which specialist to see",
                    'Weeks of waiting for appointments',
                  ].map((text) => (
                    <li key={text} className="flex items-center gap-3 text-text-sub">
                      <span className="material-symbols-outlined text-error/70 text-base shrink-0">close</span>
                      {text}
                    </li>
                  ))}
                </ul>
              </div>

              {/* The CareFind Way */}
              <div className="bg-primary rounded-3xl p-8 lg:p-10 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-8">
                  <span className="material-symbols-outlined text-white text-3xl">check_circle</span>
                  <h3 className="text-2xl font-bold">The CareFind Way</h3>
                </div>
                <ul className="space-y-5">
                  {[
                    'Clinical-grade AI analysis',
                    'Instant specialist matching',
                    'Book instantly online',
                  ].map((text) => (
                    <li key={text} className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-white/80 text-base shrink-0">check</span>
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ──────────────────────────────────────────────── */}
        <section className="py-16 border-y border-border bg-section-teal">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border">
              {[
                { value: '50k+', label: 'Verified Doctors' },
                { value: '200+', label: 'Cities Covered' },
                { value: '10k+', label: 'Symptoms Analyzed' },
                { value: '4.9/5', label: 'Patient Rating' },
              ].map((s) => (
                <div key={s.label} className="text-center px-4">
                  <div className="text-4xl font-black text-primary mb-2">{s.value}</div>
                  <div className="text-sm font-semibold text-text-muted uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ───────────────────────────────────────────── */}
        <section className="py-24 bg-card" id="features">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black mb-4">Powerful Features for Better Health</h2>
              <p className="text-lg text-text-sub max-w-2xl mx-auto">Everything you need to find the right care, all in one place.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f) => (
                <div key={f.title} className="p-8 rounded-3xl bg-section-teal border border-border hover:border-primary/30 hover:shadow-lg transition-all group">
                  <div className="w-14 h-14 bg-card rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary text-3xl">{f.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                  <p className="text-text-sub">{f.desc}</p>
                </div>
              ))}
              {/* Wide card */}
              <div className="p-8 rounded-3xl bg-section-teal border border-border hover:border-primary/30 hover:shadow-lg transition-all group lg:col-span-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="w-16 h-16 bg-card rounded-2xl shadow-sm flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary text-4xl">favorite</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Saved Care Team</h3>
                    <p className="text-text-sub">Build your personal roster of trusted doctors, easily accessible for future bookings.</p>
                  </div>
                </div>
              </div>
              <div className="p-8 rounded-3xl bg-section-teal border border-border hover:border-primary/30 hover:shadow-lg transition-all group">
                <div className="w-14 h-14 bg-card rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-3xl">info</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Explainable AI</h3>
                <p className="text-text-sub">Understand exactly why certain conditions and doctors are recommended.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── How It Works ───────────────────────────────────────── */}
        <section className="py-24 bg-gradient-to-b from-section-teal to-card" id="how-it-works">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black mb-4">How CareFind Works</h2>
              <p className="text-lg text-text-sub max-w-2xl mx-auto">Three simple steps to finding your ideal healthcare provider.</p>
            </div>
            <div className="relative max-w-5xl mx-auto">
              <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-1 bg-border -z-10 rounded-full" />
              <div className="grid md:grid-cols-3 gap-12">
                {steps.map((s) => (
                  <div key={s.step} className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-card border-4 border-section-teal shadow-xl flex items-center justify-center mb-6 relative">
                      <span className="material-symbols-outlined text-primary text-4xl">{s.icon}</span>
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-text-base text-card font-bold flex items-center justify-center text-sm">
                        {s.step}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                    <p className="text-text-sub">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Patient Stories ─────────────────────────────────────── */}
        <section className="py-24 bg-section-teal border-t border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black mb-4">Patient Stories</h2>
              <p className="text-lg text-text-sub max-w-2xl mx-auto">
                Hear from people who found the right care when they needed it most.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((t) => (
                <div key={t.name} className="bg-card p-8 rounded-3xl border border-border shadow-sm relative">
                  <span className="material-symbols-outlined text-primary/20 text-6xl absolute top-6 right-6">format_quote</span>
                  <div className="flex gap-1 text-warning mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-sm">star</span>
                    ))}
                  </div>
                  <p className="text-text-sub mb-6 relative z-10 italic">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-section-blue shrink-0" />
                    <div>
                      <p className="font-bold text-text-base">{t.name}</p>
                      <p className="text-sm text-text-muted">{t.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────────── */}
        <section className="py-24 bg-card">
          <div className="max-w-5xl mx-auto px-6">
            <div className="bg-primary rounded-[2.5rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/30">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-black mb-6">Find the Right Doctor Today</h2>
                <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                  Don&apos;t wait to get the care you deserve. Use our AI-powered search to connect with top-rated specialists instantly.
                </p>
                <button className="bg-white text-primary px-10 py-5 rounded-2xl font-black text-lg hover:bg-section-teal hover:scale-105 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2 mx-auto">
                  Start Your Health Search
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>
       
      <Footer />


    </div>
  );
}
