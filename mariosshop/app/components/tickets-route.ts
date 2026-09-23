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

  return NextResponse.json({ ok: true });
}