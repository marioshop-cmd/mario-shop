'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Bell, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getNotificationsForEmail, onNotificationsChanged, type AppNotification } from '../lib/notifications';

const SEEN_KEY_PREFIX = 'seen-notifications-';
const POLL_MS = 4000; // also poll, since localStorage 'storage' events don't fire in the same tab

/** Unique key per "occurrence" — a resend of the same notification counts as new. */
function occurrenceKey(n: AppNotification): string {
  const lastTime = n.resentAt.length ? n.resentAt[n.resentAt.length - 1] : n.createdAt;
  return `${n.id}::${lastTime}`;
}

function getSeenSet(email: string): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY_PREFIX + email);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function markSeen(email: string, key: string) {
  const seen = getSeenSet(email);
  seen.add(key);
  try {
    localStorage.setItem(SEEN_KEY_PREFIX + email, JSON.stringify(Array.from(seen)));
  } catch {
    // ignore storage failures
  }
}

export default function NotificationToast() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [queue, setQueue] = useState<AppNotification[]>([]);

  const checkForNew = useCallback(() => {
    if (!currentUser?.email) return;
    const email = currentUser.email.toLowerCase();
    const seen = getSeenSet(email);
    const all = getNotificationsForEmail(email);
    const unseen = all.filter((n) => !seen.has(occurrenceKey(n)));

    if (unseen.length === 0) return;
    setQueue((prev) => {
      const prevKeys = new Set(prev.map(occurrenceKey));
      const toAdd = unseen.filter((n) => !prevKeys.has(occurrenceKey(n)));
      return toAdd.length ? [...prev, ...toAdd] : prev;
    });
  }, [currentUser?.email]);

  useEffect(() => {
    if (!currentUser?.email) return;
    checkForNew();

    const unsubscribe = onNotificationsChanged(checkForNew);
    const interval = setInterval(checkForNew, POLL_MS);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [currentUser?.email, checkForNew]);

  const dismiss = (n: AppNotification) => {
    if (currentUser?.email) {
      markSeen(currentUser.email.toLowerCase(), occurrenceKey(n));
    }
    setQueue((prev) => prev.filter((item) => occurrenceKey(item) !== occurrenceKey(n)));
  };

  const handleClick = (n: AppNotification) => {
    dismiss(n);
    // Only product-related notifications (with both brandId and productId)
    // have somewhere specific to jump to — others just get dismissed.
    if (n.brandId && n.productId != null) {
      router.push(`/services?brandId=${encodeURIComponent(n.brandId)}&productId=${n.productId}`);
    }
  };

  if (!currentUser || typeof document === 'undefined' || queue.length === 0) return null;

  const current = queue[0];

  return createPortal(
    <div
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-[9998] sm:w-full sm:max-w-md"
      role="status"
      aria-live="polite"
    >
      <div
        onClick={() => handleClick(current)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleClick(current);
        }}
        className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/95 backdrop-blur-sm shadow-2xl p-3 sm:p-4 animate-[slideUp_0.25s_ease-out] cursor-pointer hover:border-red-500/40 transition"
      >
        <div className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-full bg-red-600/15 border border-red-500/40 flex items-center justify-center">
          <Bell className="w-5 h-5 text-red-500" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white truncate">{current.title}</p>
          <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{current.message}</p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            dismiss(current);
          }}
          aria-label="Dismiss"
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {queue.length > 1 && (
        <p className="text-center text-[11px] text-zinc-500 mt-1.5">+{queue.length - 1} more</p>
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
}
