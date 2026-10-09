'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Crown, Trophy, Hexagon } from 'lucide-react';
import { getLeaderboard, onLeaderboardChanged, type LeaderboardEntry } from '../lib/leaderboard';

// A rank title earned from the number of orders. Change the numbers freely.
function titleFor(orders: number): { label: string; color: string } {
  if (orders >= 20) return { label: 'LEGEND', color: 'text-amber-400' };
  if (orders >= 10) return { label: 'CHAMPION', color: 'text-red-400' };
  if (orders >= 5) return { label: 'PRO', color: 'text-sky-400' };
  return { label: 'PLAYER', color: 'text-zinc-400' };
}

const AVATAR_COLORS = [
  'from-amber-400 to-red-600',
  'from-zinc-400 to-zinc-700',
  'from-orange-500 to-red-900',
  'from-red-500 to-rose-900',
  'from-rose-500 to-zinc-800',
  'from-red-600 to-zinc-900',
];

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setLeaderboard(getLeaderboard());
    const unsubscribe = onLeaderboardChanged(() => setLeaderboard(getLeaderboard()));
    return unsubscribe;
  }, []);

  const rows = leaderboard.slice(0, 100);

  return (
    <main className="min-h-screen bg-zinc-950 px-4 pb-20 pt-28 text-white font-sans sm:pt-32">
      <div className="mx-auto max-w-5xl">
        {/* Hero */}
        <div className="relative mb-10 overflow-hidden rounded-3xl border border-zinc-800/60 bg-zinc-950/60 px-6 py-12 text-center shadow-2xl backdrop-blur-md">
          <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-red-600/20 blur-[100px]" />
          <h1 className="relative text-4xl font-black tracking-tight sm:text-5xl">
            Ranking <span className="text-red-500">Leaderboard</span>
          </h1>
          <p className="relative mx-auto mt-3 max-w-md text-sm text-zinc-400 sm:text-base">
            See who&apos;s at the top. Every order you make helps you climb the ranks!
          </p>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-3xl border border-zinc-800/60 bg-zinc-950/60 shadow-2xl backdrop-blur-md">
          <div className="px-6 pb-4 pt-6 sm:px-8">
            <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">Top 100 Clients</h2>
            <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
              Our most loyal customers. Updates in real time.
            </p>
          </div>

          <div className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-3 border-b border-zinc-800/80 px-4 py-3 text-xs font-bold text-zinc-500 sm:grid-cols-[5rem_1fr_9rem_6rem] sm:px-8">
            <span>Rank</span>
            <span>Player</span>
            <span className="hidden text-center sm:block">Title</span>
            <span className="text-right">Orders</span>
          </div>

          {rows.length === 0 ? (
            <p className="px-6 py-16 text-center text-sm text-zinc-500">
              No orders yet. Be the first on the board!
            </p>
          ) : (
            <ul>
              {rows.map((client, index) => {
                const rank = index + 1;
                const title = titleFor(client.orders);
                const rowTint =
                  rank === 1
                    ? 'bg-amber-500/[0.07]'
                    : rank === 2
                      ? 'bg-zinc-400/[0.05]'
                      : rank === 3
                        ? 'bg-orange-500/[0.06]'
                        : 'hover:bg-white/[0.03]';
                const rankColor =
                  rank === 1 ? 'text-amber-400' : rank === 2 ? 'text-zinc-300' : rank === 3 ? 'text-orange-400' : 'text-zinc-400';

                return (
                  <li
                    key={client.id}
                    className={`grid grid-cols-[3.5rem_1fr_auto] items-center gap-3 border-b border-zinc-800/60 px-4 py-3.5 transition-colors last:border-0 sm:grid-cols-[5rem_1fr_9rem_6rem] sm:px-8 ${rowTint}`}
                  >
                    <span className={`flex items-center gap-2 text-sm font-black ${rankColor}`}>
                      {rank === 1 ? (
                        <Crown className="h-4 w-4" />
                      ) : rank <= 3 ? (
                        <Trophy className="h-4 w-4" />
                      ) : (
                        <Trophy className="h-4 w-4 opacity-40" />
                      )}
                      {rank}
                    </span>

                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-black text-white ${
                          AVATAR_COLORS[index % AVATAR_COLORS.length]
                        }`}
                      >
                        {(client.username || '?').charAt(0).toUpperCase()}
                      </span>
                      <span className="truncate text-sm font-bold text-zinc-100">{client.username}</span>
                    </span>

                    <span className={`hidden items-center justify-center gap-1.5 text-xs font-extrabold tracking-wide sm:flex ${title.color}`}>
                      <Hexagon className="h-4 w-4" />
                      {title.label}
                    </span>

                    <span className="text-right font-mono text-xs font-bold text-red-400 sm:text-sm">
                      {client.orders} order{client.orders !== 1 ? 's' : ''}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-600/20 transition hover:bg-red-500 active:scale-95"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
