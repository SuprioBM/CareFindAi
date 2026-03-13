'use client';

import { useState } from 'react';
import Link from 'next/link';
import VerifyEmailModal from '../../../components/forms/VerifyModal';
import { apiFetch } from '@/lib/api';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (res.status === 201) {
        // registration success → email OTP sent
        setShowModal(true);
        return;
      }

      throw new Error(data?.message || 'Registration failed');
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifiedSuccess = () => {
    setShowModal(false);
  };

  return (
    <>
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 pt-18">
      <div className="w-full max-w-md bg-card/80 backdrop-blur-xl border border-primary/10 rounded-2xl shadow-[0_0_40px_rgba(20,184,166,0.05)] p-8 relative overflow-hidden">
        <div className="absolute right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] pointer-events-none" />

        <div className="mb-8 text-center relative z-10">
          <h1 className="text-2xl font-bold mb-2">Create an Account</h1>
          <p className="text-text-muted text-sm">
            Join CareFind to access high-end healthcare.
          </p>
        </div>

        <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
          <div className="flex gap-4">
            <label className="flex flex-col flex-1">
              <span className="text-sm font-medium mb-1.5 text-text-sub">
               Name
              </span>
              <input
                type="text"
                placeholder="Enter Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl bg-surface border border-border focus:border-primary focus:ring-1 focus:ring-primary text-text-base placeholder:text-text-muted h-12 px-4 transition-all outline-none"
              />
            </label>
          </div>

          <label className="flex flex-col">
            <span className="text-sm font-medium mb-1.5 text-text-sub">
              Email Address
            </span>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">
                mail
              </span>
              <input
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-surface border border-border focus:border-primary focus:ring-1 focus:ring-primary text-text-base placeholder:text-text-muted h-12 pl-11 pr-4 transition-all outline-none"
              />
            </div>
          </label>

          <label className="flex flex-col">
            <span className="text-sm font-medium mb-1.5 text-text-sub">
              Password
            </span>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-surface border border-border focus:border-primary focus:ring-1 focus:ring-primary text-text-base placeholder:text-text-muted h-12 pl-11 pr-12 transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-sub transition-colors"
              >
                <span className="material-symbols-outlined text-sm">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </label>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>

            <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-card text-xs font-medium text-text-muted uppercase tracking-wider">
                Or continue with
              </span>
            </div>
          </div>

      <div className="mt-6 grid grid-cols-1 gap-3">
        <button
          onClick={() => {
            window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/start`;
          }}
          className="inline-flex justify-center items-center py-2.5 px-4 border border-border rounded-xl bg-surface text-sm font-medium text-text-sub hover:bg-section-teal hover:border-primary/30 transition-colors"
        >
          <svg
            aria-hidden="true"
            className="h-5 w-5 mr-2"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
          </svg>
          Google
        </button>
      </div>


          <div className="text-center mt-6">
            <span className="text-sm text-text-muted">
              Already have an account?{' '}
            </span>
            <Link
              href="/login"
              className="text-sm text-primary font-medium hover:underline"
            >
              Sign In
            </Link>
          </div>
        </form>
      </div>

      {showModal && (
        <VerifyEmailModal
          email={email}
          onClose={() => setShowModal(false)}
          onVerified={handleVerifiedSuccess}
          verifyEndpoint="/auth/verify-email"
          resendEndpoint="/auth/resend-verification"
        />
      )}
      </div>
    </>
  );
}