'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

type Step = 'email' | 'code' | 'newPassword' | 'done';

export default function ForgotPasswordPage() {
  const { requestPasswordResetCode, verifyPasswordResetCode, resetPasswordWithCode } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ⚠️ NO REAL EMAIL SERVICE CONNECTED YET.
  // devCode is shown on-screen below so you can test the whole flow now.
  // Once you set up an email API (e.g. EmailJS), send `devCode` to the
  // user's email instead of displaying it here, and remove this banner.
  const [devCode, setDevCode] = useState<string | null>(null);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 300));
    const result = await requestPasswordResetCode(email.trim());
    setSubmitting(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setDevCode(result.devCode || null);
    setStep('code');
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code.trim()) {
      setError('Please enter the code.');
      return;
    }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 300));
    const result = await verifyPasswordResetCode(email.trim(), code.trim());
    setSubmitting(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setStep('newPassword');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 300));
    const result = await resetPasswordWithCode(email.trim(), code.trim(), newPassword);
    setSubmitting(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setStep('done');
    setTimeout(() => router.push('/login'), 1800);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4 pt-24 pb-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            Reset Your <span className="text-red-500">Password</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-2">
            {step === 'email' && "Enter your account email and we'll send you a code."}
            {step === 'code' && 'Enter the 6-digit code to continue.'}
            {step === 'newPassword' && 'Choose a new password for your account.'}
            {step === 'done' && 'Your password has been reset.'}
          </p>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 md:p-8 backdrop-blur-md">
          {error && (
            <div role="alert" className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs font-semibold text-red-400">
              {error}
            </div>
          )}

          {devCode && step === 'code' && (
            <div role="status" className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs font-semibold text-amber-300">
              📧 No email service is connected yet, so here's your code for testing: <span className="font-mono text-sm">{devCode}</span>
            </div>
          )}

          {/* STEP 1: EMAIL */}
          {step === 'email' && (
            <form onSubmit={handleRequestCode} noValidate className="space-y-4">
              <div>
                <label htmlFor="fp-email" className="block text-xs font-bold text-zinc-300 mb-2">
                  Email
                </label>
                <input
                  id="fp-email"
                  type="email"
                  autoComplete="email"
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 text-sm text-white rounded-xl p-3 outline-none transition disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? 'Sending…' : 'Send Code'}
              </button>
            </form>
          )}

          {/* STEP 2: CODE */}
          {step === 'code' && (
            <form onSubmit={handleVerifyCode} noValidate className="space-y-4">
              <div>
                <label htmlFor="fp-code" className="block text-xs font-bold text-zinc-300 mb-2">
                  6-digit code
                </label>
                <input
                  id="fp-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  disabled={submitting}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 text-center tracking-[0.5em] font-mono text-lg text-white rounded-xl p-3 outline-none transition disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? 'Verifying…' : 'Verify Code'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setCode('');
                  setError('');
                }}
                className="w-full text-center text-[11px] font-semibold text-zinc-500 hover:text-zinc-300 transition"
              >
                Use a different email
              </button>
            </form>
          )}

          {/* STEP 3: NEW PASSWORD */}
          {step === 'newPassword' && (
            <form onSubmit={handleResetPassword} noValidate className="space-y-4">
              <div>
                <label htmlFor="fp-new" className="block text-xs font-bold text-zinc-300 mb-2">
                  New Password
                </label>
                <input
                  id="fp-new"
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={submitting}
                  minLength={6}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 text-sm text-white rounded-xl p-3 outline-none transition disabled:opacity-50"
                />
              </div>

              <div>
                <label htmlFor="fp-confirm" className="block text-xs font-bold text-zinc-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  id="fp-confirm"
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={submitting}
                  minLength={6}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 text-sm text-white rounded-xl p-3 outline-none transition disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? 'Saving…' : 'Reset Password'}
              </button>
            </form>
          )}

          {/* STEP 4: DONE */}
          {step === 'done' && (
            <div className="text-center py-4 space-y-2">
              <div className="text-3xl">✅</div>
              <p className="text-sm font-bold text-white">Password reset!</p>
              <p className="text-xs text-zinc-500">Redirecting you to login…</p>
            </div>
          )}

          {step !== 'done' && (
            <p className="text-center text-xs text-zinc-500 mt-6">
              Remembered your password?{' '}
              <Link href="/login" className="font-bold text-red-400 hover:underline">
                Log in
              </Link>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
