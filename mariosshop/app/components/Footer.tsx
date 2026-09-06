import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-zinc-950 border-t border-zinc-900 px-4 py-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
        
        {/* Brand Title */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🍄</span>
          <span className="font-black text-base tracking-tight text-white">
            MARIO'S<span className="text-red-500">.</span>SHOP
          </span>
        </div>

        {/* Custom Developer Attribution Signature */}
        <p className="text-xs text-zinc-600 font-mono">
          © 2026 Mario's Shop. All rights reserved. Powered by Amen allah chouaieb
        </p>

      </div>
    </footer>
  );
}