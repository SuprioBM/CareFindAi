'use client';

import Link from 'next/link';
import ThemeToggle from '../../../components/Themes/ThemeToggle';

const workingHours = [
  { day: 'Monday', hours: '9:00 AM - 5:00 PM' },
  { day: 'Tuesday', hours: '9:00 AM - 5:00 PM' },
  { day: 'Wednesday', hours: '9:00 AM - 5:00 PM' },
  { day: 'Thursday', hours: '9:00 AM - 6:00 PM' },
  { day: 'Friday', hours: '9:00 AM - 1:00 PM' },
  { day: 'Saturday - Sunday', hours: 'Closed', highlight: true },
];

const stats = [
  { value: '4.9', label: 'Rating', icon: 'star', highlight: true },
  { value: '150+', label: 'Reviews', icon: null },
  { value: '15', label: 'Years Exp.', icon: null },
  { value: '5k+', label: 'Patients', icon: null },
];

export default function DoctorProfilePage() {
  return (
    <div className="bg-surface text-text-base min-h-screen flex flex-col antialiased">

      {/* ── Header ── */}
      <header className="flex items-center justify-between border-b border-border px-10 py-3 bg-surface sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 text-primary">
            <span className="material-symbols-outlined text-2xl">medical_services</span>
            <h2 className="text-lg font-bold tracking-tight text-text-base">CareFind</h2>
          </div>
          <div className="hidden md:flex items-stretch rounded-xl h-10 min-w-40 max-w-64 bg-card border border-border focus-within:border-primary transition-colors">
            <div className="text-text-muted flex items-center justify-center pl-4 rounded-l-xl">
              <span className="material-symbols-outlined text-xl">search</span>
            </div>
            <input
              className="flex w-full min-w-0 flex-1 rounded-xl bg-transparent text-text-base focus:outline-none border-none h-full placeholder:text-text-muted px-3 text-sm"
              placeholder="Search"
            />
          </div>
        </div>
        <div className="flex flex-1 justify-end items-center gap-8">
          <nav className="hidden md:flex items-center gap-6">
            {[['Find Doctors', '#'], ['Appointments', '#'], ['Messages', '#'], ['Profile', '#']].map(([label, href]) => (
              <Link key={label} href={href} className="text-text-sub hover:text-primary transition-colors text-sm font-medium">
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div
              className="w-10 h-10 rounded-full bg-cover bg-center bg-primary/20 border-2 border-border"
              style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBAkm4bbhmikqaQXtRlrXHaIO64IKTPnEytBHO0aCQxlNZKwrprxj2u3opQ6bVI4NTPxkhRPy8WY0GpsyVcIL9YULxeJk2Fg3jYoNF5bmlehYVtnezhOUuLo_WXboNHs8xpKwX_SmMLnfEO7g_pFeJnBrAPqmjhU4W5vw9JLaAdl8jNQJG0Z8-Fw4f6hFCG03XzW9g0ZZBGBcjqUdZRxWdOPjRIn73Dw3i2-utxwb7O8lwaX5X8Tdo0NWoA5gGQh0XB4Zh-dDhePlY')` }}
            />
          </div>
        </div>
      </header>

      <div className="max-w-[960px] mx-auto w-full px-10 py-4 flex-1">

        {/* ── Breadcrumb ── */}
        <div className="flex flex-wrap gap-2 py-4">
          <Link href="/" className="text-text-muted hover:text-text-base transition-colors text-sm font-medium">Home</Link>
          <span className="text-text-muted text-sm">/</span>
          <Link href="/symptoms" className="text-text-muted hover:text-text-base transition-colors text-sm font-medium">Doctors</Link>
          <span className="text-text-muted text-sm">/</span>
          <span className="text-text-base text-sm font-medium">Dr. Sarah Jenkins</span>
        </div>

        {/* ── Profile card ── */}
        <div className="bg-card p-6 rounded-xl border border-border flex flex-col gap-6 @container">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
            <div className="flex gap-6 items-center">
              <div
                className="w-32 h-32 rounded-full flex-shrink-0 bg-cover bg-center border-4 border-primary/20"
                style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCQs_1BFJmc4r4XrZl1By_vQFAvPDddABc2qPRJ179G3ynFSB6LzliIjrT4Fr1obKAcvz7w6fsxMehpCr9kpW-tdNYjBZe8RSQKdAy9mstXcBu0lv09tRnpZfQHn4REhAra-3buWu276ZzUkFKERB4-fqLU47j3lqVeV8FW8Hysm6pLjvcwj5tg1cHK54OFGHmx2B61rx9d-OuHX3enb7wMIsgo3yvf8bza4DO7ZJA0QSUzjyuhNVfCgYWTt2PKTBzCmby-0JNMnI8')` }}
              />
              <div className="flex flex-col justify-center">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Dr. Sarah Jenkins</h1>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-semibold">Cardiologist</span>
                  <span className="text-text-muted text-sm">• 15 years experience</span>
                </div>
                <div className="flex items-center gap-1 text-text-muted mt-2">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  <p className="text-sm">New York, NY</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 flex-col sm:flex-row">
              <button className="flex items-center justify-center rounded-xl h-12 px-6 bg-border text-text-base text-sm font-bold hover:bg-border/80 transition-colors border border-border">
                <span className="material-symbols-outlined mr-2">calendar_month</span>
                Book Appointment
              </button>
              <button className="flex items-center justify-center rounded-xl h-12 px-6 bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-[0_0_15px_rgba(20,184,166,0.4)] transition-colors">
                <span className="material-symbols-outlined mr-2">bookmark</span>
                Save
              </button>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {stats.map(({ value, label, icon, highlight }) => (
            <div key={label} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5 items-center justify-center">
              <p className={`text-3xl font-bold leading-tight ${highlight ? 'text-primary' : 'text-text-base'}`}>{value}</p>
              <div className="flex items-center gap-1">
                {icon && <span className="material-symbols-outlined text-yellow-500 text-sm">{icon}</span>}
                <p className="text-text-muted text-xs font-medium uppercase tracking-wider">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── About ── */}
        <div className="py-6">
          <h2 className="text-2xl font-bold tracking-tight mb-4">About Dr. Jenkins</h2>
          <div className="bg-card p-6 rounded-xl border border-border">
            <p className="text-text-muted text-base leading-relaxed">
              Dr. Sarah Jenkins is a board-certified Cardiologist with over 15 years of experience in diagnosing and treating
              cardiovascular diseases. She specializes in preventive cardiology, echocardiography, and heart failure management.
              Dr. Jenkins is dedicated to providing compassionate, patient-centered care and utilizes the latest evidence-based
              treatments to improve her patients&apos; heart health and overall quality of life.
            </p>
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {['Preventive Cardiology', 'Echocardiography', 'Heart Failure', 'Arrhythmias'].map((s) => (
                  <span key={s} className="bg-border text-text-base px-3 py-1 rounded-md text-sm">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Location + Hours ── */}
        <div className="py-6 flex gap-6 flex-col md:flex-row pb-12">
          {/* Location */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold tracking-tight mb-4">Location</h2>
            <div className="bg-card p-4 rounded-xl border border-border overflow-hidden h-64 relative">
              <div
                className="w-full h-full rounded-lg flex items-center justify-center relative bg-cover bg-center"
                style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCI81AIGp6TKu-Muc70AzLTOoT-wIeadCbNNtKFe5MjfSwJbhSKLm3cKIpynms5cCsAJ5AmxmN2WLcJ85R-fPGrAUURstNgoayKhTmts5w-HzLgrckK250sLqZ56NLlm99KrFzisjw2GZiPpxiozkL2A6oeZAYbvUYM6WEC_W-rUSKM97uV9yIBinXyvBYtU-xWWcshGSBMnF29mwkwAnGLBfwXUdP_2KpeMUuKepi99oHMwCwCfiqcpDxEO45jwz9chOXBmBgNzJ4')` }}
              >
                <span className="material-symbols-outlined text-primary text-5xl absolute drop-shadow-lg">location_on</span>
              </div>
            </div>
            <div className="mt-4 text-text-muted text-sm">
              <p className="font-medium text-text-base mb-1">Heart Care Clinic</p>
              <p>123 Medical Center Dr, Suite 400</p>
              <p>New York, NY 10001</p>
            </div>
          </div>

          {/* Working Hours */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold tracking-tight mb-4">Working Hours</h2>
            <div className="bg-card p-6 rounded-xl border border-border flex flex-col gap-3">
              {workingHours.map(({ day, hours, highlight }, i) => (
                <div
                  key={day}
                  className={`flex justify-between items-center py-2 ${i < workingHours.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <span className="text-text-muted text-sm">{day}</span>
                  <span className={`text-sm font-medium ${highlight ? 'text-primary' : 'text-text-base'}`}>{hours}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
