
'use client';

import React from "react";
// @ts-ignore CSS side-effect imports are handled by the Next.js bundler.
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
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
        {/* Website Title */}
        <title>Mario's Shop | Premium Digital Marketplace</title>

        {/* SEO Description */}
        <meta
          name="description"
          content="Level up with instant delivery gift cards, gaming top-ups, and subscriptions."
        />

        {/* Responsive Viewport */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />

        {/* Theme Color */}
        <meta name="theme-color" content="#09090b" />

        {/* Mario Shop Favicon */}
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="shortcut icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
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

        <GoogleAnalytics gaId="G-QRMZVEKJ6D" />
      </body>
    </html>
  );
}
