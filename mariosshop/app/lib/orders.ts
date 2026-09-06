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

// Fired on the current tab whenever orders change, since the native
// `storage` event only fires in *other* tabs, not the one that made the
// change. Components can listen for this to stay in sync immediately.
const ORDERS_UPDATED_EVENT = 'app_orders_updated';

function generateId(): string {
  const random = Math.random().toString(36).slice(2, 9);
  const timestamp = Date.now().toString(36);
  return `${timestamp}-${random}`;
}

function readOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

function writeOrders(orders: Order[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new Event(ORDERS_UPDATED_EVENT));
  } catch {
    // ignore storage errors (e.g. private browsing quota)
  }
}

/** Subscribe to order changes, both cross-tab (native storage event) and
 * same-tab (custom event dispatched by writeOrders). Returns an unsubscribe
 * function for use in a useEffect cleanup. */
export function onOrdersChanged(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(ORDERS_UPDATED_EVENT, callback);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(ORDERS_UPDATED_EVENT, callback);
  };
}

// Alias kept for compatibility with any code that may call it by this name.
export const subscribeToOrders = onOrdersChanged;

/** Creates a new order for a user and persists it. */
export function createOrder(params: {
  email: string;
  items: OrderItem[];
  totalCost: number;
}): Order {
  const now = new Date().toISOString();

  const order: Order = {
    id: generateId(),
    email: params.email,
    items: params.items,
    totalCost: params.totalCost,
    status: 'Pending',
    createdAt: now,
    updatedAt: now,
    messages: [],
  };

  const orders = readOrders();
  orders.unshift(order); // newest first
  writeOrders(orders);

  return order;
}

/** Returns every order in the system (e.g. for an admin dashboard). */
export function getAllOrders(): Order[] {
  return readOrders();
}

/** Returns all orders belonging to a specific user, newest first. */
export function getOrdersByEmail(email: string): Order[] {
  return readOrders().filter((o) => o.email === email);
}

// Alias kept for compatibility with any code that may call it by this name.
export const getOrdersForUser = getOrdersByEmail;

/** Returns a single order by id, or undefined if not found. */
export function getOrderById(orderId: string): Order | undefined {
  return readOrders().find((o) => o.id === orderId);
}

/** Updates an order's status (e.g. from an admin panel). */
export function updateOrderStatus(orderId: string, status: OrderStatus): Order | undefined {
  const orders = readOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return undefined;

  orders[index] = {
    ...orders[index],
    status,
    updatedAt: new Date().toISOString(),
  };
  writeOrders(orders);

  return orders[index];
}

/** Appends a message to an order's conversation thread (client <-> admin). */
export function appendOrderMessage(
  orderId: string,
  sender: OrderMessageSender,
  text: string
): Order | undefined {
  const orders = readOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return undefined;

  const message: OrderMessage = {
    id: generateId(),
    sender,
    text,
    createdAt: new Date().toISOString(),
  };

  orders[index] = {
    ...orders[index],
    messages: [...orders[index].messages, message],
    updatedAt: new Date().toISOString(),
  };
  writeOrders(orders);

  return orders[index];
}

// Alias kept for compatibility with any code that may call it by this name.
export const addMessageToOrder = appendOrderMessage;