'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  clearHomeReviews,
  deleteHomeReview,
  getHomeReviews,
  onHomeReviewsChanged,
  type HomeReview,
} from '../lib/homeReviews';

const KEY_STORAGE = 'paymentAdminKey'; // same key as the other admin tools

export default function AdminReviewsPanel() {
  const [adminKey, setAdminKey] = useState('');
  const [reviews, setReviews] = useState<HomeReview[]>([]);
  const [loading, setLoading] = useState(true);
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

  const load = useCallback(() => {
    getHomeReviews()
      .then(setReviews)
      .catch((error: unknown) => console.error('Unable to load reviews:', error))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    return onHomeReviewsChanged(load);
  }, [load]);

  const handleDelete = async (review: HomeReview) => {
    setMessage('');
    if (!adminKey) return setMessage('⚠️ Enter the admin key first.');
    if (!confirm(`Delete the review from ${review.user}?`)) return;
    const result = await deleteHomeReview(adminKey, review.id);
    setMessage(result.success ? '✅ Review deleted.' : `❌ ${result.message}`);
    if (result.success) load();
  };

  const handleClearAll = async () => {
    setMessage('');
    if (!adminKey) return setMessage('⚠️ Enter the admin key first.');
    if (!confirm('Delete ALL reviews from the home page?')) return;
    if (!confirm('Are you sure? This cannot be undone.')) return;
    const result = await clearHomeReviews(adminKey);
    setMessage(result.success ? '🗑️ All reviews were cleared.' : `❌ ${result.message}`);
    if (result.success) load();
  };

  return (
    <section className="rounded-2xl border border-white/[0.06] bg-[#0d0d10] p-5 sm:max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-black">Home page reviews</h2>
          <p className="mt-1 text-[10px] text-zinc-600">
            The &quot;Reviews from people who bought&quot; box. Delete one, or clear them all.
          </p>
        </div>
        {reviews.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="rounded-lg border border-red-500/40 px-3 py-1.5 text-[10px] font-bold text-red-400 hover:bg-red-500/10"
          >
            Clear all reviews
          </button>
        )}
      </div>

      <input
        type="password"
        placeholder="Admin key (PAYMENT_ADMIN_KEY)"
        value={adminKey}
        onChange={(e) => handleKeyChange(e.target.value)}
        autoComplete="off"
        className="mt-4 w-full min-w-0 rounded-xl border border-white/[0.07] bg-black/20 p-3 text-xs outline-none focus:border-red-500/50"
      />

      {message && <div className="mt-3 text-[11px] text-zinc-400">{message}</div>}

      <div className="mt-4">
        {loading ? (
          <p className="text-xs text-zinc-600">Loading…</p>
        ) : reviews.length === 0 ? (
          <p className="text-xs text-zinc-600">There are no reviews on the home page.</p>
        ) : (
          <ul className="space-y-2">
            {reviews.map((review) => (
              <li
                key={review.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-white/[0.05] bg-black/20 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-zinc-100">
                    {review.user} <span className="font-medium text-zinc-600">· {review.item}</span>
                  </p>
                  <p className="text-[11px] text-amber-400">
                    {'★'.repeat(review.rating)}
                    <span className="text-zinc-700">{'★'.repeat(5 - review.rating)}</span>
                  </p>
                  <p className="mt-1 break-words text-[11px] italic text-zinc-400">&quot;{review.comment}&quot;</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(review)}
                  className="shrink-0 rounded-lg border border-red-500/40 px-2.5 py-1 text-[10px] font-bold text-red-400 hover:bg-red-500/10"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
