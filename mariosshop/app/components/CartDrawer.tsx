'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeCartItem,
    totalCartCost,
    checkout,
    isNoCoinsModalOpen,
    closeNoCoinsModal,
    checkoutMessage,
  } = useCart();

  return (
    <>
      {/* ---------------------------------------------------- */}
      {/* SHOPPING CART (PANIER 🧺) DRAWER / SIDEBAR           */}
      {/* ---------------------------------------------------- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-zinc-950 border-l border-zinc-800 h-full p-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <span>🧺</span> Panier (Basket)
                </h2>
                <button
                  onClick={closeCart}
                  className="text-zinc-400 hover:text-white font-bold text-sm bg-zinc-900 w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500 text-xs">
                    El 9ofa far8a (Your panier is empty)!
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg bg-zinc-950 border border-zinc-800"
                          />
                        )}
                        <div>
                          <h4 className="text-xs font-bold text-white">{item.name}</h4>
                          {item.variantLabel && (
                            <span className="text-[10px] text-amber-400 font-mono block">{item.variantLabel}</span>
                          )}
                          <span className="text-xs font-black text-red-400 mt-0.5 block">
                            {item.priceNumeric.toFixed(2)} TND
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.cartItemId, -1)}
                            className="px-2 py-0.5 text-xs text-zinc-400 hover:text-white"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-bold text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.cartItemId, 1)}
                            className="px-2 py-0.5 text-xs text-zinc-400 hover:text-white"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeCartItem(item.cartItemId)}
                          className="text-zinc-500 hover:text-red-400 text-xs px-1"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-zinc-900 pt-4 space-y-4">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-zinc-400">Total Price:</span>
                <span className="text-lg font-black text-amber-400">{totalCartCost.toFixed(2)} TND</span>
              </div>

              <button
                onClick={checkout}
                disabled={cart.length === 0}
                className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition ${
                  cart.length > 0
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20'
                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                }`}
              >
                Commander / Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* INSUFFICIENT COINS / CONTACT POPUP MODAL            */}
      {/* ---------------------------------------------------- */}
      {isNoCoinsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 max-w-md w-full space-y-6 text-center shadow-2xl relative">
            <button
              onClick={closeNoCoinsModal}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white font-bold text-xs bg-zinc-950 w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center"
            >
              ✕
            </button>

            <div className="w-16 h-16 bg-red-950/80 border border-red-500/40 rounded-full flex items-center justify-center mx-auto text-3xl">
              ⚠️
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">Solde Insuffisant / No Coins!</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {checkoutMessage ||
                  "You don't have enough balance or coins to complete this order. Please reach out via Discord or Instagram to top up your account or create a ticket."}
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Link
                href="/contact?tab=ticket&reason=balance"
                onClick={closeNoCoinsModal}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
              >
                <span>🎫</span> Open Support Ticket
              </Link>

              <a
                href="https://discord.gg"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                <span>💬</span> Open Discord Ticket
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-90 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
              >
                <span>📸</span> Contact Me on Instagram
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
