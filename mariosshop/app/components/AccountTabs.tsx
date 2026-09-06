'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../language/LanguageContext';
import { User, Bell, ShieldCheck, Package, CreditCard, LogOut } from 'lucide-react';

const TABS = [
  { key: 'acct_tab_profile', path: '/account', icon: User },
  { key: 'acct_tab_billing', path: '/account/billing', icon: CreditCard },
  { key: 'acct_tab_orders', path: '/my-orders', icon: Package },
  { key: 'acct_tab_security', path: '/account/security', icon: ShieldCheck },
  { key: 'acct_tab_notifications', path: '/account/notifications', icon: Bell },
];

export default function AccountTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const { logoutUser } = useAuth();
  const { t } = useLanguage();

  const handleLogout = () => {
    logoutUser();
    router.push('/');
  };

  return (
    <div className="flex items-center justify-center flex-wrap gap-2 mb-8">
      {TABS.map((tab) => {
        const isActive = pathname === tab.path;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.path}
            href={tab.path}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold tracking-wide border transition-all ${
              isActive
                ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {t(tab.key)}
          </Link>
        );
      })}

      <button
        onClick={handleLogout}
        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold tracking-wide border border-zinc-800 bg-zinc-900/90 text-zinc-400 hover:text-red-400 hover:border-red-500/50 transition-all"
      >
        <LogOut className="w-3.5 h-3.5" />
        {t('acct_tab_logout')}
      </button>
    </div>
  );
}
