'use client';

import React, { useState } from 'react';
import { createTicket } from '../lib/tickets';
import { useAuth } from '../context/AuthContext';
import TicketThread from './TicketThread';
import { X, ArrowRight, Headphones } from 'lucide-react';

interface StartChatButtonProps {
  label: React.ReactNode;
  className?: string;
  /** When set, shows an "Ordering" context box and ties the ticket subject
   * to this product — used for the "Contact Us to Buy" button on a
   * product page. Omit for a general inquiry (e.g. "Can't Find It?"). */
  productName?: string;
  productRef?: string | number;
}

export default function StartChatButton({ label, className, productName, productRef }: StartChatButtonProps) {
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentUser?.username || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleStart = () => {
    if (!email.trim()) {
      setError('Email is required so we can reply to you.');
      return;
    }
    const subject = productName ? `Order Inquiry: ${productName}` : "Can't Find It — General Inquiry";
    const firstMessage = productName
      ? `Hi, I'm interested in ${productName}${productRef ? ` (Ref: ${productRef})` : ''}.${name ? ` My name is ${name}.` : ''}`
      : `Hi, I couldn't find what I'm looking for.${name ? ` My name is ${name}.` : ''} Can you help me find it?`;

    const ticket = createTicket({
      category: 'Other',
      subject,
      email: email.trim(),
      firstMessage,
    });

    if (ticket) {
      setError('');
      setTicketId(ticket.id);
    } else {
      setError('Something went wrong starting the chat — try again.');
    }
  };

  const close = () => {
    setOpen(false);
    setTicketId(null);
    setError('');
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className={className}>
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:justify-end bg-black/60 backdrop-blur-sm px-4 py-4 sm:px-0 sm:pr-6"
          onClick={close}
        >
          <div
            className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-red-700 to-red-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-black text-white leading-tight">Mario's Shop Support</p>
                  <p className="text-[11px] text-red-100 flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Online · replies instantly
                  </p>
                </div>
              </div>
              <button onClick={close} className="text-white/80 hover:text-white transition shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              {!ticketId ? (
                <>
                  <p className="text-xs font-bold text-zinc-400 mb-4">Quick intro — so we can send you your reply</p>

                  {productName && (
                    <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-3 mb-4">
                      <p className="text-[10px] font-bold text-red-400 uppercase tracking-wide">Ordering</p>
                      <p className="text-sm font-bold text-white mt-0.5">{productName}</p>
                      {productRef !== undefined && (
                        <p className="text-[11px] text-zinc-500 mt-0.5">Ref: {productRef}</p>
                      )}
                    </div>
                  )}

                  {error && <p className="text-xs text-red-400 font-semibold mb-3">{error}</p>}

                  <label className="block text-[11px] font-bold text-zinc-400 mb-1.5">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-500 text-sm text-white rounded-xl p-3 outline-none transition mb-3"
                  />

                  <label className="block text-[11px] font-bold text-zinc-400 mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-500 text-sm text-white rounded-xl p-3 outline-none transition mb-4"
                  />

                  <button
                    onClick={handleStart}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white text-sm font-bold transition"
                  >
                    Start Chat <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <TicketThread ticketId={ticketId} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
