'use client';

import { useState } from 'react';
import Link from 'next/link';
import VerifyEmailModal from '../../../../components/forms/VerifyModal';
import { useAuth } from '@/authContext/authContext';
import { apiFetch } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';


export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [pendingLogin, setPendingLogin] = useState<{
    email: string;
    password: string;
  } | null>(null);

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const tryLogin = async (loginEmail: string, loginPassword: string) => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: loginEmail,
        password: loginPassword,
      }),
    });

    const data = await res.json();
    console.log(data);
    

    const isVerified = data?.user?.isVerified;

    if (isVerified === false) {
      setPendingLogin({ email: loginEmail, password: loginPassword });
      setShowModal(true);
      return;
    }

    if (!res.ok) {
      throw new Error(data?.message || 'Login failed');
    }

    login(data.user, data.accessToken, data.sessionId);
    router.push(redirect || '/');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await tryLogin(email, password);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifiedSuccess = async () => {
    if (!pendingLogin) return;
    setShowModal(false);
    setError('');
    setLoading(true);
    try {
      await tryLogin(pendingLogin.email, pendingLogin.password);
      setPendingLogin(null);
    } catch (err: any) {
      setError(err?.message || 'Login failed after verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-[calc(100vh-100px)] flex items-center justify-center px-4 pt-18">
        {showModal && (
          <VerifyEmailModal
            email={pendingLogin?.email || email}
            onClose={() => setShowModal(false)}
            onVerified={handleVerifiedSuccess}
            verifyEndpoint="/auth/verify-email"
            resendEndpoint="/auth/resend-verification"
          />
        )}

        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute bottom-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        </div>

        <div className="w-full max-w-md bg-card/80 backdrop-blur-xl rounded-2xl shadow-xl border border-primary/10 relative z-10 overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40" />

          <div className="p-8 sm:p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <span className="material-symbols-outlined text-3xl">account_circle</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome To CareFind</h1>
              <p className="text-sm text-text-muted">Sign in to your CareFind account to continue</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-sub mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-text-muted text-xl">mail</span>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl text-text-base placeholder:text-text-muted focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-text-sub">
                    Password
                  </label>
                  <Link
                    href="/reset-password"
                    className="text-xs font-medium text-primary hover:text-primary-hover transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-text-muted text-xl">lock</span>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-12 py-3 bg-surface border border-border rounded-xl text-text-base placeholder:text-text-muted focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-text-sub transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-border bg-surface accent-primary"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-text-sub">
                  Remember me for 30 days
                </label>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-hover transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

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
                  window.location.href =
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/google/start?redirect=` + encodeURIComponent(redirect);
                }}
                className="inline-flex justify-center items-center py-2.5 px-4 border border-border rounded-xl bg-surface text-sm font-medium text-text-sub hover:bg-section-teal hover:border-primary/30 transition-colors"
              >
                <svg aria-hidden="true" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                </svg>
                Google
              </button>
            </div>

            <p className="mt-8 text-center text-sm text-text-muted">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-bold text-primary hover:text-primary-hover transition-colors">
                Sign up now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}