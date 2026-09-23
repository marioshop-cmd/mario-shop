import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Shared ticket data layer.
 *
 * All ticket surfaces (contact form, "Add B9CHICH" form, admin dashboard,
 * client "My Tickets" page) read and write through this file. It used to be
 * backed by localStorage, which meant a ticket only ever existed in the
 * browser that created it — an admin on a different device could never see
 * it. This now persists to Supabase, the same pattern as lib/products.ts
 * and lib/homeReviews.ts, so every ticket is visible to everyone who should
 * see it, on any device.
 *
 * NOTE: every function here is now async (it was synchronous before). Any
 * call site needs `await` (or `.then()`).
 */

export type TicketStatus = 'Pending' | 'In Progress' | 'Resolved' | 'Closed';

export type TicketCategory =
  | 'Order Issue'
  | 'Code Problem'
  | 'Payment & Billing'
  | 'Refund Request'
  | 'Account & Security'
  | 'Other';

export type MessageSender = 'client' | 'admin';

export interface TicketMessage {
  id: string;
  sender: MessageSender;
  text: string;
  createdAt: string; // ISO timestamp
}

export interface Ticket {
  id: string;
  category: TicketCategory | '';
  subject: string;
  email: string; // used to link the ticket to a client account
  status: TicketStatus;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  messages: TicketMessage[];
}

export const TICKET_CATEGORIES: TicketCategory[] = [
  'Order Issue',
  'Code Problem',
  'Payment & Billing',
  'Refund Request',
  'Account & Security',
  'Other',
];

export const TICKET_STATUSES: TicketStatus[] = ['Pending', 'In Progress', 'Resolved', 'Closed'];

const REALTIME_TABLE = 'tickets';

/* -------------------------------------------------------------------------- */
/*  Internal helpers                                                          */
/* -------------------------------------------------------------------------- */

