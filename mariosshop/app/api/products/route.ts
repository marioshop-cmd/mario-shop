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
    .from('site_catalog')
    .select('brands')
    .eq('id', 1)
    .maybeSingle();

  if (error) {
    console.error('Failed to load product catalog:', error);
    return NextResponse.json({ error: 'Failed to load product catalog' }, { status: 500 });
  }

  return NextResponse.json(data?.brands ?? []);
}

export async function PUT(request: Request) {
  let supabase;
  try {
    supabase = getSupabase();
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
  }
  const brands: unknown = await request.json();
  if (!Array.isArray(brands)) {
    return NextResponse.json({ error: 'Catalog must be an array' }, { status: 400 });
  }

  const { error } = await supabase
    .from('site_catalog')
    .upsert({ id: 1, brands }, { onConflict: 'id' });

  if (error) {
    console.error('Failed to save product catalog:', error);
    return NextResponse.json({ error: 'Failed to save product catalog' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
