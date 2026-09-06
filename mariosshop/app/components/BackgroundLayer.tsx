'use client';

import React from 'react';

/**
 * One shared background layer for the entire site, rendered once in
 * layout.tsx instead of every page painting its own copy of the image.
 * Sits fixed behind everything at z-index -1.
 *
 * The image drifts slowly and continuously from left to right (and back),
 * independent of scrolling — a smooth ambient motion via a CSS animation
 * rather than a scroll-tied transform. CSS animations are handled by the
 * browser's compositor, so this stays smooth even on lower-end devices.
 */
export default function BackgroundLayer() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#05050a]">
      <div
        className="absolute inset-y-0 site-bg-drift"
        style={{
          backgroundImage: "url('/images/site-bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Dark tint on top for text readability, same strength site-wide */}
      <div className="absolute inset-0 bg-[#05050a]/55" />

      <style jsx>{`
        .site-bg-drift {
          /* Wider than the viewport so there's room to pan left/right
             without ever revealing an edge. */
          left: -10%;
          right: -10%;
          animation: bg-pan-right 40s ease-in-out infinite alternate;
        }

        @keyframes bg-pan-right {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(6%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .site-bg-drift {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
