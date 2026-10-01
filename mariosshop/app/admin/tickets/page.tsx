'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  appendMessage,
  getAllTickets,
  onTicketsChanged,
  TICKET_STATUSES,
  updateTicketStatus,
  type Ticket,
  type TicketStatus,
} from '../../lib/tickets';
import { useAuth } from '../../context/AuthContext';

import AdminTicketCenter from './AdminTicketCenter';

export default function Page() {
  return <AdminTicketCenter paneHeight="min-h-[70vh]" />;
}