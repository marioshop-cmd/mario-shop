'use client';

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from './LanguageContext';

type Language = 'tn' | 'en' | 'fr';

const LANGUAGES: { code: Language; label: string; flagSrc: string }[] = [
  { code: 'tn', label: 'تونسي', flagSrc: '/images/flags/tunisia.png' },
  { code: 'en', label: 'English', flagSrc: '/images/flags/en.png' },
  { code: 'fr', label: 'Français', flagSrc: '/images/flags/france.png' },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Trigger button: flag image + chevron, styled to sit in a dark navbar */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition"
      >
        <img src={current.flagSrc} alt={current.label} className="w-5 h-3.5 object-cover rounded-sm" />
        <svg
          className={`w-3 h-3 text-zinc-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 12 12"
          fill="none"
        >
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown: light card with flag + name rows */}
      {open && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden z-50 py-1 animate-[fadeIn_0.15s_ease-out]"
        >
          {LANGUAGES.map((lang) => {
            const active = lang.code === language;
            return (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setLanguage(lang.code);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition text-left ${
                  active ? 'bg-red-50 text-red-600' : 'text-zinc-800 hover:bg-zinc-100'
                }`}
              >
                <img src={lang.flagSrc} alt={lang.label} className="w-5 h-3.5 object-cover rounded-sm" />
                {lang.label}
              </button>
            );
          })}
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
