'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Coins, Cpu, Gamepad2, Gift, Headphones, RefreshCw, Smartphone } from 'lucide-react';
import { useLanguage } from '../language/LanguageContext';
import { getAllBrands, onProductsChanged, type BrandService } from '../lib/products';

// "category" must match brand.category in the product data (same values the
// Services page filters on). Clicking a tile opens /services already filtered.
const TILES = [
  { category: 'Gift Cards', labelKey: 'cat_gaming_giftcards', subKey: 'browse_sub_gaming_giftcards', icon: Gamepad2 },
  { category: 'Game Top-Ups', labelKey: 'cat_mobile_topups', subKey: 'browse_sub_topups', icon: Smartphone },
  { category: 'Currencies and Points', labelKey: 'cat_currencies_points', subKey: 'browse_sub_currencies', icon: Coins },
  { category: 'Subscriptions', labelKey: 'cat_gaming_subscriptions', subKey: 'browse_sub_subscriptions', icon: RefreshCw },
  { category: 'AI', labelKey: 'cat_ai_tools', subKey: 'browse_sub_ai', icon: Cpu },
  { category: 'Streaming', labelKey: 'cat_ears_eyes', subKey: 'browse_sub_media', icon: Headphones },
  { category: 'General Gift Cards', labelKey: 'cat_general_giftcards', subKey: 'browse_sub_giftcards', icon: Gift },
];

export default function CategoryBrowser() {
  const { t } = useLanguage();
  const [brands, setBrands] = useState<BrandService[]>([]);
  const scroller = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = () => {
      getAllBrands()
        .then((data) => {
          if (mounted) setBrands(data);
        })
        .catch((error: unknown) => console.error('Browse by category: failed to load products', error));
    };
    load();
    const unsubscribe = onProductsChanged(load);
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const counts = useMemo(() => {
    const result: Record<string, number> = {};
    for (const brand of brands) {
      result[brand.category] = (result[brand.category] || 0) + brand.products.length;
    }
    return result;
  }, [brands]);

  const updateArrows = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener('resize', updateArrows);
    return () => window.removeEventListener('resize', updateArrows);
  }, [updateArrows, brands]);

  const scrollByAmount = (direction: 1 | -1) => {
    scroller.current?.scrollBy({ left: direction * 320, behavior: 'smooth' });
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-800/60 bg-zinc-950/60 p-6 shadow-2xl backdrop-blur-md md:p-8">
      <h2 className="mb-5 text-2xl font-black tracking-tight text-white md:text-3xl">{t('browse_title')}</h2>

      <div className="relative" dir="ltr">
        <div
          ref={scroller}
          onScroll={updateArrows}
          className="flex snap-x gap-2 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {TILES.map((tile) => {
            const Icon = tile.icon;
            const count = counts[tile.category] || 0;
            return (
              <Link
                key={tile.category}
                href={`/services?category=${encodeURIComponent(tile.category)}`}
                className="group flex w-[10.5rem] shrink-0 snap-start flex-col gap-2 rounded-2xl border border-transparent p-4 transition duration-300 hover:border-red-500/40 hover:bg-zinc-900/60 sm:w-48"
              >
                <Icon className="h-7 w-7 text-zinc-200 transition group-hover:text-red-400" />
                <span className="text-base font-extrabold leading-tight text-white">{t(tile.labelKey)}</span>
                <span className="text-[11px] leading-snug text-zinc-500">
                  {count} {t('browse_products')} · {t(tile.subKey)}
                </span>
              </Link>
            );
          })}
        </div>

        {canLeft && (
          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            aria-label="Previous"
            className="absolute left-0 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/95 text-white shadow-lg transition hover:border-red-500/60"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {canRight && (
          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            aria-label="Next"
            className="absolute right-0 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/95 text-white shadow-lg transition hover:border-red-500/60"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
