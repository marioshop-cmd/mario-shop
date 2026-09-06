'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../language/LanguageContext';
import AccountTabs from '../../components/AccountTabs';
import { Bell, Check } from 'lucide-react';
import {
  getNotificationsForEmail,
  onNotificationsChanged,
  type AppNotification,
} from '../../lib/notifications';

function formatNotifTime(iso: string): string {
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

type NotificationPrefs = {
  orderUpdates: boolean;
  promotions: boolean;
  newProducts: boolean;
  securityAlerts: boolean;
};

const DEFAULT_PREFS: NotificationPrefs = {
  orderUpdates: true,
  promotions: false,
  newProducts: true,
  securityAlerts: true,
};

const STORAGE_KEY = 'notification-prefs';

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked ? 'bg-red-600' : 'bg-zinc-700'
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function NotificationsPage() {
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

  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [saved, setSaved] = useState(false);
  const [received, setReceived] = useState<AppNotification[]>([]);

  const refreshReceived = () => {
    if (currentUser) setReceived(getNotificationsForEmail(currentUser.email));
  };

  useEffect(() => {
    refreshReceived();
    const unsubscribe = onNotificationsChanged(refreshReceived);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setPrefs(JSON.parse(stored));
      } catch {
        // ignore malformed storage
      }
    }
    if (typeof Notification !== 'undefined') {
      setBrowserPermission(Notification.permission);
    } else {
      setBrowserPermission('unsupported');
    }
  }, []);

  const toggle = (key: keyof NotificationPrefs) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const requestBrowserPermission = async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setBrowserPermission(result);
  };

  if (!currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-xs text-zinc-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-4 py-10 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <AccountTabs />

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-600/15 border border-red-500/40 flex items-center justify-center shrink-0">
              <Bell className="w-4.5 h-4.5 text-red-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{t('acct_browser_notif_title')}</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {t('acct_browser_notif_desc')}
              </p>
            </div>
          </div>

          {browserPermission === 'unsupported' && (
            <p className="text-xs text-zinc-500">{t('acct_notif_unsupported')}</p>
          )}
          {browserPermission === 'granted' && (
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-2">
                <Check className="w-3.5 h-3.5" /> {t('acct_notif_enabled')}
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                To turn these off, use the toggles below to control what you get notified about — or
                block notifications for this site from your browser's own settings (usually the icon
                just left of the address bar). No website, including this one, can turn browser
                notifications back off on your behalf once you've allowed them.
              </p>
            </div>
          )}
          {browserPermission === 'denied' && (
            <p className="text-xs text-red-400 font-semibold">
              {t('acct_notif_blocked')}
            </p>
          )}
          {browserPermission === 'default' && (
            <button
              onClick={requestBrowserPermission}
              className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition"
            >
              {t('acct_enable_browser_notif')}
            </button>
          )}
        </section>

        {received.length > 0 && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 mb-6">
            <h2 className="text-sm font-bold text-white mb-1">{t('acct_recent_notif_title')}</h2>
            <p className="text-xs text-zinc-500 mb-4">{t('acct_recent_notif_desc')}</p>

            <div className="space-y-2">
              {received.map((n) => (
                <div key={n.id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3.5">
                  <p className="text-sm font-bold text-white">{n.title}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-zinc-600 mt-1.5">{formatNotifTime(n.createdAt)}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-sm font-bold text-white mb-1">{t('acct_notif_prefs_title')}</h2>
          <p className="text-xs text-zinc-500 mb-5">
            Turn individual notification types on or off.
            {saved && <span className="text-emerald-400 font-semibold ml-2">Saved</span>}
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{t('acct_pref_orders')}</p>
                <p className="text-xs text-zinc-500">{t('acct_pref_orders_desc')}</p>
              </div>
              <Toggle checked={prefs.orderUpdates} onChange={() => toggle('orderUpdates')} />
            </div>

            <div className="h-px bg-zinc-800" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{t('acct_pref_promos')}</p>
                <p className="text-xs text-zinc-500">{t('acct_pref_promos_desc')}</p>
              </div>
              <Toggle checked={prefs.promotions} onChange={() => toggle('promotions')} />
            </div>

            <div className="h-px bg-zinc-800" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{t('acct_pref_new_products')}</p>
                <p className="text-xs text-zinc-500">{t('acct_pref_new_products_desc')}</p>
              </div>
              <Toggle checked={prefs.newProducts} onChange={() => toggle('newProducts')} />
            </div>

            <div className="h-px bg-zinc-800" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{t('acct_pref_security')}</p>
                <p className="text-xs text-zinc-500">{t('acct_pref_security_desc')}</p>
              </div>
              <Toggle checked={prefs.securityAlerts} onChange={() => toggle('securityAlerts')} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
