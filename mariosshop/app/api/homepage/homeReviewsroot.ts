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