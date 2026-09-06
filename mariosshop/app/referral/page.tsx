'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../language/LanguageContext';

export default function ReferralPage() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  
  // Interactive referral link & code state
  const [copied, setCopied] = useState(false);

  const referralCode = currentUser?.referralCode ?? "------";

const users =
  typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("mario_users") || "[]")
    : [];

const totalReferrals = users.filter(
  (u: any) => u.referredBy === referralCode
).length;

const totalEarnings = currentUser?.totalReferralEarnings ?? 0;

const referralLink =
  typeof window !== "undefined"
    ? `${window.location.origin}/register?ref=${referralCode}`
    : "";

  function handleCopy() {
    if (!referralLink) return;
    try {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // ignore
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* HERO HEADER */}
        <section className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-4 py-1.5 rounded-full text-red-500 text-xs font-bold uppercase tracking-widest">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
            {t('referral_badge')}
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            {t('referral_hero_title_1')}<span className="text-red-500">{t('referral_hero_title_highlight')}</span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
            {t('referral_hero_sub')}
          </p>
        </section>
        

        {/* 3 STAT CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Total Referrals */}
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-6 text-center space-y-2 flex flex-col items-center justify-center backdrop-blur-md">
            <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            </div>
            <div className="text-3xl font-black text-white">{totalReferrals}</div>
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('referral_total_referrals')}</div>
          </div>

          {/* Card 2: Total Earnings */}
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-6 text-center space-y-2 flex flex-col items-center justify-center backdrop-blur-md">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center text-lg font-bold">
              $
            </div>
            <div className="text-3xl font-black text-emerald-400">{totalEarnings.toFixed(2)} DT</div>
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('referral_total_earnings')}</div>
          </div>

          {/* Card 3: Your Code */}
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-6 text-center space-y-2 flex flex-col items-center justify-center backdrop-blur-md">
            <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
              </svg>
            </div>
            <div className="text-2xl md:text-3xl font-black text-white tracking-widest font-mono">
              {referralCode}
            </div>
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('referral_your_code')}</div>
          </div>
        </section>

        {/* LINK GENERATOR BOX */}
        <section className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 md:p-8 backdrop-blur-md space-y-4">
          <h2 className="text-lg font-extrabold text-white tracking-tight mb-4">
            {t('referral_link_title')}
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-300 font-mono"
            />
            <button
              onClick={handleCopy}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg transition-colors duration-200 text-sm whitespace-nowrap"
            >
              {copied ? t('copied') : t('copy_link')}
            </button>
          </div>
        </section>

        {/* REWARDS & RULES SECTION */}
        <section className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 md:p-8 backdrop-blur-md space-y-6">
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            {t('rewards_rules_title')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            
            {/* WHAT YOU EARN */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                {t('what_you_earn')}
              </h3>
              
              <ul className="space-y-3 text-xs md:text-sm text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-emerald-400 fill-current mt-0.5 shrink-0" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  <span><strong className="text-white">{t('earn1_bold')}</strong>{t('earn1_text')}</span>
                </li>

                <li className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-emerald-400 fill-current mt-0.5 shrink-0" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  <span>{t('earn2_pre')}<strong className="text-white">{t('earn2_bold')}</strong>{t('earn2_text')}</span>
                </li>

                <li className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-emerald-400 fill-current mt-0.5 shrink-0" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  <span>{t('earn3')}</span>
                </li>
              </ul>
            </div>

            {/* RULES */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                {t('rules_title')}
              </h3>

              <ul className="space-y-2.5 text-xs md:text-sm text-zinc-400 list-disc list-inside leading-relaxed">
                <li>{t('rule1')}</li>
                <li>{t('rule2')}</li>
                <li>{t('rule3')}</li>
                <li>{t('rule4')}</li>
              </ul>
            </div>

          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* STEP 1 */}
          <div className="border-beam group bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:border-red-500/40" style={{ '--beam-delay': '0s' } as React.CSSProperties}>
            <span className="text-6xl md:text-7xl font-black text-zinc-800/90 group-hover:text-red-600 transition-colors duration-300 select-none absolute top-3 right-5 pointer-events-none">
              1
            </span>
            <div className="inline-block bg-zinc-950/90 border border-zinc-800/80 px-3 py-1 rounded-md text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6">
              {t('step_label')} 01
            </div>
            <div className="w-12 h-12 bg-zinc-950 border border-zinc-800/80 rounded-xl flex items-center justify-center text-zinc-300 group-hover:text-red-500 group-hover:border-red-500/30 transition-all duration-300 mb-5">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{t('share_code_title')}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {t('share_code_desc')}
            </p>
          </div>

          {/* STEP 2 */}
          <div className="border-beam group bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:border-red-500/40" style={{ '--beam-delay': '0.8s' } as React.CSSProperties}>
            <span className="text-6xl md:text-7xl font-black text-zinc-800/90 group-hover:text-red-600 transition-colors duration-300 select-none absolute top-3 right-5 pointer-events-none">
              2
            </span>
            <div className="inline-block bg-zinc-950/90 border border-zinc-800/80 px-3 py-1 rounded-md text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6">
              {t('step_label')} 02
            </div>
            <div className="w-12 h-12 bg-zinc-950 border border-zinc-800/80 rounded-xl flex items-center justify-center text-zinc-300 group-hover:text-red-500 group-hover:border-red-500/30 transition-all duration-300 mb-5">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9 0c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm9 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2c0-2.66-5.33-4-7-4z"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{t('friend_signup_title')}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {t('friend_signup_desc')}
            </p>
          </div>

          {/* STEP 3 */}
          <div className="border-beam group bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:border-red-500/40" style={{ '--beam-delay': '1.6s' } as React.CSSProperties}>
            <span className="text-6xl md:text-7xl font-black text-zinc-800/90 group-hover:text-red-600 transition-colors duration-300 select-none absolute top-3 right-5 pointer-events-none">
              3
            </span>
            <div className="inline-block bg-zinc-950/90 border border-zinc-800/80 px-3 py-1 rounded-md text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6">
              {t('step_label')} 03
            </div>
            <div className="w-12 h-12 bg-zinc-950 border border-zinc-800/80 rounded-xl flex items-center justify-center text-zinc-300 group-hover:text-red-500 group-hover:border-red-500/30 transition-all duration-300 mb-5">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{t('get_credit_title')}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {t('get_credit_desc')}
            </p>
          </div>

        </section>

      </div>

      <style jsx>{`
        /* A bright point of light continuously travels around each card's
           border, like a slow-spinning halo — matches the effect used on
           the homepage's Payment Methods cards and Services page pills. */
        @property --beam-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes beamSpin {
          to { --beam-angle: 360deg; }
        }
        .border-beam {
          isolation: isolate;
        }
        .border-beam::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1.5px;
          background: conic-gradient(
            from var(--beam-angle),
            transparent 0deg,
            transparent 220deg,
            rgba(239, 68, 68, 0.35) 260deg,
            rgba(239, 68, 68, 1) 300deg,
            rgba(239, 68, 68, 0.35) 340deg,
            transparent 360deg
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: beamSpin 2.6s linear infinite;
          animation-delay: var(--beam-delay, 0s);
          pointer-events: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .border-beam::before { animation: none !important; }
        }
      `}</style>
    </main>
  );
}
