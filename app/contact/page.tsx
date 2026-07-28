'use client';

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { createTicket, TICKET_CATEGORIES, type TicketCategory } from '@/app/lib/tickets';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type Tab = 'help' | 'ticket';

interface HelpCategory {
  title: string;
  subtitle: string;
  icon: string;
  items: string[];
}

interface FormErrors {
  email?: string;
  category?: string;
  subject?: string;
  message?: string;
}

/* -------------------------------------------------------------------------- */
/*  Static data                                                               */
/* -------------------------------------------------------------------------- */

const HELP_CATEGORIES: HelpCategory[] = [
  {
    title: 'Order Issues',
    subtitle: 'Track orders, delivery delays, missing codes',
    icon: '📦',
    items: ['Where is my order?', "I didn't receive my code", 'My order is stuck on processing'],
  },
  {
    title: 'Code Problems',
    subtitle: 'Invalid codes, already redeemed, wrong region',
    icon: '🔑',
    items: ["My code doesn't work", 'Code says already redeemed', 'Wrong region code received'],
  },
  {
    title: 'Payment & Billing',
    subtitle: 'Payment failures, charges, invoices',
    icon: '💳',
    items: ['Payment was declined', 'I was charged twice', 'How to get an invoice'],
  },
  {
    title: 'Refunds & Returns',
    subtitle: 'Request a refund, refund status, policy',
    icon: '🔄',
    items: ['How to request a refund', 'Refund processing time', 'Refund eligibility'],
  },
  {
    title: 'Account & Security',
    subtitle: 'Login issues, password reset, 2FA',
    icon: '🛡️',
    items: ["Can't log into my account", 'Reset my password', 'Enable two-factor auth'],
  },
  {
    title: 'General Questions',
    subtitle: 'Subscriptions, regions, platforms',
    icon: '❓',
    items: ['How subscriptions work', 'Which region should I choose?', 'Supported platforms'],
  },
];

const CONTACT_METHODS = [
  { label: 'Email', value: 'support@mariosshop.tn', href: 'mailto:support@mariosshop.tn' },
  { label: 'Live Chat', value: 'Available for all customers', href: undefined },
  { label: 'Response Time', value: 'Under 2 hours on average', href: undefined },
];

const MESSAGE_MAX_LENGTH = 1000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* -------------------------------------------------------------------------- */
/*  Small building blocks                                                     */
/* -------------------------------------------------------------------------- */

function StatusDot({ className = '' }: { className?: string }) {
  return <span className={`h-2 w-2 rounded-full ${className}`} />;
}

function DiscordIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z"
      />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
      />
    </svg>
  );
}

function TicketIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}

function HelpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function ChatIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
    </svg>
  );
}

function InboxIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12h4l2 3h6l2-3h4M5 5h14l1.5 7.5v6a2 2 0 01-2 2H5.5a2 2 0 01-2-2v-6L5 5z"
      />
    </svg>
  );
}

function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Field wrapper: label + error, fully accessible                            */
/* -------------------------------------------------------------------------- */

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}

function Field({ label, htmlFor, error, hint, children }: FieldProps) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label htmlFor={htmlFor} className="block text-xs font-bold text-zinc-300">
          {label}
        </label>
        {hint}
      </div>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-[11px] font-semibold text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

const inputBase =
  'w-full rounded-xl border bg-zinc-950 p-3 text-xs text-white outline-none transition placeholder:text-zinc-600 focus:ring-2 focus:ring-red-500/30 disabled:cursor-not-allowed disabled:opacity-50';

function fieldBorder(hasError?: string) {
  return hasError ? 'border-red-500/70 focus:border-red-500' : 'border-zinc-800 focus:border-red-500';
}

/* -------------------------------------------------------------------------- */
/*  Contact page                                                              */
/* -------------------------------------------------------------------------- */

