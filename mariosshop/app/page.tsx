'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import FaqSection from './components/FaqSection';
import FeaturedProducts from './components/FeaturedProducts';
import { useLanguage } from './language/LanguageContext';
import { getLeaderboard, onLeaderboardChanged, type LeaderboardEntry } from './lib/leaderboard';

// Initial Kwaret-Style Reviews Data
const INITIAL_REVIEWS: { id: number; user: string; item: string; rating: number; comment: string }[] = [];

// Timeline Data for How It Works Section
const STEPS = [
  { id: "01", titleKey: "step1_title", descKey: "step1_desc", icon: "🛒", badge: "Step 1" },
  { id: "02", titleKey: "step2_title", descKey: "step2_desc", icon: "🧺", badge: "Step 2" },
  { id: "03", titleKey: "step3_title", descKey: "step3_desc", icon: "⭐", badge: "Step 3" },
];

// Tunisian Payment Methods
const TUNISIAN_PAYMENTS = [
  { id: "1", titleKey: "payment1_title", descKey: "payment1_desc", logo: "/payment/d17.png", badge: "D17" },
  { id: "2", titleKey: "payment2_title", descKey: "payment2_desc", logo: "/payment/ooredoo.png", badge: "OOREDOO TN" },
  { id: "3", titleKey: "payment3_title", descKey: "payment3_desc", logo: "/payment/poste-tn.png", badge: "POSTE TUNISIE" },
];

// Custom Hook for Counter Animation
function useStatsAnimation(targets: {
  happyCustomers: number;
  activeProducts: number;
}) {
  const [values, setValues] = useState({
    happyCustomers: 0,
    activeProducts: 0,
  });

  useEffect(() => {
    let frame: number;
    let timeout: ReturnType<typeof setTimeout>;

    const duration = 3500; // Slower & luxury
    const pause = 3000;

    const animate = () => {
      const start = performance.now();

      const update = (time: number) => {
        const progress = Math.min((time - start) / duration, 1);

        // Smooth Apple-like easing
        const eased =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        setValues({
          happyCustomers: Math.round(eased * targets.happyCustomers),
          activeProducts: Math.round(eased * targets.activeProducts),
        });

        if (progress < 1) {
          frame = requestAnimationFrame(update);
        } else {
          setValues(targets);

          timeout = setTimeout(() => {
            setValues({
              happyCustomers: 0,
              activeProducts: 0,
            });

            animate();
          }, pause);
        }
      };

      frame = requestAnimationFrame(update);
    };

    animate();

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
    };
  }, [targets.happyCustomers, targets.activeProducts]);

  return values;
}

// Animated 5-star rating block
function AnimatedStarRating({ rating }: { rating: number }) {
  const rounded = Math.round(rating);

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= rounded;
          return (
            <span
              key={star}
              className={`star-pop inline-block text-3xl leading-none ${
                filled ? 'text-yellow-400 star-glow' : 'text-zinc-700'
              }`}
              style={{ animationDelay: `${star * 120}ms` }}
              aria-hidden="true"
            >
              ★
            </span>
          );
        })}
      </div>
      <h3 className="text-xl font-black text-white font-mono mt-1">{rating.toFixed(1)} / 5</h3>
    </div>
  );
}

