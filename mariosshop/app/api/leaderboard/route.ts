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

// Same admin key as the payment methods page (PAYMENT_ADMIN_KEY).
function isAdmin(request: NextRequest): boolean {
  const expected = process.env.PAYMENT_ADMIN_KEY;
  const given = request.headers.get('x-admin-key') || '';
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

const toInt = (value: unknown): number => {
  const n = Math.trunc(Number(value));
  if (!Number.isFinite(n)) return 0;
  return Math.max(-1_000_000, Math.min(1_000_000, n));
};

/**
 * GET  -> the ranking, best first. Public. Emails are only included when the
 *         admin key is sent, so customers never see each other's emails.
 * POST -> admin only:
 *         { action: 'adjust', email, addOrders?, addXp?, username? }
 *         { action: 'delete', email }
 */
export async function GET(request: NextRequest) {
  const limitParam = Number(request.nextUrl.searchParams.get('limit') || 100);
  const limit = Math.max(1, Math.min(100, Number.isFinite(limitParam) ? Math.trunc(limitParam) : 100));
  const admin = isAdmin(request);

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('leaderboard')
      .select('email, username, orders, xp')
      .order('xp', { ascending: false })
      .order('orders', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to load leaderboard:', error);
      return NextResponse.json({ error: 'Failed to load leaderboard' }, { status: 500 });
    }

    return NextResponse.json(
      (data ?? []).map((row, index) => ({
        id: index + 1,
        username: row.username,
        orders: row.orders,
        xp: row.xp,
        ...(admin ? { email: row.email } : {}),
      })),
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server is not configured' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!process.env.PAYMENT_ADMIN_KEY) {
    return NextResponse.json({ success: false, message: 'PAYMENT_ADMIN_KEY is not set on the server.' }, { status: 500 });
  }
  if (!isAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Wrong admin key.' }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body.' }, { status: 400 });
  }

  const email = String(body?.email ?? '').trim().toLowerCase();
  if (!email || !email.includes('@')) {
    return NextResponse.json({ success: false, message: 'Enter a valid client email.' }, { status: 400 });
  }

  try {
    const supabase = getSupabase();

    if (body?.action === 'delete') {
      const { error } = await supabase.from('leaderboard').delete().eq('email', email);
      if (error) {
        console.error('Failed to delete leaderboard entry:', error);
        return NextResponse.json({ success: false, message: 'Could not remove this player.' }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: 'Player removed from the ranking.' });
    }

    if (body?.action !== 'adjust') {
      return NextResponse.json({ success: false, message: 'Unknown action.' }, { status: 400 });
    }

    const addOrders = toInt(body?.addOrders);
    const addXp = toInt(body?.addXp);
    if (addOrders === 0 && addXp === 0) {
      return NextResponse.json({ success: false, message: 'Enter some orders or XP to add.' }, { status: 400 });
    }

    const { data: existing, error: readError } = await supabase
      .from('leaderboard')
      .select('username, orders, xp')
      .eq('email', email)
      .maybeSingle();

    if (readError) {
      console.error('Failed to read leaderboard row:', readError);
      return NextResponse.json({ success: false, message: 'Could not read the ranking.' }, { status: 500 });
    }

    // New player: take the name from their account if they have one,
    // otherwise use the part of the email before the @ (never the full email).
    let username = String(body?.username ?? '').trim() || existing?.username || '';
    if (!username) {
      const { data: accounts } = await supabase
        .from('user_accounts')
        .select('users')
        .eq('id', 1)
        .maybeSingle();
      const match = Array.isArray(accounts?.users)
        ? accounts!.users.find((u: any) => String(u?.email || '').toLowerCase() === email)
        : null;
      username = match?.username || email.split('@')[0];
    }

    const orders = Math.max(0, (existing?.orders ?? 0) + addOrders);
    const xp = Math.max(0, (existing?.xp ?? 0) + addXp);

    const { error: saveError } = await supabase
      .from('leaderboard')
      .upsert({ email, username, orders, xp, updated_at: new Date().toISOString() }, { onConflict: 'email' });

    if (saveError) {
      console.error('Failed to save leaderboard row:', saveError);
      return NextResponse.json(
        { success: false, message: `Could not save the ranking. (${saveError.message})` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `✅ ${username} is now at ${orders} order${orders === 1 ? '' : 's'} and ${xp.toLocaleString('en-US')} XP.`,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server is not configured' }, { status: 500 });
  }
}