'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../language/LanguageContext';

function generateReferralCode(existingUsers: any[]) {
  let code = '';

  do {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
  } while (existingUsers.some((u) => u.referralCode === code));

  return code;
}

const COUNTRIES = [
  'Tunisia',
  'Algeria',
  'Morocco',
  'Libya',
  'France',
  'Other',
];

// The 24 governorates of Tunisia
const TUNISIA_REGIONS = [
  'Tunis',
  'Ariana',
  'Ben Arous',
  'Manouba',
  'Nabeul',
  'Zaghouan',
  'Bizerte',
  'Béja',
  'Jendouba',
  'Kef',
  'Siliana',
  'Sousse',
  'Monastir',
  'Mahdia',
  'Sfax',
  'Kairouan',
  'Kasserine',
  'Sidi Bouzid',
  'Gabès',
  'Médenine',
  'Tataouine',
  'Gafsa',
  'Tozeur',
  'Kébili',
];

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const referralCodeFromUrl = searchParams.get('ref');

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const isTunisia = country === 'Tunisia';

  const handleCountryChange = (value: string) => {
    setCountry(value);
    // Changing away from Tunisia clears a now-irrelevant region pick.
    if (value !== 'Tunisia') setRegion('');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !username.trim() || !country || !password) {
      setError(t('err_register_fields'));
      return;
    }

    if (isTunisia && !region) {
      setError(t('err_register_region'));
      return;
    }

    const existingUsers = JSON.parse(
      localStorage.getItem('mario_users') || '[]'
    );

    const userExists = existingUsers.some(
      (u: any) => u.email === cleanEmail
    );

    if (userExists) {
      setError(t('err_register_exists'));
      return;
    }

    const myReferralCode = generateReferralCode(existingUsers);

    const referredBy =
      referralCodeFromUrl &&
      existingUsers.find(
        (u: any) => u.referralCode === referralCodeFromUrl
      )
        ? referralCodeFromUrl
        : null;

    const newUser = {
      email: cleanEmail,
      username: username.trim(),
      country,
      region: isTunisia ? region : null,
      password,
      isAdmin: false,

      referralCode: myReferralCode,
      referredBy: referredBy,

      wallet: 1,
      totalReferralEarnings: 0,
      firstPurchaseCompleted: false
    };

    existingUsers.push(newUser);

    localStorage.setItem(
      'mario_users',
      JSON.stringify(existingUsers)
    );

    localStorage.setItem(
      'currentUser',
      JSON.stringify({
        ...newUser
      })
    );

    window.dispatchEvent(new Event('authChange'));

    router.push('/');
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 overflow-hidden">
      {/* Soft glowing shapes behind the card — creates the frosted-glass
          depth effect since the card itself uses backdrop-blur. */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-red-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-red-900/20 blur-3xl" />

      <div className="auth-card-in relative bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 max-w-md w-full space-y-6 shadow-2xl backdrop-blur-xl">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-red-500">
            {t('create_account_title')}
          </h1>

          <p className="text-xs text-zinc-400">
            {t('create_account_subtitle')}
          </p>

          {referralCodeFromUrl && (
            <div className="mt-3 rounded-xl bg-green-900/20 border border-green-600 p-3 text-xs text-green-400 font-bold">
              {t('referral_join_msg')}
            </div>
          )}
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-xs text-zinc-400 font-bold block mb-1">
              {t('email_address_label')}
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@gmail.com"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 font-bold block mb-1">
              {t('username_label')}
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('username_placeholder')}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 font-bold block mb-1">
              {t('country_label')}
            </label>

            <select
              value={country}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500 outline-none"
              required
            >
              <option value="" disabled>
                {t('select_country_placeholder')}
              </option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Only shown once Tunisia is picked as the country */}
          {isTunisia && (
            <div>
              <label className="text-xs text-zinc-400 font-bold block mb-1">
                {t('region_label')}
              </label>

              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500 outline-none"
                required
              >
                <option value="" disabled>
                  {t('select_region_placeholder')}
                </option>
                {TUNISIA_REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs text-zinc-400 font-bold block mb-1">
              {t('password_label')}
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 pr-11 text-sm text-white focus:border-red-500 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 font-bold text-center bg-red-950/40 border border-red-500/30 p-2.5 rounded-xl">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-red-600/20"
          >
            {t('register_button')}
          </button>
        </form>
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
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterPageContent />
    </Suspense>
  );
}
