'use client';

import Link from 'next/link';

export default function ReferralPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 px-4 pt-28 text-white sm:px-6 sm:pt-32 lg:px-8">
      {/* Ambient glow accents */}
      <div className="pointer-events-none absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-red-600/20 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-amber-500/10 blur-[100px]" />

      <div className="relative mx-auto flex max-w-2xl flex-col items-center py-16 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-red-500/30 bg-red-500/10 text-4xl shadow-[0_0_40px_rgba(239,68,68,0.15)]">
          🎁
        </div>

        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-red-400">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          Coming Soon
        </span>

        <h1 className="mb-4 text-4xl font-black tracking-tight sm:text-5xl">
          Referral Program
        </h1>

        <p className="mb-10 max-w-md text-sm leading-relaxed text-zinc-400">
          Invite your friends, earn B9CHICH, and get rewarded every time they shop.
          We're putting the finishing touches on it — check back soon.
        </p>

        <div className="grid w-full gap-3 sm:grid-cols-3">
          {[
            { icon: '🔗', label: 'Share your link' },
            { icon: '🛍️', label: 'Friend shops' },
            { icon: '💰', label: 'You both earn' },
          ].map((step) => (
            <div
              key={step.label}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-5 text-center opacity-60"
            >
              <div className="mb-2 text-2xl">{step.icon}</div>
              <p className="text-xs font-bold text-zinc-300">{step.label}</p>
            </div>
          ))}
        </div>

        <Link
          href="/"
          className="mt-12 inline-flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-3 text-xs font-bold text-zinc-300 transition hover:border-red-500/50 hover:text-red-400"
        >
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}
