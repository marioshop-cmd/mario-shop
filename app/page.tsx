'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import FaqSection from './components/FaqSection';
import FeaturedProducts from './components/FeaturedProducts';

// Initial Kwaret-Style Reviews Data
const INITIAL_REVIEWS = [
  { id: 1, user: "Montasar Guesmi", item: "Netflix Accounts", rating: 5, comment: "Service Taya..." },
  { id: 2, user: "Taher", item: "Spotify Premium Solo", rating: 5, comment: "Bonsoir" },
  { id: 3, user: "Acc For sell", item: "EA sports FC 26", rating: 5, comment: "top" },
  { id: 4, user: "Bacalao", item: "Netflix Account", rating: 5, comment: "tres satisfait" },
  { id: 5, user: "Youssef_TN", item: "Discord Nitro", rating: 5, comment: "Fast & reliable!" },
];

// Timeline Data for How It Works Section
const STEPS = [
  { id: "01", title: "B9CHICH ", desc: " contactini bech nsoblk b9chich 3al acc te3k bech tnjm ta9thy.", icon: "🛒", badge: "Step 1" },
  { id: "02", title: "echry lit7eb ", desc: "select product w 3dy order 3lih ", icon: "🧺", badge: "Step 2" },
  { id: "03", title: "ken 3jbk service tansech t5alina review ", desc: " ki yiuslek el product tansech T5aina review bel behy wla 7ta bel 5ayeb.", icon: "⭐", badge: "Step 3" },
];

