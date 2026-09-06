'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Store, User } from 'lucide-react';
import NotificationPrompt from './NotificationPrompt';
import LanguageSwitcher from '../language/LanguageSwitcher';

export default function Navbar() {
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const { totalCartItemsCount, openCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    {
      name: 'HOME',
      path: '/',
      icon: (
        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
    },
    {
      name: 'SERVICES',
      path: '/services',
      icon: <Store className="w-4 h-4 shrink-0" />,
    },
    {
      name: 'MY ORDERS',
      path: '/my-orders',
      icon: (
        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      ),
    },
    {
      name: 'REFERRAL',
      path: '/referral',
      icon: (
        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      ),
    },
    {
      name: 'CONTACT',
      path: '/contact',
      icon: (
        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
      ),
    },
    {
      name: 'FAQ',
      path: '/faq',
      icon: (
        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 11.9 12 12.5 12 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z" />
        </svg>
      ),
    },
  ];

  const userBalance = currentUser?.b9chich ?? 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/95 border-b border-zinc-800/80 backdrop-blur-md px-3 md:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">

        {/* LEFT SECTION: Logo + Nav Links */}
        <div className="flex items-center gap-4 lg:gap-5 min-w-0">
          <Link href="/" className="shrink-0 flex items-center group">
            <div className="relative flex items-center justify-center">
              <img 
                src="/images/logo.png" 
                alt="Mario's Shop" 
                className="relative h-10 w-auto object-contain drop-shadow-[0_0_8px_rgba(239,68,68,0.4)] group-hover:scale-105 transition duration-300" 
              />
            </div>
          </Link>

          {/* NAV LINKS */}
          <nav className="hidden lg:flex items-center gap-3 xl:gap-5 overflow-x-auto no-scrollbar">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`relative flex items-center gap-1.5 text-[11px] xl:text-xs font-extrabold tracking-wider py-1 transition-colors duration-200 shrink-0 ${
                    isActive ? 'text-red-500' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {link.icon}
                  <span className="whitespace-nowrap">{link.name}</span>

                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* RIGHT CONTROLS */}
        <div className="flex items-center gap-2.5 shrink-0">

          <LanguageSwitcher />

          {/* SEARCH BAR */}
          <div className="relative hidden xl:block w-48">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/90 border border-red-500/40 focus:border-red-500 text-xs text-zinc-100 placeholder-zinc-500 rounded-xl pl-8 pr-3 py-1.5 outline-none transition-all"
            />
            <svg className="w-3.5 h-3.5 text-red-500 absolute left-2.5 top-2 fill-current" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </div>

          {/* CART BUTTON */}
          <button
            onClick={openCart}
            className="relative bg-zinc-900/90 border border-red-500/40 hover:border-red-500 p-2 rounded-xl text-red-500 transition"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
            {totalCartItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {totalCartItemsCount}
              </span>
            )}
          </button>

          {/* BALANCE BUTTON */}
          <div className="hidden sm:flex items-center gap-1.5 bg-zinc-900/90 border border-red-500/40 px-2.5 py-1 rounded-full">
            <div className="w-3.5 h-3.5 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center text-[9px] font-bold border border-red-500/50">
              !
            </div>
            <span className="text-[11px] font-black text-red-500 tracking-wide">
              {userBalance} B9CHICH
            </span>
          </div>

          {/* USER */}
          <div className="flex items-center">
            {currentUser ? (
              <Link href="/account" className="flex items-center gap-1.5 group">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-red-900 border border-red-500/50 flex items-center justify-center overflow-hidden shadow-[0_0_8px_rgba(239,68,68,0.3)] group-hover:shadow-[0_0_12px_rgba(239,68,68,0.5)] transition-all">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-white" />
                  )}
                </div>
                <span className="hidden 2xl:inline text-xs font-bold text-zinc-300 group-hover:text-white transition">
                  {currentUser.username || 'Guest'}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl transition"
              >
                Login
              </Link>
            )}
          </div>

        </div>

      </div>

      {currentUser && <NotificationPrompt />}
    </header>
  );
}