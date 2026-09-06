import { NextRequest, NextResponse } from 'next/server';

// Server-side only — RESEND_API_KEY lives in .env.local and is never sent
// to the browser, unlike anything in a 'use client' file. This route is
// the only place that ever touches the real Resend API key.
export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ success: false, message: 'Missing email or code.' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, message: 'Email service not configured.' }, { status: 500 });
    }

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Resend's test domain — swap for your own verified domain
        // (e.g. "Mario's Shop <noreply@yourdomain.com>") once you've
        // added and verified one in the Resend dashboard.
        from: "Mario's Shop <onboarding@resend.dev>",
        to: email,
        subject: 'Your password reset code',
        html: `
          <div style="font-family: sans-serif; background:#09090b; color:#fff; padding:32px; border-radius:16px; max-width:420px; margin:0 auto;">
            <h2 style="color:#ef4444; margin-bottom:8px;">Mario's Shop</h2>
            <p style="color:#a1a1aa; font-size:14px;">Use this code to reset your password. It expires in 10 minutes.</p>
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
      return NextResponse.json({ success: false, message: 'Failed to send email.' }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('send-reset-email error:', err);
    return NextResponse.json({ success: false, message: 'Unexpected server error.' }, { status: 500 });
  }
}