function generateId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${Date.now().toString().slice(-5)}${random}`;
}

/** Upgrades tickets saved by older versions of the contact form (which only
 * had a single `message` + `response` string) to the new `messages[]` shape. */
function normalizeTicket(raw: any): Ticket {
  if (Array.isArray(raw.messages)) {
    return {
      id: raw.id,
      category: raw.category ?? '',
      subject: raw.subject ?? '',
      email: raw.email ?? 'Guest',
      status: raw.status ?? 'Pending',
      createdAt: raw.createdAt ?? new Date().toISOString(),
      updatedAt: raw.updatedAt ?? raw.createdAt ?? new Date().toISOString(),
      messages: raw.messages,
    };
  }

  const createdAt = raw.createdAt ?? new Date().toISOString();
  const messages: TicketMessage[] = [];
  if (raw.message) {
    messages.push({ id: generateId('MSG'), sender: 'client', text: raw.message, createdAt });
  }
  if (raw.response) {
    messages.push({ id: generateId('MSG'), sender: 'admin', text: raw.response, createdAt });
  }

  return {
    id: raw.id,
    category: raw.category ?? '',
    subject: raw.subject ?? '',
    email: raw.email ?? 'Guest',
    status: raw.status ?? 'Pending',
    createdAt,
    updatedAt: createdAt,
    messages,
  };
}

async function readTicketsRaw(): Promise<Ticket[]> {
  const response = await fetch('/api/tickets', { cache: 'no-store' });
  const parsed: unknown = await response.json();
  if (!response.ok) {
    const details =
      parsed && typeof parsed === 'object' && 'details' in parsed
        ? String((parsed as { details: unknown }).details)
        : 'Unknown server error';
    throw new Error(`Unable to load tickets: ${details}`);
  }
  return Array.isArray(parsed) ? parsed.map(normalizeTicket) : [];
}

async function writeTickets(tickets: Ticket[]): Promise<boolean> {
  const response = await fetch('/api/tickets', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tickets),
  });
  return response.ok;
}

/* -------------------------------------------------------------------------- */
/*  Public API — all async now                                                */
/* -------------------------------------------------------------------------- */

export async function readTickets(): Promise<Ticket[]> {
  return readTicketsRaw();
}

export async function createTicket(input: {
  category: TicketCategory | '';
  subject: string;
  email: string;
  firstMessage: string;
}): Promise<Ticket | null> {
  const now = new Date().toISOString();
  const ticket: Ticket = {
    id: generateId('TICK'),
    category: input.category,
    subject: input.subject.trim(),
    email: input.email.trim() || 'Guest',
    status: 'Pending',
    createdAt: now,
    updatedAt: now,
    messages: [{ id: generateId('MSG'), sender: 'client', text: input.firstMessage.trim(), createdAt: now }],
  };

  const tickets = await readTicketsRaw();
  tickets.unshift(ticket);
  const saved = await writeTickets(tickets);
  return saved ? ticket : null;
}

export async function getTicketsByEmail(email: string): Promise<Ticket[]> {
  const clean = email.trim().toLowerCase();
  const tickets = await readTicketsRaw();
  return tickets
    .filter((t) => t.email.trim().toLowerCase() === clean)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function getAllTickets(): Promise<Ticket[]> {
  const tickets = await readTicketsRaw();
  return tickets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function getTicketById(id: string): Promise<Ticket | null> {
  const tickets = await readTicketsRaw();
  return tickets.find((t) => t.id === id) ?? null;
}

/** Adds a message to a ticket's thread. Admin replies auto-move a Pending
 * ticket to "In Progress" so nothing sits forgotten in the queue. */
export async function appendMessage(ticketId: string, sender: MessageSender, text: string): Promise<Ticket | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const tickets = await readTicketsRaw();
  const idx = tickets.findIndex((t) => t.id === ticketId);
  if (idx === -1) return null;

  const now = new Date().toISOString();
  tickets[idx].messages.push({ id: generateId('MSG'), sender, text: trimmed, createdAt: now });
  tickets[idx].updatedAt = now;
  if (sender === 'admin' && tickets[idx].status === 'Pending') {
    tickets[idx].status = 'In Progress';
  }

  const saved = await writeTickets(tickets);
  return saved ? tickets[idx] : null;
}

export async function updateTicketStatus(ticketId: string, status: TicketStatus): Promise<boolean> {
  const tickets = await readTicketsRaw();
  const idx = tickets.findIndex((t) => t.id === ticketId);
  if (idx === -1) return false;

  tickets[idx].status = status;
  tickets[idx].updatedAt = new Date().toISOString();
  return writeTickets(tickets);
}

/* -------------------------------------------------------------------------- */
/*  Realtime — same shared-channel pattern as lib/products.ts                 */
/* -------------------------------------------------------------------------- */

let realtimeClient: SupabaseClient | null = null;

function getRealtimeClient(): SupabaseClient | null {
  if (realtimeClient) return realtimeClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  realtimeClient = createClient(url, key);
  return realtimeClient;
}

const changeListeners = new Set<() => void>();
let sharedChannel: ReturnType<NonNullable<ReturnType<typeof getRealtimeClient>>['channel']> | null = null;
let sharedInterval: number | null = null;

function notifyAllListeners() {
  changeListeners.forEach((listener) => listener());
}

function ensureSharedSubscription() {
  const client = getRealtimeClient();
  if (!client) return;

  if (!sharedChannel) {
    sharedChannel = client
      .channel('tickets-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: REALTIME_TABLE },
        notifyAllListeners,
      )
      .subscribe();
  }

  if (sharedInterval === null) {
    // Fallback for deployments where Realtime hasn't been enabled for this
    // table yet — an admin and a client can still both have a ticket open
    // and see new messages within 30s instead of needing a manual refresh.
    sharedInterval = window.setInterval(notifyAllListeners, 30000);
  }
}

/** Fires when the shared tickets table changes, so an admin and a client can
 * have the dashboard and "My Tickets" open side by side and see new
 * messages without a manual refresh. Same signature as before — only the
 * mechanism underneath changed (Supabase realtime instead of the
 * same-device-only `storage` event). */
export function onTicketsChanged(callback: () => void): () => void {
  changeListeners.add(callback);
  ensureSharedSubscription();

  return () => {
    changeListeners.delete(callback);
    if (changeListeners.size === 0) {
      if (sharedInterval !== null) {
        window.clearInterval(sharedInterval);
        sharedInterval = null;
      }
      if (sharedChannel) {
        const client = getRealtimeClient();
        void client?.removeChannel(sharedChannel);
        sharedChannel = null;
      }
    }
  };
}
