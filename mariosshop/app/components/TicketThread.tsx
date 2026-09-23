'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { appendMessage, getTicketById, onTicketsChanged, type Ticket, type TicketStatus } from '../lib/tickets';

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

interface TicketThreadProps {
  ticketId: string;
}

export default function TicketThread({ ticketId }: TicketThreadProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const refresh = useCallback(async () => {
    const t = await getTicketById(ticketId);
    setTicket(t);
  }, [ticketId]);

  useEffect(() => {
    refresh();
    const unsubscribe = onTicketsChanged(refresh);
    return unsubscribe;
  }, [refresh]);

  const handleSend = useCallback(async () => {
    if (!message.trim()) return;
    setSending(true);
    const updated = await appendMessage(ticketId, 'client', message);
    setSending(false);
    if (updated) {
      setMessage('');
      refresh();
    }
  }, [ticketId, message, refresh]);

  if (!ticket) return null;

  return (
    <div className="flex min-h-[380px] max-h-[65vh] flex-col rounded-2xl border border-zinc-800 bg-zinc-900/50">
      <div className="flex items-center justify-between border-b border-zinc-800 p-4">
        <div>
          <h3 className="text-sm font-black text-white">{ticket.subject}</h3>
          <p className="text-[11px] text-zinc-500">{ticket.id}</p>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${STATUS_STYLES[ticket.status]}`}>
          {ticket.status}
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {ticket.messages.map((m) => (
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

      {ticket.status !== 'Closed' && (
        <div className="border-t border-zinc-800 p-4">
          <div className="flex gap-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={2}
              placeholder="Message support…"
              className="flex-1 resize-none rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/30"
            />
            <button
              onClick={handleSend}
              disabled={sending || !message.trim()}
              className="shrink-0 rounded-xl bg-red-600 px-5 text-xs font-black uppercase tracking-wide text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
