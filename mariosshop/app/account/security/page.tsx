'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../language/LanguageContext';
import AccountTabs from '../../components/AccountTabs';

export default function SecurityPage() {
  const { currentUser, updateSecurityInfo, changePassword } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  // Redirect guests to login, same grace-period pattern used elsewhere.
  useEffect(() => {
    if (currentUser === null) {
      const timer = setTimeout(() => {
        if (!currentUser) router.replace('/login');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentUser, router]);

  // --- Recovery info form ---
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [infoMessage, setInfoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savingInfo, setSavingInfo] = useState(false);

  // FIX: currentUser is null for a moment after a refresh while AuthContext
  // loads the session from localStorage. useState's initial value only runs
  // once, so it was locking these fields at empty forever. This effect
  // re-syncs the form whenever currentUser actually loads/changes.
  useEffect(() => {
    if (currentUser) {
      setRecoveryEmail(currentUser.recoveryEmail || '');
      setPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoMessage(null);
    setSavingInfo(true);
    await new Promise((r) => setTimeout(r, 200));

    const result = updateSecurityInfo({ recoveryEmail: recoveryEmail.trim(), phone: phone.trim() });
    setSavingInfo(false);
    setInfoMessage({ type: result.success ? 'success' : 'error', text: result.message });
  };

  // --- Change password form ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setSavingPassword(true);
    await new Promise((r) => setTimeout(r, 200));
    const result = changePassword(currentPassword, newPassword);
    setSavingPassword(false);

    setPasswordMessage({ type: result.success ? 'success' : 'error', text: result.message });
    if (result.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  if (!currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-xs text-zinc-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-4 py-10 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <AccountTabs />

        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight">{t('acct_security_title')}</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage your recovery info and password for <span className="text-zinc-300 font-semibold">{currentUser.email}</span>.
          </p>
        </div>

        <div className="space-y-8">
          {/* RECOVERY INFO */}
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white">{t('acct_recovery_title')}</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {t('acct_recovery_desc')}
              </p>
            </div>

            <form onSubmit={handleSaveInfo} className="space-y-4">
              {infoMessage && (
                <div
                  role="status"
                  className={`rounded-xl border p-3 text-xs font-semibold ${
                    infoMessage.type === 'success'
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                      : 'border-red-500/40 bg-red-500/10 text-red-400'
                  }`}
                >
                  {infoMessage.text}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">{t('acct_recovery_gmail')}</label>
                <input
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="yourbackup@gmail.com"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 text-sm text-white rounded-xl p-3 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">{t('acct_phone')}</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+216 XX XXX XXX"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 text-sm text-white rounded-xl p-3 outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={savingInfo}
                className="rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold px-5 py-2.5 transition disabled:opacity-60"
              >
                {savingInfo ? t('acct_saving') : t('acct_save_info')}
              </button>
            </form>
          </section>

          {/* CHANGE PASSWORD */}
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white">{t('acct_change_password_title')}</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {t('acct_change_password_desc')}
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordMessage && (
                <div
                  role="status"
                  className={`rounded-xl border p-3 text-xs font-semibold ${
                    passwordMessage.type === 'success'
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                      : 'border-red-500/40 bg-red-500/10 text-red-400'
                  }`}
                >
                  {passwordMessage.text}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">{t('acct_current_password')}</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 text-sm text-white rounded-xl p-3 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">{t('acct_new_password')}</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 text-sm text-white rounded-xl p-3 outline-none transition"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">{t('acct_confirm_password')}</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 text-sm text-white rounded-xl p-3 outline-none transition"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className="rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-5 py-2.5 transition shadow-[0_0_15px_rgba(239,68,68,0.3)] disabled:opacity-60"
              >
                {savingPassword ? t('acct_saving') : t('acct_update_password')}
              </button>
            </form>

            <p className="text-xs text-zinc-500 pt-1">
              {t('acct_forgot_current')}{' '}
              <Link href="/account/password" className="font-semibold text-red-400 hover:underline">
                {t('acct_reset_via_email')}
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