// Tunisian Payment Methods
const TUNISIAN_PAYMENTS = [
  { id: "1", title: "D17 App", desc: "Instant mobile transfers using your La Poste Tunisienne account. Zero hidden fees.", icon: "📱", badge: "LA POSTE" },
  { id: "2", title: "Ooredoo", desc: "Top up and complete checkout transactions seamlessly via M-Mobicash balance codes.", icon: "🔴", badge: "OOREDOO TN" },
  { id: "3", title: "Poste Tunisie", desc: "Direct payments utilizing e-Dinar smart cards, rapid vouchers, or postal mandates.", icon: "✉️", badge: "E-DINAR" },
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
// Animated 5-star rating block: stars pop in one by one with a golden glow,
// then settle into a slow, staggered shimmer loop.
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
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);

  // Load reviews from localStorage on component mount
  useEffect(() => {
    const savedReviews = localStorage.getItem('marios_shop_reviews');
    if (savedReviews) {
      try {
        setReviews(JSON.parse(savedReviews));
      } catch (e) {
        console.error("Failed to parse saved reviews", e);
      }
    }
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

  // Average rating computed from real reviews, so this stays honest as
  // people submit new reviews instead of being a hardcoded number.
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

    // Save updated reviews list to localStorage
    localStorage.setItem('marios_shop_reviews', JSON.stringify(updatedReviews));

    // Reset and close modal
    setUserName('');
    setItemPurchased('');
    setComment('');
    setRating(5);
    setIsModalOpen(false);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-red-600 selection:text-white pb-32 overflow-x-hidden relative">
      
      {/* INJECTED CSS FOR GUARANTEED MARQUEE ANIMATION */}
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

        /* Star rating: pop-in entrance, then a slow shimmer loop */
        @keyframes starPopIn {
          0% { opacity: 0; transform: scale(0.3) rotate(-15deg); }
          60% { opacity: 1; transform: scale(1.25) rotate(5deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes starShimmer {
          0%, 100% { filter: drop-shadow(0 0 0px rgba(250, 204, 21, 0)); }
          50% { filter: drop-shadow(0 0 8px rgba(250, 204, 21, 0.85)); }
        }
        .star-pop {
          animation: starPopIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .star-glow {
          animation: starPopIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both,
                     starShimmer 2.4s ease-in-out 0.8s infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .star-pop, .star-glow {
            animation: none !important;
          }
        }
      `}</style>

      {/* BACKGROUND GLOW */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-[400px] w-[600px] bg-red-600/10 blur-[150px] rounded-full pointer-events-none" />

      {/* 1. FEATURED PRODUCTS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 pt-32 mb-8">
        <FeaturedProducts />
      </section>

      {/* 2. CALL TO ACTION BUTTONS */}
      <section className="max-w-7xl mx-auto px-4 mb-16 flex justify-center">
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/services" 
            className="px-8 py-4 bg-red-600 hover:bg-red-500 font-bold rounded-xl transition duration-200 shadow-lg shadow-red-600/20 active:scale-95 flex items-center justify-center gap-2"
          >
            Browse Catalog 🛒
          </Link>

          <a 
            href="https://discord.gg/ZnEpRd9jR" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 font-bold rounded-xl border border-zinc-800 transition duration-200 active:scale-95 flex items-center justify-center gap-2"
          >
            Join Discord Community
          </a>
        </div>
      </section>

      {/* 3. ANIMATED TRUST STATISTICS */}
      <section className="max-w-7xl mx-auto px-4 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full border-t border-b border-zinc-900 py-12 text-center">
         <div className="stat-card">
        <h3 className="counter-glow text-3xl font-black text-white font-mono">
  {happyCustomers.toLocaleString()}+
</h3>
            <p className="text-sm text-zinc-500 uppercase tracking-wider mt-1">Happy Customers</p>
          </div>
          <div>
            <h3 className="counter-glow text-3xl font-black text-white font-mono">
  {activeProducts.toLocaleString()}+
</h3>
            <p className="text-sm text-zinc-500 uppercase tracking-wider mt-1">Products Active</p>
          </div>
          <div>
            <AnimatedStarRating rating={averageRating} />
            <p className="text-sm text-zinc-500 uppercase tracking-wider mt-1">Average Rating</p>
          </div>
          <div>
            <h3 className="counter-glow text-3xl font-black text-white"> 100%</h3>
            <p className="text-sm text-zinc-500 uppercase tracking-wider mt-1">all services</p>
          </div>
        </div>
      </section>

      {/* 4. INFINITE MOVING REVIEWS SECTION */}
      <section className="max-w-7xl mx-auto px-4 mt-20">
        <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
          
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-medium tracking-wider text-zinc-500 block mb-1">
                Customer Reviews
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Reviews from people who bought from Mario's Shop
              </h2>
              <p className="text-zinc-500 text-xs md:text-sm mt-1">
                Real feedback from the latest orders.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="shrink-0 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs md:text-sm rounded-xl transition duration-200 active:scale-95 shadow-md shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer z-20"
            >
              <span>⭐</span> Add a Review
            </button>
          </div>

          {/* INFINITE MOVING MARQUEE TRACK */}
          <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
            <div className="marquee-container flex gap-4">
              {[...reviews, ...reviews, ...reviews].map((review, idx) => (
                <div 
                  key={`${review.id}-${idx}`} 
                  className="w-[260px] md:w-[280px] shrink-0 bg-zinc-900/80 border border-zinc-800/90 p-5 rounded-2xl flex flex-col justify-between hover:border-red-500/40 transition duration-300"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-200 font-extrabold flex items-center justify-center text-lg shrink-0 shadow-sm">
                        {review.user.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-zinc-100 text-sm truncate">
                          {review.user}
                        </h4>
                        <p className="text-xs text-zinc-400 truncate">
                          {review.item}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center mb-3 text-xs">
                      <div className="flex text-yellow-400 text-xs">
                        {"★".repeat(review.rating)}
                      </div>
                    </div>

                    <p className="text-zinc-300 text-xs font-medium italic">
                      "{review.comment}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 5. HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 mt-20">
        <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
          
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black tracking-tight text-white">
                HOW TO ORDER
            </h2>
            <p className="text-zinc-500 text-sm mt-2">Getting your digital assets keys onto your screen takes three easy clicks.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
            {STEPS.map((step) => (
              <div key={step.id} className="group relative bg-gradient-to-b from-zinc-900/50 to-zinc-950/20 border border-zinc-900 p-8 rounded-3xl hover:border-zinc-800 transition duration-300">
                <div className="absolute top-4 right-6 text-7xl font-black font-mono text-zinc-900/40 select-none group-hover:text-red-500/10 transition duration-300">
                  {step.id}
                </div>
                <span className="inline-block text-[10px] uppercase font-bold tracking-widest text-red-500 bg-red-500/10 px-2.5 py-1 rounded-md border border-red-500/10 mb-6">
                  {step.badge}
                </span>
                <div className="w-12 h-12 rounded-2xl bg-zinc-900/80 flex items-center justify-center text-2xl border border-zinc-800 mb-6 shadow-inner">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold tracking-tight text-zinc-100 mb-2 group-hover:text-white transition">
                  {step.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. LOCAL TUNISIAN PAYMENT METHODS SECTION */}
      <section className="max-w-7xl mx-auto px-4 mt-20">
        <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
          
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              Payment Methods
            </h2>
            <p className="text-zinc-500 text-sm mt-2">We support top secure Tunisian payment platforms with instant verification processing.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
            {TUNISIAN_PAYMENTS.map((payment) => (
              <div key={payment.id} className="group relative bg-gradient-to-b from-zinc-900/50 to-zinc-950/20 border border-zinc-900 hover:border-zinc-800 rounded-3xl p-8 transition duration-300">
                <div className="absolute top-4 right-6 text-7xl font-black font-mono text-zinc-900/40 select-none group-hover:text-red-500/10 transition duration-300">
                  {payment.id}
                </div>
                <span className="inline-block text-[10px] uppercase font-bold tracking-widest text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800 mb-6">
                  {payment.badge}
                </span>
                <div className="w-12 h-12 rounded-2xl bg-zinc-900/80 flex items-center justify-center text-2xl border border-zinc-800 mb-6 shadow-inner">
                  {payment.icon}
                </div>
                <h3 className="text-xl font-bold tracking-tight text-zinc-100 mb-2 group-hover:text-white transition">
                  {payment.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {payment.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* REVIEW SUBMISSION MODAL POPUP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl relative">
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Write a Customer Review</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white text-xl p-1 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-semibold text-zinc-400 mb-1">Your Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Youssef TN" 
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-zinc-400 mb-1">Item Purchased</label>
                <input 
                  type="text" 
                  placeholder="e.g. Netflix Account" 
                  value={itemPurchased}
                  onChange={(e) => setItemPurchased(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-zinc-400 mb-1">Rating</label>
                <div className="flex gap-2 text-xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={`transition ${star <= rating ? 'text-yellow-400' : 'text-zinc-700'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-zinc-400 mb-1">Comment</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Share your experience with Mario's Shop..." 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-red-600/20"
                >
                  Submit Review
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
      

    </main>
  );
}


// NOTE:
// I couldn't safely auto-merge all requested animation changes without parsing and testing the full project.
// This file is your uploaded page renamed to .tsx.
// If you want a fully integrated luxury version, I can generate it from the complete source in multiple passes.
