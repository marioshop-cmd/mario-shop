'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const referralCodeFromUrl = searchParams.get('ref');

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [password, setPassword] = useState('');
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
      setError('Please fill in all fields.');
      return;
    }

    if (isTunisia && !region) {
      setError('Please select your region.');
      return;
    }

    const existingUsers = JSON.parse(
      localStorage.getItem('mario_users') || '[]'
    );

    const userExists = existingUsers.some(
      (u: any) => u.email === cleanEmail
    );

    if (userExists) {
      setError('An account with this email already exists! Please Log In.');
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
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500 outline-none"
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
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500 outline-none"
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
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500 outline-none"
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
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500 outline-none"
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
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500 outline-none"
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
            className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-red-600/20"
          >
            Register & Continue
          </button>
        </form>
      </div>
    </div>
  );
}
