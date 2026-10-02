
'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { requestAuthCode, verifyAuthCode } from '../lib/authCodes';

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

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { registerUser } = useAuth();

  const referralCodeFromUrl = searchParams.get('ref');

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Post-registration email verification
  const [step, setStep] = useState<'form' | 'code'>('form');
  const [code, setCode] = useState('');
  const [resending, setResending] = useState(false);
  const [resendNotice, setResendNotice] = useState('');

  const isTunisia = country === 'Tunisia';

  const handleCountryChange = (value: string) => {
    setCountry(value);
    // Changing away from Tunisia clears a now-irrelevant region pick.
    if (value !== 'Tunisia') setRegion('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !username.trim() || !country || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (isTunisia && !region) {
      setError('Please select your region.');
      return;
    }

    setSubmitting(true);
    const result = await registerUser({
      email: cleanEmail,
      username: username.trim(),
      country,
      region: isTunisia ? region : null,
      password,
      isAdmin: false,
      referredBy: referralCodeFromUrl || null,
      wallet: 1,
      totalReferralEarnings: 0,
      firstPurchaseCompleted: false,
    });
    setSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Something went wrong creating your account. Please try again.');
      return;
    }

    // Account is created — now require email verification before sending
    // them into the shop.
    const codeResult = await requestAuthCode(cleanEmail, 'register');
    if (!codeResult.success) {
      setError(codeResult.message || 'Account created, but we could not send the verification code. You can request a new one below.');
    }
    setStep('code');
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code.trim()) {
      setError('Please enter the code from your email.');
      return;
    }

    setSubmitting(true);
    const result = await verifyAuthCode(email.trim().toLowerCase(), code.trim(), 'register');
    setSubmitting(false);

    if (!result.success) {
      setError(result.message || 'Incorrect code.');
      return;
    }

    router.push('/');
  };

  const handleResend = async () => {
    setResending(true);
    setResendNotice('');
    const result = await requestAuthCode(email.trim().toLowerCase(), 'register');
    setResending(false);
    setResendNotice(result.success ? 'A new code has been sent.' : result.message || 'Could not resend the code.');
  };

  if (step === 'code') {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-red-500">Check Your Email</h1>
            <p className="text-xs text-zinc-400">
              We sent a 6-digit code to {email.trim().toLowerCase()}.
            </p>
          </div>

          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400 font-bold block mb-1">6-digit code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={submitting}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-center text-lg tracking-[0.5em] font-bold text-white focus:border-red-500 outline-none disabled:opacity-50"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 font-bold text-center bg-red-950/40 border border-red-500/30 p-2.5 rounded-xl">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || code.length !== 6}
              className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-red-600/20 disabled:opacity-60"
            >
              {submitting ? 'Verifying…' : 'Verify & Continue'}
            </button>

            <div className="text-center space-y-1">
              {resendNotice && <p className="text-[11px] text-zinc-500">{resendNotice}</p>}
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-[11px] font-semibold text-red-400 hover:underline disabled:opacity-50"
              >
                {resending ? 'Sending…' : "Didn't get it? Resend code"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-red-500">
            Create Account 🍄
          </h1>

          <p className="text-xs text-zinc-400">
            Register once to access Mario's Shop anytime.
          </p>

          {referralCodeFromUrl && (
            <div className="mt-3 rounded-xl bg-green-900/20 border border-green-600 p-3 text-xs text-green-400 font-bold">
              🎉 You're joining through a referral invitation.
            </div>
          )}
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-xs text-zinc-400 font-bold block mb-1">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@gmail.com"
              disabled={submitting}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500 outline-none disabled:opacity-50"
              required
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 font-bold block mb-1">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="MarioGamer"
              disabled={submitting}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500 outline-none disabled:opacity-50"
              required
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 font-bold block mb-1">
              Country
            </label>

            <select
              value={country}
              onChange={(e) => handleCountryChange(e.target.value)}
              disabled={submitting}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500 outline-none disabled:opacity-50"
              required
            >
              <option value="" disabled>
                Select your country
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
                Region
              </label>

              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                disabled={submitting}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500 outline-none disabled:opacity-50"
                required
              >
                <option value="" disabled>
                  Select your region
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
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={submitting}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500 outline-none disabled:opacity-50"
              required
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 font-bold text-center bg-red-950/40 border border-red-500/30 p-2.5 rounded-xl">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-red-600/20 disabled:opacity-60"
          >
            {submitting ? 'Creating account…' : 'Register & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
