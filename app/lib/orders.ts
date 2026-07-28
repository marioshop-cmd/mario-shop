/**
 * Shared order data layer. Mirrors lib/tickets.ts on purpose: same
 * localStorage-with-cross-tab-sync pattern, so orders behave consistently
 * with tickets across the app.
 */

export type OrderStatus = 'Pending' | 'Processing' | 'Delivered' | 'Cancelled';

export type OrderMessageSender = 'client' | 'admin';

export interface OrderMessage {
  id: string;
  sender: OrderMessageSender;
  text: string;
  createdAt: string; // ISO timestamp
}

export interface OrderItem {
  productName: string;
  variantLabel?: string;
  priceNumeric: number;
  quantity: number;
}

export interface Order {
  id: string;
  email: string;
  items: OrderItem[];
  totalCost: number;
  status: OrderStatus;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  messages: OrderMessage[];
}

export const ORDER_STATUSES: OrderStatus[] = ['Pending', 'Processing', 'Delivered', 'Cancelled'];

const STORAGE_KEY = 'app_orders';

function generateId(): string {
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${Date.now().toString().slice(-5)}${random}`;
}

function generateMessageId(): string {
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `OMSG-${Date.now().toString().slice(-5)}${random}`;
}

/** Older orders (created before chat support) won't have a `messages`
 * array — upgrade them in place so the rest of the app never has to check. */
function normalizeOrder(raw: any): Order {
  return {
    id: raw.id,
    email: raw.email,
    items: Array.isArray(raw.items) ? raw.items : [],
    totalCost: raw.totalCost ?? 0,
    status: raw.status ?? 'Pending',
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? raw.createdAt ?? new Date().toISOString(),
    messages: Array.isArray(raw.messages) ? raw.messages : [],
  };
}

export function readOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeOrder);
  } catch {
    return [];
  }
}

function writeOrders(orders: Order[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    return true;
  } catch {
    return false;
  }
}

export function createOrder(input: { email: string; items: OrderItem[]; totalCost: number }): Order | null {
  const now = new Date().toISOString();
  const order: Order = {
    id: generateId(),
    email: input.email.trim().toLowerCase(),
    items: input.items,
    totalCost: input.totalCost,
    status: 'Pending',
    createdAt: now,
    updatedAt: now,
    messages: [],
  };

  const orders = readOrders();
  orders.unshift(order);
  return writeOrders(orders) ? order : null;
}

export function getOrdersByEmail(email: string): Order[] {
  const clean = email.trim().toLowerCase();
  return readOrders()
    .filter((o) => o.email === clean)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getAllOrders(): Order[] {
  return readOrders().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function updateOrderStatus(orderId: string, status: OrderStatus): boolean {
  const orders = readOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return false;

  orders[idx].status = status;
  orders[idx].updatedAt = new Date().toISOString();
  return writeOrders(orders);
}

/** Adds a chat message to an order's thread — used for things like the
 * client sharing their account email for a subscription order, and the
 * admin replying with delivery details. */
export function appendOrderMessage(orderId: string, sender: OrderMessageSender, text: string): Order | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const orders = readOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return null;

  const now = new Date().toISOString();
  orders[idx].messages.push({ id: generateMessageId(), sender, text: trimmed, createdAt: now });
  orders[idx].updatedAt = now;

  return writeOrders(orders) ? orders[idx] : null;
}

export function onOrdersChanged(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
