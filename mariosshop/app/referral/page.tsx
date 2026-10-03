'use client';

import Link from 'next/link';

const STEPS = [
  {
    icon: '🔗',
    label: 'Share your link',
    text: 'Copy your personal referral link and send it to your friends.',
  },
  {
    icon: '🛍️',
    label: 'Friend shops',
    text: 'Your friend signs up with your link and makes a purchase.',
  },
  {
    icon: '💰',
    label: 'You both earn',
    text: 'You both get rewarded in B9CHICH.',
  },
];

export default function ReferralPage() {
  return (
    <main className="min-h-screen px-4 pb-16 pt-28 text-white sm:px-6 sm:pt-32 lg:px-8">
      {/* Frosted glass panel: see-through with a strong blur, so the space
          background shows softly behind it instead of a flat grey box. */}
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/25 bg-white/10 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10">
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/30 bg-white/15 text-4xl backdrop-blur-md">
            🎁
          </div>

          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white backdrop-blur-md">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
            Coming Soon
          </span>

          <h1 className="mb-4 text-4xl font-black tracking-tight text-white drop-shadow sm:text-5xl">
            Referral Program
          </h1>

          <p className="mb-10 max-w-md text-sm leading-relaxed text-white/90 sm:text-base">
            Invite your friends, earn B9CHICH, and get rewarded every time they shop.
            We&apos;re putting the finishing touches on it — check back soon.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <div
              key={step.label}
              className="rounded-2xl border border-white/25 bg-white/10 px-4 py-6 text-center backdrop-blur-md"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/25 bg-white/15 text-2xl">
                {step.icon}
              </div>
              <p className="mb-1 text-[11px] font-black uppercase tracking-widest text-red-400">
                Step {index + 1}
              </p>
              <p className="mb-2 text-sm font-extrabold text-white">{step.label}</p>
              <p className="text-xs leading-relaxed text-white/80">{step.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-red-400/40 bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-500 active:scale-95"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
