
/**
 * Shared transaction log. Mirrors the same localStorage-with-cross-tab-sync
 * pattern as lib/orders.ts and lib/products.ts.
 *
 * A "transaction" is any change to a user's B9CHICH balance:
 *   - 'Injection' → admin manually tops up a client's balance
 *   - 'Purchase'  → a client spends balance at checkout
 *
 * Purchases are logged the moment spendB9chich() succeeds (before the order
 * even exists yet), then linkTransactionToOrder() attaches the resulting
 * order id right after createOrder() runs — that's why the two happen as
 * separate steps instead of one.
 */
 
export type TransactionType = 'Injection' | 'Purchase';
 
export interface Transaction {
  id: string;
  email: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  note?: string;
  createdAt: string; // ISO timestamp
  orderId?: string;
}
 
const STORAGE_KEY = 'mario_transactions';
 
// Fired on the current tab whenever transactions change, since the native
// `storage` event only fires in *other* tabs, not the one that made the
// change.
const TRANSACTIONS_UPDATED_EVENT = 'mario_transactions_updated';
 
function generateId(): string {
  const random = Math.random().toString(36).slice(2, 9);
  const timestamp = Date.now().toString(36);
  return `txn_${timestamp}-${random}`;
}
 
function readTransactions(): Transaction[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Transaction[]) : [];
  } catch {
    return [];
  }
}
 
function writeTransactions(transactions: Transaction[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    window.dispatchEvent(new Event(TRANSACTIONS_UPDATED_EVENT));
  } catch {
    // ignore storage errors (e.g. private browsing quota)
  }
}
 
/** Logs a new transaction (an admin top-up or a client purchase). */
export function logTransaction(input: {
  email: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  note?: string;
}): Transaction {
  const transaction: Transaction = {
    id: generateId(),
    email: input.email,
    type: input.type,
    amount: input.amount,
    balanceAfter: input.balanceAfter,
    note: input.note,
    createdAt: new Date().toISOString(),
  };
 
  const transactions = readTransactions();
  transactions.unshift(transaction); // newest first
  writeTransactions(transactions);
 
  return transaction;
}
 
/**
 * Attaches an order id to the most recent Purchase transaction for a user
 * that doesn't already have one linked. Called right after an order is
 * created during checkout, so the admin table can show which order each
 * purchase transaction belongs to.
 */
export function linkTransactionToOrder(email: string, orderId: string | number): Transaction | undefined {
  const transactions = readTransactions();
 
  const index = transactions.findIndex(
    (t) => t.email === email && t.type === 'Purchase' && !t.orderId
  );
  if (index === -1) return undefined;
 
  transactions[index] = { ...transactions[index], orderId: String(orderId) };
  writeTransactions(transactions);
 
  return transactions[index];
}
 
/** Returns every transaction ever recorded, newest first (for the admin table). */
export function getAllTransactions(): Transaction[] {
  return readTransactions();
}
 
/** Returns every transaction recorded for a given user email. */
export function getTransactionsForUser(email: string): Transaction[] {
  return readTransactions().filter((t) => t.email === email);
}
 
/** Subscribe to transaction changes, both cross-tab (native storage event)
 * and same-tab (custom event dispatched by writeTransactions). Returns an
 * unsubscribe function for use in a useEffect cleanup. */
export function onTransactionsChanged(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
 
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
 
  window.addEventListener('storage', handleStorage);
  window.addEventListener(TRANSACTIONS_UPDATED_EVENT, callback);
 
  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(TRANSACTIONS_UPDATED_EVENT, callback);
  };
}
 