export default function ContactPage() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('help');
  const searchParams = useSearchParams();

  // Coming from a "need help / insufficient balance" link elsewhere on the
  // site (?tab=ticket&reason=balance) — jump straight to the ticket form,
  // pre-filled, instead of making the person navigate and re-explain.
  useEffect(() => {
    if (searchParams.get('tab') === 'ticket') {
      setActiveTab('ticket');
      if (searchParams.get('reason') === 'balance') {
        setCategory('Payment & Billing');
        setSubject('B9CHICH balance top-up request');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Form state
  const [category, setCategory] = useState<TicketCategory | ''>('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(currentUser?.email ?? '');

  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [lastTicketId, setLastTicketId] = useState<string | null>(null);

  const subjectInputRef = useRef<HTMLInputElement>(null);
  const formId = useId();
  const isLoggedIn = Boolean(currentUser);

  // Keep the email field in sync with the active account so the ticket is
  // always linked correctly for "My Tickets".
  useEffect(() => {
    if (currentUser?.email) setEmail(currentUser.email);
  }, [currentUser?.email]);

  const validate = useCallback((): FormErrors => {
    const next: FormErrors = {};
    if (!email.trim()) next.email = 'Enter your email so we can reach you.';
    else if (!EMAIL_PATTERN.test(email.trim())) next.email = 'Enter a valid email address.';

    if (!category) next.category = 'Choose a category.';
    if (!subject.trim()) next.subject = 'Give your ticket a short subject.';
    else if (subject.trim().length < 4) next.subject = 'Subject should be at least 4 characters.';

    if (!message.trim()) next.message = 'Describe your issue.';
    else if (message.trim().length < 10) next.message = 'Add a few more details (10+ characters).';
    else if (message.length > MESSAGE_MAX_LENGTH) next.message = `Keep it under ${MESSAGE_MAX_LENGTH} characters.`;

    return next;
  }, [email, category, subject, message]);

  const resetForm = useCallback(() => {
    setCategory('');
    setSubject('');
    setMessage('');
    setEmail(currentUser?.email ?? '');
    setErrors({});
  }, [currentUser?.email]);

  const handleTicketSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const validationErrors = validate();
      setErrors(validationErrors);
      if (Object.keys(validationErrors).length > 0) return;

      setStatus('submitting');

      // Simulate a brief network round-trip so submitting state is visible,
      // then persist locally.
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newTicket = createTicket({
        category,
        subject,
        email,
        firstMessage: message,
      });

      if (!newTicket) {
        setStatus('error');
        return;
      }

      setLastTicketId(newTicket.id);
      setStatus('success');
      resetForm();
    },
    [category, subject, message, email, validate, resetForm]
  );

  useEffect(() => {
    if (status !== 'success') return;
    const timer = setTimeout(() => setStatus('idle'), 5000);
    return () => clearTimeout(timer);
  }, [status]);

  const messageLength = message.length;
  const messageOverLimit = messageLength > MESSAGE_MAX_LENGTH;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = useMemo(
    () => [
      { id: 'help', label: 'Help Center', icon: <HelpIcon className="h-4 w-4 text-red-500" /> },
      { id: 'ticket', label: 'Contact Us', icon: <TicketIcon className="h-4 w-4 text-red-500" /> },
    ],
    []
  );

  return (
    <main className="space-y-12 bg-zinc-950 px-4 pb-16 pt-28 text-white sm:px-6 sm:pt-32 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-12">
        {/* Social section */}
        <section className="space-y-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <StatusDot className="animate-pulse bg-red-500" />
            Connect With Us
          </div>

          <h1 className="text-4xl font-black tracking-tight md:text-5xl">
            OUR SOCIAL <span className="text-red-500">MEDIA</span>
          </h1>

          <p className="mx-auto max-w-lg text-xs text-zinc-400 md:text-sm">
            Stay connected for instant stock updates, giveaways, and community support.
          </p>

          <div className="mx-auto grid max-w-md grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
            <a
              href="https://discord.gg"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 text-sm font-black tracking-wider text-zinc-200 shadow-lg transition-all duration-300 hover:scale-[1.03] hover:border-indigo-500 hover:text-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <DiscordIcon className="h-5 w-5" />
              DISCORD
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 text-sm font-black tracking-wider text-zinc-200 shadow-lg transition-all duration-300 hover:scale-[1.03] hover:border-pink-500 hover:text-pink-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
            >
              <InstagramIcon className="h-5 w-5" />
              INSTAGRAM
            </a>
          </div>
        </section>

        {/* Status bar */}
        <div className="mx-auto flex max-w-fit flex-wrap items-center justify-center gap-6 rounded-full border border-zinc-800/80 bg-zinc-900/60 px-6 py-2 text-xs font-semibold text-zinc-300">
          <div className="flex items-center gap-2">
            <StatusDot className="bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span>All Systems Operational</span>
          </div>
          <div className="text-zinc-600" aria-hidden="true">•</div>
          <div>
            Avg. response: <span className="font-bold text-white">&lt; 2 hours</span>
          </div>
          <div className="text-zinc-600" aria-hidden="true">•</div>
          <div>
            Satisfaction: <span className="font-bold text-red-500">98%</span>
          </div>
        </div>

        {/* Tabs */}
        <div role="tablist" aria-label="Support sections" className="flex justify-center gap-3">
          {tabs.map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                id={`${formId}-tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`${formId}-panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-full border px-6 py-2.5 text-xs font-extrabold tracking-wider transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                  selected
                    ? 'border-red-500/80 bg-zinc-900 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}

          <Link
            href="/my-tickets"
            className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-6 py-2.5 text-xs font-extrabold tracking-wider text-zinc-400 transition-all duration-300 hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <InboxIcon className="h-4 w-4 text-red-500" />
            My Tickets
          </Link>
        </div>

        {/* Help center */}
        {activeTab === 'help' && (
          <div
            role="tabpanel"
            id={`${formId}-panel-help`}
            aria-labelledby={`${formId}-tab-help`}
            className="grid animate-[fadeIn_0.3s_ease] gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {HELP_CATEGORIES.map((cat) => (
              <div
                key={cat.title}
                className="group rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 transition-all duration-300 hover:border-red-500/50"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-lg transition-transform group-hover:scale-110">
                  <span aria-hidden="true">{cat.icon}</span>
                </div>
                <h3 className="text-base font-black text-white">{cat.title}</h3>
                <p className="mb-4 mt-1 text-xs text-zinc-400">{cat.subtitle}</p>

                <ul className="space-y-2 border-t border-zinc-800/60 pt-4 text-xs text-zinc-300">
                  {cat.items.map((item) => (
                    <li key={item}>
                      <button
                        type="button"
                        onClick={() => setActiveTab('ticket')}
                        className="flex w-full items-center gap-2 rounded text-left transition hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                      >
                        <span className="font-bold text-red-500" aria-hidden="true">•</span>
                        <span>{item}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Ticket form */}
        {activeTab === 'ticket' && (
          <div
            role="tabpanel"
            id={`${formId}-panel-ticket`}
            aria-labelledby={`${formId}-tab-ticket`}
            className="mx-auto max-w-xl animate-[fadeIn_0.3s_ease] rounded-3xl border border-red-500/30 bg-zinc-900/80 p-8 shadow-[0_0_35px_rgba(239,68,68,0.12)]"
          >
            <h2 className="mb-2 text-center text-2xl font-black text-white">Submit a Ticket</h2>
            <p className="mb-6 text-center text-xs text-zinc-400">
              Fill out the form below and our support team will get back to you.
            </p>

            {status === 'success' ? (
              <div
                role="status"
                className="space-y-1 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-center text-xs font-bold text-emerald-400"
              >
                <p>🎉 Ticket submitted successfully.</p>
                {lastTicketId && (
                  <p className="font-mono text-[11px] font-semibold text-emerald-300">
                    Reference: {lastTicketId}
                  </p>
                )}
                {isLoggedIn && (
                  <p className="pt-1 font-normal normal-case tracking-normal text-emerald-300/80">
                    Track replies anytime in{' '}
                    <Link href="/my-tickets" className="font-bold underline underline-offset-2 hover:text-emerald-200">
                      My Tickets
                    </Link>
                    .
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} noValidate className="space-y-4">
                {status === 'error' && (
                  <div role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs font-semibold text-red-400">
                    Something went wrong saving your ticket. Please try again.
                  </div>
                )}

                <Field
                  label="Your Email"
                  htmlFor={`${formId}-email`}
                  error={errors.email}
                  hint={
                    isLoggedIn ? (
                      <span className="text-[10px] font-semibold text-zinc-500">Linked to your account</span>
                    ) : undefined
                  }
                >
                  <input
                    id={`${formId}-email`}
                    type="email"
                    placeholder="yourname@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === 'submitting' || isLoggedIn}
                    aria-invalid={Boolean(errors.email)}
                    className={`${inputBase} ${fieldBorder(errors.email)}`}
                  />
                </Field>
                {!isLoggedIn && (
                  <p className="-mt-2 text-[11px] text-zinc-500">
                    <Link href="/login" className="font-semibold text-red-400 hover:underline">
                      Log in
                    </Link>{' '}
                    to track replies to this ticket in one place.
                  </p>
                )}

                <Field label="Category" htmlFor={`${formId}-category`} error={errors.category}>
                  <select
                    id={`${formId}-category`}
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TicketCategory)}
                    disabled={status === 'submitting'}
                    aria-invalid={Boolean(errors.category)}
                    className={`${inputBase} ${fieldBorder(errors.category)}`}
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {TICKET_CATEGORIES.map((c: TicketCategory) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Subject" htmlFor={`${formId}-subject`} error={errors.subject}>
                  <input
                    id={`${formId}-subject`}
                    ref={subjectInputRef}
                    type="text"
                    placeholder="Brief description"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={status === 'submitting'}
                    aria-invalid={Boolean(errors.subject)}
                    className={`${inputBase} ${fieldBorder(errors.subject)}`}
                  />
                </Field>

                <Field
                  label="Message"
                  htmlFor={`${formId}-message`}
                  error={errors.message}
                  hint={
                    <span className={`text-[10px] font-semibold ${messageOverLimit ? 'text-red-400' : 'text-zinc-500'}`}>
                      {messageLength}/{MESSAGE_MAX_LENGTH}
                    </span>
                  }
                >
                  <textarea
                    id={`${formId}-message`}
                    rows={4}
                    placeholder="Describe your issue in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={status === 'submitting'}
                    aria-invalid={Boolean(errors.message)}
                    className={`${inputBase} resize-none ${fieldBorder(errors.message)}`}
                  />
                </Field>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status === 'submitting' ? (
                    <>
                      <Spinner />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <TicketIcon className="h-4 w-4" />
                      Submit Ticket
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Other ways to reach us */}
        <div className="border-t border-zinc-900 pt-8">
          <h3 className="mb-6 text-center text-lg font-black tracking-tight">Other Ways to Reach Us</h3>

          <div className="grid gap-4 sm:grid-cols-3">
            {CONTACT_METHODS.map((method) => (
              <div
                key={method.label}
                className="space-y-1 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 text-center"
              >
                <span className="block text-xs font-bold text-zinc-400">{method.label}</span>
                {method.href ? (
                  <a
                    href={method.href}
                    className="text-xs font-extrabold text-red-500 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    {method.value}
                  </a>
                ) : (
                  <span className="text-xs font-extrabold text-white">{method.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating chat button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={isChatOpen}
            className="flex items-center gap-2 rounded-full border border-red-400/40 bg-gradient-to-r from-red-600 to-red-800 px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all duration-300 hover:scale-105 hover:from-red-500 hover:to-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          >
            <div className="relative">
              <ChatIcon className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-pulse rounded-full border border-zinc-900 bg-emerald-400" />
            </div>
            <span>CHAT WITH US</span>
          </button>
        ) : (
          <div
            role="dialog"
            aria-label="Live support"
            className="w-80 animate-[fadeIn_0.2s_ease] space-y-3 rounded-2xl border border-red-500/40 bg-zinc-900 p-4 shadow-[0_0_30px_rgba(0,0,0,0.8)]"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <StatusDot className="animate-pulse bg-emerald-500" />
                <span className="text-xs font-black text-white">Live Support</span>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                aria-label="Close live support"
                className="rounded text-sm font-bold text-zinc-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-zinc-300">
              Need quick help? Submit a ticket using the form or reach out directly on Discord for an instant
              reply.
            </p>
            <button
              onClick={() => {
                setActiveTab('ticket');
                setIsChatOpen(false);
                subjectInputRef.current?.focus();
              }}
              className="w-full rounded-xl bg-red-600 py-2 text-xs font-extrabold text-white transition hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              Open Support Ticket
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
