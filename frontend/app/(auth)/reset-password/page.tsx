'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import VerifyEmailModal from '../../../components/forms/VerifyModal';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [sendLoading, setSendLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const router = useRouter();

  const handleSendCode = async () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setSendLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to send reset code');
      }

      setCodeSent(true);
      setSuccess(data?.message || 'If that email exists, we sent a reset code.');
      setShowVerifyModal(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset code');
    } finally {
      setSendLoading(false);
    }
  };

  const handleCodeVerified = () => {
    setShowVerifyModal(false);
    setCodeVerified(true);
    setError('');
    setSuccess('Code verified. You can now set a new password.');
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!codeVerified) {
      setError('Please verify your reset code first.');
      return;
    }

    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setResetLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to reset password');
      }

      setSuccess(data?.message || 'Password reset successful. Redirecting to login...');

      setTimeout(() => {
        router.push('/login');
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 pt-8 pb-8">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-[0_0_40px_rgba(20,184,166,0.08)] p-8 backdrop-blur-sm">
          <div className="flex justify-center mb-6 text-primary">
            <span className="material-symbols-outlined text-5xl">lock_reset</span>
          </div>

          <h1 className="text-3xl font-bold text-center mb-3">Reset Password</h1>
          <p className="text-sm text-text-muted text-center mb-8">
            Enter your email to receive a reset code, verify it, then set your new password.
          </p>

          <form className="flex flex-col gap-5" onSubmit={handleResetPassword}>
            <label className="flex flex-col">
              <span className="text-sm font-medium mb-2 text-text-sub">Email Address</span>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={codeSent}
                className="w-full rounded-xl bg-surface border border-border focus:border-primary focus:ring-1 focus:ring-primary text-text-base placeholder:text-text-muted h-12 px-4 transition-all outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </label>

            <button
              type="button"
              onClick={handleSendCode}
              disabled={sendLoading || codeSent}
              className={`w-full h-12 rounded-xl border font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                codeSent
                  ? 'border-primary/50 text-primary bg-primary/10'
                  : 'border-primary text-primary bg-transparent hover:bg-primary/10'
              }`}
            >
              {sendLoading ? (
                'Sending...'
              ) : codeSent ? (
                <>
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Code Sent
                </>
              ) : (
                'Send Code'
              )}
            </button>

            {codeSent && !codeVerified && (
              <button
                type="button"
                onClick={() => setShowVerifyModal(true)}
                className="w-full h-12 rounded-xl border border-primary text-primary bg-transparent hover:bg-primary/10 font-bold transition-all"
              >
                Verify Code
              </button>
            )}

            <label className="flex flex-col">
              <span className="text-sm font-medium mb-2 text-text-sub">New Password</span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!codeVerified}
                  className="w-full rounded-xl bg-surface border border-border focus:border-primary focus:ring-1 focus:ring-primary text-text-base placeholder:text-text-muted h-12 px-4 pr-12 transition-all outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={!codeVerified}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-sub transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </label>

            <label className="flex flex-col">
              <span className="text-sm font-medium mb-2 text-text-sub">Confirm New Password</span>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={!codeVerified}
                  className="w-full rounded-xl bg-surface border border-border focus:border-primary focus:ring-1 focus:ring-primary text-text-base placeholder:text-text-muted h-12 px-4 pr-12 transition-all outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={!codeVerified}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-sub transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </label>

            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <button
              type="submit"
              disabled={!codeVerified || resetLoading}
              className="w-full h-12 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-all shadow-[0_4px_14px_0_rgba(20,184,166,0.35)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.25)] mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {resetLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link
              href="/login"
              className="text-sm font-medium text-text-muted hover:text-primary transition-colors inline-flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>

      {showVerifyModal && (
        <VerifyEmailModal
          email={email}
          onClose={() => setShowVerifyModal(false)}
          onVerified={handleCodeVerified}
          verifyEndpoint="/auth/verify-reset-code"
          resendEndpoint="/auth/forgot-password"
        />
      )}
    </>
  );
}