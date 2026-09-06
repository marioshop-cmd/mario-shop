'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../language/LanguageContext';
import AccountTabs from '../../components/AccountTabs';
import TicketThread from '../../components/TicketThread';
import { createTicket, getTicketsByEmail, onTicketsChanged, type Ticket } from '../../lib/tickets';
import { Wallet } from 'lucide-react';

const QUICK_AMOUNTS = [10, 25, 50, 100];

export default function BillingPage() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (currentUser === null) {
      const timer = setTimeout(() => {
        if (!currentUser) router.replace('/login');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentUser, router]);

  const [amount, setAmount] = useState<number | ''>('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [viewingTicketId, setViewingTicketId] = useState<string | null>(null);

  const refreshTickets = () => {
    if (currentUser) setTickets(getTicketsByEmail(currentUser.email));
  };

  useEffect(() => {
    refreshTickets();
    const unsubscribe = onTicketsChanged(refreshTickets);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const billingTickets = useMemo(
    () => tickets.filter((t) => t.category === 'Payment & Billing'),
    [tickets]
  );

  const activeTicket = billingTickets.find((t) => t.status !== 'Resolved' && t.status !== 'Closed') || null;
  const pastTickets = billingTickets.filter((t) => t.id !== activeTicket?.id);

  const handleRequestTopUp = () => {
    if (!currentUser || !amount) return;
    const ticket = createTicket({
      category: 'Payment & Billing',
      subject: `Balance Top-Up Request: ${amount} B9CHICH`,
      email: currentUser.email,
      firstMessage: `Hi, I'd like to add ${amount} B9CHICH (${amount} TND) to my balance. Please let me know how to pay.`,
    });
    if (ticket) {
      setAmount('');
      refreshTickets();
    }
  };

  if (!currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-xs text-zinc-500">Loading…</p>
      </main>
    );
  }

  const userBalance = currentUser?.b9chich ?? 0;

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-4 py-10 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <AccountTabs />

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-red-600/15 border border-red-500/40 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-500 font-semibold">{t('acct_current_balance')}</p>
              <p className="text-2xl font-black text-red-500">
                {userBalance} <span className="text-zinc-400 text-xs font-semibold">B9CHICH</span>
              </p>
            </div>
          </div>
        </section>

        {activeTicket ? (
          <section className="mb-6">
            <p className="text-xs text-zinc-500 mb-2">
              {t('acct_open_request_note')}
            </p>
            <TicketThread ticketId={activeTicket.id} />
          </section>
        ) : (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 mb-6">
            <h2 className="text-sm font-bold text-white mb-1">{t('acct_add_balance_title')}</h2>
            <p className="text-xs text-zinc-500 mb-5">
              {t('acct_add_balance_desc')}
            </p>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {QUICK_AMOUNTS.map((val) => (
                <button
                  key={val}
                  onClick={() => setAmount(val)}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                    amount === val
                      ? 'bg-red-600 border-red-500 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">{t('acct_custom_amount')}</label>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Enter amount"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 text-sm text-white rounded-xl p-3 outline-none transition"
              />
            </div>

            <button
              onClick={handleRequestTopUp}
              disabled={!amount}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] disabled:opacity-50"
            >
              {t('acct_request')} {amount || ''} B9CHICH
            </button>
          </section>
        )}

        {pastTickets.length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-zinc-400 mb-2">{t('acct_past_requests')}</h2>

            {viewingTicketId ? (
              <div>
                <button
                  onClick={() => setViewingTicketId(null)}
                  className="mb-2 text-[11px] font-bold text-zinc-400 hover:text-white transition"
                >
                  {t('acct_back_to_requests')}
                </button>
                <TicketThread ticketId={viewingTicketId} />
              </div>
            ) : (
              <div className="space-y-2">
                {pastTickets.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setViewingTicketId(t.id)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 flex items-center justify-between text-left hover:border-zinc-700 transition"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{t.subject}</p>
                      <p className="text-[10px] text-zinc-500">{t.id}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase text-zinc-400">{t.status}</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
