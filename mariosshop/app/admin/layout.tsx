'use client';

import React from 'react';
import Link from 'next/link';

const nav = [
  { href: '#overview', label: 'Overview', icon: '⌂' },
  { href: '#products', label: 'Products', icon: '▦' },
  { href: '#orders', label: 'Orders', icon: '◫' },
  { href: '#finance', label: 'Finance', icon: '₮' },
  { href: '#transactions', label: 'Transactions', icon: '↔' },
  { href: '#tickets', label: 'Support', icon: '✦' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="min-h-screen bg-[#070709] text-white">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r border-zinc-800/80 bg-[#09090b]/95 px-4 py-5 backdrop-blur-xl lg:flex lg:flex-col">
        <div className="flex items-center gap-3 border-b border-zinc-800/80 px-2 pb-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-600 text-sm font-black shadow-lg shadow-red-950/40">M</div>
          <div>
            <div className="text-sm font-black tracking-tight">MARIO'S SHOP</div>
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600">Admin Center</div>
          </div>
        </div>

        <div className="mt-6 px-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Workspace</div>
        <nav className="mt-2 space-y-1">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-500 transition hover:bg-zinc-900 hover:text-white">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-zinc-900 text-zinc-500 transition group-hover:bg-red-500/10 group-hover:text-red-400">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-7 px-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Tools</div>
        <nav className="mt-2 space-y-1">
          <Link href="/admin/balance" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-500 transition hover:bg-zinc-900 hover:text-white">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-zinc-900 text-zinc-500">$</span> Payment Requests
          </Link>
          <Link href="/admin/notifications" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-500 transition hover:bg-zinc-900 hover:text-white">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-zinc-900 text-zinc-500">!</span> Notifications
          </Link>
        </nav>

        <div className="mt-auto rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,.7)]" />
            <span className="text-[10px] font-bold text-zinc-300">Admin systems online</span>
          </div>
          <p className="mt-2 text-[9px] leading-4 text-zinc-600">Store operations, orders and support are available from this workspace.</p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <div role="banner" className="fixed inset-x-0 top-0 z-40 border-b border-zinc-800/80 bg-[#070709]/90 px-4 py-3 backdrop-blur-xl lg:left-64 lg:px-8">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-red-600 text-xs font-black">M</div>
              <span className="text-xs font-black">MARIO'S ADMIN</span>
            </div>
            <div className="hidden items-center gap-2 lg:flex">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-600">Control Center</span>
              <span className="text-zinc-800">/</span>
              <span className="text-[10px] font-bold text-zinc-400">Overview</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/" className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-[10px] font-bold text-zinc-400 transition hover:text-white">View Store</Link>
              <Link href="/admin/notifications" className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-800 bg-zinc-900/70 text-xs text-zinc-400 transition hover:border-red-500/40 hover:text-red-400">!</Link>
            </div>
          </div>
        </div>

        {children}
      </div>
    </section>
  );
}
