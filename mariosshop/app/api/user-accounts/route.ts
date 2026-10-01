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
    .from('user_accounts')
    .select('users')
    .eq('id', 1)
    .maybeSingle();

  if (error) {
    console.error('Failed to load user accounts:', error);
    return NextResponse.json(
      { error: 'Failed to load user accounts', details: error.message, code: error.code },
      { status: 500 },
    );
  }

  return NextResponse.json(data?.users ?? []);
}

export async function PUT(request: Request) {
  let supabase;
  try {
    supabase = getSupabase();
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
  }
  let users: unknown;
  try {
    users = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid users JSON' }, { status: 400 });
  }
  if (!Array.isArray(users)) {
    return NextResponse.json({ error: 'Users must be an array' }, { status: 400 });
  }

  const { error } = await supabase
    .from('user_accounts')
    .upsert({ id: 1, users, updated_at: new Date().toISOString() }, { onConflict: 'id' });

  if (error) {
    console.error('Failed to save user accounts:', error);
    return NextResponse.json(
      { error: 'Failed to save user accounts', details: error.message, code: error.code },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}