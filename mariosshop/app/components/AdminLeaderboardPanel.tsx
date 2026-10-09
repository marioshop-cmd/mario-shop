'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  adjustLeaderboard,
  deleteLeaderboardEntry,
  getLeaderboard,
  onLeaderboardChanged,
  titleForXp,
  xpFromTnd,
  XP_PER_TND,
  type LeaderboardEntry,
} from '../lib/leaderboard';

const KEY_STORAGE = 'paymentAdminKey'; // same key the Payment Methods page uses

export default function AdminLeaderboardPanel() {
  const [adminKey, setAdminKey] = useState('');
  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState('1');
  const [tnd, setTnd] = useState('');
  const [xp, setXp] = useState('0');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    try {
      setAdminKey(sessionStorage.getItem(KEY_STORAGE) || '');
    } catch {
      /* storage not available */
    }
  }, []);

  const handleKeyChange = (value: string) => {
    setAdminKey(value);
    try {
      sessionStorage.setItem(KEY_STORAGE, value);
    } catch {
      /* storage not available */
    }
  };

  const load = useCallback(async () => {
    setPlayers(await getLeaderboard(100, adminKey || undefined));
    setLoading(false);
  }, [adminKey]);

  useEffect(() => {
    load();
    return onLeaderboardChanged(load);
  }, [load]);

  const handleTndChange = (value: string) => {
    setTnd(value);
    const amount = parseFloat(value.replace(',', '.'));
    setXp(Number.isFinite(amount) && amount > 0 ? String(xpFromTnd(amount)) : '0');
  };

  const handleApply = async () => {
    setMessage('');
    if (!adminKey) return setMessage('⚠️ Enter the admin key first.');
    if (!email.trim()) return setMessage('⚠️ Enter a client email.');

    setBusy(true);
    const result = await adjustLeaderboard(adminKey, {
      email: email.trim(),
      addOrders: parseInt(orders, 10) || 0,
      addXp: parseInt(xp, 10) || 0,
    });
    setBusy(false);
    setMessage(result.message);

    if (result.success) {
      setEmail('');
      setOrders('1');
      setTnd('');
      setXp('0');
      load();
    }
  };

  const handleDelete = async (player: LeaderboardEntry) => {
    if (!player.email) return;
    if (!confirm(`Remove ${player.username} from the ranking?`)) return;
    const result = await deleteLeaderboardEntry(adminKey, player.email);
    setMessage(result.message);
    if (result.success) load();
  };

  const inputClass =
    'min-w-0 rounded-xl border border-white/[0.07] bg-black/20 p-3 text-xs outline-none focus:border-red-500/50';

  return (
    <section className="rounded-2xl border border-white/[0.06] bg-[#0d0d10] p-5 sm:max-w-3xl">
      <div>
        <h2 className="text-sm font-black">Leaderboard</h2>
        <p className="mt-1 text-[10px] text-zinc-600">
          Add orders and XP to a client&apos;s ranking. Rule: {XP_PER_TND} XP for every 1 TND spent.
        </p>
      </div>

      <input
        type="password"
        placeholder="Admin key (PAYMENT_ADMIN_KEY)"
        value={adminKey}
        onChange={(e) => handleKeyChange(e.target.value)}
        autoComplete="off"
        className={`mt-4 w-full ${inputClass}`}
      />

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <input
          type="email"
          placeholder="Client email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`col-span-2 sm:col-span-4 ${inputClass}`}
        />
        <label className="text-[10px] font-bold text-zinc-500">
          Orders to add
          <input
            type="number"
            value={orders}
            onChange={(e) => setOrders(e.target.value)}
            className={`mt-1 w-full ${inputClass}`}
          />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">
          Spent (TND)
          <input
            type="number"
            min="0"
            value={tnd}
            onChange={(e) => handleTndChange(e.target.value)}
            placeholder="optional"
            className={`mt-1 w-full ${inputClass}`}
          />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">
          XP to add
          <input
            type="number"
            value={xp}
            onChange={(e) => setXp(e.target.value)}
            className={`mt-1 w-full ${inputClass}`}
          />
        </label>
        <button
          type="button"
          onClick={handleApply}
          disabled={busy}
          className="self-end rounded-xl bg-red-600 px-5 py-3 text-xs font-black hover:bg-red-500 disabled:opacity-60"
        >
          {busy ? 'Saving…' : 'Apply'}
        </button>
      </div>
      <p className="mt-2 text-[10px] text-zinc-600">
        Tip: type the amount spent and the XP fills itself. Use negative numbers to remove orders or XP.
      </p>

      {message && <div className="mt-3 text-[11px] text-zinc-400">{message}</div>}

      <div className="mt-5 border-t border-white/[0.06] pt-4">
        <h3 className="mb-3 text-[11px] font-black uppercase tracking-wider text-zinc-500">Current ranking</h3>
        {loading ? (
          <p className="text-xs text-zinc-600">Loading…</p>
        ) : players.length === 0 ? (
          <p className="text-xs text-zinc-600">
            Nobody is on the board yet. Add the first client above.
          </p>
        ) : (
          <ul className="space-y-2">
            {players.map((player) => (
              <li
                key={`${player.id}-${player.username}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-black/20 px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="w-6 text-xs font-black text-zinc-500">{player.id}</span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-zinc-100">{player.username}</p>
                    <p className="truncate text-[10px] text-zinc-600">
                      {player.email || 'enter the admin key to see emails'}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <div className="text-right">
                    <p className="font-mono text-xs font-bold text-red-400">
                      {player.xp.toLocaleString('en-US')} XP
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {titleForXp(player.xp).label} · {player.orders} order{player.orders === 1 ? '' : 's'}
                    </p>
                  </div>
                  {player.email && (
                    <button
                      type="button"
                      onClick={() => handleDelete(player)}
                      className="rounded-lg border border-red-500/40 px-2.5 py-1 text-[10px] font-bold text-red-400 hover:bg-red-500/10"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
