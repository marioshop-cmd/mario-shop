'use client';

import React from 'react';
import Link from 'next/link';
import { Coins, Cpu, Gamepad2, Gift, Headphones, RefreshCw, Smartphone } from 'lucide-react';
import { useLanguage } from '../language/LanguageContext';

// "category" must match brand.category in the product data (the same values the
// Services page filters on). Clicking a tile opens /services already filtered.
const TILES = [
  { category: 'Gift Cards', labelKey: 'cat_gaming_giftcards', icon: Gamepad2 },
  { category: 'Game Top-Ups', labelKey: 'cat_mobile_topups', icon: Smartphone },
  { category: 'Currencies and Points', labelKey: 'cat_currencies_points', icon: Coins },
  { category: 'Subscriptions', labelKey: 'cat_gaming_subscriptions', icon: RefreshCw },
  { category: 'AI', labelKey: 'cat_ai_tools', icon: Cpu },
  { category: 'Streaming', labelKey: 'cat_ears_eyes', icon: Headphones },
  { category: 'General Gift Cards', labelKey: 'cat_general_giftcards', icon: Gift },
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
    <div className="relative overflow-hidden rounded-3xl border border-zinc-800/60 bg-zinc-950/60 p-6 shadow-2xl backdrop-blur-md md:p-8">
      <h2 className="mb-5 text-2xl font-black tracking-tight text-white md:text-3xl">{title}</h2>

      <div
        dir="ltr"
        className="cat-marquee overflow-hidden"
        style={{
          WebkitMaskImage: 'linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)',
          maskImage: 'linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)',
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
                className="group mr-3 flex shrink-0 items-center gap-3 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 px-4 py-3 transition duration-300 hover:border-red-500/50 hover:bg-zinc-900/70 sm:px-5 sm:py-3.5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-700/70 bg-zinc-800/80 text-zinc-200 transition group-hover:border-red-500/40 group-hover:text-red-400">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="whitespace-nowrap text-sm font-extrabold text-white sm:text-base">{t(tile.labelKey)}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        @keyframes catMarquee {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
        .cat-track {
          display: flex;
          flex-wrap: nowrap;
          width: max-content;
          animation: catMarquee 50s linear infinite;
          will-change: transform;
        }
        .cat-marquee:hover .cat-track {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .cat-track { animation: none; }
        }
      `}</style>
    </div>
  );
}
