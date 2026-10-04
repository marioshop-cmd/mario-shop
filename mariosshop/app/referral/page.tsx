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
    <main className="min-h-screen bg-zinc-950 px-4 pb-16 pt-28 text-white font-sans sm:pt-32">
      {/* Same panel style as the "Reviews from people who bought" box on the home page */}
      <section className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800/60 bg-zinc-950/60 p-8 shadow-2xl backdrop-blur-md md:p-10">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800 text-3xl shadow-sm">
              🎁
            </div>

            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
              Coming Soon
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              Referral Program
            </h1>
            <p className="mt-2 max-w-md text-xs text-zinc-500 md:text-sm">
              Invite your friends, earn B9CHICH, and get rewarded every time they shop.
              We&apos;re putting the finishing touches on it — check back soon.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <div
                key={step.label}
                className="flex flex-col rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5 backdrop-blur-sm transition duration-300 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-lg shadow-sm">
                    {step.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-bold text-zinc-100">{step.label}</h4>
                    <p className="text-xs text-zinc-400">Step {index + 1}</p>
                  </div>
                </div>
                <p className="text-xs font-medium italic text-zinc-300">{step.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-red-600/20 transition duration-200 hover:bg-red-500 active:scale-95 md:text-sm"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
