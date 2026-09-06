'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type PaymentMethod = 'D17' | 'Ooredoo' | 'Poste Tunis';

const PAYMENT_METHODS: {
  id: PaymentMethod;
  icon: string;
  description: string;
}[] = [
  {
    id: 'D17',
    icon: '📱',
    description: 'Pay using your D17 / La Poste mobile payment.',
  },
  {
    id: 'Ooredoo',
    icon: '📲',
    description: 'Pay using Ooredoo payment or balance transfer.',
  },
  {
    id: 'Poste Tunis',
    icon: '🏦',
    description: 'Pay using Poste Tunis / e-Dinar.',
  },
];

function getAccountEmail() {
  if (typeof window === 'undefined') return '';

  const possibleKeys = [
    'mario_current_user',
    'currentUser',
    'mario_currentUser',
    'user',
  ];

  for (const key of possibleKeys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (parsed?.email) return parsed.email;
    } catch {}
  }

  try {
    const usersRaw = localStorage.getItem('mario_users');
    if (usersRaw) {
      const users = JSON.parse(usersRaw);
      const currentEmail =
        localStorage.getItem('mario_current_email') ||
        localStorage.getItem('currentUserEmail');
      if (currentEmail) return currentEmail;
      if (Array.isArray(users) && users.length === 1 && users[0]?.email) {
        return users[0].email;
      }
    }
  } catch {}

  return '';
}

export default function AddB9chichPage() {
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  useEffect(() => {
    setEmail(getAccountEmail());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = Number(amount);

    if (!email.trim()) {
      setMessage('Please enter your account email.');
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      setMessage('Please enter a valid B9CHICH amount.');
      return;
    }

    if (!paymentMethod) {
      setMessage('Please select a payment method.');
      return;
    }

    const id = `B9-${Date.now()}`;

    const newTicket = {
      id,
      type: 'add_b9chich',
      name: 'B9CHICH Top Up Request',
      email: email.trim(),
      subject: `Add ${numericAmount} B9CHICH`,
      message: `Client wants to add ${numericAmount} B9CHICH. Payment method selected: ${paymentMethod}.`,
      category: 'Payment & Billing',
      paymentMethod,
      b9chichAmount: numericAmount,
      status: 'Open',
      createdAt: new Date().toISOString(),
      replies: [],
    };

    try {
      const saved = localStorage.getItem('app_tickets');
      const tickets = saved ? JSON.parse(saved) : [];
      const updatedTickets = [newTicket, ...tickets];
      localStorage.setItem('app_tickets', JSON.stringify(updatedTickets));
      window.dispatchEvent(new Event('storage'));
    } catch {
      setMessage('Something went wrong while creating your request.');
      return;
    }

    setTicketId(id);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white px-4 py-24">
        <div className="mx-auto max-w-2xl rounded-3xl border border-red-500/40 bg-zinc-950/80 p-8 md:p-12 text-center shadow-2xl shadow-red-950/20">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-3xl">
            ✓
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">Request Created</p>
          <h1 className="mt-3 text-3xl font-black">Your B9CHICH request is waiting for review</h1>
          <p className="mt-4 text-sm leading-6 text-zinc-400">
            Your request was sent to the Mario Shop admin. Wait for the payment instructions
            or reply in your ticket. The admin can send the appropriate payment details for
            your selected method.
          </p>

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 text-left">
            <div className="flex justify-between gap-4 border-b border-zinc-800 pb-3">
              <span className="text-zinc-500">Request ID</span>
              <span className="font-mono text-sm text-white">{ticketId}</span>
            </div>
            <div className="flex justify-between gap-4 border-b border-zinc-800 py-3">
              <span className="text-zinc-500">B9CHICH</span>
              <span className="font-bold text-red-400">{amount} B9CHICH</span>
            </div>
            <div className="flex justify-between gap-4 pt-3">
              <span className="text-zinc-500">Payment Method</span>
              <span className="font-bold text-white">{paymentMethod}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/tickets"
              className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-500"
            >
              View My Tickets
            </Link>
            <Link
              href="/"
              className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-3 font-bold text-zinc-200 transition hover:bg-zinc-800"
            >
              Back Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-20 text-white">
      <section className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/70 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-red-500 hover:text-white"
        >
          ← Back
        </Link>

        <div className="overflow-hidden rounded-3xl border border-red-500/35 bg-zinc-950/80 shadow-2xl shadow-black/40">
          <div className="border-b border-zinc-800 p-7 text-center md:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-400">Mario Shop Wallet</p>
            <h1 className="mt-3 text-3xl font-black md:text-4xl">Add B9CHICH</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-400">
              Choose how much B9CHICH you want and select your preferred payment method.
              Your request will be sent to the admin for payment instructions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7 p-6 md:p-10">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-bold text-zinc-200">Your Email</label>
                <span className="text-xs text-zinc-500">Linked to your account</span>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-200">
                How much B9CHICH do you want to add?
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Example: 10"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900/60 px-4 py-3 text-lg font-bold text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500"
              />
              <p className="mt-2 text-xs text-zinc-500">Enter the number of B9CHICH you want to purchase.</p>
            </div>

            <div>
              <label className="mb-3 block text-sm font-bold text-zinc-200">
                Select Payment Method
              </label>
              <div className="grid gap-3 md:grid-cols-3">
                {PAYMENT_METHODS.map((method) => {
                  const selected = paymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        selected
                          ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-950/30'
                          : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-600'
                      }`}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-2xl">{method.icon}</span>
                        {selected && <span className="text-xs font-bold text-red-400">SELECTED ✓</span>}
                      </div>
                      <h3 className="font-bold text-white">{method.id}</h3>
                      <p className="mt-1 text-xs leading-5 text-zinc-500">{method.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {message && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-red-600 px-5 py-4 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-red-600/20 transition hover:bg-red-500 active:scale-[0.99]"
            >
              Submit B9CHICH Request →
            </button>

            <p className="text-center text-xs leading-5 text-zinc-500">
              After submitting, wait for the admin to respond in your ticket with the appropriate payment instructions.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
