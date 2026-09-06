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

  return (
    <AdminPinGate>
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight">🔔 Client Notifications</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Send an update to every client or hand-pick who hears about it. Resend anytime.
          </p>
        </div>

        {/* COMPOSER */}
        <section className="rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 space-y-4">
          {productName && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-semibold text-amber-300">
              Prefilled for product: {productName}
            </div>
          )}

          {feedback && (
            <div
              className={`rounded-xl border p-3 text-xs font-semibold ${
                feedback.type === 'success'
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                  : 'border-red-500/40 bg-red-500/10 text-red-400'
              }`}
            >
              {feedback.text}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="New discount on Steam Gift Cards!"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 text-sm text-white rounded-xl p-3 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Tell clients what's new…"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 text-sm text-white rounded-xl p-3 outline-none transition resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                    category === c.value
                      ? 'bg-red-600 border-red-500 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-zinc-600 mt-2">
              Labels this notification for your own records — clients still choose what they get on their own
              Notifications page, this doesn't override that.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-2">Send to</label>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setAudience('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                  audience === 'all'
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                All Clients
              </button>
              <button
                onClick={() => setAudience('specific')}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                  audience === 'specific'
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                Specific Clients
              </button>
            </div>

            {audience === 'specific' && (
              <div className="max-h-56 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 divide-y divide-zinc-900">
                {clients.length === 0 ? (
                  <p className="p-4 text-center text-xs text-zinc-600">No registered clients yet.</p>
                ) : (
                  clients.map((c) => (
                    <label
                      key={c.email}
                      className="flex items-center gap-3 p-3 text-xs text-zinc-300 hover:bg-zinc-900/60 cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEmails.includes(c.email)}
                        onChange={() => toggleEmail(c.email)}
                        className="accent-red-600"
                      />
                      <span className="font-bold">{c.username}</span>
                      <span className="text-zinc-500">{c.email}</span>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleSend}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)]"
          >
            Send Notification 🚀
          </button>
        </section>

        {/* HISTORY */}
        <section className="rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold">Sent Notifications</h2>
            <p className="text-xs text-zinc-500">
              {notifications.length} total · resend anytime, e.g. as a reminder.
            </p>
          </div>

          {notifications.length === 0 ? (
            <p className="rounded-xl border border-zinc-900 bg-zinc-950 p-6 text-center text-xs text-zinc-600">
              Nothing sent yet.
            </p>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <div key={n.id} className="rounded-xl border border-zinc-900 bg-zinc-950 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wide text-red-400 bg-red-950/40 border border-red-900/50 rounded px-2 py-0.5 mb-1.5">
                        {CATEGORIES.find((c) => c.value === n.category)?.label || 'General'}
                      </span>
                      <p className="text-sm font-bold text-white">{n.title}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{n.message}</p>
                      <p className="text-[11px] text-zinc-600 mt-2">
                        {recipientLabel(n)} · sent {formatTime(n.createdAt)}
                        {n.resentAt.length > 0 &&
                          ` · resent ${n.resentAt.length}x, last ${formatTime(n.resentAt[n.resentAt.length - 1])}`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleResend(n.id)}
                      className="shrink-0 bg-zinc-900 border border-zinc-800 hover:border-red-500/50 text-xs font-bold text-zinc-300 hover:text-red-400 px-3 py-1.5 rounded-lg transition"
                    >
                      🔁 Resend
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
