/**
 * What a client wants to be notified about, and whether pop-up notifications
 * are switched on for their account. Both live in this device's storage.
 * The account Notifications page and the pop-up manager share this file, so
 * they can never disagree.
 */

import type { NotificationCategory } from './notifications';

export type NotificationPrefs = {
  orderUpdates: boolean;
  promotions: boolean;
  newProducts: boolean;
  securityAlerts: boolean;
};

export const DEFAULT_PREFS: NotificationPrefs = {
  orderUpdates: true,
  promotions: false,
  newProducts: true,
  securityAlerts: true,
};

// Same key the account page has always used, so nobody loses their settings.
export const PREFS_STORAGE_KEY = 'notification-prefs';

const STATUS_PREFIX = 'notif-status-';
export const STATUS_EVENT = 'marios_notif_status_changed';

export function loadPrefs(): NotificationPrefs {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: NotificationPrefs): void {
  try {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* storage not available */
  }
}

/** null = never answered (the site will ask), 'enabled', or 'disabled' (turned off on purpose). */
export type NotifStatus = 'enabled' | 'disabled' | null;

export function getNotifStatus(email: string): NotifStatus {
  try {
    const value = localStorage.getItem(STATUS_PREFIX + email.toLowerCase());
    return value === 'enabled' || value === 'disabled' ? value : null;
  } catch {
    return null;
  }
}

export function setNotifStatus(email: string, status: 'enabled' | 'disabled'): void {
  try {
    localStorage.setItem(STATUS_PREFIX + email.toLowerCase(), status);
  } catch {
    /* storage not available */
  }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(STATUS_EVENT));
}

export type NotifPreset = 'all' | 'discounts' | 'products' | 'orders';

export const PRESETS: { value: NotifPreset; label: string; hint: string }[] = [
  { value: 'all', label: 'Everything', hint: 'Orders, discounts and new products' },
  { value: 'discounts', label: 'Only discounts', hint: 'Promotions and offers' },
  { value: 'products', label: 'Only new products', hint: 'When something new arrives' },
  { value: 'orders', label: 'Only order updates', hint: 'Status changes on your orders' },
];

export function prefsForPreset(preset: NotifPreset): NotificationPrefs {
  return {
    orderUpdates: preset === 'all' || preset === 'orders',
    promotions: preset === 'all' || preset === 'discounts',
    newProducts: preset === 'all' || preset === 'products',
    securityAlerts: true,
  };
}

/** "General" messages go to everyone who has pop-ups on; the other
 * categories follow the client's own choices. */
export function isCategoryAllowed(prefs: NotificationPrefs, category: NotificationCategory): boolean {
  switch (category) {
    case 'orderUpdate':
      return prefs.orderUpdates;
    case 'promotion':
      return prefs.promotions;
    case 'newProduct':
      return prefs.newProducts;
    default:
      return true;
  }
}