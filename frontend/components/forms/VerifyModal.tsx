'use client';

import { useRef, useState } from 'react';
import { apiFetch } from '@/lib/api';

interface Props {
  email: string;
  onClose: () => void;
  onVerified: () => void;
  verifyEndpoint: string;
  resendEndpoint: string;
}

export default function VerifyEmailModal({
  email,
  onClose,
  onVerified,
  verifyEndpoint,
  resendEndpoint,
}: Props) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);

    if (!pasted) return;

    const next = Array(6).fill('');
    pasted.split('').forEach((char, i) => {
      next[i] = char;
    });

    setOtp(next);
    setError('');

    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');

    if (code.length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await apiFetch(verifyEndpoint, {
        method: 'POST',
        body: JSON.stringify({
          email,
          code,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Verification failed');
      }

      setSuccess(data?.message || 'Code verified successfully.');
      onVerified();
    } catch (err: any) {
      setError(err?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await apiFetch(resendEndpoint, {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to resend code');
      }

      setSuccess(data?.message || 'Verification code sent again.');
    } catch (err: any) {
      setError(err?.message || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-card/90 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-[0_0_40px_rgba(20,184,166,0.1)] p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-[0_0_20px_rgba(20,184,166,0.15)]">
            <span className="material-symbols-outlined text-primary text-3xl">
              mark_email_read
            </span>
          </div>

          <h2 className="text-2xl font-bold mb-3">Verify Code</h2>

          <p className="text-text-muted text-sm px-4">
            We've sent a 6-digit code to
            <br />
            <span className="text-text-base font-medium">
              {email || 'your email'}
            </span>
          </p>
        </div>

        <div className="flex justify-between gap-3 mb-4 px-2">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              autoFocus={i === 0}
              className={`w-12 h-12 text-center text-xl font-bold rounded-full border text-text-base bg-surface transition-all outline-none ${
                digit
                  ? 'border-primary border-2 ring-4 ring-primary/20 shadow-[0_0_15px_rgba(20,184,166,0.25)] bg-card'
                  : 'border-border focus:border-primary focus:border-2 focus:ring-4 focus:ring-primary/20 focus:bg-card focus:shadow-[0_0_15px_rgba(20,184,166,0.25)]'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center mb-3">{error}</p>
        )}

        {success && (
          <p className="text-sm text-green-600 text-center mb-3">{success}</p>
        )}

        <button
          type="button"
          onClick={handleVerify}
          disabled={loading}
          className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-all flex items-center justify-center mb-6 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading}
            className="text-sm text-text-muted hover:text-primary transition-colors flex items-center justify-center gap-1 mx-auto disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            {resendLoading ? 'Sending...' : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  );
}