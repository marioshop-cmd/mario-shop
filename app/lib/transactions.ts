/**
 * B9CHICH transaction ledger. Every balance change (admin injection or a
 * client's purchase) gets logged here, so the admin dashboard can show a
 * full audit trail instead of just the current balance.
 */

export type TransactionType = 'Injection' | 'Purchase';

export interface Transaction {
  id: string;
  email: string;
  type: TransactionType;
  amount: number; // always positive; direction comes from `type`
  balanceAfter: number;
  note?: string;
  orderId?: string; // links a Purchase transaction to its order, so the
  // admin dashboard can show the order's live status right on this row
  createdAt: string; // ISO timestamp
}

const STORAGE_KEY = 'app_transactions';

function generateId(): string {
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TXN-${Date.now().toString().slice(-5)}${random}`;
}

export function readTransactions(): Transaction[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeTransactions(transactions: Transaction[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    return true;
  } catch {
    return false;
  }
}

export function logTransaction(input: {
  email: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  note?: string;
}): void {
  const transaction: Transaction = {
    id: generateId(),
    email: input.email.trim().toLowerCase(),
    type: input.type,
    amount: input.amount,
    balanceAfter: input.balanceAfter,
    note: input.note,
    createdAt: new Date().toISOString(),
  };

  const transactions = readTransactions();
  transactions.unshift(transaction);
  writeTransactions(transactions);
}

export function getAllTransactions(): Transaction[] {
  return readTransactions().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/** Called right after an order is created at checkout, to link the Purchase
 * transaction that was just logged to its order — finds the most recent
 * transaction for this email that doesn't have an orderId yet. */
export function linkTransactionToOrder(email: string, orderId: string): void {
  const clean = email.trim().toLowerCase();
  const transactions = readTransactions();

  let target: Transaction | null = null;
  for (const t of transactions) {
    if (t.email === clean && t.type === 'Purchase' && !t.orderId) {
      if (!target || new Date(t.createdAt) > new Date(target.createdAt)) {
        target = t;
      }
    }
  }
  if (!target) return;

  const updated = transactions.map((t) => (t.id === target!.id ? { ...t, orderId } : t));
  writeTransactions(updated);
}

export function getTransactionsByEmail(email: string): Transaction[] {
  const clean = email.trim().toLowerCase();
  return readTransactions()
    .filter((t) => t.email === clean)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function onTransactionsChanged(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
