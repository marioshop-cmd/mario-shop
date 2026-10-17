'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../language/LanguageContext';
import { getNotificationsForEmail, onNotificationsChanged, type AppNotification } from '../lib/notifications';
import {
  PRESETS,
  STATUS_EVENT,
  getNotifStatus,
  isCategoryAllowed,
  loadPrefs,
  prefsForPreset,
  savePrefs,
  setNotifStatus,
  type NotifPreset,
  type NotifStatus,
} from '../lib/notificationPrefs';

const SEEN_KEY_PREFIX = 'seen-notifications-';
const LATER_KEY_PREFIX = 'notif-later-';
const TOAST_MS = 4000; // how long each mini pop-up stays
const FLASH_MS = 3000;
// Older notifications are never popped up on a device that hasn't seen them.
const MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000;

/** Unique key per "occurrence": a resend of the same notification counts as new. */
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

function markSeen(email: string, keys: string[]) {
  const seen = getSeenSet(email);
  keys.forEach((key) => seen.add(key));
  try {
    localStorage.setItem(SEEN_KEY_PREFIX + email, JSON.stringify(Array.from(seen)));
  } catch {
    /* ignore storage failures */
  }
}

export default function NotificationToast() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();

  const email = currentUser?.email?.toLowerCase() || '';

  const [status, setStatus] = useState<NotifStatus | 'loading'>('loading');
  const [promptOpen, setPromptOpen] = useState(false);
  const [step, setStep] = useState<'ask' | 'choose'>('ask');
  const [choice, setChoice] = useState<NotifPreset>('all');
  const [queue, setQueue] = useState<AppNotification[]>([]);
  const [flash, setFlash] = useState('');

  /* ---------- 1. read the saved answer and decide whether to ask ---------- */
  useEffect(() => {
    if (!email) {
      setStatus('loading');
      setPromptOpen(false);
      setQueue([]);
      return;
    }

    const read = () => setStatus(getNotifStatus(email));
    read();
    window.addEventListener(STATUS_EVENT, read);
    return () => window.removeEventListener(STATUS_EVENT, read);
  }, [email]);

  useEffect(() => {
    if (!email || status !== null) {
      setPromptOpen(false);
      return;
    }
    // "Later" only hides the question for this visit. A new visit asks again.
    let laterThisVisit = false;
    try {
      laterThisVisit = sessionStorage.getItem(LATER_KEY_PREFIX + email) === '1';
    } catch {
      /* storage not available */
    }
    if (laterThisVisit) return;

    const timer = setTimeout(() => {
      setStep('ask');
      setPromptOpen(true);
    }, 900);
    return () => clearTimeout(timer);
  }, [email, status]);

  /* ---------- 2. look for new notifications (only when switched on) ---------- */
  const checkForNew = useCallback(async () => {
    if (!email || status !== 'enabled') return;

    const prefs = loadPrefs();
    const seen = getSeenSet(email);
    const all = await getNotificationsForEmail(email);
    const now = Date.now();

    const toShow: AppNotification[] = [];
    const silentlySeen: string[] = [];

    for (const n of all) {
      const key = occurrenceKey(n);
      if (seen.has(key)) continue;

      const lastTime = n.resentAt.length ? n.resentAt[n.resentAt.length - 1] : n.createdAt;
      const tooOld = now - new Date(lastTime).getTime() > MAX_AGE_MS;

      if (tooOld || !isCategoryAllowed(prefs, n.category)) {
        silentlySeen.push(key); // not wanted: never pop up later by surprise
      } else {
        toShow.push(n);
      }
    }

    if (silentlySeen.length) markSeen(email, silentlySeen);

    if (toShow.length) {
      setQueue((prev) => {
        const prevKeys = new Set(prev.map(occurrenceKey));
        const toAdd = toShow.filter((n) => !prevKeys.has(occurrenceKey(n)));
        return toAdd.length ? [...prev, ...toAdd] : prev;
      });
    }
  }, [email, status]);

  useEffect(() => {
    if (!email || status !== 'enabled') return;
    checkForNew();
    return onNotificationsChanged(checkForNew); // right after a change + every 20s
  }, [email, status, checkForNew]);

  /* ---------- 3. mini pop-up goes away by itself ---------- */
  const dismiss = useCallback(
    (n: AppNotification) => {
      if (email) markSeen(email, [occurrenceKey(n)]);
      setQueue((prev) => prev.filter((item) => occurrenceKey(item) !== occurrenceKey(n)));
    },
    [email],
  );

  const current = queue[0];
  const currentKey = current ? occurrenceKey(current) : null;

  useEffect(() => {
    if (!current || promptOpen || flash) return;
    const timer = setTimeout(() => dismiss(current), TOAST_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKey, promptOpen, flash, dismiss]);

  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(''), FLASH_MS);
    return () => clearTimeout(timer);
  }, [flash]);

  /* ---------- actions ---------- */
  const handleLater = () => {
    try {
      sessionStorage.setItem(LATER_KEY_PREFIX + email, '1');
    } catch {
      /* storage not available */
    }
    setPromptOpen(false);
  };

  const handleConfirm = () => {
    savePrefs(prefsForPreset(choice));
    setNotifStatus(email, 'enabled');
    setStatus('enabled');
    setPromptOpen(false);
    setFlash(t('notifp_enabled_flash'));
  };

  const handleOpen = (n: AppNotification) => {
    dismiss(n);
    // Only product notifications (with brandId and productId) have a page to open.
    if (n.brandId && n.productId != null) {
      router.push(`/services?brandId=${encodeURIComponent(n.brandId)}&productId=${n.productId}`);
    }
  };

  if (!currentUser || typeof document === 'undefined') return null;
  if (pathname?.startsWith('/admin')) return null;

  /* ---------- the question: Enable or Later ---------- */
  if (promptOpen) {
    return createPortal(
      <div
        className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/60 p-4 pb-28 backdrop-blur-sm sm:items-center sm:pb-4"
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
      >
        <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-[notifUp_0.25s_ease-out]">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-500/40 bg-red-600/15">
            <Bell className="h-5 w-5 text-red-500" />
          </div>

          {step === 'ask' ? (
            <>
              <h2 className="text-lg font-black text-white">{t('notif_popup_title')}</h2>
              <p className="mt-1.5 text-sm text-zinc-400">
                {t('notif_popup_desc')}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleLater}
                  className="rounded-xl border border-zinc-700 py-3 text-sm font-bold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                >
                  {t('notif_popup_later')}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('choose')}
                  className="rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/25 transition hover:bg-red-500 active:scale-95"
                >
                  {t('notif_popup_enable')}
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-black text-white">{t('notifp_choose_title')}</h2>
              <p className="mt-1.5 text-sm text-zinc-400">{t('notifp_choose_sub')}</p>
              <div className="mt-4 space-y-2">
                {PRESETS.map((preset) => {
                  const active = choice === preset.value;
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setChoice(preset.value)}
                      aria-pressed={active}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
                        active
                          ? 'border-red-500/60 bg-red-500/10'
                          : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                      }`}
                    >
                      <span>
                        <span className="block text-sm font-bold text-white">{t(preset.labelKey)}</span>
                        <span className="block text-[11px] text-zinc-500">{t(preset.hintKey)}</span>
                      </span>
                      {active && <Check className="h-4 w-4 shrink-0 text-red-500" />}
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleLater}
                  className="rounded-xl border border-zinc-700 py-3 text-sm font-bold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                >
                  {t('notif_popup_later')}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/25 transition hover:bg-red-500 active:scale-95"
                >
                  {t('notifp_confirm')}
                </button>
              </div>
            </>
          )}
        </div>

        <style jsx global>{`
          @keyframes notifUp {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>,
      document.body,
    );
  }

  /* ---------- the mini pop-up ---------- */
  if (!flash && !current) return null;

  return createPortal(
    <div
      className="fixed left-4 right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] z-[9998] md:left-auto md:right-6 md:bottom-6 md:w-full md:max-w-md"
      role="status"
      aria-live="polite"
    >
      {flash ? (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-zinc-900/95 p-3 shadow-2xl backdrop-blur-sm sm:p-4 animate-[notifUp_0.25s_ease-out]">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10">
            <Check className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="min-w-0 flex-1 text-xs text-zinc-200">{flash}</p>
        </div>
      ) : (
        current && (
          <div
            onClick={() => handleOpen(current)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleOpen(current);
            }}
            className="relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/95 p-3 shadow-2xl backdrop-blur-sm transition hover:border-red-500/40 sm:p-4 animate-[notifUp_0.25s_ease-out]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-red-500/40 bg-red-600/15 sm:h-12 sm:w-12">
              <Bell className="h-5 w-5 text-red-500" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">{current.title}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-zinc-400">{current.message}</p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                dismiss(current);
              }}
              aria-label="Dismiss"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <span
              className="absolute bottom-0 left-0 h-0.5 bg-red-500"
              style={{ animation: `notifBar ${TOAST_MS}ms linear forwards` }}
            />
          </div>
        )
      )}

      {!flash && queue.length > 1 && (
        <p className="mt-1.5 text-center text-[11px] text-zinc-500">+{queue.length - 1} more</p>
      )}

      <style jsx global>{`
        @keyframes notifUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes notifBar {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>,
    document.body,
  );
}
