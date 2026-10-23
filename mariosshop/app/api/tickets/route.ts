import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase environment variables are not configured');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Sends a small alert to n8n. It can never break the site: errors are only logged.
async function notify(table: string, id: string): Promise<void> {
  const url = process.env.N8N_ORDER_WEBHOOK_URL;
  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (!url || !secret) return;

  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-secret': secret,
      },
      body: JSON.stringify({ record: { table, id } }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (error) {
    console.error('notify failed', error);
  }
}

export async function GET() {
  let supabase;
  try {
    supabase = getSupabase();
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
  }
  const { data, error } = await supabase
    .from('tickets')
    .select('tickets')
    .eq('id', 1)
    .maybeSingle();

  if (error) {
    console.error('Failed to load tickets:', error);
    return NextResponse.json(
      { error: 'Failed to load tickets', details: error.message, code: error.code },
      { status: 500 },
    );
  }

  return NextResponse.json(data?.tickets ?? []);
}

export async function PUT(request: Request) {
  let supabase;
  try {
    supabase = getSupabase();
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
  }
  let tickets: unknown;
  try {
    tickets = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid tickets JSON' }, { status: 400 });
  }
  if (!Array.isArray(tickets)) {
    return NextResponse.json({ error: 'Tickets must be an array' }, { status: 400 });
  }

  // How many tickets existed before this save (used to detect new ones)
  let oldCount = 0;
  try {
    const { data: current } = await supabase
      .from('tickets')
      .select('tickets')
      .eq('id', 1)
      .maybeSingle();
    oldCount = Array.isArray(current?.tickets) ? current.tickets.length : 0;
  } catch (error) {
    console.error('Could not read previous tickets:', error);
  }

  const { error } = await supabase
    .from('tickets')
    .upsert({ id: 1, tickets, updated_at: new Date().toISOString() }, { onConflict: 'id' });

  if (error) {
    console.error('Failed to save tickets:', error);
    return NextResponse.json(
      { error: 'Failed to save tickets', details: error.message, code: error.code },
      { status: 500 },
    );
  }

  const added = tickets.length - oldCount;
  if (added > 0) {
    await notify('tickets', `${added} new`);
  }

  return NextResponse.json({ ok: true });
}