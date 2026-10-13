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

// Same admin key as the other admin tools (PAYMENT_ADMIN_KEY).
function isAdmin(request: NextRequest): boolean {
  const expected = process.env.PAYMENT_ADMIN_KEY;
  const given = request.headers.get('x-admin-key') || '';
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

const CATEGORIES = ['orderUpdate', 'promotion', 'newProduct', 'general'];

function generateId(): string {
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `NOTIF-${Date.now().toString().slice(-5)}${random}`;
}

function toApi(row: any, recipients: 'all' | string[]) {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    recipients,
    category: row.category || 'general',
    productId: row.product_id ?? undefined,
    productName: row.product_name ?? undefined,
    brandId: row.brand_id ?? undefined,
    createdAt: row.created_at,
    resentAt: Array.isArray(row.resent_at) ? row.resent_at : [],
  };
}

/**
 * GET ?email=client@x.com  -> notifications for that client (public).
 *       Other people's email addresses are never included in the answer.
 * GET (admin key, no email) -> every notification with its full recipient list.
 */
export async function GET(request: NextRequest) {
  const email = (request.nextUrl.searchParams.get('email') || '').trim().toLowerCase();
  const admin = isAdmin(request);

  if (!email && !admin) {
    return NextResponse.json({ error: 'Missing email.' }, { status: 400 });
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(300);

    if (error) {
      console.error('Failed to load notifications:', error);
      return NextResponse.json({ error: 'Failed to load notifications' }, { status: 500 });
    }

    const rows = data ?? [];

    if (!email) {
      return NextResponse.json(rows.map((row) => toApi(row, row.recipients === 'all' ? 'all' : row.recipients ?? [])));
    }

    const mine = rows
      .filter(
        (row) =>
          row.recipients === 'all' ||
          (Array.isArray(row.recipients) && row.recipients.map((e: string) => String(e).toLowerCase()).includes(email)),
      )
      .map((row) => toApi(row, row.recipients === 'all' ? 'all' : [email]));

    return NextResponse.json(mine);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server is not configured' }, { status: 500 });
  }
}

/**
 * POST (admin key required)
 *   { action: 'create', title, message, recipients: 'all' | string[], category?, productId?, productName?, brandId? }
 *   { action: 'resend', id }
 *   { action: 'delete', id }
 */
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

  let supabase;
  try {
    supabase = getSupabase();
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Server is not configured.' }, { status: 500 });
  }

  if (body?.action === 'create') {
    const title = String(body?.title ?? '').trim().slice(0, 120);
    const message = String(body?.message ?? '').trim().slice(0, 1000);
    if (!title || !message) {
      return NextResponse.json({ success: false, message: 'Add a title and message first.' }, { status: 400 });
    }

    let recipients: 'all' | string[];
    if (body?.recipients === 'all') {
      recipients = 'all';
    } else if (Array.isArray(body?.recipients) && body.recipients.length > 0) {
      recipients = body.recipients.map((e: unknown) => String(e).trim().toLowerCase()).filter(Boolean).slice(0, 500);
    } else {
      return NextResponse.json({ success: false, message: 'Pick at least one client.' }, { status: 400 });
    }

    const category = CATEGORIES.includes(body?.category) ? body.category : 'general';
    const productId = Number.isFinite(Number(body?.productId)) && body?.productId !== undefined ? Number(body.productId) : null;

    const { error } = await supabase.from('notifications').insert({
      id: generateId(),
      title,
      message,
      recipients,
      category,
      product_id: productId,
      product_name: body?.productName ? String(body.productName).slice(0, 200) : null,
      brand_id: body?.brandId ? String(body.brandId).slice(0, 100) : null,
      resent_at: [],
    });

    if (error) {
      console.error('Failed to create notification:', error);
      return NextResponse.json(
        { success: false, message: `Could not save the notification. (${error.message})` },
        { status: 500 },
      );
    }
    return NextResponse.json({ success: true, message: 'Notification sent.' });
  }

  const id = String(body?.id ?? '');
  if (!id) {
    return NextResponse.json({ success: false, message: 'Missing notification id.' }, { status: 400 });
  }

  if (body?.action === 'resend') {
    const { data, error: readError } = await supabase.from('notifications').select('resent_at').eq('id', id).maybeSingle();
    if (readError || !data) {
      return NextResponse.json({ success: false, message: 'Notification not found.' }, { status: 404 });
    }
    const resent = Array.isArray(data.resent_at) ? data.resent_at : [];
    const { error } = await supabase
      .from('notifications')
      .update({ resent_at: [...resent, new Date().toISOString()] })
      .eq('id', id);
    if (error) {
      console.error('Failed to resend notification:', error);
      return NextResponse.json({ success: false, message: 'Could not resend it.' }, { status: 500 });
    }
    return NextResponse.json({ success: true, message: 'Notification resent.' });
  }

  if (body?.action === 'delete') {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete notification:', error);
      return NextResponse.json({ success: false, message: 'Could not delete it.' }, { status: 500 });
    }
    return NextResponse.json({ success: true, message: 'Notification deleted.' });
  }

  return NextResponse.json({ success: false, message: 'Unknown action.' }, { status: 400 });
}