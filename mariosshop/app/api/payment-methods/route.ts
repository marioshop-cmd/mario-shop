import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase environment variables are not configured');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Writes (add / delete) need the admin key. It is checked here on the
 * server against PAYMENT_ADMIN_KEY, so nobody can change payment methods
 * just by calling this URL. Reading the list is public (the home page
 * needs it).
 */
function isAdmin(request: NextRequest): boolean {
  const expected = process.env.PAYMENT_ADMIN_KEY;
  const given = request.headers.get('x-admin-key') || '';
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('payment_methods')
      .select('id, name, icon_url, sort_order')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to load payment methods:', error);
      return NextResponse.json({ error: 'Failed to load payment methods' }, { status: 500 });
    }
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server is not configured' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!process.env.PAYMENT_ADMIN_KEY) {
    return NextResponse.json({ error: 'PAYMENT_ADMIN_KEY is not set on the server.' }, { status: 500 });
  }
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Wrong admin key.' }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const name = String(body?.name ?? '').trim();
  const iconUrl = String(body?.iconUrl ?? '');

  if (!name || name.length > 40) {
    return NextResponse.json({ error: 'Name is required (max 40 characters).' }, { status: 400 });
  }
  const isDataImage = iconUrl.startsWith('data:image/');
  const isLocalPath = iconUrl.startsWith('/') && !iconUrl.startsWith('//');
  if (!isDataImage && !isLocalPath) {
    return NextResponse.json({ error: 'Please upload an icon.' }, { status: 400 });
  }
  if (iconUrl.length > 200_000) {
    return NextResponse.json({ error: 'Icon is too large.' }, { status: 400 });
  }

  try {
    const supabase = getSupabase();

    const { data: last } = await supabase
      .from('payment_methods')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder = (last?.sort_order ?? 0) + 1;

    const { data, error } = await supabase
      .from('payment_methods')
      .insert({ name, icon_url: iconUrl, sort_order: nextOrder })
      .select('id, name, icon_url, sort_order')
      .single();

    if (error) {
      console.error('Failed to add payment method:', error);
      return NextResponse.json(
        { error: 'Could not save the payment method.', details: error.message },
        { status: 500 },
      );
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server is not configured' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!process.env.PAYMENT_ADMIN_KEY) {
    return NextResponse.json({ error: 'PAYMENT_ADMIN_KEY is not set on the server.' }, { status: 500 });
  }
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Wrong admin key.' }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
  }

  try {
    const supabase = getSupabase();
    const { error } = await supabase.from('payment_methods').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete payment method:', error);
      return NextResponse.json({ error: 'Could not delete the payment method.' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server is not configured' }, { status: 500 });
  }
}