import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Shared homepage reviews ("people review" section). Previously these lived
 * in localStorage, which only ever showed a review to the browser that
 * wrote it and wiped it out on refresh/logout. This persists them in
 * Supabase instead — same pattern as lib/products.ts — so every visitor,
 * on every device, sees the same list.
 */

export interface HomeReview {
  id: number;
  user: string;
  item: string;
  rating: number;
  comment: string;
}

const REALTIME_TABLE = 'home_reviews';

async function readReviews(): Promise<HomeReview[]> {
  const response = await fetch('/api/home-reviews', { cache: 'no-store' });
  const parsed: unknown = await response.json();
  if (!response.ok) {
    const details =
      parsed && typeof parsed === 'object' && 'details' in parsed
        ? String((parsed as { details: unknown }).details)
        : 'Unknown server error';
    throw new Error(`Unable to load the shared reviews: ${details}`);
  }
  return Array.isArray(parsed) ? (parsed as HomeReview[]) : [];
}

async function writeReviews(reviews: HomeReview[]): Promise<boolean> {
  const response = await fetch('/api/home-reviews', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviews),
  });
  return response.ok;
}

export async function getHomeReviews(): Promise<HomeReview[]> {
  return readReviews();
}

/** Adds a new homepage review and persists it for everyone. Returns the
 * saved review on success, or null if the write failed. */
export async function addHomeReview(input: {
  user: string;
  item: string;
  rating: number;
  comment: string;
}): Promise<HomeReview | null> {
  const reviews = await readReviews();

  const newReview: HomeReview = {
    id: Date.now(),
    user: input.user.trim() || 'Anonymous',
    item: input.item.trim() || "Mario's Product",
    rating: Math.min(5, Math.max(1, Math.round(input.rating))),
    comment: input.comment.trim(),
  };

  const updated = [newReview, ...reviews];
  const saved = await writeReviews(updated);
  return saved ? newReview : null;
}

// Realtime updates — same shared-channel approach as lib/products.ts, so a
// review someone else just submitted shows up here without a page reload.
let realtimeClient: SupabaseClient | null = null;

function getRealtimeClient(): SupabaseClient | null {
  if (realtimeClient) return realtimeClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  realtimeClient = createClient(url, key);
  return realtimeClient;
}

const changeListeners = new Set<() => void>();
let sharedChannel: ReturnType<NonNullable<ReturnType<typeof getRealtimeClient>>['channel']> | null = null;
let sharedInterval: number | null = null;

function notifyAllListeners() {
  changeListeners.forEach((listener) => listener());
}

function ensureSharedSubscription() {
  const client = getRealtimeClient();
  if (!client) return;

  if (!sharedChannel) {
    sharedChannel = client
      .channel('home-reviews-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: REALTIME_TABLE },
        notifyAllListeners,
      )
      .subscribe();
  }

  if (sharedInterval === null) {
    // Fallback for deployments where Realtime hasn't been enabled for this
    // table yet.
    sharedInterval = window.setInterval(notifyAllListeners, 30000);
  }
}

export function onHomeReviewsChanged(callback: () => void): () => void {
  changeListeners.add(callback);
  ensureSharedSubscription();

  return () => {
    changeListeners.delete(callback);
    if (changeListeners.size === 0) {
      if (sharedInterval !== null) {
        window.clearInterval(sharedInterval);
        sharedInterval = null;
      }
      if (sharedChannel) {
        const client = getRealtimeClient();
        void client?.removeChannel(sharedChannel);
        sharedChannel = null;
      }
    }
  };
}
