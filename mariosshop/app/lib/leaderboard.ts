/**
 * Shared leaderboard data layer. The ranking now lives in Supabase (via
 * /api/leaderboard), so every visitor sees the same board on any device.
 * The old version kept it in each browser's localStorage, which meant only
 * the browser that wrote it could see it.
 */

export interface LeaderboardEntry {
  id: number; // position in the current ranking (1 = first)
  username: string;
  orders: number;
  xp: number;
  email?: string; // only filled in when the admin key is sent
}

export interface LeaderboardResult {
  success: boolean;
  message: string;
}

const CHANGED_EVENT = 'marios_leaderboard_changed';
const POLL_MS = 30000;

/** 10 XP for every 1 TND spent. Change this one number to change the rule. */
export const XP_PER_TND = 10;
export const xpFromTnd = (tnd: number): number => Math.round(Math.max(0, tnd) * XP_PER_TND);

// Rank titles by total XP, highest first. Edit freely.
const TITLES = [
  { min: 25000, label: 'LORD', color: 'text-amber-400' },
  { min: 10000, label: 'LEGEND', color: 'text-red-400' },
  { min: 5000, label: 'CHAMPION', color: 'text-fuchsia-400' },
  { min: 2000, label: 'PRO', color: 'text-sky-400' },
  { min: 500, label: 'PLAYER', color: 'text-emerald-400' },
  { min: 0, label: 'ROOKIE', color: 'text-zinc-400' },
];

export function titleForXp(xp: number): { label: string; color: string } {
  return TITLES.find((t) => xp >= t.min) ?? TITLES[TITLES.length - 1];
}

/** The ranking, best first. Pass the admin key to also get each player's email. */
export async function getLeaderboard(limit = 100, adminKey?: string): Promise<LeaderboardEntry[]> {
  try {
    const response = await fetch(`/api/leaderboard?limit=${limit}`, {
      cache: 'no-store',
      headers: adminKey ? { 'x-admin-key': adminKey } : undefined,
    });
    if (!response.ok) return [];
    const data: unknown = await response.json();
    return Array.isArray(data) ? (data as LeaderboardEntry[]) : [];
  } catch (error) {
    console.error('Unable to load leaderboard:', error);
    return [];
  }
}

async function postAdmin(adminKey: string, payload: Record<string, unknown>): Promise<LeaderboardResult> {
  try {
    const response = await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    const result: LeaderboardResult = {
      success: Boolean(data?.success),
      message: data?.message || (response.ok ? 'Done.' : 'Something went wrong.'),
    };
    if (result.success && typeof window !== 'undefined') {
      window.dispatchEvent(new Event(CHANGED_EVENT));
    }
    return result;
  } catch {
    return { success: false, message: '❌ Network error. Please try again.' };
  }
}

/** Admin: add (or remove, with negative numbers) orders and XP for a client. */
export function adjustLeaderboard(
  adminKey: string,
  params: { email: string; addOrders?: number; addXp?: number; username?: string },
): Promise<LeaderboardResult> {
  return postAdmin(adminKey, { action: 'adjust', ...params });
}

/** Admin: remove a client from the ranking. */
export function deleteLeaderboardEntry(adminKey: string, email: string): Promise<LeaderboardResult> {
  return postAdmin(adminKey, { action: 'delete', email });
}

/** Kept for older code: +1 order for this client. */
export function addOrderByEmail(email: string, adminKey: string): Promise<LeaderboardResult> {
  return adjustLeaderboard(adminKey, { email, addOrders: 1 });
}

/** Calls back when the ranking may have changed: right after an admin edit in
 * this tab, and every 30 seconds while the tab is visible. */
export function onLeaderboardChanged(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(CHANGED_EVENT, callback);
  const timer = window.setInterval(() => {
    if (!document.hidden) callback();
  }, POLL_MS);
  return () => {
    window.removeEventListener(CHANGED_EVENT, callback);
    window.clearInterval(timer);
  };
}