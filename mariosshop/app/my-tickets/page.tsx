'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  appendMessage,
  getTicketsByEmail,
  onTicketsChanged,
  type Ticket,
  type TicketStatus,
} from '../lib/tickets';

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

const STATUS_STYLES: Record<TicketStatus, string> = {
  Pending: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  'In Progress': 'border-sky-500/40 bg-sky-500/10 text-sky-400',
  Resolved: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  Closed: 'border-zinc-600/40 bg-zinc-600/10 text-zinc-400',
};

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function MyTicketsPage() {
  const { currentUser } = useAuth();
  const router = useRouter();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const refresh = useCallback(async () => {
    if (currentUser?.email) setTickets(await getTicketsByEmail(currentUser.email));
  }, [currentUser?.email]);

  useEffect(() => {
    refresh();
    const unsubscribe = onTicketsChanged(refresh);
    return unsubscribe;
  }, [refresh]);

  // Redirect guests to login — this page only makes sense for an account.
  useEffect(() => {
    if (currentUser === null) {
      const timer = setTimeout(() => {
        if (!currentUser) router.replace('/login');
      }, 300); // small grace period while the session loads from localStorage
      return () => clearTimeout(timer);
    }
  }, [currentUser, router]);

  const selectedTicket = useMemo(
    () => tickets.find((t) => t.id === selectedId) ?? null,
    [tickets, selectedId]
  );

  useEffect(() => {
    if (!selectedId && tickets.length > 0) setSelectedId(tickets[0].id);
  }, [tickets, selectedId]);

  const handleSendReply = useCallback(async () => {
    if (!selectedTicket || !reply.trim()) return;
    setSending(true);
    const updated = await appendMessage(selectedTicket.id, 'client', reply);
    setSending(false);
    if (updated) {
      setReply('');
      refresh();
    }
  }, [selectedTicket, reply, refresh]);

  if (!currentUser) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-zinc-950 px-4 text-center text-white">
        <p className="text-xs text-zinc-400">You need to be logged in to view your tickets.</p>
        <Link
          href="/login"
          className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-black uppercase tracking-wide text-white transition hover:bg-red-500"
        >
          Log In
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 pt-28 text-white sm:px-6 sm:pt-32 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight">My Tickets</h1>
            <p className="text-xs text-zinc-400">Follow up on your support requests and reply to our team.</p>
          </div>
          <Link
            href="/contact"
            className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-bold text-zinc-300 transition hover:border-red-500/50 hover:text-red-400"
          >
            + New Ticket
          </Link>
        </div>

        {tickets.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-10 text-center">
            <p className="text-sm font-bold text-white">No tickets yet</p>
            <p className="mt-1 text-xs text-zinc-500">
              Submit one from the{' '}
              <Link href="/contact" className="font-semibold text-red-400 hover:underline">
                Contact page
              </Link>{' '}
              and it'll show up here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            {/* Ticket list */}
            <div className="max-h-[70vh] space-y-2 overflow-y-auto pr-1">
              {tickets.map((t) => {
                const lastMessage = t.messages[t.messages.length - 1];
                const selected = t.id === selectedTicket?.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      selected
                        ? 'border-red-500/60 bg-zinc-900 shadow-[0_0_18px_rgba(239,68,68,0.15)]'
                        : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-bold text-white">{t.subject}</span>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${STATUS_STYLES[t.status]}`}>
                        {t.status}
                      </span>
                    </div>
                    {lastMessage && (
                      <p className="mt-1 truncate text-[11px] text-zinc-400">
                        <span className="font-semibold text-zinc-500">
                          {lastMessage.sender === 'admin' ? 'Support: ' : 'You: '}
                        </span>
                        {lastMessage.text}
                      </p>
                    )}
                    <p className="mt-1 text-[10px] text-zinc-600">{formatTime(t.updatedAt)}</p>
                  </button>
                );
              })}
            </div>

            {/* Thread view */}
            <div className="flex min-h-[70vh] flex-col rounded-2xl border border-zinc-800 bg-zinc-900/50">
              {!selectedTicket ? (
                <div className="flex flex-1 items-center justify-center text-xs text-zinc-500">
                  Select a ticket to view the conversation.
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 p-4">
                    <div>
                      <h2 className="text-sm font-black text-white">{selectedTicket.subject}</h2>
                      <p className="text-[11px] text-zinc-500">
                        {selectedTicket.id} · {selectedTicket.category || 'Uncategorized'}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-3 py-1 text-[10px] font-bold uppercase ${STATUS_STYLES[selectedTicket.status]}`}>
                      {selectedTicket.status}
                    </span>
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto p-4">
                    {selectedTicket.messages.map((m: Ticket['messages'][number]) => (
                      <div key={m.id} className={`flex ${m.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs ${
                            m.sender === 'client'
                              ? 'rounded-tr-sm bg-red-600 text-white'
                              : 'rounded-tl-sm border border-zinc-800 bg-zinc-950 text-zinc-200'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{m.text}</p>
                          <p className={`mt-1 text-[10px] ${m.sender === 'client' ? 'text-red-100/70' : 'text-zinc-500'}`}>
                            {m.sender === 'client' ? 'You' : 'Support'} · {formatTime(m.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedTicket.status === 'Closed' ? (
                    <div className="border-t border-zinc-800 p-4 text-center text-[11px] text-zinc-500">
                      This ticket is closed. Open a new ticket if you need further help.
                    </div>
                  ) : (
                    <div className="border-t border-zinc-800 p-4">
                      <div className="flex gap-2">
                        <textarea
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendReply();
                            }
                          }}
                          rows={2}
                          placeholder="Type your reply… (Enter to send, Shift+Enter for a new line)"
                          className="flex-1 resize-none rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/30"
                        />
                        <button
                          onClick={handleSendReply}
                          disabled={sending || !reply.trim()}
                          className="shrink-0 rounded-xl bg-red-600 px-5 text-xs font-black uppercase tracking-wide text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
