'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: string;
  publisher: string;
  title: string;
  price: string;
  image: string;
  link: string;
}

const FEATURED_PRODUCTS: Product[] = [
  {
    id: '1',
    publisher: 'RIOT GAMES',
    title: 'Valorant 1000 VP',
    price: '39.00 DT',
    image: '/images/products/valorant.jpeg', // Replace with your image paths
    link: '/services/valorant-1000-vp',
  },
  {
    id: '2',
    publisher: 'ELECTRONIC ARTS',
    title: 'EA Sports FC 26',
    price: '120.00 DT',
    image: '/images/products/eafc.jpeg',
    link: '/services/ea-sports-fc-26',
  },
  {
    id: '3',
    publisher: 'GEMINI / AI',
    title: 'Gemini Advanced 1 Month',
    price: '25.00 DT',
    image: '/images/products/gemini.jpeg',
    link: '/services/gemini-advanced',
  },
  {
    id: '4',
    publisher: 'ROCKSTAR GAMES',
    title: 'GTA V Premium Edition',
    price: '45.00 DT',
    image: '/images/products/gtav.jpeg',
    link: '/services/gta-v',
  },
  {
    id: '5',
    publisher: 'NETFLIX',
    title: 'Netflix Premium 1 Profile',
    price: '15.00 DT',
    image: '/images/products/netflix.jpeg',
    link: '/services/netflix-premium',
  },
  {
    id: '6',
    publisher: 'SPOTIFY',
    title: 'Spotify Premium Solo 1 Month',
    price: '10.00 DT',
    image: '/images/products/spotify.jpeg',
    link: '/services/spotify-premium',
  },
];

export default function FeaturedProducts() {
  const [activeProduct, setActiveProduct] = useState<Product>(FEATURED_PRODUCTS[0]);

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4">
      {/* MAIN FEATURED CARD */}
      <div className="relative w-full max-w-xl bg-zinc-950/90 border border-zinc-800/80 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:border-red-500/30">
        
        {/* Ambient Red Glow Behind Header Image */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-48 bg-red-600/20 blur-3xl pointer-events-none -z-0" />

        {/* IMAGE CONTAINER */}
        <div className="relative w-full h-[280px] md:h-[320px] bg-zinc-900 overflow-hidden z-10">
          <Image
            src={activeProduct.image}
            alt={activeProduct.title}
            fill
            className="object-cover object-center transition-all duration-500 transform scale-100 hover:scale-105"
            priority
          />
        </div>

        {/* CARD CONTENT FOOTER */}
        <div className="p-6 md:p-8 bg-zinc-950/95 relative z-10 flex flex-col gap-3">
          
          {/* Publisher Badge */}
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-red-500/10 text-red-500 border border-red-500/20 tracking-wider uppercase">
              {activeProduct.publisher}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {activeProduct.title}
          </h3>

          {/* Price & Shop CTA Button */}
          <div className="flex items-end justify-between mt-2">
            <div>
              <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">From</p>
              <p className="text-3xl md:text-4xl font-black text-red-500 font-mono tracking-tight">
                {activeProduct.price}
              </p>
            </div>

            <Link
              href={activeProduct.link}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition duration-200 shadow-lg shadow-red-500/25 active:scale-95 flex items-center gap-2 text-sm md:text-base"
            >
              Shop <span>→</span>
            </Link>
          </div>

        </div>
      </div>

      {/* THUMBNAIL SELECTOR BAR */}
      <div className="flex items-center justify-center gap-3 mt-6 p-2 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl backdrop-blur-md max-w-full overflow-x-auto">
        {FEATURED_PRODUCTS.map((prod) => {
          const isActive = activeProduct.id === prod.id;
          return (
            <button
              key={prod.id}
              onClick={() => setActiveProduct(prod)}
              className={`relative w-12 h-14 md:w-14 md:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'border-red-500 scale-105 shadow-lg shadow-red-500/30'
                  : 'border-zinc-800/80 opacity-60 hover:opacity-100 hover:border-zinc-700'
              }`}
            >
              <Image
                src={prod.image}
                alt={prod.title}
                fill
                className="object-cover"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}