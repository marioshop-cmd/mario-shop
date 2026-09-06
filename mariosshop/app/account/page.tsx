'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../language/LanguageContext';
import AccountTabs from '../components/AccountTabs';
import { User as UserIcon, RefreshCw, PlusCircle } from 'lucide-react';

export default function AccountPage() {
  const { currentUser, updateProfile, updateSecurityInfo } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (currentUser === null) {
      const timer = setTimeout(() => {
        if (!currentUser) router.replace('/login');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentUser, router]);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // FIX: currentUser is null for a moment after a refresh while AuthContext
  // loads the session from localStorage. useState's initial value only runs
  // once, so it was locking these fields at empty forever. This effect
  // re-syncs the form whenever currentUser actually loads/changes.
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.username || '');
      setPhone(currentUser.phone || '');
      setAvatarPreview(currentUser.avatarUrl || null);
    }
  }, [currentUser]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAvatarPreview(dataUrl);
      // Save immediately on selection — no need to wait for "Save Changes".
      setUploadingAvatar(true);
      const result = updateProfile({ avatarUrl: dataUrl });
      setUploadingAvatar(false);
      setMessage({ type: result.success ? 'success' : 'error', text: result.success ? t('acct_profile_updated') : result.message });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    await new Promise((r) => setTimeout(r, 200));

    const nameResult = updateProfile({ username: fullName.trim() });
    const phoneResult = updateSecurityInfo({
      recoveryEmail: currentUser?.recoveryEmail || '',
      phone: phone.trim(),
    });
    setSaving(false);

    const success = nameResult.success && phoneResult.success;
    setMessage({
      type: success ? 'success' : 'error',
      text: success ? t('acct_profile_updated') : nameResult.message || phoneResult.message,
    });
  };

  if (!currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-xs text-zinc-500">Loading…</p>
      </main>
    );
  }

  const userBalance = currentUser?.b9chich ?? 0;

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-4 py-10 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <AccountTabs />

        {/* OVERVIEW CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
            <p className="text-[11px] text-zinc-500 font-semibold mb-1">{t('acct_status_title')}</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-lg font-black">{t('acct_status_all_good')}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
            <p className="text-[11px] text-zinc-500 font-semibold mb-1">{t('acct_total_orders')}</p>
            <p className="text-lg font-black">
              <a href="/my-orders" className="hover:text-red-400 transition">{t('acct_view_orders')}</a>
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-zinc-500 font-semibold mb-1">{t('acct_balance_label')}</p>
              <p className="text-lg font-black text-red-500">{userBalance} <span className="text-zinc-400 text-xs font-semibold">B9CHICH</span></p>
            </div>
            <a
              href="/account/billing"
              className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              {t('acct_add')}
            </a>
          </div>
        </div>

        {/* AVATAR */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 mb-6">
          <h2 className="text-sm font-bold text-white mb-4">{t('acct_picture_title')}</h2>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-900 border border-red-500/50 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-7 h-7 text-white" />
                )}
              </div>
              <p className="text-xs text-zinc-500 max-w-[220px]">
                {t('acct_picture_desc')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition"
            >
              {avatarPreview ? t('acct_change_image') : t('acct_choose_file')}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </section>

        {/* ACCOUNT DETAILS */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-sm font-bold text-white mb-4">{t('acct_details_title')}</h2>

          <form onSubmit={handleSave} className="space-y-4">
            {message && (
              <div
                role="status"
                className={`rounded-xl border p-3 text-xs font-semibold ${
                  message.type === 'success'
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                    : 'border-red-500/40 bg-red-500/10 text-red-400'
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">{t('acct_login_method')}</label>
                <div className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-400 rounded-xl p-3">
                  Email
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">{t('acct_full_name')}</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 text-sm text-white rounded-xl p-3 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">{t('email_label')}</label>
              <div className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-400 rounded-xl p-3">
                {currentUser.email}
              </div>
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
              disabled={saving}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
              {saving ? t('acct_saving') : t('acct_save_changes')}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
