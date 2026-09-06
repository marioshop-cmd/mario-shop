/**
 * Shared notification data layer — admin sends updates (about a product,
 * a promo, anything) to all clients or to a hand-picked list, and can
 * resend the same notification later. Mirrors the tickets.ts pattern so
 * anyone reading that file will recognize this one immediately.
 */

export type NotificationCategory = 'orderUpdate' | 'promotion' | 'newProduct' | 'general';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  /** 'all' broadcasts to every client; otherwise a list of lowercased emails. */
  recipients: 'all' | string[];
  /** Matches the categories clients can toggle on their own Notifications
   * page (orderUpdates/promotions/newProducts). Currently used for
   * labeling/organizing sent notifications only — actually filtering who
   * receives one by their personal toggle isn't possible yet since those
   * preferences live in each client's own browser storage, not anywhere
   * the admin side can read. */
  category: NotificationCategory;
  productId?: number;
  productName?: string;
  /** The product's parent brand id (BrandService.id in products.ts) —
   * needed alongside productId to deep-link to /services?brandId=..&productId=..
   * since products aren't addressable by productId alone. */
  brandId?: string;
  createdAt: string; // ISO timestamp
  resentAt: string[]; // ISO timestamps, one per resend
}

const STORAGE_KEY = 'app_notifications';

function generateId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${Date.now().toString().slice(-5)}${random}`;
}

export function readNotifications(): AppNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((n: any) => ({
      ...n,
      resentAt: Array.isArray(n.resentAt) ? n.resentAt : [],
      category: n.category || 'general',
    }));
  } catch {
    return [];
  }
}

function writeNotifications(list: AppNotification[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

export function createNotification(input: {
  title: string;
  message: string;
  recipients: 'all' | string[];
  category?: NotificationCategory;
  productId?: number;
  productName?: string;
  brandId?: string;
}): AppNotification | null {
  const notification: AppNotification = {
    id: generateId('NOTIF'),
    title: input.title.trim(),
    message: input.message.trim(),
    recipients: input.recipients === 'all' ? 'all' : input.recipients.map((e) => e.trim().toLowerCase()),
    category: input.category || 'general',
    productId: input.productId,
    productName: input.productName,
    brandId: input.brandId,
    createdAt: new Date().toISOString(),
    resentAt: [],
  };

  const all = readNotifications();
  all.unshift(notification);
  return writeNotifications(all) ? notification : null;
}

/** Resending doesn't duplicate the entry — it just stamps a new resend time
 * so clients see it surface again and admins can see the send history. */
export function resendNotification(id: string): boolean {
  const all = readNotifications();
  const idx = all.findIndex((n) => n.id === id);
  if (idx === -1) return false;
  all[idx].resentAt.push(new Date().toISOString());
  return writeNotifications(all);
}

export function getAllNotifications(): AppNotification[] {
  return readNotifications().sort((a, b) => {
    const aTime = a.resentAt.length ? a.resentAt[a.resentAt.length - 1] : a.createdAt;
    const bTime = b.resentAt.length ? b.resentAt[b.resentAt.length - 1] : b.createdAt;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });
}

export function getNotificationsForEmail(email: string): AppNotification[] {
  const clean = email.trim().toLowerCase();
  return getAllNotifications().filter(
    (n) => n.recipients === 'all' || (Array.isArray(n.recipients) && n.recipients.includes(clean))
  );
}

export function onNotificationsChanged(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}