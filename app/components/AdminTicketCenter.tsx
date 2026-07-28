'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  appendMessage,
  getAllTickets,
  onTicketsChanged,
  TICKET_STATUSES,
  updateTicketStatus,
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

interface AdminTicketCenterProps {
  /** Tailwind height class for the list/thread panes. Defaults to a size that
   * fits nicely embedded inside another page; pass "min-h-[70vh]" etc. for a
   * full standalone page. */
  paneHeight?: string;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function AdminTicketCenter({ paneHeight = 'min-h-[520px] max-h-[70vh]' }: AdminTicketCenterProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'All'>('All');
  const [search, setSearch] = useState('');
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const refresh = useCallback(() => {
    setTickets(getAllTickets());
  }, []);

  useEffect(() => {
    refresh();
    const unsubscribe = onTicketsChanged(refresh);
    return unsubscribe;
  }, [refresh]);

  const filteredTickets = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tickets.filter((t) => {
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
      const matchesSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [tickets, statusFilter, search]);

  const selectedTicket = useMemo(
    () => tickets.find((t) => t.id === selectedId) ?? null,
    [tickets, selectedId]
  );

  useEffect(() => {
    if (!selectedId && filteredTickets.length > 0) setSelectedId(filteredTickets[0].id);
  }, [filteredTickets, selectedId]);

  const handleSendReply = useCallback(async () => {
    if (!selectedTicket || !reply.trim()) return;
    setSending(true);
    const updated = appendMessage(selectedTicket.id, 'admin', reply);
    setSending(false);
    if (updated) {
      setReply('');
      refresh();
    }
  }, [selectedTicket, reply, refresh]);

  const handleStatusChange = useCallback(
    (status: TicketStatus) => {
      if (!selectedTicket) return;
      updateTicketStatus(selectedTicket.id, status);
      refresh();
    },
    [selectedTicket, refresh]
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      {/* Ticket list */}
      <div className="space-y-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search ID, subject, email…"
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-xs text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/30"
        />

        <div className="flex flex-wrap gap-1.5">
          {(['All', ...TICKET_STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wide transition ${
                statusFilter === s
                  ? 'border-red-500/70 bg-red-500/10 text-red-400'
                  : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className={`${paneHeight} space-y-2 overflow-y-auto pr-1`}>
          {filteredTickets.length === 0 ? (
            <p className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center text-xs text-zinc-500">
              No tickets match this view.
            </p>
          ) : (
            filteredTickets.map((t) => {
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
                  <p className="mt-1 truncate text-[11px] text-zinc-500">{t.email}</p>
                  {lastMessage && (
                    <p className="mt-1 truncate text-[11px] text-zinc-400">
                      <span className="font-semibold text-zinc-500">
                        {lastMessage.sender === 'admin' ? 'You: ' : ''}
                      </span>
                      {lastMessage.text}
                    </p>
                  )}
                  <p className="mt-1 text-[10px] text-zinc-600">{formatTime(t.updatedAt)}</p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Thread view */}
      <div className={`flex ${paneHeight} flex-col rounded-2xl border border-zinc-800 bg-zinc-900/50`}>
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
                  {selectedTicket.id} · {selectedTicket.email} · {selectedTicket.category || 'Uncategorized'}
                </p>
              </div>
              <select
                value={selectedTicket.status}
                onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-bold outline-none ${STATUS_STYLES[selectedTicket.status]}`}
              >
                {TICKET_STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-zinc-900 text-white">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {selectedTicket.messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs ${
                      m.sender === 'admin'
                        ? 'rounded-tr-sm bg-red-600 text-white'
                        : 'rounded-tl-sm border border-zinc-800 bg-zinc-950 text-zinc-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    <p className={`mt-1 text-[10px] ${m.sender === 'admin' ? 'text-red-100/70' : 'text-zinc-500'}`}>
                      {m.sender === 'admin' ? 'Support' : 'Client'} · {formatTime(m.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

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
          </>
        )}
      </div>
    </div>
  );
}
