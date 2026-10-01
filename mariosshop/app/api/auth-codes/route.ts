import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * One shared endpoint for every "email me a 6-digit code" flow: register
 * verification, login 2FA, and password reset. Codes live in Supabase (not
 * localStorage/memory) so they work correctly across serverless instances
 * and survive a page refresh — always-on, no dependency on which server
 * happened to handle the previous request.
 *
 * POST body: { action: 'request' | 'verify', email, purpose, code? }
 *   - action 'request' (default): always issues a BRAND NEW code, replacing
 *     any code already pending for that email+purpose, and emails it.
 *   - action 'verify': checks the code matches and hasn't expired. Codes
 *     are single-use — a verified code is deleted immediately.
 */

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase environment variables are not configured');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
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

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // Resend's test domain — swap for your own verified domain once
      // you've added and verified one in the Resend dashboard.
      from: "Mario's Shop <onboarding@resend.dev>",
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
  const cleanEmail = String(email).trim().toLowerCase();

  let supabase;
  try {
    supabase = getSupabase();
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Server is not configured.' }, { status: 500 });
  }

  if (action === 'verify') {
    if (!code) {
      return NextResponse.json({ success: false, message: 'Missing code.' }, { status: 400 });
    }
    const { data, error } = await supabase
      .from('auth_codes')
      .select('*')
      .eq('email', cleanEmail)
      .eq('purpose', purpose)
      .eq('code', String(code).trim())
      .maybeSingle();

    if (error) {
      console.error('Verify lookup failed:', error);
      return NextResponse.json({ success: false, message: 'Something went wrong verifying your code.' }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ success: false, message: 'Incorrect code.' }, { status: 400 });
    }
    if (new Date(data.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ success: false, message: 'This code has expired. Request a new one.' }, { status: 400 });
    }

    // Single-use — delete it the moment it's successfully verified.
    await supabase.from('auth_codes').delete().eq('id', data.id);

    return NextResponse.json({ success: true });
  }

  // Default action: request a fresh code. Always brand new — replaces
  // whatever was pending before, per "code is always refresh new code".
  const newCode = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await supabase.from('auth_codes').delete().eq('email', cleanEmail).eq('purpose', purpose);
  const { error: insertError } = await supabase
    .from('auth_codes')
    .insert({ email: cleanEmail, code: newCode, purpose, expires_at: expiresAt });

  if (insertError) {
    console.error('Failed to store code:', insertError);
    return NextResponse.json({ success: false, message: 'Something went wrong. Please try again.' }, { status: 500 });
  }

  try {
    await sendCodeEmail(cleanEmail, newCode, purpose);
  } catch (error) {
    console.error(error);
    // Don't hard-fail the whole flow just because email sending isn't
    // configured yet — the code is already safely stored, so hand it back
    // directly as a fallback rather than leaving the user stuck.
    return NextResponse.json({
      success: true,
      message: "Couldn't send the email, but here's your code for now.",
      devCode: newCode,
    });
  }

  return NextResponse.json({ success: true });
}