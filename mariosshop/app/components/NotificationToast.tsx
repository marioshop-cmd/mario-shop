'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type NotifPreset = 'all' | 'products' | 'orders';
type NotifStatus = 'enabled' | 'disabled' | null;
type NotificationCategory = 'promo' | 'product' | 'order' | 'general' | string;

type AppNotification = {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  createdAt: string;
  resentAt: string[];
  brandId?: string;
  productId?: number | string | null;
};

const STATUS_EVENT = 'notif-status-changed';
const PRESETS: { value: NotifPreset; label: string; hint: string }[] = [
  { value: 'all', label: 'Everything', hint: 'Deals, products and order updates' },
  { value: 'products', label: 'Products only', hint: 'New arrivals and store updates' },
  { value: 'orders', label: 'Orders only', hint: 'Shipping and order status updates' },
];

const SEEN_KEY_PREFIX = 'seen-notifications-';
const LATER_KEY_PREFIX = 'notif-later-';
const TOAST_MS = 4000; // how long each mini pop-up stays
const FLASH_MS = 3000;
// Older notifications are never popped up on a device that hasn't seen them.
const MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000;

function loadPrefs(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem('notif-prefs');
    if (!raw) return { promo: true, product: true, order: true };
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed ? parsed : { promo: true, product: true, order: true };
  } catch {
    return { promo: true, product: true, order: true };
  }
}

function savePrefs(prefs: Record<string, boolean>) {
  try {
    localStorage.setItem('notif-prefs', JSON.stringify(prefs));
  } catch {
    /* ignore storage failures */
  }
}

function prefsForPreset(preset: NotifPreset): Record<string, boolean> {
  switch (preset) {
    case 'all':
      return { promo: true, product: true, order: true };
    case 'products':
      return { promo: true, product: true, order: false };
    case 'orders':
      return { promo: false, product: false, order: true };
    default:
      return { promo: true, product: true, order: true };
  }
}

function isCategoryAllowed(prefs: Record<string, boolean>, category: string): boolean {
  const key = String(category).toLowerCase();
  if (key.includes('order')) return prefs.order ?? true;
  if (key.includes('product') || key.includes('promo')) return prefs.product ?? prefs.promo ?? true;
  return prefs.general ?? true;
}

function getNotifStatus(email: string): NotifStatus {
  try {
    const raw = localStorage.getItem(`notif-status-${email}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed === 'enabled' || parsed === 'disabled' ? parsed : null;
  } catch {
    return null;
  }
}

function setNotifStatus(email: string, status: NotifStatus) {
  try {
    localStorage.setItem(`notif-status-${email}`, JSON.stringify(status));
  } catch {
    /* ignore storage failures */
  }
  window.dispatchEvent(new CustomEvent(STATUS_EVENT));
}

async function getNotificationsForEmail(_email: string): Promise<AppNotification[]> {
  return [];
}

function onNotificationsChanged(callback: () => void) {
  const id = setInterval(callback, 20000);
  return () => clearInterval(id);
}

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
    setFlash('Notifications are on. You will get a short pop-up when something new arrives.');
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
              <h2 className="text-lg font-black text-white">Turn on notifications?</h2>
              <p className="mt-1.5 text-sm text-zinc-400">
                Get a quick pop-up for discounts, new products and order updates while you browse the shop.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleLater}
                  className="rounded-xl border border-zinc-700 py-3 text-sm font-bold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                >
                  Later
                </button>
                <button
                  type="button"
                  onClick={() => setStep('choose')}
                  className="rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/25 transition hover:bg-red-500 active:scale-95"
                >
                  Enable
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-black text-white">What do you want to hear about?</h2>
              <p className="mt-1.5 text-sm text-zinc-400">You can change this any time in your account.</p>
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
                        <span className="block text-sm font-bold text-white">{preset.label}</span>
                        <span className="block text-[11px] text-zinc-500">{preset.hint}</span>
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
                  Later
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/25 transition hover:bg-red-500 active:scale-95"
                >
                  Confirm
                </button>
              </div>
            </>
          )}
        </div>

        <style>{`
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

      <style>{`
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
