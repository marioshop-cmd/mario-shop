'use client';

/**
 * Mobile-only bottom navigation bar (Home / Services / Account / Cart /
 * More), plus a slide-up "More" sheet for the rest of the site's links —
 * same layout pattern as Kwaret.shop's mobile nav, but using this site's
 * actual pages, icons, and red/zinc theme instead of copying their content.
 *
 * This is hidden at the `lg` breakpoint and above (`lg:hidden`), matching
 * the exact breakpoint where Navbar.tsx's own nav links collapse
 * (`hidden lg:flex`) — so there's never a point where both the desktop nav
 * links AND this bar show at once.
 *
 * Add <MobileBottomNav /> once in app/layout.tsx, right alongside <Navbar />
 * (see SETUP_INSTRUCTIONS_MOBILE_NAV.md for exactly where). It renders
 * fixed to the bottom of the viewport, so it doesn't need to be repeated on
 * every page.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Store, User, ShoppingCart, Menu, X, LogOut, LogIn } from 'lucide-react';
import LanguageSwitcher from '../language/LanguageSwitcher';

// Reuses the exact same icon paths as Navbar.tsx so mobile and desktop
// icons look identical.
const HomeIcon = () => (
  <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </svg>
);

const MyOrdersIcon = () => (
  <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
);

const ReferralIcon = () => (
  <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  </svg>
);

const ContactIcon = () => (
  <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
  </svg>
);

const FaqIcon = () => (
  <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 11.9 12 12.5 12 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z" />
  </svg>
);

interface MoreLink {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const MORE_LINKS: MoreLink[] = [
  { name: 'My Orders', path: '/my-orders', icon: <MyOrdersIcon /> },
  { name: 'Referral', path: '/referral', icon: <ReferralIcon /> },
  { name: 'Contact', path: '/contact', icon: <ContactIcon /> },
  { name: 'FAQ', path: '/faq', icon: <FaqIcon /> },
];

function TabButton({
  active,
  label,
  icon,
  badge,
  onClick,
  href,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  onClick?: () => void;
  href?: string;
}) {
  const content = (
    <div
      className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 rounded-xl transition-colors duration-200 ${
        active ? 'bg-red-600 text-white' : 'text-zinc-400'
      }`}
    >
      <div className="relative">
        {icon}
        {typeof badge === 'number' && badge > 0 && (
          <span className="absolute -top-1.5 -right-2 bg-white text-red-600 text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
            {badge}
          </span>
        )}
      </div>
      <span className="text-[10px] font-bold tracking-wide">{label}</span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="flex-1 flex items-center justify-center">
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className="flex-1 flex items-center justify-center">
      {content}
    </button>
  );
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { currentUser, logoutUser } = useAuth();
  const { totalCartItemsCount, openCart } = useCart();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Prevent the page behind the More sheet from scrolling while it's open.
  useEffect(() => {
    if (isMoreOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isMoreOpen]);

  const isHome = pathname === '/';
  const isServices = pathname === '/services';
  const isAccount = pathname === '/account' || pathname === '/login';
  const isMoreActivePage = MORE_LINKS.some((l) => l.path === pathname);

  return (
    <>
      {/* Bottom bar — hidden at lg and above, matching Navbar.tsx's own
          `hidden lg:flex` breakpoint for its desktop nav links. */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 border-t border-zinc-800/80 backdrop-blur-md"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-stretch px-1 py-1.5">
          <TabButton active={isHome} label="Home" icon={<HomeIcon />} href="/" />
          <TabButton active={isServices} label="Shop" icon={<Store className="w-5 h-5 shrink-0" />} href="/services" />
          <TabButton
            active={isAccount}
            label="Account"
            icon={<User className="w-5 h-5 shrink-0" />}
            href={currentUser ? '/account' : '/login'}
          />
          <TabButton
            active={false}
            label="Cart"
            icon={<ShoppingCart className="w-5 h-5 shrink-0" />}
            badge={totalCartItemsCount}
            onClick={openCart}
          />
          <TabButton
            active={isMoreOpen || isMoreActivePage}
            label="More"
            icon={<Menu className="w-5 h-5 shrink-0" />}
            onClick={() => setIsMoreOpen(true)}
          />
        </div>
      </nav>

      {/* More sheet */}
      {isMoreOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsMoreOpen(false)}
          />

          {/* Sheet */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 rounded-t-3xl px-5 pt-5"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 96px)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <span className="text-red-500 text-xs font-black tracking-widest">MENU</span>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Links grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {MORE_LINKS.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setIsMoreOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-3 rounded-2xl border transition ${
                    pathname === link.path
                      ? 'bg-red-600/15 border-red-500/50 text-red-500'
                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-300'
                  }`}
                >
                  {link.icon}
                  <span className="text-sm font-bold">{link.name}</span>
                </Link>
              ))}
            </div>

            {/* Language */}
            <div className="mb-5">
              <div className="text-[10px] font-black tracking-widest text-zinc-500 mb-2">LANGUAGE</div>
              <LanguageSwitcher />
            </div>

            {/* Login / Logout */}
            {currentUser ? (
              <button
                onClick={() => {
                  logoutUser();
                  setIsMoreOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-sm py-3 rounded-2xl"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMoreOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-bold text-sm py-3 rounded-2xl"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
