'use client';

import React, { useEffect, useState } from 'react';

interface PaymentMethod {
  id: string;
  name: string;
  icon_url: string;
}

/**
 * Shows the payment methods added from the admin page: icon + name only,
 * no description text. Put <PaymentMethods /> on the home page where the
 * old payment cards were (keep your own section title around it).
 */
export default function PaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/payment-methods', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setMethods(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (methods.length === 0) return null;

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {methods.map((method) => (
        <div
          key={method.id}
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-center"
        >
          <img
            src={method.icon_url}
            alt={method.name}
            className="h-14 w-14 object-contain"
            loading="lazy"
          />
          <span className="text-sm font-bold text-white">{method.name}</span>
        </div>
      ))}
    </div>
  );
}
