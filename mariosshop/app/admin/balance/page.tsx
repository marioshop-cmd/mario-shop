'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import AdminTicketCenter from '../../components/AdminTicketCenter';

export default function AdminBalanceRequestsPage() {
  const { currentUser } = useAuth();
  const router = useRouter();

  // Same admin gate used on the main tickets page.
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

  if (!currentUser || !currentUser.isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-xs text-zinc-500">
        Loading…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Balance Requests</h1>
          <p className="text-xs text-zinc-400">
            Chats from clients asking to top up their balance. Reply with a payment method, then use
            "Approve &amp; Credit" once they've paid.
          </p>
        </div>

        <AdminTicketCenter paneHeight="min-h-[70vh]" categoryFilter="Payment & Billing" />
      </div>
    </main>
  );
}
