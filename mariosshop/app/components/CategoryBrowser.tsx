'use client';

import React from 'react';
import Link from 'next/link';
import { Coins, Cpu, Gamepad2, Gift, Headphones, RefreshCw, Smartphone } from 'lucide-react';
import { useLanguage } from '../language/LanguageContext';

// "category" must match brand.category in the product data (the same values the
// Services page filters on). Clicking a card opens /services already filtered.
// "accent" is the colour of that category's icon and glow.
const TILES = [
  { category: 'Gift Cards', labelKey: 'cat_gaming_giftcards', icon: Gamepad2, accent: '#a78bfa' },
  { category: 'Game Top-Ups', labelKey: 'cat_mobile_topups', icon: Smartphone, accent: '#38bdf8' },
  { category: 'Currencies and Points', labelKey: 'cat_currencies_points', icon: Coins, accent: '#fbbf24' },
  { category: 'Subscriptions', labelKey: 'cat_gaming_subscriptions', icon: RefreshCw, accent: '#34d399' },
  { category: 'AI', labelKey: 'cat_ai_tools', icon: Cpu, accent: '#22d3ee' },
  { category: 'Streaming', labelKey: 'cat_ears_eyes', icon: Headphones, accent: '#f472b6' },
  { category: 'General Gift Cards', labelKey: 'cat_general_giftcards', icon: Gift, accent: '#f87171' },
];

// Repeated so the row is wide enough on big screens, then doubled so the loop
// has no jump (the animation moves exactly half of the track).
const BASE = [...TILES, ...TILES];
const LOOP = [...BASE, ...BASE];

export default function CategoryBrowser() {
  const { t } = useLanguage();

  // If the translation file on the site is older and lacks this text, show the English name.
  const translated = t('browse_title');
  const title = translated === 'browse_title' ? 'Our Service Category' : translated;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-800/60 bg-zinc-950/60 py-6 shadow-2xl backdrop-blur-md md:py-8">
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-red-600/10 blur-[80px]" />

      <div className="relative mb-5 flex items-center gap-3 px-5 md:mb-6 md:px-8">
        <span className="h-6 w-1.5 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)] md:h-7" />
        <h2 className="text-xl font-black tracking-tight text-white md:text-3xl">{title}</h2>
      </div>

      <div
        dir="ltr"
        className="cat-marquee relative overflow-hidden py-1"
        style={{
          WebkitMaskImage: 'linear-gradient(to right, transparent, #000 7%, #000 93%, transparent)',
          maskImage: 'linear-gradient(to right, transparent, #000 7%, #000 93%, transparent)',
        }}
      >
        <div className="cat-track">
          {LOOP.map((tile, index) => {
            const Icon = tile.icon;
            const isCopy = index >= TILES.length; // only the first set is for keyboard / screen readers
            return (
              <Link
                key={`${tile.category}-${index}`}
                href={`/services?category=${encodeURIComponent(tile.category)}`}
                aria-hidden={isCopy ? true : undefined}
                tabIndex={isCopy ? -1 : undefined}
                className="group relative mr-3 flex h-32 w-36 shrink-0 flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-900/50 px-3 text-center transition duration-300 hover:-translate-y-1 sm:h-36 sm:w-44"
              >
                {/* coloured glow + border that appear on hover / touch */}
                <span
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${tile.accent}38, transparent 70%)`,
                    boxShadow: `inset 0 0 0 1px ${tile.accent}88`,
                  }}
                />
                <span
                  className="relative flex h-12 w-12 items-center justify-center rounded-2xl border transition duration-300 group-hover:scale-110 sm:h-14 sm:w-14"
                  style={{ backgroundColor: `${tile.accent}1f`, borderColor: `${tile.accent}55`, color: tile.accent }}
                >
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                </span>
                <span className="relative text-xs font-extrabold leading-tight text-white sm:text-sm">{t(tile.labelKey)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
