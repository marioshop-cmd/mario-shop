import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomInt } from 'crypto';

/**
 * One shared endpoint for every "email me a 6-digit code" flow: register
 * verification, login 2FA, and password reset.
 *
 * POST body: { action: 'request' | 'verify', email, purpose, code? }
 *
 * Security rules in this version:
 *  - The code is NEVER returned to the browser in production. (It is only
 *    echoed back as `devCode` when running locally with `npm run dev`.)
 *  - Codes come from crypto.randomInt, not Math.random.
 *  - A code dies after 5 wrong guesses.
 *  - A new code can only be requested once every 60 seconds per email+purpose.
 *
 * REQUIRES this one-time SQL in Supabase (SQL Editor):
 *   alter table auth_codes add column if not exists attempts int not null default 0;
 */

const VALID_PURPOSES = ['register', 'login', 'reset'] as const;
const MAX_ATTEMPTS = 5;
const CODE_LIFETIME_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase environment variables are not configured');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function generateCode(): string {
  return randomInt(100000, 1000000).toString();
}

const PURPOSE_COPY: Record<string, { subject: string; intro: string }> = {
  register: {
    subject: "Verify your Mario's Shop account",
    intro: 'Use this code to verify your new account. It expires in 10 minutes.',
  },
  login: {
    subject: "Your Mario's Shop login code",
    intro: 'Use this code to finish logging in. It expires in 10 minutes.',
  },
  reset: {
    subject: 'Your password reset code',
    intro: 'Use this code to reset your password. It expires in 10 minutes.',
  },
};

async function sendCodeEmail(email: string, code: string, purpose: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('Email service not configured.');
  const copy = PURPOSE_COPY[purpose] ?? PURPOSE_COPY.login;

  // Set RESEND_FROM in your hosting environment once you have a verified
  // domain, e.g.  Mario's Shop <noreply@yourdomain.com>
  // Until then Resend's test sender only delivers to your own Resend email.
  const from = process.env.RESEND_FROM || "Mario's Shop <onboarding@resend.dev>";

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: copy.subject,
      html: `
        <div style="font-family: sans-serif; background:#09090b; color:#fff; padding:32px; border-radius:16px; max-width:420px; margin:0 auto;">
          <h2 style="color:#ef4444; margin-bottom:8px;">Mario's Shop</h2>
          <p style="color:#a1a1aa; font-size:14px;">${copy.intro}</p>
          <div style="background:#18181b; border:1px solid #27272a; border-radius:12px; padding:20px; text-align:center; margin:20px 0;">
            <span style="font-size:28px; font-weight:800; letter-spacing:8px; color:#fff;">${code}</span>
          </div>
          <p style="color:#71717a; font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    }),
  });

  if (!resendRes.ok) {
    const errText = await resendRes.text();
    console.error('Resend error:', errText);
    throw new Error('Failed to send email.');
  }
}

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body.' }, { status: 400 });
  }

  const { action, email, purpose, code } = body || {};
  if (!email || !purpose) {
    return NextResponse.json({ success: false, message: 'Missing email or purpose.' }, { status: 400 });
  }
  if (!VALID_PURPOSES.includes(purpose)) {
    return NextResponse.json({ success: false, message: 'Invalid purpose.' }, { status: 400 });
  }
  const cleanEmail = String(email).trim().toLowerCase();

  let supabase;
  try {
    supabase = getSupabase();
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Server is not configured.' }, { status: 500 });
  }

  /* ----------------------------- VERIFY ----------------------------- */
  if (action === 'verify') {
    if (!code) {
      return NextResponse.json({ success: false, message: 'Missing code.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('auth_codes')
      .select('*')
      .eq('email', cleanEmail)
      .eq('purpose', purpose)
      .maybeSingle();

    if (error) {
      console.error('Verify lookup failed:', error);
      return NextResponse.json({ success: false, message: 'Something went wrong verifying your code.' }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ success: false, message: 'No active code. Request a new one.' }, { status: 400 });
    }
    if (new Date(data.expires_at).getTime() < Date.now()) {
      await supabase.from('auth_codes').delete().eq('id', data.id);
      return NextResponse.json({ success: false, message: 'This code has expired. Request a new one.' }, { status: 400 });
    }
    if ((data.attempts ?? 0) >= MAX_ATTEMPTS) {
      await supabase.from('auth_codes').delete().eq('id', data.id);
      return NextResponse.json({ success: false, message: 'Too many wrong attempts. Request a new code.' }, { status: 429 });
    }

    if (String(data.code) !== String(code).trim()) {
      await supabase
        .from('auth_codes')
        .update({ attempts: (data.attempts ?? 0) + 1 })
        .eq('id', data.id);
      return NextResponse.json({ success: false, message: 'Incorrect code.' }, { status: 400 });
    }

    // Single-use — delete it the moment it's successfully verified.
    await supabase.from('auth_codes').delete().eq('id', data.id);
    return NextResponse.json({ success: true });
  }

  /* ----------------------------- REQUEST ---------------------------- */
  // Cooldown: the existing code's expiry minus its lifetime = when it was made.
  const { data: existing } = await supabase
    .from('auth_codes')
    .select('expires_at')
    .eq('email', cleanEmail)
    .eq('purpose', purpose)
    .maybeSingle();

  if (existing) {
    const createdAt = new Date(existing.expires_at).getTime() - CODE_LIFETIME_MS;
    const waitMs = RESEND_COOLDOWN_MS - (Date.now() - createdAt);
    if (waitMs > 0) {
      return NextResponse.json(
        { success: false, message: `Please wait ${Math.ceil(waitMs / 1000)}s before requesting another code.` },
        { status: 429 },
      );
    }
  }

  const newCode = generateCode();
  const expiresAt = new Date(Date.now() + CODE_LIFETIME_MS).toISOString();

  await supabase.from('auth_codes').delete().eq('email', cleanEmail).eq('purpose', purpose);
  const { error: insertError } = await supabase
    .from('auth_codes')
    .insert({ email: cleanEmail, code: newCode, purpose, expires_at: expiresAt, attempts: 0 });

  if (insertError) {
    console.error('Failed to store code:', insertError);
    return NextResponse.json({ success: false, message: 'Something went wrong. Please try again.' }, { status: 500 });
  }

  try {
    await sendCodeEmail(cleanEmail, newCode, purpose);
  } catch (error) {
    console.error(error);

    // Local development only: show the code so you can keep testing
    // without email set up. NEVER happens on the live site.
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        success: true,
        message: "Couldn't send the email, but here's your code for now (dev mode only).",
        devCode: newCode,
      });
    }

    await supabase.from('auth_codes').delete().eq('email', cleanEmail).eq('purpose', purpose);
    return NextResponse.json(
      { success: false, message: "We couldn't send the email right now. Please try again later." },
      { status: 502 },
    );
  }

  return NextResponse.json({ success: true });
}
