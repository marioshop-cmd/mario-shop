/**
 * Shared ticket data layer.
 *
 * All three ticket surfaces (contact form, admin dashboard, client "My Tickets"
 * page) read and write through this file so the localStorage shape never
 * drifts between them. Everything lives under one key: "app_tickets".
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

const STORAGE_KEY = 'app_tickets';

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

/* -------------------------------------------------------------------------- */
/*  Public API                                                                */
/* -------------------------------------------------------------------------- */

export function readTickets(): Ticket[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeTicket);
  } catch {
    return [];
  }
}

function writeTickets(tickets: Ticket[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    return true;
  } catch {
    return false;
  }
}

export function createTicket(input: {
  category: TicketCategory | '';
  subject: string;
  email: string;
  firstMessage: string;
}): Ticket | null {
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

  const tickets = readTickets();
  tickets.unshift(ticket);
  return writeTickets(tickets) ? ticket : null;
}

export function getTicketsByEmail(email: string): Ticket[] {
  const clean = email.trim().toLowerCase();
  return readTickets()
    .filter((t) => t.email.trim().toLowerCase() === clean)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getAllTickets(): Ticket[] {
  return readTickets().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getTicketById(id: string): Ticket | null {
  return readTickets().find((t) => t.id === id) ?? null;
}

/** Adds a message to a ticket's thread. Admin replies auto-move a Pending
 * ticket to "In Progress" so nothing sits forgotten in the queue. */
export function appendMessage(ticketId: string, sender: MessageSender, text: string): Ticket | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const tickets = readTickets();
  const idx = tickets.findIndex((t) => t.id === ticketId);
  if (idx === -1) return null;

  const now = new Date().toISOString();
  tickets[idx].messages.push({ id: generateId('MSG'), sender, text: trimmed, createdAt: now });
  tickets[idx].updatedAt = now;
  if (sender === 'admin' && tickets[idx].status === 'Pending') {
    tickets[idx].status = 'In Progress';
  }

  return writeTickets(tickets) ? tickets[idx] : null;
}

export function updateTicketStatus(ticketId: string, status: TicketStatus): boolean {
  const tickets = readTickets();
  const idx = tickets.findIndex((t) => t.id === ticketId);
  if (idx === -1) return false;

  tickets[idx].status = status;
  tickets[idx].updatedAt = new Date().toISOString();
  return writeTickets(tickets);
}

/** Fires when app_tickets changes in another tab/window, so an admin and a
 * client can have the dashboard and "My Tickets" open side by side and see
 * new messages without a manual refresh. */
export function onTicketsChanged(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