export default function HomePage() {
  const { t } = useLanguage();
  
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedReviews = localStorage.getItem('marios_shop_reviews');
    if (savedReviews) {
      try { setReviews(JSON.parse(savedReviews)); } catch (e) { console.error(e); }
    }

    // Leaderboard now comes from the shared lib/leaderboard.ts, so it stays
    // in sync with whatever the admin dashboard's "+1 Order" tool writes.
    setLeaderboard(getLeaderboard());
    const unsubscribe = onLeaderboardChanged(() => setLeaderboard(getLeaderboard()));
    return unsubscribe;
  }, []);

  // Modal & Form State for Review Submission
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [itemPurchased, setItemPurchased] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);

  // Animated Counter Values
  const { happyCustomers, activeProducts } = useStatsAnimation({
    happyCustomers: 10000,
    activeProducts: 1000,
  });

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 5;

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !comment.trim()) return;

    const newReview = {
      id: Date.now(),
      user: userName,
      item: itemPurchased || "Mario's Product",
      rating: rating,
      comment: comment
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem('marios_shop_reviews', JSON.stringify(updatedReviews));

    setUserName('');
    setItemPurchased('');
    setComment('');
    setRating(5);
    setIsModalOpen(false);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-red-600 selection:text-white pb-32 overflow-x-hidden relative">
      
      {/* INJECTED CSS */}
      <style jsx global>{`
        @keyframes marqueeMove {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .marquee-container {
          display: flex;
          width: max-content;
          animation: marqueeMove 25s linear infinite !important;
        }
        .marquee-container:hover {
          animation-play-state: paused !important;
        }

        @keyframes starPopIn {
          0% { opacity: 0; transform: scale(0.3) rotate(-15deg); }
          60% { opacity: 1; transform: scale(1.25) rotate(5deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes starShimmer {
          0%, 100% { filter: drop-shadow(0 0 0px rgba(250, 204, 21, 0)); }
          50% { filter: drop-shadow(0 0 8px rgba(250, 204, 21, 0.85)); }
        }
        .star-pop { animation: starPopIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        .star-glow { animation: starPopIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both, starShimmer 2.4s ease-in-out 0.8s infinite; }

        @keyframes counterPopIn {
          0% { opacity: 0; transform: scale(0.4) translateY(14px); }
          60% { opacity: 1; transform: scale(1.18) translateY(-3px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes counterGlow {
          0%, 100% { text-shadow: 0 0 0px rgba(239, 68, 68, 0); transform: translateY(0px); }
          50% { text-shadow: 0 0 10px rgba(239, 68, 68, 0.55), 0 0 22px rgba(239, 68, 68, 0.25); transform: translateY(-2px); }
        }
        .counter-glow { animation: counterPopIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both, counterGlow 2.6s ease-in-out 0.7s infinite; }
        .stat-card { transition: transform 0.25s ease; }
        .stat-card:hover { transform: translateY(-3px); }

        @property --beam-angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
        @keyframes beamSpin { to { --beam-angle: 360deg; } }
        .border-beam { position: relative; border-radius: inherit; isolation: isolate; }
        .border-beam::before {
          content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 1.5px;
          background: conic-gradient(from var(--beam-angle), transparent 0deg, transparent 260deg, rgba(255, 255, 255, 0.95) 300deg, rgba(255, 255, 255, 0.2) 330deg, transparent 360deg);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude;
          animation: beamSpin 3s linear infinite; animation-delay: var(--beam-delay, 0s); pointer-events: none;
        }

        /* Leaderboard smooth re-order animation */
        .leaderboard-row {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      {/* BACKGROUND GLOW */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-[400px] w-[600px] bg-red-600/10 blur-[150px] rounded-full pointer-events-none" />

      {/* FIXED SOCIAL BAR ON THE RIGHT */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2.5 translate-x-2 hover:translate-x-0 transition-transform duration-300 ease-out">
        {/* Discord */}
        <a href="#" className="group relative bg-zinc-900/90 hover:bg-[#5865F2] border-l-2 border-y border-zinc-800 hover:border-[#5865F2] text-zinc-400 hover:text-white p-3 rounded-l-2xl transition-all duration-300 ease-out shadow-xl shadow-black/60 hover:-translate-x-2 flex items-center justify-center backdrop-blur-md">
          <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 127.14 96.36">
            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14c2.64-27.38-4.51-51.11-19.32-72.1ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
          </svg>
        </a>
        {/* Facebook */}
        <a href="#" className="group relative bg-zinc-900/90 hover:bg-[#1877F2] border-l-2 border-y border-zinc-800 hover:border-[#1877F2] text-zinc-400 hover:text-white p-3 rounded-l-2xl transition-all duration-300 ease-out shadow-xl shadow-black/60 hover:-translate-x-2 flex items-center justify-center backdrop-blur-md">
          <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </a>
        {/* Instagram */}
        <a href="#" className="group relative bg-zinc-900/90 hover:bg-[#E4405F] border-l-2 border-y border-zinc-800 hover:border-[#E4405F] text-zinc-400 hover:text-white p-3 rounded-l-2xl transition-all duration-300 ease-out shadow-xl shadow-black/60 hover:-translate-x-2 flex items-center justify-center backdrop-blur-md">
          <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </a>
      </div>

      {/* 1. FEATURED PRODUCTS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 pt-32 mb-8">
        <FeaturedProducts />
      </section>

      {/* 2. CALL TO ACTION BUTTONS */}
      <section className="max-w-7xl mx-auto px-4 mb-16 flex justify-center">
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/services" className="px-9 py-3 bg-transparent hover:bg-red-500/10 font-bold border-2 border-red-500 text-red-400 transition duration-200 active:scale-95 flex items-center justify-center gap-2" style={{ borderRadius: '9999px' }}>
            {t('browse_catalog')} 🛒
          </Link>
          <a href="https://discord.gg/ZnEpRd9jR" target="_blank" rel="noopener noreferrer" className="px-9 py-3 bg-transparent hover:bg-indigo-500/10 font-bold border-2 border-indigo-500 text-indigo-400 transition duration-200 active:scale-95 flex items-center justify-center gap-2" style={{ borderRadius: '9999px' }}>
            <svg viewBox="0 0 127.14 96.36" className="w-5 h-5 fill-current"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/></svg>
            {t('join_discord')}
          </a>
        </div>
      </section>

      {/* 3. ANIMATED TRUST STATISTICS */}
      <section className="max-w-7xl mx-auto px-4 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full border-t border-b border-zinc-900 py-12 text-center">
         <div className="stat-card">
            <h3 className="counter-glow text-3xl font-black text-white font-mono" style={{ animationDelay: '0ms, 700ms' }}>{happyCustomers.toLocaleString()}+</h3>
            <p className="text-sm text-zinc-500 uppercase tracking-wider mt-1">{t('stat_happy_customers')}</p>
          </div>
          <div className="stat-card">
            <h3 className="counter-glow text-3xl font-black text-white font-mono" style={{ animationDelay: '150ms, 850ms' }}>{activeProducts.toLocaleString()}+</h3>
            <p className="text-sm text-zinc-500 uppercase tracking-wider mt-1">{t('stat_products_active')}</p>
          </div>
          <div className="stat-card">
            <AnimatedStarRating rating={averageRating} />
            <p className="text-sm text-zinc-500 uppercase tracking-wider mt-1">{t('stat_avg_rating')}</p>
          </div>
          <div className="stat-card">
            <h3 className="counter-glow text-3xl font-black text-white" style={{ animationDelay: '450ms, 1150ms' }}> 100%</h3>
            <p className="text-sm text-zinc-500 uppercase tracking-wider mt-1">{t('stat_all_services')}</p>
          </div>
        </div>
      </section>

      {/* 4. INFINITE MOVING REVIEWS SECTION */}
      <section className="max-w-7xl mx-auto px-4 mt-20">
        <div className="bg-zinc-950/60 backdrop-blur-md border border-zinc-800/60 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-medium tracking-wider text-zinc-500 block mb-1">{t('reviews_label')}</span>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{t('reviews_title')}</h2>
              <p className="text-zinc-500 text-xs md:text-sm mt-1">{t('reviews_subtitle')}</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="shrink-0 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs md:text-sm rounded-xl transition duration-200 active:scale-95 shadow-md shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer z-20">
              <span>⭐</span> {t('add_review')}
            </button>
          </div>

          <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
            {reviews.length === 0 ? (
              <p className="text-center text-sm text-zinc-500 py-8">
                No reviews yet — be the first to leave one!
              </p>
            ) : (
            <div className={`flex gap-4 ${reviews.length > 4 ? 'marquee-container' : 'flex-wrap justify-center'}`}>
              {(reviews.length > 4 ? [...reviews, ...reviews, ...reviews] : reviews).map((review, idx) => (
                <div key={`${review.id}-${idx}`} className="w-[260px] md:w-[280px] shrink-0 bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/60 p-5 rounded-2xl flex flex-col justify-between hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 transition duration-300">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-200 font-extrabold flex items-center justify-center text-lg shrink-0 shadow-sm">
                        {review.user.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-zinc-100 text-sm truncate">{review.user}</h4>
                        <p className="text-xs text-zinc-400 truncate">{review.item}</p>
                      </div>
                    </div>
                    <div className="flex items-center mb-3 text-xs">
                      <div className="flex text-yellow-400 text-xs">{"★".repeat(review.rating)}</div>
                    </div>
                    <p className="text-zinc-300 text-xs font-medium italic">"{review.comment}"</p>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        </div>
      </section>

      

      {/* 6. HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 mt-20">
        <div className="bg-zinc-950/60 backdrop-blur-md border border-zinc-800/60 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black tracking-tight text-white">{t('how_to_order')}</h2>
            <p className="text-zinc-500 text-sm mt-2">{t('how_to_order_sub')}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
            {STEPS.map((step) => (
              <div key={step.id} className="group relative bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/50 p-8 rounded-3xl hover:border-red-500/40 hover:shadow-lg hover:shadow-red-500/10 transition duration-300">
                <div className="absolute top-4 right-6 text-7xl font-black font-mono text-zinc-900/40 select-none group-hover:text-red-500/10 transition duration-300">{step.id}</div>
                <span className="inline-block text-[10px] uppercase font-bold tracking-widest text-red-500 bg-red-500/10 px-2.5 py-1 rounded-md border border-red-500/10 mb-6">{step.badge}</span>
                <div className="w-12 h-12 rounded-2xl bg-zinc-900/80 flex items-center justify-center text-2xl border border-zinc-800 mb-6 shadow-inner">{step.icon}</div>
                <h3 className="text-xl font-bold tracking-tight text-zinc-100 mb-2 group-hover:text-white transition">{t(step.titleKey)}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{t(step.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. LOCAL TUNISIAN PAYMENT METHODS SECTION */}
      <section className="max-w-7xl mx-auto px-4 mt-20">
        <div className="bg-zinc-950/60 backdrop-blur-md border border-zinc-800/60 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">{t('payment_methods')}</h2>
            <p className="text-zinc-500 text-sm mt-2">{t('payment_methods_sub')}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
            {TUNISIAN_PAYMENTS.map((payment) => (
              <div key={payment.id} className="group relative bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/50 hover:border-red-500/40 hover:shadow-lg hover:shadow-red-500/10 rounded-3xl p-8 transition duration-300">
                <div className="absolute top-4 right-6 text-7xl font-black font-mono text-zinc-900/40 select-none group-hover:text-red-500/10 transition duration-300">{payment.id}</div>
                <span className="inline-block text-[10px] uppercase font-bold tracking-widest text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800 mb-6">{payment.badge}</span>
                <div className="w-20 h-20 rounded-2xl bg-zinc-900/80 flex items-center justify-center border border-zinc-800 group-hover:border-red-500/40 mb-6 shadow-inner overflow-hidden p-3 transition duration-300">
                  <img src={payment.logo} alt={payment.badge} className="w-full h-full object-contain drop-shadow-lg" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-zinc-100 mb-2 group-hover:text-white transition">{t(payment.titleKey)}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{t(payment.descKey)}</p>
              </div>
            ))}
          </div>

          {/* ONE BUTTON FOR ALL PAYMENT METHODS */}
          <div className="mt-8 flex justify-center">
            <Link href="/add-b9chich"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border-2 border-red-500 bg-red-500/10 text-red-400 font-black tracking-wide transition duration-200 hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-600/20 active:scale-95"
            >
              💰 ADD B9CHICH <span className="text-base">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* REVIEW SUBMISSION MODAL POPUP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">{t('write_review')}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white text-xl p-1 font-bold">✕</button>
            </div>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-semibold text-zinc-400 mb-1">{t('your_name')}</label>
                <input type="text" required placeholder="e.g. Youssef TN" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="block text-xs uppercase font-semibold text-zinc-400 mb-1">{t('item_purchased')}</label>
                <input type="text" placeholder="e.g. Netflix Account" value={itemPurchased} onChange={(e) => setItemPurchased(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="block text-xs uppercase font-semibold text-zinc-400 mb-1">{t('rating')}</label>
                <div className="flex gap-2 text-xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button type="button" key={star} onClick={() => setRating(star)} className={`transition ${star <= rating ? 'text-yellow-400' : 'text-zinc-700'}`}>★</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase font-semibold text-zinc-400 mb-1">{t('comment')}</label>
                <textarea required rows={3} placeholder={t('comment_placeholder')} value={comment} onChange={(e) => setComment(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl text-sm transition">{t('cancel')}</button>
                <button type="submit" className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-red-600/20">{t('submit_review')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. TOP 10 CLIENT ORDERS LEADERBOARD (NEW SECTION) */}
      <section className="max-w-4xl mx-auto px-4 mt-20">
        <div className="bg-zinc-950/60 backdrop-blur-md border border-zinc-800/60 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          
          <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4 text-center sm:text-left">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-white flex items-center justify-center sm:justify-start gap-3">
                 Top 10 Clients
              </h2>
              <p className="text-zinc-500 text-sm mt-2">Our most loyal customers. Automatically updates in real-time.</p>
            </div>
          </div>

          <div className="flex flex-col rounded-xl overflow-hidden">
            {leaderboard.slice(0, 10).map((client, index) => (
              <div 
                key={client.id} 
                className="leaderboard-row group flex items-center justify-between py-4 border-b border-zinc-800/80 last:border-0 hover:bg-zinc-900/30 transition-colors px-4 -mx-4 sm:px-6 sm:-mx-6 cursor-default"
              >
                <div className="flex items-center gap-6 flex-1 min-w-0">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-zinc-600 group-hover:text-red-500 transition-colors w-10 text-right shrink-0">
                    {index + 1}
                  </span>
                  <span className="font-semibold text-[#b3b3b3] group-hover:text-white transition-colors text-base sm:text-lg truncate">
                    {client.username}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-zinc-500 text-xs sm:text-sm font-medium shrink-0 ml-4 group-hover:text-zinc-400 transition-colors">
                  <span className="w-1 h-1 rounded-full bg-zinc-600"></span>
                  {client.orders} order{client.orders !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </main>
  );
}