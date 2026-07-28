'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function DebugTicketsPage() {
  const { currentUser } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [rawStorage, setRawStorage] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [rawOrdersStorage, setRawOrdersStorage] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [rawTransactionsStorage, setRawTransactionsStorage] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('app_tickets') || '[]';
      setRawStorage(raw);
      setTickets(JSON.parse(raw));
    } catch (e) {
      setRawStorage('ERROR: ' + String(e));
    }
    try {
      const rawOrders = localStorage.getItem('app_orders') || '[]';
      setRawOrdersStorage(rawOrders);
      setOrders(JSON.parse(rawOrders));
    } catch (e) {
      setRawOrdersStorage('ERROR: ' + String(e));
    }
    try {
      const rawTxns = localStorage.getItem('app_transactions') || '[]';
      setRawTransactionsStorage(rawTxns);
      setTransactions(JSON.parse(rawTxns));
    } catch (e) {
      setRawTransactionsStorage('ERROR: ' + String(e));
    }
  }, []);

  const currentEmail = (currentUser?.email || '').trim().toLowerCase();

  return (
    <main className="min-h-screen bg-zinc-950 text-white pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-black">🔍 Debug: Tickets</h1>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-red-400 mb-2">Compte connecté</h2>
          {currentUser ? (
            <div className="text-xs space-y-1 font-mono">
              <p>username: <span className="text-white">{currentUser.username}</span></p>
              <p>email: <span className="text-emerald-400 font-bold">"{currentUser.email}"</span></p>
              <p>isAdmin: <span className="text-white">{String(currentUser.isAdmin)}</span></p>
            </div>
          ) : (
            <p className="text-xs text-zinc-500">Personne n'est connecté.</p>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-red-400 mb-2">
            Tickets dans le localStorage ({tickets.length})
          </h2>
          {tickets.length === 0 ? (
            <p className="text-xs text-zinc-500">Aucun ticket trouvé — localStorage['app_tickets'] est vide.</p>
          ) : (
            <div className="space-y-2">
              {tickets.map((t, i) => {
                const ticketEmail = (t.email || '').trim().toLowerCase();
                const matches = ticketEmail === currentEmail;
                return (
                  <div
                    key={i}
                    className={`text-xs font-mono p-3 rounded-xl border ${
                      matches ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-zinc-800 bg-zinc-950'
                    }`}
                  >
                    <p>id: {t.id}</p>
                    <p>
                      email: <span className={matches ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>"{t.email}"</span>
                      {' '}{matches ? '✅ correspond au compte connecté' : '❌ ne correspond PAS'}
                    </p>
                    <p>subject: {t.subject}</p>
                    <p>messages: {Array.isArray(t.messages) ? t.messages.length : 'AUCUN TABLEAU messages !'}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-red-400 mb-2">Raw localStorage['app_tickets']</h2>
          <pre className="text-[10px] text-zinc-400 overflow-x-auto whitespace-pre-wrap break-all">{rawStorage}</pre>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-amber-400 mb-2">
            Orders dans le localStorage ({orders.length})
          </h2>
          {orders.length === 0 ? (
            <p className="text-xs text-zinc-500">Aucune commande trouvée — localStorage['app_orders'] est vide.</p>
          ) : (
            <div className="space-y-2">
              {orders.map((o, i) => {
                const orderEmail = (o.email || '').trim().toLowerCase();
                const matches = orderEmail === currentEmail;
                return (
                  <div
                    key={i}
                    className={`text-xs font-mono p-3 rounded-xl border ${
                      matches ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-zinc-800 bg-zinc-950'
                    }`}
                  >
                    <p>id: {o.id}</p>
                    <p>
                      email: <span className={matches ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>"{o.email}"</span>
                      {' '}{matches ? '✅ correspond au compte connecté' : '❌ ne correspond PAS'}
                    </p>
                    <p>status: {o.status}</p>
                    <p>totalCost: {o.totalCost}</p>
                    <p>items: {Array.isArray(o.items) ? o.items.length : 'AUCUN TABLEAU items !'}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-amber-400 mb-2">Raw localStorage['app_orders']</h2>
          <pre className="text-[10px] text-zinc-400 overflow-x-auto whitespace-pre-wrap break-all">{rawOrdersStorage}</pre>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-emerald-400 mb-2">
            Transactions dans le localStorage ({transactions.length})
          </h2>
          {transactions.length === 0 ? (
            <p className="text-xs text-zinc-500">Aucune transaction trouvée — localStorage['app_transactions'] est vide.</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((t, i) => (
                <div key={i} className="text-xs font-mono p-3 rounded-xl border border-zinc-800 bg-zinc-950">
                  <p>id: {t.id}</p>
                  <p>email: <span className="text-emerald-400 font-bold">"{t.email}"</span></p>
                  <p>type: {t.type}</p>
                  <p>amount: {t.amount}</p>
                  <p>balanceAfter: {t.balanceAfter}</p>
                  <p>createdAt: {t.createdAt}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-emerald-400 mb-2">Raw localStorage['app_transactions']</h2>
          <pre className="text-[10px] text-zinc-400 overflow-x-auto whitespace-pre-wrap break-all">{rawTransactionsStorage}</pre>
        </div>
      </div>
    </main>
  );
}
