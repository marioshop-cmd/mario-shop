'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, type User } from '../context/AuthContext';
import { requestAuthCode, verifyAuthCode } from '../lib/authCodes';

export default function LoginPage() {
  const { currentUser, loginUser, completeLogin } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<'credentials' | 'code'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendNotice, setResendNotice] = useState('');

  // Already logged in? No need to see the login form. This only fires once
  // completeLogin() has actually run (after the code is verified), so it
  // can't skip the 2FA step.
  useEffect(() => {
    if (currentUser) router.replace('/');
  }, [currentUser, router]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setSubmitting(true);
    const result = await loginUser(email.trim(), password);

    if (!result.success || !result.user) {
      setSubmitting(false);
      setError(result.error || 'Invalid email or password.');
      return;
    }

    const codeResult = await requestAuthCode(result.user.email, 'login');
    setSubmitting(false);

    if (!codeResult.success) {
      setError(codeResult.message || 'Could not send your login code. Please try again.');
      return;
    }

    setPendingUser(result.user);
    setStep('code');
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!pendingUser) return;
    if (!code.trim()) {
      setError('Please enter the code from your email.');
      return;
    }

    setSubmitting(true);
    const result = await verifyAuthCode(pendingUser.email, code.trim(), 'login');
    setSubmitting(false);

    if (!result.success) {
      setError(result.message || 'Incorrect code.');
      return;
    }

    completeLogin(pendingUser);
    router.push('/');
  };

  const handleResend = async () => {
    if (!pendingUser) return;
    setResending(true);
    setResendNotice('');
    const result = await requestAuthCode(pendingUser.email, 'login');
    setResending(false);
    setResendNotice(result.success ? 'A new code has been sent.' : result.message || 'Could not resend the code.');
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4 pt-24 pb-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-4 py-1.5 rounded-full text-red-500 text-xs font-bold uppercase tracking-widest mb-4">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
            </svg>
            Welcome Back
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            {step === 'credentials' ? (
              <>Log In to <span className="text-red-500">Your Account</span></>
            ) : (
              <>Check Your <span className="text-red-500">Email</span></>
            )}
          </h1>
          <p className="text-zinc-400 text-sm mt-2">
            {step === 'credentials'
              ? 'Access your balance, orders, and support tickets.'
              : `We sent a 6-digit code to ${pendingUser?.email}.`}
          </p>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 md:p-8 backdrop-blur-md">
          {step === 'credentials' ? (
            <form onSubmit={handleCredentialsSubmit} noValidate className="space-y-4">
              {error && (
                <div role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs font-semibold text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="login-email" className="block text-xs font-bold text-zinc-300 mb-2">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 text-sm text-white rounded-xl p-3 outline-none transition disabled:opacity-50"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="login-password" className="block text-xs font-bold text-zinc-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-300 transition"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 text-sm text-white rounded-xl p-3 outline-none transition disabled:opacity-50"
                />
              </div>

              <div className="text-right">
                <Link href="/forgot-password" className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-300 transition">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? 'Checking…' : 'Continue'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCodeSubmit} noValidate className="space-y-4">
              {error && (
                <div role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs font-semibold text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="login-code" className="block text-xs font-bold text-zinc-300 mb-2">
                  6-digit code
                </label>
                <input
                  id="login-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={submitting}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 text-center text-lg tracking-[0.5em] font-bold text-white rounded-xl p-3 outline-none transition disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || code.length !== 6}
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? 'Verifying…' : 'Verify & Log In'}
              </button>

              <div className="text-center space-y-2">
                {resendNotice && <p className="text-[11px] text-zinc-500">{resendNotice}</p>}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-[11px] font-semibold text-red-400 hover:underline disabled:opacity-50"
                >
                  {resending ? 'Sending…' : "Didn't get it? Resend code"}
                </button>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('credentials');
                      setCode('');
                      setError('');
                    }}
                    className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-300 transition"
                  >
                    ← Back
                  </button>
                </div>
              </div>
            </form>
          )}

          {step === 'credentials' && (
            <p className="text-center text-xs text-zinc-500 mt-6">
              Don't have an account?{' '}
              <Link href="/register" className="font-bold text-red-400 hover:underline">
                Sign up
              </Link>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
