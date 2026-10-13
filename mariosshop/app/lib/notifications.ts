/**
 * Shared notification data layer. Notifications now live in Supabase (via
 * /api/notifications), so a notification the admin sends really reaches the
 * client's own phone or computer. The old version kept them in the browser's
 * localStorage, which only the admin's own browser could ever read.
 */

export type NotificationCategory = 'orderUpdate' | 'promotion' | 'newProduct' | 'general';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  /** 'all' for every client; otherwise a list of lowercased emails. */
  recipients: 'all' | string[];
  category: NotificationCategory;
  productId?: number;
  productName?: string;
  /** The product's parent brand id, needed with productId to deep-link to
   * /services?brandId=..&productId=.. */
  brandId?: string;
  createdAt: string; // ISO timestamp
  resentAt: string[]; // ISO timestamps, one per resend
}

export interface NotificationResult {
  success: boolean;
  message: string;
}

const CHANGED_EVENT = 'marios_notifications_changed';
const POLL_MS = 20000;

function lastTime(n: AppNotification): string {
  return n.resentAt.length ? n.resentAt[n.resentAt.length - 1] : n.createdAt;
}

function sortNewestFirst(list: AppNotification[]): AppNotification[] {
  return [...list].sort((a, b) => new Date(lastTime(b)).getTime() - new Date(lastTime(a)).getTime());
}

async function fetchList(url: string, adminKey?: string): Promise<AppNotification[]> {
  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: adminKey ? { 'x-admin-key': adminKey } : undefined,
    });
    if (!response.ok) return [];
    const data: unknown = await response.json();
    return Array.isArray(data) ? sortNewestFirst(data as AppNotification[]) : [];
  } catch (error) {
    console.error('Unable to load notifications:', error);
    return [];
  }
}

/** Admin: every notification ever sent (needs the admin key). */
export function getAllNotifications(adminKey: string): Promise<AppNotification[]> {
  return fetchList('/api/notifications', adminKey);
}

/** A client's own notifications: the ones sent to everyone plus the ones sent to them. */
export function getNotificationsForEmail(email: string): Promise<AppNotification[]> {
  return fetchList(`/api/notifications?email=${encodeURIComponent(email.trim().toLowerCase())}`);
}

async function postAdmin(adminKey: string, payload: Record<string, unknown>): Promise<NotificationResult> {
  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    const result: NotificationResult = {
      success: Boolean(data?.success),
      message: data?.message || (response.ok ? 'Done.' : 'Something went wrong.'),
    };
    if (result.success && typeof window !== 'undefined') {
      window.dispatchEvent(new Event(CHANGED_EVENT));
    }
    return result;
  } catch {
    return { success: false, message: 'Network error. Please try again.' };
  }
}

/** Admin: send a notification to everyone or to a list of emails. */
export function createNotification(
  adminKey: string,
  input: {
    title: string;
    message: string;
    recipients: 'all' | string[];
    category?: NotificationCategory;
    productId?: number;
    productName?: string;
    brandId?: string;
  },
): Promise<NotificationResult> {
  return postAdmin(adminKey, { action: 'create', ...input });
}

/** Admin: resending stamps a new time, so clients see it surface again. */
export function resendNotification(adminKey: string, id: string): Promise<NotificationResult> {
  return postAdmin(adminKey, { action: 'resend', id });
}

/** Admin: delete a notification for everyone. */
export function deleteNotification(adminKey: string, id: string): Promise<NotificationResult> {
  return postAdmin(adminKey, { action: 'delete', id });
}

/** Calls back right after an admin change in this tab, and every 20 seconds
 * while the tab is visible. */
export function onNotificationsChanged(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const onVisible = () => {
    if (!document.hidden) callback();
  };
  window.addEventListener(CHANGED_EVENT, callback);
  document.addEventListener('visibilitychange', onVisible);
  const timer = window.setInterval(() => {
    if (!document.hidden) callback();
  }, POLL_MS);
  return () => {
    window.removeEventListener(CHANGED_EVENT, callback);
    document.removeEventListener('visibilitychange', onVisible);
    window.clearInterval(timer);
  };
}