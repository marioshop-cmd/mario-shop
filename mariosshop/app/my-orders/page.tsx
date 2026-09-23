'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../language/LanguageContext';
import {
  getOrdersByEmail,
  type Order,
  type OrderStatus,
} from '../lib/orders';

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

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

const STEPS: { status: OrderStatus; labelKey: string }[] = [
  { status: 'Pending', labelKey: 'order_status_pending' },
  { status: 'Processing', labelKey: 'order_status_processing' },
  { status: 'Delivered', labelKey: 'order_status_delivered' },
];

function OrderProgress({ status }: { status: OrderStatus }) {
  const { t } = useLanguage();

  if (status === 'Cancelled') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400">
        {t('order_cancelled_msg')}
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.status === status);

  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => {
        const reached = i <= currentIndex;
        const isLast = i === STEPS.length - 1;
        return (
          <React.Fragment key={step.status}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-black transition-colors ${
                  reached
                    ? 'border-red-500 bg-red-600 text-white'
                    : 'border-zinc-700 bg-zinc-900 text-zinc-600'
                }`}
              >
                {reached ? '✓' : i + 1}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wide ${reached ? 'text-white' : 'text-zinc-600'}`}>
                {t(step.labelKey)}
              </span>
            </div>
            {!isLast && (
              <div className={`mx-1 mb-4 h-0.5 flex-1 rounded ${i < currentIndex ? 'bg-red-500' : 'bg-zinc-800'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

const STORAGE_KEY = 'app_orders';

type OrderMessage = {
  id: string;
  sender: 'client' | 'support';
  text: string;
  createdAt: string;
};

function onOrdersChanged(callback: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener('storage', handleStorageEvent);
  return () => window.removeEventListener('storage', handleStorageEvent);
}

function appendOrderMessage(orderId: string, sender: 'client' | 'support', text: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;

    const orders = JSON.parse(raw);
    if (!Array.isArray(orders)) return false;

    const matchingOrder = orders.find((order) => order?.id === orderId);
    if (!matchingOrder || typeof matchingOrder !== 'object') return false;

    const message: OrderMessage = {
      id: `MSG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      sender,
      text,
      createdAt: new Date().toISOString(),
    };

    if (!Array.isArray(matchingOrder.messages)) {
      matchingOrder.messages = [];
    }

    matchingOrder.messages.push(message);
    matchingOrder.updatedAt = new Date().toISOString();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    return true;
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function MyOrdersPage() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (currentUser?.email) setOrders(getOrdersByEmail(currentUser.email));
  }, [currentUser?.email]);

  useEffect(() => {
    refresh();
    const unsubscribe = onOrdersChanged(refresh);
    return unsubscribe;
  }, [refresh]);

  // Redirect guests to login — same grace-period pattern used on My Tickets.
  useEffect(() => {
    if (currentUser === null) {
      const timer = setTimeout(() => {
        if (!currentUser) router.replace('/login');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentUser, router]);

  const handleSendMessage = useCallback(
    async (orderId: string) => {
      const text = replyDrafts[orderId];
      if (!text || !text.trim()) return;
      setSendingId(orderId);
      const updated = appendOrderMessage(orderId, 'client', text);
      setSendingId(null);
      if (updated) {
        setReplyDrafts((prev) => ({ ...prev, [orderId]: '' }));
        refresh();
      }
    },
    [replyDrafts, refresh]
  );

  if (!currentUser) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-zinc-950 px-4 text-center text-white">
        <p className="text-xs text-zinc-400">{t('need_login_orders')}</p>
        <Link
          href="/login"
          className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-black uppercase tracking-wide text-white transition hover:bg-red-500"
        >
          {t('login')}
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 pt-28 text-white sm:px-6 sm:pt-32 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight">{t('my_orders_title')}</h1>
            <p className="text-xs text-zinc-400">{t('my_orders_subtitle')}</p>
          </div>
          <Link
            href="/services"
            className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-bold text-zinc-300 transition hover:border-red-500/50 hover:text-red-400"
          >
            {t('browse_shop_button')}
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-10 text-center">
            <p className="text-sm font-bold text-white">{t('no_orders_yet')}</p>
            <p className="mt-1 text-xs text-zinc-500">
              {t('no_orders_desc_pre')}{' '}
              <Link href="/services" className="font-semibold text-red-400 hover:underline">
                {t('shop_link_label')}
              </Link>{' '}
              {t('no_orders_desc_suffix')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isExpanded = expandedId === order.id;
              const messages = ((order as any).messages ?? []) as OrderMessage[];
              const messageCount = messages.length;
              return (
                <div key={order.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-mono text-zinc-500">{order.id}</p>
                      <p className="text-[11px] text-zinc-600">{formatTime(order.createdAt)}</p>
                    </div>
                    <span className="text-sm font-black text-amber-400">{order.totalCost.toFixed(2)} TND</span>
                  </div>

                  <div className="space-y-1.5 border-t border-zinc-800 pt-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-zinc-300">
                          {item.productName}
                          {item.variantLabel ? ` — ${item.variantLabel}` : ''}
                          {item.quantity > 1 ? ` x${item.quantity}` : ''}
                        </span>
                        <span className="text-zinc-500">{(item.priceNumeric * item.quantity).toFixed(2)} TND</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-zinc-800 pt-4">
                    <OrderProgress status={order.status} />
                  </div>

                  <div className="border-t border-zinc-800 pt-3">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      className="flex items-center gap-2 text-xs font-bold text-zinc-400 transition hover:text-red-400"
                    >
                      💬 {isExpanded ? t('hide_label') : t('message_us_about_order')}
                      {messageCount > 0 && (
                        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">{messageCount}</span>
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 space-y-3 rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                        {messages.length === 0 ? (
                          <p className="text-center text-[11px] text-zinc-600">
                            {t('no_messages_yet_desc')}
                          </p>
                        ) : (
                          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                            {messages.map((m) => (
                              <div key={m.id} className={`flex ${m.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${
                                    m.sender === 'client'
                                      ? 'rounded-tr-sm bg-red-600 text-white'
                                      : 'rounded-tl-sm border border-zinc-800 bg-zinc-900 text-zinc-200'
                                  }`}
                                >
                                  <p className="whitespace-pre-wrap">{m.text}</p>
                                  <p className={`mt-1 text-[10px] ${m.sender === 'client' ? 'text-red-100/70' : 'text-zinc-500'}`}>
                                    {m.sender === 'client' ? t('you_label') : t('support_label')} · {formatTime(m.createdAt)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <textarea
                            value={replyDrafts[order.id] || ''}
                            onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [order.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(order.id);
                              }
                            }}
                            rows={2}
                            placeholder={t('message_input_placeholder')}
                            className="flex-1 resize-none rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/30"
                          />
                          <button
                            onClick={() => handleSendMessage(order.id)}
                            disabled={sendingId === order.id || !(replyDrafts[order.id] || '').trim()}
                            className="shrink-0 rounded-xl bg-red-600 px-4 text-xs font-black uppercase tracking-wide text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {t('send_button')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
