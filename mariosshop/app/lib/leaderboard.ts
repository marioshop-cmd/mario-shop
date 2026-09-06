/**
 * Shared "Top 10 Clients" leaderboard data layer. The homepage reads this
 * to render the leaderboard; the admin dashboard writes to it via
 * addOrderByEmail so a manual "+1 Order" always lands on the same data
 * the storefront shows, instead of two disconnected copies drifting apart.
 */

export interface LeaderboardEntry {
  id: number;
  username: string;
  email?: string;
  orders: number;
}

const STORAGE_KEY = 'marios_shop_leaderboard';

// Same starting data the homepage used to hardcode — kept here as the
// fallback for a first-ever visit before any real data exists.
const SEED: LeaderboardEntry[] = [];

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return SEED;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return SEED;
    return parsed;
  } catch {
    return SEED;
  }
}

function writeLeaderboard(list: LeaderboardEntry[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

function findUsernameForEmail(email: string): string {
  try {
    const users = JSON.parse(window.localStorage.getItem('mario_users') || '[]');
    const match = users.find((u: any) => (u.email || '').toLowerCase() === email.toLowerCase());
    return match?.username || email;
  } catch {
    return email;
  }
}

/** Adds +1 order for the client with this email. Matches an existing row
 * by stored email first, falling back to username (for older rows seeded
 * before emails were tracked) — or creates a new row starting at 1 order
 * if this client isn't on the board yet. Always re-sorts by order count. */
export function addOrderByEmail(email: string): { success: boolean; message: string } {
  const clean = email.trim().toLowerCase();
  if (!clean) return { success: false, message: '⚠️ Enter a client email.' };

  const username = findUsernameForEmail(clean);
  const list = getLeaderboard();

  const idx = list.findIndex(
    (e) => (e.email && e.email.toLowerCase() === clean) || e.username.toLowerCase() === username.toLowerCase()
  );

  let updated: LeaderboardEntry[];
  let newOrders: number;

  if (idx !== -1) {
    newOrders = list[idx].orders + 1;
    updated = list.map((e, i) => (i === idx ? { ...e, orders: newOrders, email: clean } : e));
  } else {
    newOrders = 1;
    const nextId = list.length > 0 ? Math.max(...list.map((e) => e.id)) + 1 : 1;
    updated = [...list, { id: nextId, username, email: clean, orders: newOrders }];
  }

  const sorted = updated.sort((a, b) => b.orders - a.orders);
  return writeLeaderboard(sorted)
    ? { success: true, message: `✅ +1 order for ${username} — now at ${newOrders} order${newOrders === 1 ? '' : 's'}.` }
    : { success: false, message: '❌ Failed to save — try again.' };
}

export function onLeaderboardChanged(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}