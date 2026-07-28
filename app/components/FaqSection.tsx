'use client';

import React, { useState } from 'react';

interface FaqItem {
  question: string;
  answer: string;
  category?: string;
}

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<string>('ALL');

  const faqs: FaqItem[] = [
    {
      category: 'ORDERS',
      question: '9adech y93d w9t bech youselni el product?',
      answer:
        'El products mte3na instantly delivered! Besh yousloulek fil e-mail walla direct fil account dashboard te3ek fi a9al min 5 minutes ba3d el payment.',
    },
    {
      category: 'BALANCE',
      question: 'kifh nosb ba9chich fel compte te3i?',
      answer:
        'Tnajam teshri B9CHICH 3an tri9 el admin directly, walla tista3mel D17 / Flouci / Bank transfer, ba3dha t3abi el demand w' +
        ' yewsal balance direct l comptek.',
    },
    {
      category: 'REFUND',
      question: 'ki ysir refund chnwa na3ml?',
      answer:
        'Ki ysir ay problem fil order, contacti support fel Contact section walla Discord. El balance yarja3lk auto B9CHICH fil account te3ek fi 24h max.',
    },
    {
      category: 'SECURITY',
      question: 'Is my personal information and account safe?',
      answer:
        '100% Secure. Kol el transactions mchafrin (encrypted), w' +
        ' ma nstahfthouch b sensitive password parameters. Kol chy protected.',
    },
  ];

  const categories = ['ALL', 'ORDERS', 'BALANCE', 'REFUND', 'SECURITY'];

  const filteredFaqs =
    activeTab === 'ALL'
      ? faqs
      : faqs.filter((faq) => faq.category === activeTab);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      {/* HEADER SECTION */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold uppercase tracking-widest mb-3 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Got Questions?
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2 uppercase">
          AKTHER AS2LA <span className="text-red-500 underline decoration-red-500/50 underline-offset-8">MET3WDA</span>
        </h1>
        <p className="text-zinc-400 text-xs md:text-sm max-w-md mx-auto">
          Everything you need to know about purchasing, balance top-ups, and Instant Delivery.
        </p>
      </div>

      {/* CATEGORY TABS */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveTab(cat);
              setOpenIndex(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-200 border ${
              activeTab === cat
                ? 'bg-red-600 text-white border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] scale-105'
                : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ACCORDION LIST */}
      <div className="space-y-3">
        {filteredFaqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isOpen
                  ? 'bg-zinc-900/90 border-red-500/60 shadow-[0_0_25px_rgba(239,68,68,0.15)]'
                  : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full flex items-center justify-between p-5 text-left transition"
              >
                <div className="flex items-center gap-3 pr-4">
                  <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                  <span className="text-sm md:text-base font-extrabold text-zinc-100 tracking-wide">
                    {faq.question}
                  </span>
                </div>

                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-300 flex-shrink-0 ${
                    isOpen
                      ? 'bg-red-500/20 border-red-500/50 text-red-500 rotate-180'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                  </svg>
                </div>
              </button>

              {/* SMOOTH EXPANDABLE BODY */}
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="p-5 pt-0 text-xs md:text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/50 mt-1">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SUPPORT BANNER */}
      <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-red-950/30 via-zinc-900 to-zinc-950 border border-red-500/20 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-left">
          <h4 className="text-sm font-bold text-white">Ma l9itech l ijaba te3ek?</h4>
          <p className="text-xs text-zinc-400">Contact our 24/7 support team directly.</p>
        </div>
        <a
          href="/contact"
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider transition shadow-[0_0_15px_rgba(239,68,68,0.4)]"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}