'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  CircleHelp,
  Home,
  Mail,
  Search,
  ShoppingBag,
  Store,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getAllProductsFlat, onProductsChanged, type FlatProduct } from '../lib/products';
import LanguageSwitcher from '../language/LanguageSwitcher';

const navLinks = [
  { name: 'HOME', path: '/', icon: <Home className="h-4 w-4" /> },
  { name: 'SERVICES', path: '/services', icon: <Store className="h-4 w-4" /> },
  { name: 'MY ORDERS', path: '/my-orders', icon: <ShoppingBag className="h-4 w-4" /> },
  { name: 'REFERRAL', path: '/referral', icon: <Users className="h-4 w-4" /> },
  { name: 'CONTACT', path: '/contact', icon: <Mail className="h-4 w-4" /> },
  { name: 'FAQ', path: '/faq', icon: <CircleHelp className="h-4 w-4" /> },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logoutUser } = useAuth();
  const { totalCartItemsCount, openCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const userBalance = currentUser?.b9chich ?? 0;

  // Live product catalog for the search bar — pulled from the same shared
  // Supabase-backed source the Services page and admin dashboard already
  // use, so it's never hardcoded and stays current automatically: new
  // products, renamed products, and deleted products all reflect here with
  // no changes needed to this file.
  //
  // getAllProductsFlat() is async (it fetches /api/products), and
  // onProductsChanged()'s callback fires with no data of its own — it just
  // signals "something changed" — so each time it fires we re-fetch fresh
  // data ourselves and only apply it if the component is still mounted.
  const [products, setProducts] = useState<FlatProduct[]>([]);
  useEffect(() => {
    let isMounted = true;

    const loadProducts = () => {
      getAllProductsFlat()
        .then((data) => {
          if (isMounted) setProducts(data);
        })
        .catch((error) => {
          console.error('Navbar search: failed to load products', error);
        });
    };

    loadProducts();
    const unsubscribe = onProductsChanged(loadProducts);

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const searchResults = trimmedQuery
    ? products.filter((product) => product.name.toLowerCase().includes(trimmedQuery)).slice(0, 8)
    : [];

  // Sends the shopper straight to that product's detail view, reusing the
  // ?brandId=&productId= deep link the Services page already listens for.
  const handleSelectResult = (product: FlatProduct) => {
    router.push(`/services?brandId=${product.brandId}&productId=${product.id}`);
    setSearchQuery('');
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
  };

  const renderResultsList = () => (
    searchResults.length === 0 ? (
      <p className="px-4 py-3 text-xs text-zinc-500">No results found.</p>
    ) : (
      searchResults.map((product) => (
        <button
          key={`${product.brandId}-${product.id}`}
          type="button"
          onMouseDown={() => handleSelectResult(product)}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs text-zinc-200 transition hover:bg-zinc-800/80"
        >
          <img
            src={product.image}
            alt=""
            className="h-8 w-8 shrink-0 rounded-lg bg-zinc-900 object-cover"
          />
          <span className="truncate">{product.name}</span>
        </button>
      ))
    )
  );

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/95 px-4 py-3 backdrop-blur-md md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Mario's Shop home">
            <img src="/images/logo.png" alt="" className="h-8 w-8 object-contain sm:h-9 sm:w-9" />
            <span className="text-sm font-black tracking-tight text-white sm:text-base">
              MARIO'S<span className="text-red-500">.</span>SHOP
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className={`relative flex items-center gap-2 py-1 text-xs font-extrabold tracking-wider transition-colors md:text-sm ${
                  pathname === link.path ? 'text-red-500' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {link.icon}
                <span className="whitespace-nowrap">{link.name}</span>
                {pathname === link.path && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative hidden w-52 md:block lg:w-64">
              <input
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full rounded-xl border border-red-500/40 bg-zinc-900/90 py-2 pl-9 pr-3 text-xs text-zinc-100 outline-none transition-all placeholder-zinc-500 focus:border-red-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-red-500" />
              {isSearchFocused && trimmedQuery && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl">
                  {renderResultsList()}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsMobileSearchOpen((isOpen) => !isOpen)}
              aria-label="Search"
              aria-expanded={isMobileSearchOpen}
              className="rounded-xl border border-red-500/40 bg-zinc-900/90 p-2 text-red-500 transition hover:border-red-500 md:hidden"
            >
              <Search className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={openCart}
              aria-label={`Open cart${totalCartItemsCount > 0 ? `, ${totalCartItemsCount} items` : ''}`}
              className="relative rounded-xl border border-red-500/40 bg-zinc-900/90 p-2 text-red-500 transition hover:border-red-500"
            >
              <span className="block text-lg leading-none" aria-hidden="true">🛒</span>
              {totalCartItemsCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white">
                  {totalCartItemsCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-1.5 rounded-full border border-red-500/40 bg-zinc-900/90 px-2 py-1 sm:gap-2 sm:px-3 sm:py-1.5">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-red-500/50 bg-red-500/20 text-[10px] font-bold text-red-500">!</span>
              <span className="whitespace-nowrap text-[10px] font-black tracking-wide text-red-500 sm:text-xs">
                {userBalance} B9CHICH <span className="hidden text-[11px] font-normal text-zinc-400 sm:inline">({userBalance} TND)</span>
              </span>
            </div>

            <div className="shrink-0">
              <LanguageSwitcher />
            </div>

            <div className="hidden items-center gap-2 pl-2 md:flex">
              <span className="text-xs font-bold text-zinc-300">{currentUser?.username || 'Guest'}</span>
              {currentUser ? (
                <button type="button" onClick={logoutUser} className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-bold text-zinc-300 transition hover:bg-zinc-800">
                  Logout
                </button>
              ) : (
                <Link href="/login" className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {isMobileSearchOpen && (
        <div className="fixed inset-x-0 top-[3.75rem] z-40 border-b border-zinc-800/80 bg-zinc-950/98 px-4 py-3 shadow-xl backdrop-blur-md md:hidden">
          <div className="relative mx-auto max-w-xl">
            <input
              type="text"
              autoFocus
              placeholder="Search products..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-xl border border-red-500/40 bg-zinc-900/90 py-2.5 pl-9 pr-9 text-sm text-zinc-100 outline-none transition-all placeholder-zinc-500 focus:border-red-500"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-red-500" />
            <button
              type="button"
              onClick={() => {
                setIsMobileSearchOpen(false);
                setSearchQuery('');
              }}
              aria-label="Close search"
              className="absolute right-2.5 top-2.5 text-zinc-500 transition hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {trimmedQuery && (
            <div className="mx-auto mt-3 max-h-80 max-w-xl overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900/70">
              {searchResults.length === 0 ? (
                <p className="px-4 py-3 text-xs text-zinc-500">No results found.</p>
              ) : (
                searchResults.map((product) => (
                  <button
                    key={`${product.brandId}-${product.id}`}
                    type="button"
                    onClick={() => handleSelectResult(product)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs text-zinc-200 transition hover:bg-zinc-800/80"
                  >
                    <img
                      src={product.image}
                      alt=""
                      className="h-8 w-8 shrink-0 rounded-lg bg-zinc-900 object-cover"
                    />
                    <span className="truncate">{product.name}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

    </>
  );
}
