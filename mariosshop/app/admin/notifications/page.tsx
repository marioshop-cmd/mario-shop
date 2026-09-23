'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import AdminPinGate from '../../components/AdminPinGate';
import {
  createNotification,
  getAllNotifications,
  onNotificationsChanged,
  resendNotification,
  type AppNotification,
  type NotificationCategory,
} from '../../lib/notifications';

const CATEGORIES: { value: NotificationCategory; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'orderUpdate', label: 'Order Update' },
  { value: 'promotion', label: 'Promotion' },
  { value: 'newProduct', label: 'New Product' },
];

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

interface ClientOption {
  email: string;
  username: string;
}

function AdminNotificationsInner() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!currentUser) {
        router.replace('/login');
      } else if (!currentUser.isAdmin) {
        router.replace('/');
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [currentUser, router]);

  // Prefilled when arriving from a product's "🔔 Notify" button.
  const productId = searchParams.get('productId');
  const productName = searchParams.get('productName');
  const brandId = searchParams.get('brandId');

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState<'all' | 'specific'>('all');
  const [category, setCategory] = useState<NotificationCategory>('general');
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (productName) {
      setTitle(`${productName} — Update!`);
      setMessage(`Check out ${productName} — there's a new update on it. Take a look!`);
      setCategory('newProduct');
    }
  }, [productName]);

  const refreshNotifications = () => setNotifications(getAllNotifications());

  useEffect(() => {
    refreshNotifications();
    const unsubscribe = onNotificationsChanged(refreshNotifications);
    return unsubscribe;
  }, []);

  useEffect(() => {
    try {
      const rawUsers = JSON.parse(localStorage.getItem('mario_users') || '[]');
      setClients(
        rawUsers
          .filter((u: any) => u.email)
          .map((u: any) => ({ email: u.email, username: u.username || u.email }))
      );
    } catch {
      setClients([]);
    }
  }, []);

  const toggleEmail = (email: string) => {
    setSelectedEmails((prev) => (prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]));
  };

  const handleSend = () => {
    if (!title.trim() || !message.trim()) {
      setFeedback({ type: 'error', text: 'Add a title and message first.' });
      return;
    }
    if (audience === 'specific' && selectedEmails.length === 0) {
      setFeedback({ type: 'error', text: 'Pick at least one client, or switch to All Clients.' });
      return;
    }

    const result = createNotification({
      title: title.trim(),
      message: message.trim(),
      recipients: audience === 'all' ? 'all' : selectedEmails,
      category,
      productId: productId ? Number(productId) : undefined,
      productName: productName || undefined,
      brandId: brandId || undefined,
    });

    if (result) {
      setFeedback({ type: 'success', text: 'Notification sent.' });
      setTitle('');
      setMessage('');
      setSelectedEmails([]);
      setAudience('all');
      setCategory('general');
      refreshNotifications();
    } else {
      setFeedback({ type: 'error', text: 'Something went wrong sending that.' });
    }
  };

  const handleResend = (id: string) => {
    if (resendNotification(id)) refreshNotifications();
  };

  const recipientLabel = (n: AppNotification) => {
    if (n.recipients === 'all') return 'All Clients';
    const count = n.recipients.length;
    return `${count} client${count === 1 ? '' : 's'}`;
  };

  if (!currentUser || !currentUser.isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-xs text-zinc-500">
        Loading…
      </main>
    );
  }

  const totalSent = notifications.length;
  const totalResends = notifications.reduce((sum, n) => sum + n.resentAt.length, 0);
  const allAudience = notifications.filter((n) => n.recipients === 'all').length;

  return (
    <AdminPinGate>
      <main className="min-h-screen bg-[#09090b] px-3 py-5 text-white sm:px-5 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-7xl space-y-5">
          {/* Header */}
          <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 shadow-xl sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-lg ring-1 ring-red-500/20">🔔</span>
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-red-400">Admin Center</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Notifications</h1>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-400">
                Create client updates, target specific users, and keep a complete resend history.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:min-w-[360px]">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Sent</p>
                <p className="mt-1 text-lg font-black">{totalSent}</p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Resends</p>
                <p className="mt-1 text-lg font-black">{totalResends}</p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">All Clients</p>
                <p className="mt-1 text-lg font-black">{allAudience}</p>
              </div>
            </div>
          </div>

          {productName && (
            <div className="flex items-center gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-xs font-bold text-amber-300">
              <span>✨</span>
              <span>Prefilled notification for <strong>{productName}</strong></span>
            </div>
          )}

          {feedback && (
            <div className={`rounded-xl border px-4 py-3 text-xs font-bold ${
              feedback.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : 'border-red-500/30 bg-red-500/10 text-red-400'
            }`}>
              {feedback.type === 'success' ? '✓' : '⚠'} {feedback.text}
            </div>
          )}

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
            {/* Composer */}
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/45 shadow-xl">
              <div className="border-b border-zinc-800 px-4 py-4 sm:px-5">
                <h2 className="text-sm font-black">Create Notification</h2>
                <p className="mt-1 text-[11px] text-zinc-500">Write the message your clients will receive.</p>
              </div>

              <div className="space-y-5 p-4 sm:p-5">
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-400">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="New discount on Steam Gift Cards!"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-400">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    placeholder="Tell clients what's new…"
                    className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-400">Category</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setCategory(c.value)}
                        className={`rounded-xl border px-3 py-2.5 text-[11px] font-black transition ${
                          category === c.value
                            ? 'border-red-500/70 bg-red-600 text-white shadow-lg shadow-red-950/30'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[10px] leading-4 text-zinc-600">
                    Category is for organizing notifications. It does not override the client's own notification preferences.
                  </p>
                </div>

                <button
                  onClick={handleSend}
                  className="w-full rounded-xl bg-gradient-to-r from-red-600 to-red-500 py-3.5 text-xs font-black uppercase tracking-[0.12em] text-white shadow-lg shadow-red-950/30 transition hover:from-red-500 hover:to-red-400 active:scale-[0.99]"
                >
                  Send Notification 🚀
                </button>
              </div>
            </section>

            {/* Audience */}
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/45 shadow-xl">
              <div className="border-b border-zinc-800 px-4 py-4 sm:px-5">
                <h2 className="text-sm font-black">Audience</h2>
                <p className="mt-1 text-[11px] text-zinc-500">Choose who receives this notification.</p>
              </div>

              <div className="p-4 sm:p-5">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setAudience('all')}
                    className={`rounded-xl border p-3 text-left transition ${
                      audience === 'all'
                        ? 'border-red-500/60 bg-red-500/10'
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-base">👥</div>
                    <p className={`mt-2 text-xs font-black ${audience === 'all' ? 'text-red-400' : 'text-zinc-300'}`}>All Clients</p>
                    <p className="mt-1 text-[10px] text-zinc-600">Send to everyone</p>
                  </button>
                  <button
                    onClick={() => setAudience('specific')}
                    className={`rounded-xl border p-3 text-left transition ${
                      audience === 'specific'
                        ? 'border-red-500/60 bg-red-500/10'
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-base">🎯</div>
                    <p className={`mt-2 text-xs font-black ${audience === 'specific' ? 'text-red-400' : 'text-zinc-300'}`}>Specific</p>
                    <p className="mt-1 text-[10px] text-zinc-600">{selectedEmails.length} selected</p>
                  </button>
                </div>

                {audience === 'specific' && (
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Clients</p>
                      <p className="text-[10px] font-bold text-red-400">{selectedEmails.length} selected</p>
                    </div>
                    <div className="max-h-[360px] overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950">
                      {clients.length === 0 ? (
                        <p className="p-5 text-center text-xs text-zinc-600">No registered clients yet.</p>
                      ) : (
                        clients.map((c) => (
                          <label key={c.email} className="flex cursor-pointer items-center gap-3 border-b border-zinc-900 p-3 last:border-0 hover:bg-zinc-900/70">
                            <input
                              type="checkbox"
                              checked={selectedEmails.includes(c.email)}
                              onChange={() => toggleEmail(c.email)}
                              className="h-4 w-4 accent-red-600"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-zinc-200">{c.username}</p>
                              <p className="truncate text-[10px] text-zinc-600">{c.email}</p>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {audience === 'all' && (
                  <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Delivery</p>
                    <p className="mt-2 text-xs font-bold text-zinc-200">All registered clients</p>
                    <p className="mt-1 text-[10px] text-zinc-600">The notification will be stored for every client as an all-client update.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* History */}
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/45 shadow-xl">
            <div className="flex flex-col gap-2 border-b border-zinc-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div>
                <h2 className="text-sm font-black">Notification History</h2>
                <p className="mt-1 text-[11px] text-zinc-500">{notifications.length} total notifications · resend any message anytime.</p>
              </div>
              <span className="w-fit rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-[10px] font-bold text-zinc-500">
                LIVE
              </span>
            </div>

            <div className="p-3 sm:p-5">
              {notifications.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/70 p-10 text-center">
                  <div className="text-2xl">🔕</div>
                  <p className="mt-2 text-xs font-bold text-zinc-500">Nothing sent yet.</p>
                  <p className="mt-1 text-[10px] text-zinc-700">Your sent notifications will appear here.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div key={n.id} className="group rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 transition hover:border-zinc-700 sm:p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="mb-1.5 flex flex-wrap items-center gap-2">
                            <span className="rounded-md border border-red-900/50 bg-red-950/40 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-red-400">
                              {CATEGORIES.find((c) => c.value === n.category)?.label || 'General'}
                            </span>
                            <span className="text-[10px] text-zinc-700">•</span>
                            <span className="text-[10px] font-bold text-zinc-600">{recipientLabel(n)}</span>
                          </div>
                          <p className="text-sm font-black text-white">{n.title}</p>
                          <p className="mt-1 text-xs leading-5 text-zinc-400">{n.message}</p>
                          <p className="mt-2 text-[10px] text-zinc-600">
                            Sent {formatTime(n.createdAt)}
                            {n.resentAt.length > 0 &&
                              ` · resent ${n.resentAt.length}x · last ${formatTime(n.resentAt[n.resentAt.length - 1])}`}
                          </p>
                        </div>
                        <button
                          onClick={() => handleResend(n.id)}
                          className="w-full shrink-0 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-zinc-400 transition hover:border-red-500/50 hover:text-red-400 sm:w-auto"
                        >
                          🔁 Resend
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </AdminPinGate>
  );

}

// Next.js requires any component using useSearchParams to be wrapped in a
// Suspense boundary — without this, the route can throw a build/render
// error instead of a plain 404, which can look like the page is broken.
export default function AdminNotificationsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-xs text-zinc-500">
          Loading…
        </main>
      }
    >
      <AdminNotificationsInner />
    </Suspense>
  );
}