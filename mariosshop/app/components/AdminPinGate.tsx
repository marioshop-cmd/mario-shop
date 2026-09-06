'use client';

import React, { useState } from 'react';
import { Lock } from 'lucide-react';

// Change this to whatever PIN you want. It's a plain constant since this
// app has no real backend — anyone with access to the source code could
// find it, but it stops casual/accidental access to the dashboard, which
// is the goal here.
const ADMIN_PIN = '259195';

/**
 * Wraps admin page content behind a numeric PIN screen. Asked fresh on
 * every visit (no "remember me") since that's what was asked for —
 * doesn't persist to localStorage/sessionStorage at all.
 *
 * Usage: wrap your existing admin page content with this, AFTER your
 * existing isAdmin check already passed:
 *
 *   if (!currentUser || !currentUser.isAdmin) return <LoadingOrRedirect />;
 *   return (
 *     <AdminPinGate>
 *       ...your actual admin page JSX...
 *     </AdminPinGate>
 *   );
 */
export default function AdminPinGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handleDigit = (d: string) => {
    if (pin.length >= 6) return;
    const next = pin + d;
    setPin(next);
    setError('');

    // Auto-check once they've typed the same length as the real PIN.
    if (next.length === ADMIN_PIN.length) {
      if (next === ADMIN_PIN) {
        setUnlocked(true);
      } else {
        setError('Incorrect PIN.');
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setPin('');
        }, 400);
      }
    }
  };

  const handleBackspace = () => {
    setPin((p) => p.slice(0, -1));
    setError('');
  };

  if (unlocked) return <>{children}</>;

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4">
      <div className={`w-full max-w-xs text-center ${shake ? 'animate-[shakeX_0.4s_ease-in-out]' : ''}`}>
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-600/15 border border-red-500/40 flex items-center justify-center">
          <Lock className="w-7 h-7 text-red-500" />
        </div>
        <h1 className="text-xl font-black text-white mb-1">Admin Access</h1>
        <p className="text-xs text-zinc-500 mb-8">Enter your PIN to continue.</p>

        {/* PIN dots */}
        <div className="flex items-center justify-center gap-3 mb-3">
          {Array.from({ length: ADMIN_PIN.length }).map((_, i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full border-2 transition ${
                i < pin.length ? 'bg-red-500 border-red-500' : 'border-zinc-700'
              }`}
            />
          ))}
        </div>

        {error && <p className="text-xs text-red-500 font-bold mb-4">{error}</p>}
        {!error && <div className="mb-4 h-4" />}

        {/* Numeric keypad */}
        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="py-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-red-500/50 text-lg font-bold text-white transition active:scale-95"
            >
              {d}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleDigit('0')}
            className="py-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-red-500/50 text-lg font-bold text-white transition active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="py-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-red-500/50 text-sm font-bold text-zinc-400 transition active:scale-95"
          >
            ⌫
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shakeX {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </main>
  );
}
