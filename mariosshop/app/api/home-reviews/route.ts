import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'crypto';

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
    .from('home_reviews')
    .select('reviews')
    .eq('id', 1)
    .maybeSingle();

  if (error) {
    console.error('Failed to load homepage reviews:', error);
    return NextResponse.json(
      { error: 'Failed to load homepage reviews', details: error.message, code: error.code },
      { status: 500 },
    );
  }

  return NextResponse.json(data?.reviews ?? []);
}

export async function PUT(request: Request) {
  let supabase;
  try {
    supabase = getSupabase();
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
  }
  let reviews: unknown;
  try {
    reviews = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid reviews JSON' }, { status: 400 });
  }
  if (!Array.isArray(reviews)) {
    return NextResponse.json({ error: 'Reviews must be an array' }, { status: 400 });
  }

  const { error } = await supabase
    .from('home_reviews')
    .upsert({ id: 1, reviews, updated_at: new Date().toISOString() }, { onConflict: 'id' });

  if (error) {
    console.error('Failed to save homepage reviews:', error);
    return NextResponse.json(
      { error: 'Failed to save homepage reviews', details: error.message, code: error.code },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

// Admin-only: same PAYMENT_ADMIN_KEY used by the other admin tools.
function isAdmin(request: Request): boolean {
  const expected = process.env.PAYMENT_ADMIN_KEY;
  const given = request.headers.get('x-admin-key') || '';
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * DELETE { id }        -> removes that one review
 * DELETE { all: true } -> clears every review
 * Needs the x-admin-key header.
 */
export async function DELETE(request: Request) {
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

  let supabase;
  try {
    supabase = getSupabase();
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
  }

  let remaining: unknown[] = [];

  if (body?.all !== true) {
    const id = Number(body?.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: 'Missing review id.' }, { status: 400 });
    }

    const { data, error: readError } = await supabase
      .from('home_reviews')
      .select('reviews')
      .eq('id', 1)
      .maybeSingle();

    if (readError) {
      console.error('Failed to read homepage reviews:', readError);
      return NextResponse.json({ error: 'Could not read the reviews.' }, { status: 500 });
    }

    const current: any[] = Array.isArray(data?.reviews) ? data!.reviews : [];
    remaining = current.filter((review) => Number(review?.id) !== id);
    if (remaining.length === current.length) {
      return NextResponse.json({ error: 'Review not found (it may already be deleted).' }, { status: 404 });
    }
  }

  const { error } = await supabase
    .from('home_reviews')
    .upsert({ id: 1, reviews: remaining, updated_at: new Date().toISOString() }, { onConflict: 'id' });

  if (error) {
    console.error('Failed to delete homepage review:', error);
    return NextResponse.json({ error: 'Could not delete the review.', details: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}