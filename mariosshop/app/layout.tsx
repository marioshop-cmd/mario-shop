'use client';

import React from "react";
// @ts-ignore CSS side-effect imports are handled by the Next.js bundler.
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import NotificationToast from "./components/NotificationToast";
import { CartProvider } from "./context/CartContext";
import { LanguageProvider } from "./language/LanguageContext";
import Navbar from "./components/Navbar";
import MobileBottomNav from "./components/MobileBottomNav";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Mario's Shop | Premium Digital Marketplace</title>

        <meta
          name="description"
          content="Level up with instant delivery gift cards, gaming top-ups, and subscriptions."
        />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />

        <meta name="theme-color" content="#09090b" />
      </head>

      <body className="flex min-h-screen flex-col bg-zinc-950 pb-20 text-white antialiased md:pb-0">
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <Navbar />
              <MobileBottomNav />

              <main className="flex-1">
                {children}
              </main>

              <Footer />
              <CartDrawer />
              <NotificationToast />
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
