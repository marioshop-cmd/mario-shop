'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface PaymentMethod {
  id: string;
  name: string;
  icon_url: string;
}

const KEY_STORAGE = 'paymentAdminKey';
const ICON_SIZE = 128; // icons are shrunk to fit inside 128x128 before saving

// Shrinks the chosen image so it stays small (a few KB) and keeps transparency.
function resizeToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('This file is not a valid image.'));
      img.onload = () => {
        const scale = Math.min(ICON_SIZE / img.width, ICON_SIZE / img.height, 1);
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not process the image.'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function AdminPaymentMethodsPage() {
  const { currentUser } = useAuth();

  const [adminKey, setAdminKey] = useState('');
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      setAdminKey(sessionStorage.getItem(KEY_STORAGE) || '');
    } catch {
      /* storage not available */
    }
  }, []);

  const handleKeyChange = (value: string) => {
    setAdminKey(value);
    try {
      sessionStorage.setItem(KEY_STORAGE, value);
    } catch {
      /* storage not available */
    }
  };

  const loadMethods = async () => {
    try {
      const res = await fetch('/api/payment-methods', { cache: 'no-store' });
      const data = await res.json();
      setMethods(Array.isArray(data) ? data : []);
    } catch {
      setMethods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMethods();
  }, []);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessage(null);
    try {
      setIconPreview(await resizeToDataUrl(file));
    } catch (err: any) {
      setIconPreview(null);
      setMessage({ type: 'error', text: err?.message || 'Could not use this image.' });
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Enter a name for the payment method.' });
      return;
    }
    if (!iconPreview) {
      setMessage({ type: 'error', text: 'Upload an icon.' });
      return;
    }
    if (!adminKey) {
      setMessage({ type: 'error', text: 'Enter the admin key first.' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ name: name.trim(), iconUrl: iconPreview }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({
          type: 'error',
          text: `${data?.error || 'Could not add the payment method.'}${data?.details ? ` (${data.details})` : ''}`,
        });
      } else {
        setMessage({ type: 'success', text: `${data.name} added.` });
        setName('');
        setIconPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        await loadMethods();
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (method: PaymentMethod) => {
    if (!confirm(`Remove ${method.name}?`)) return;
    setMessage(null);
    if (!adminKey) {
      setMessage({ type: 'error', text: 'Enter the admin key first.' });
      return;
    }
    try {
      const res = await fetch(`/api/payment-methods?id=${encodeURIComponent(method.id)}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey },
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data?.error || 'Could not remove it.' });
      } else {
        setMessage({ type: 'success', text: `${method.name} removed.` });
        await loadMethods();
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  if (!currentUser?.isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
        <p className="text-sm text-zinc-400">This page is for the shop admin only.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 pt-28 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Payment methods</h1>
          <p className="mt-1 text-xs text-zinc-400">
            These appear on the home page with their icon and name.
          </p>
        </div>

        {message && (
          <div
            role="status"
            className={`rounded-xl border p-3 text-xs font-semibold ${
              message.type === 'success'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                : 'border-red-500/40 bg-red-500/10 text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}

        <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <label className="block text-xs font-bold text-zinc-300" htmlFor="admin-key">
            Admin key
          </label>
          <input
            id="admin-key"
            type="password"
            value={adminKey}
            onChange={(e) => handleKeyChange(e.target.value)}
            placeholder="The PAYMENT_ADMIN_KEY value from your server settings"
            autoComplete="off"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white outline-none transition focus:border-red-500"
          />
          <p className="text-[11px] text-zinc-500">
            Kept only for this browser tab. It is needed to add or remove methods.
          </p>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="mb-4 text-sm font-bold text-white">Add a payment method</h2>

          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-zinc-300" htmlFor="pm-name">
                Name
              </label>
              <input
                id="pm-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                placeholder="D17"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white outline-none transition focus:border-red-500"
              />
            </div>

            <div>
              <span className="mb-1.5 block text-xs font-bold text-zinc-300">Icon</span>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
                  {iconPreview ? (
                    <img src={iconPreview} alt="Icon preview" className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-zinc-600">No icon</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl bg-zinc-800 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-zinc-700"
                >
                  {iconPreview ? 'Change icon' : 'Choose icon'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleFile}
                  className="hidden"
                />
              </div>
              <p className="mt-2 text-[11px] text-zinc-500">
                PNG with a transparent background works best. It is shrunk automatically.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-red-500 disabled:opacity-60"
            >
              {saving ? 'Adding…' : 'Add payment method'}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="mb-4 text-sm font-bold text-white">Current methods</h2>

          {loading ? (
            <p className="text-xs text-zinc-500">Loading…</p>
          ) : methods.length === 0 ? (
            <p className="text-xs text-zinc-500">No payment methods yet. Add the first one above.</p>
          ) : (
            <ul className="space-y-3">
              {methods.map((method) => (
                <li
                  key={method.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3"
                >
                  <div className="flex items-center gap-3">
                    <img src={method.icon_url} alt="" className="h-10 w-10 object-contain" />
                    <span className="text-sm font-bold">{method.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(method)}
                    className="rounded-lg border border-red-500/40 px-3 py-1.5 text-[11px] font-bold text-red-400 transition hover:bg-red-500/10"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
