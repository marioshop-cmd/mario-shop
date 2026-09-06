'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Check } from 'lucide-react';
import { useLanguage } from '../language/LanguageContext';

const DISMISS_KEY = 'notification-prompt-dismissed';
const PREFS_KEY = 'notification-prefs';

type NotificationPrefs = {
  orderUpdates: boolean;
  promotions: boolean;
  newProducts: boolean;
  securityAlerts: boolean;
};

const DEFAULT_PREFS: NotificationPrefs = {
  orderUpdates: true,
  promotions: true,
  newProducts: true,
  securityAlerts: true,
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-red-600' : 'bg-zinc-700'}`}
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

export default function NotificationPrompt() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<'ask' | 'prefs'>('ask');
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);

  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) return;
    if (Notification.permission !== 'default') return;

    // Small delay so it doesn't slam the user the instant the page loads.
    const timer = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Lock the page behind the dialog so the popup feels like a true modal.
  useEffect(() => {
    if (!visible) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  const dismiss = () => {
    setVisible(false);
  };

  const enable = async () => {
    if (typeof Notification !== 'undefined') {
      await Notification.requestPermission();
    }
    localStorage.setItem(DISMISS_KEY, '1');
    // Load whatever prefs already exist (e.g. set earlier from the account
    // page) so this second step reflects real current settings.
    const stored = localStorage.getItem(PREFS_KEY);
    if (stored) {
      try {
        setPrefs((prev) => ({ ...prev, ...JSON.parse(stored) }));
      } catch {
        // ignore malformed storage
      }
    }
    setStep('prefs');
  };

  const togglePref = (key: keyof NotificationPrefs) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const finish = () => setVisible(false);

  // Render directly into <body>. This prevents transformed/animated parent
  // containers from changing the position of the fixed modal.
  if (!visible || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex min-h-dvh items-center justify-center bg-black/75 backdrop-blur-md px-4 py-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative z-10 w-full max-w-sm sm:max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl animate-[fadeIn_0.2s_ease-out] max-h-[85vh] overflow-y-auto">
        {step === 'ask' ? (
          <div className="p-6 sm:p-8 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-red-600/15 border border-red-500/40 flex items-center justify-center">
              <Bell className="w-6 h-6 sm:w-7 sm:h-7 text-red-500" />
            </div>

            <h2 className="text-lg sm:text-xl font-black text-white mb-2">
              {t('notif_popup_title')}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mb-6 leading-relaxed">
              {t('notif_popup_desc')}
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={dismiss}
                className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs sm:text-sm font-bold transition"
              >
                {t('notif_popup_later')}
              </button>
              <button
                onClick={enable}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white text-xs sm:text-sm font-bold transition shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              >
                {t('notif_popup_enable')}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-5">
              <Check className="w-4 h-4" /> {t('acct_notif_enabled')}
            </div>

            <h2 className="text-sm font-bold text-white mb-1">{t('acct_notif_prefs_title')}</h2>
            <p className="text-xs text-zinc-500 mb-5">Turn individual notification types on or off.</p>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{t('acct_pref_orders')}</p>
                  <p className="text-xs text-zinc-500">{t('acct_pref_orders_desc')}</p>
                </div>
                <Toggle checked={prefs.orderUpdates} onChange={() => togglePref('orderUpdates')} />
              </div>

              <div className="h-px bg-zinc-800" />

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{t('acct_pref_promos')}</p>
                  <p className="text-xs text-zinc-500">{t('acct_pref_promos_desc')}</p>
                </div>
                <Toggle checked={prefs.promotions} onChange={() => togglePref('promotions')} />
              </div>

              <div className="h-px bg-zinc-800" />

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{t('acct_pref_new_products')}</p>
                  <p className="text-xs text-zinc-500">{t('acct_pref_new_products_desc')}</p>
                </div>
                <Toggle checked={prefs.newProducts} onChange={() => togglePref('newProducts')} />
              </div>

              <div className="h-px bg-zinc-800" />

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{t('acct_pref_security')}</p>
                  <p className="text-xs text-zinc-500">{t('acct_pref_security_desc')}</p>
                </div>
                <Toggle checked={prefs.securityAlerts} onChange={() => togglePref('securityAlerts')} />
              </div>
            </div>

            <button
              onClick={finish}
              className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white text-sm font-bold transition shadow-[0_0_15px_rgba(239,68,68,0.4)]"
            >
              {t('done_label')}
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>,
    document.body
  );
}
