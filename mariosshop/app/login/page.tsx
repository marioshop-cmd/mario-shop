'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../language/LanguageContext';

export default function LoginPage() {
  const { currentUser, loginUser } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already logged in? No need to see the login form.
  useEffect(() => {
    if (currentUser) router.replace('/');
  }, [currentUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError(t('err_login_required'));
      return;
    }

    setSubmitting(true);
    // Tiny delay so the loading state is visible even on instant localStorage lookups.
    await new Promise((resolve) => setTimeout(resolve, 300));
    const result = loginUser(email.trim(), password);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error || t('err_login_invalid'));
      return;
    }

    router.push('/');
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4 pt-24 pb-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-4 py-1.5 rounded-full text-red-500 text-xs font-bold uppercase tracking-widest mb-4">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
            </svg>
            {t('welcome_back')}
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            {t('login_title_1')}<span className="text-red-500">{t('login_title_highlight')}</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-2">
            {t('login_subtitle')}
          </p>
        </div>

        <div className="auth-card-in bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 md:p-8 backdrop-blur-md">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {error && (
              <div role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs font-semibold text-red-400">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="block text-xs font-bold text-zinc-300 mb-2">
                {t('email_label')}
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
                  {t('password_label')}
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-300 transition"
                >
                  {showPassword ? t('hide_password') : t('show_password')}
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? t('logging_in') : t('login')}
            </button>

            <p className="text-center">
              <Link href="/forgot-password" className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-300 transition">
                {t('forgot_password_link')}
              </Link>
            </p>
          </form>

          <p className="text-center text-xs text-zinc-500 mt-6">
            {t('no_account_yet')}{' '}
            <Link href="/register" className="font-bold text-red-400 hover:underline">
              {t('sign_up_link')}
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes authCardIn {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .auth-card-in {
          animation: authCardIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @media (prefers-reduced-motion: reduce) {
          .auth-card-in { animation: none !important; }
        }
      `}</style>
    </main>
  );
}
