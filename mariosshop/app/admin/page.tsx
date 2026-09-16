'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import AdminPinGate from '@/app/components/AdminPinGate';
import { addOrderByEmail } from '@/app/lib/leaderboard';
import { getAllTickets } from '@/app/lib/tickets';
import AdminTicketCenter from '@/app/components/AdminTicketCenter';
import { getAllOrders, updateOrderStatus, appendOrderMessage, onOrdersChanged, type Order as ShopOrder, type OrderStatus } from '@/app/lib/orders';
import { getAllTransactions, onTransactionsChanged, type Transaction } from '@/app/lib/transactions';
import {
  getAllProductsFlat,
  addProduct as addProductToCatalog,
  updateProduct as updateProductInCatalog,
  deleteProduct as deleteProductFromCatalog,
  onProductsChanged,
  type FlatProduct,
  type ProductVariant,
} from '@/app/lib/products';

type VariantDraft = { id: string; label: string; price: string; badge: string };

/** Resizes+compresses an uploaded image before it's stored as a base64
 * string in localStorage. Product photos straight from a phone camera can
 * be several MB each — with no real backend, everything lives in
 * localStorage (shared across the whole site: tickets, orders, other
 * products...), which has a hard ~5-10MB total quota per browser. A few
 * uncompressed photos can silently fill that up and start failing saves. */
function compressImage(file: File, maxWidth = 800, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported'));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/** Re-encodes an already-compressed data URL at a smaller size/quality —
 * used as an automatic retry when a save fails because storage is full,
 * so a single large image doesn't force the person to redo the whole
 * form. Doesn't need the original File, just the data URL already held
 * in state. */
function recompressDataUrl(dataUrl: string, maxWidth = 400, quality = 0.5): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = reject;
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = dataUrl;
  });
}

// 1. CATEGORIES LIST
const CATEGORIES = [
  "AI",
  "Gift Cards",
  "Gaming",
  "Game Top-Ups",
  "Streaming",
  "Subscriptions",
  "Software",
  "Accounts",
  "Mobile Apps",
  "Other"
];

export default function DirectGridAdmin() {
  const { addB9chich } = useAuth();
  const router = useRouter();

  // PRODUCTS — pulled from the real shared catalog (app/lib/products.ts),
  // the same one /services reads from. Adding/editing/deleting here now
  // actually shows up on the storefront instead of vanishing on refresh.
  const [products, setProducts] = useState<FlatProduct[]>([]);

  const refreshProducts = () => {
    getAllProductsFlat().then(setProducts).catch((error: unknown) => {
      console.error('Unable to load products:', error);
    });
  };

  useEffect(() => {
    refreshProducts();
    const unsubscribe = onProductsChanged(refreshProducts);
    return unsubscribe;
  }, []);

  // EDIT PRODUCT STATE
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pName, setPName] = useState("");
  const [pCategory, setPCategory] = useState("Gaming");
  const [pPrice, setPPrice] = useState("");
  const [pStock, setPStock] = useState(0);
  const [pDesc, setPDesc] = useState("");
  const [pImage, setPImage] = useState("");
  const [pFeatures, setPFeatures] = useState("");
  const [pImportantNotice, setPImportantNotice] = useState("");
  const [pVariants, setPVariants] = useState<VariantDraft[]>([]);
  const [pFeatured, setPFeatured] = useState(false);

  // CREATE NEW PRODUCT STATE
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Gaming");
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState(10);
  const [newDesc, setNewDesc] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newFeatures, setNewFeatures] = useState("");
  const [newImportantNotice, setNewImportantNotice] = useState("");
  const [newVariants, setNewVariants] = useState<VariantDraft[]>([]);
  const [newFeatured, setNewFeatured] = useState(false);

  const addVariantRow = (setter: React.Dispatch<React.SetStateAction<VariantDraft[]>>) => {
    setter((prev) => [...prev, { id: `v-${Date.now()}-${prev.length}`, label: "", price: "", badge: "" }]);
  };
  const updateVariantRow = (
    setter: React.Dispatch<React.SetStateAction<VariantDraft[]>>,
    index: number,
    field: keyof VariantDraft,
    value: string
  ) => {
    setter((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };
  const removeVariantRow = (setter: React.Dispatch<React.SetStateAction<VariantDraft[]>>, index: number) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };
  const draftsToVariants = (drafts: VariantDraft[]): ProductVariant[] =>
    drafts
      .filter((v) => v.label.trim() && v.price.trim())
      .map((v) => ({
        id: v.id,
        label: v.label.trim(),
        price: v.price.trim(),
        ...(v.badge.trim() ? { badge: v.badge.trim() } : {}),
      }));

  // ADMIN FILTER STATE
  const [filterCategory, setFilterCategory] = useState("All");

  // ORDERS — pulled from the real order records clients create at checkout
  // (app/lib/orders.ts), not fake sample data. Status changes here are what
  // move the progress bar the client sees on /my-orders.
  const [shopOrders, setShopOrders] = useState<ShopOrder[]>([]);

  const refreshOrders = () => setShopOrders(getAllOrders());

  useEffect(() => {
    refreshOrders();
    const unsubscribe = onOrdersChanged(refreshOrders);
    return unsubscribe;
  }, []);

  const handleOrderStatusChange = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
    refreshOrders(); // onOrdersChanged only fires cross-tab; refresh locally too
  };

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [orderReplyDrafts, setOrderReplyDrafts] = useState<Record<string, string>>({});
  const [sendingOrderId, setSendingOrderId] = useState<string | null>(null);

  const handleSendOrderMessage = (orderId: string) => {
    const text = orderReplyDrafts[orderId];
    if (!text || !text.trim()) return;
    setSendingOrderId(orderId);
    console.log('[order chat] sending to orderId:', orderId, 'text:', text);
    const updated = appendOrderMessage(orderId, 'admin', text);
    console.log('[order chat] appendOrderMessage returned:', updated);
    setSendingOrderId(null);
    if (updated) {
      setOrderReplyDrafts((prev) => ({ ...prev, [orderId]: '' }));
      refreshOrders();
    } else {
      alert(`Failed to send — order ${orderId} was not found in storage. Try refreshing the page.`);
    }
  };

  function formatOrderTime(iso: string): string {
    try {
      return new Date(iso).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  }

  // 💸 B9CHICH TRANSACTION HISTORY — every injection/purchase, logged by
  // AuthContext into lib/transactions.ts
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    setTransactions(getAllTransactions());
    const unsubscribe = onTransactionsChanged(() => setTransactions(getAllTransactions()));
    return unsubscribe;
  }, []);

  function formatTxnTime(iso: string): string {
    try {
      return new Date(iso).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  }

  // B9CHICH STATE
  const [targetEmail, setTargetEmail] = useState("");
  const [b9chichToAdd, setB9chichToAdd] = useState(10);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // LEADERBOARD BOOST STATE — manual "+1 Order" for the homepage Top 10
  // Clients section, matched to a client by their email.
  const [leaderboardEmail, setLeaderboardEmail] = useState("");
  const [leaderboardMsg, setLeaderboardMsg] = useState("");

  const handleBoostLeaderboard = () => {
    if (!leaderboardEmail.trim()) {
      return setLeaderboardMsg("⚠️ Please enter a client email!");
    }
    const res = addOrderByEmail(leaderboardEmail.trim());
    setLeaderboardMsg(res.message);
    if (res.success) setLeaderboardEmail("");
  };

  // 🎫 SUPPORT TICKETS — the full chat UI is the shared <AdminTicketCenter />
  // component (also used standalone at /admin/tickets), so replies made here
  // and there always stay in sync.
  // Ticket count is read client-side only (useEffect), never during render —
  // getAllTickets() touches localStorage, which doesn't exist during SSR and
  // would otherwise cause a hydration mismatch (server renders 0, client
  // renders the real count).
  const [ticketCount, setTicketCount] = useState(0);
  useEffect(() => {
    setTicketCount(getAllTickets().length);
  }, []);

  // HANDLERS FOR PRODUCTS & B9CHICH
  const handleAddProduct = async () => {
    if (!newName || !newPrice) return alert("Please fill in the Product Name and Price!");
    const featuresArr = newFeatures.split("\n").map((s) => s.trim()).filter(Boolean);
    const noticeArr = newImportantNotice.split("\n").map((s) => s.trim()).filter(Boolean);
    const variantsArr = draftsToVariants(newVariants);
    const buildInput = (image: string) => ({
      name: newName,
      category: newCategory,
      price: newPrice,
      stock: newStock,
      description: newDesc || "No description provided.",
      image: image || "https://via.placeholder.com/80/1e293b/ffffff?text=Product",
      ...(featuresArr.length ? { features: featuresArr } : {}),
      ...(noticeArr.length ? { importantNotice: noticeArr } : {}),
      ...(variantsArr.length ? { variants: variantsArr } : {}),
      ...(newFeatured ? { featured: true } : {}),
    });

    let result = await addProductToCatalog(buildInput(newImage));

    // Storage full — most likely because of everything ALREADY stored,
    // not this image specifically. Try once more with the image shrunk
    // much harder before giving up, since that alone sometimes clears
    // just enough room to fit.
    if (!result && newImage) {
      try {
        const smaller = await recompressDataUrl(newImage, 400, 0.5);
        result = await addProductToCatalog(buildInput(smaller));
      } catch {
        // fall through to the failure alert below
      }
    }

    if (!result) {
      alert(
        "⚠️ Failed to save this product — your browser's storage is completely full, even after shrinking the image further. Please delete a few old/unused products (Admin → Products) to free up space, then try again."
      );
      return null;
    }

    refreshProducts();
    setIsAdding(false);
    setNewName("");
    setNewCategory("Gaming");
    setNewPrice("");
    setNewStock(10);
    setNewDesc("");
    setNewImage("");
    setNewFeatures("");
    setNewImportantNotice("");
    setNewVariants([]);
    setNewFeatured(false);

    // Handed back so callers (like "Save & Notify Clients") can build a
    // deep link straight to this exact product — it has both `id` and
    // `brandId`, which is what /services needs to open it directly.
    return result;
  };

  const handleDeleteProduct = async (brandId: string, id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const deleted = await deleteProductFromCatalog(brandId, id);
      if (!deleted) {
        alert("Failed to delete this product from the shared catalog.");
        return;
      }
      refreshProducts();
    }
  };

  const handleInjectB9chich = () => {
    if (!targetEmail.trim()) {
      return setFeedbackMsg("⚠️ Please enter a target client email!");
    }
    const res = addB9chich(targetEmail.trim(), b9chichToAdd);
    setFeedbackMsg(res.message);
    if (res.success) {
      setTargetEmail("");
      setTransactions(getAllTransactions());
    }
  };

  const displayedProducts = products.filter(p => filterCategory === "All" ? true : p.category === filterCategory);

  return (
    <AdminPinGate>
    <main className="min-h-screen bg-zinc-950 text-white font-sans p-6 pt-32 space-y-12 max-w-7xl mx-auto">
      
      <div className="space-y-5">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-red-500">👑 MARIO'S CONTROL PANEL</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage your store, orders, clients and support from one place.</p>
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-300">⚡ Quick Actions</h2>
            <span className="text-[10px] text-zinc-600">Jump directly to what you need</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2">
            <button
              onClick={() => {
                setIsAdding(true);
                document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="rounded-xl bg-red-600 hover:bg-red-500 px-4 py-3 text-xs font-black transition"
            >
              ➕ Add Product
            </button>

            <button
              onClick={() => document.getElementById('orders')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="rounded-xl border border-zinc-800 bg-zinc-950 hover:border-red-500/60 px-4 py-3 text-xs font-bold text-zinc-200 transition"
            >
              📦 Orders ({shopOrders.length})
            </button>

            <button
              onClick={() => document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="rounded-xl border border-zinc-800 bg-zinc-950 hover:border-red-500/60 px-4 py-3 text-xs font-bold text-zinc-200 transition"
            >
              🎫 Tickets ({ticketCount})
            </button>

            <button
              onClick={() => router.push('/admin/notifications')}
              className="rounded-xl border border-zinc-800 bg-zinc-950 hover:border-red-500/60 px-4 py-3 text-xs font-bold text-zinc-200 transition"
            >
              🔔 New Notification
            </button>

            <button
              onClick={() => router.push('/admin/balance')}
              className="rounded-xl border border-zinc-800 bg-zinc-950 hover:border-red-500/60 px-4 py-3 text-xs font-bold text-zinc-200 transition"
            >
              💳 Payments
            </button>
          </div>
        </div>
      </div>

      <hr className="border-zinc-900" />

      {/* SECTION 1: PRODUCT CONTROL */}
      <section id="products" className="scroll-mt-32 bg-zinc-900/20 border border-zinc-900 p-6 rounded-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">🛍️ Product Control & Edit Store</h2>
            <p className="text-xs text-zinc-500">Modify titles, images, categories, pricing, or active stock status.</p>
          </div>

          <div className="flex items-center gap-3">
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 p-2.5 rounded-xl focus:outline-none focus:border-red-500"
            >
              <option value="All">All Categories ({products.length})</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <button 
              onClick={() => setIsAdding(!isAdding)} 
              className="bg-red-600 hover:bg-red-500 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2"
            >
              {isAdding ? "✕ Close Form" : "➕ Add New Product"}
            </button>
          </div>
        </div>

        {isAdding && (
          <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider">Create New Item</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input type="text" placeholder="Product Name *" value={newName} onChange={e => setNewName(e.target.value)} className="bg-zinc-900 border border-zinc-800 text-sm p-2.5 rounded-lg text-white" />
              <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="bg-zinc-900 border border-zinc-800 text-sm p-2.5 rounded-lg text-white">
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input type="text" placeholder="Price (e.g. 15 TND)" value={newPrice} onChange={e => setNewPrice(e.target.value)} className="bg-zinc-900 border border-zinc-800 text-sm p-2.5 rounded-lg text-white" />
              <div className="space-y-1.5">
                <input type="number" min={0} placeholder="Stock quantity" value={newStock} onChange={e => setNewStock(parseInt(e.target.value) || 0)} className="w-full bg-zinc-900 border border-zinc-800 text-sm p-2.5 rounded-lg text-white" />
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => setNewStock(1)} className="flex-1 bg-zinc-950 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-2 py-1 rounded-lg hover:bg-amber-500/10 transition">1 (Last Unit)</button>
                  <button type="button" onClick={() => setNewStock(0)} className="flex-1 bg-zinc-950 border border-red-500/30 text-red-400 text-[10px] font-bold px-2 py-1 rounded-lg hover:bg-red-500/10 transition">Out of Stock</button>
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  {newImage && (
                    <img src={newImage} alt="" className="w-12 h-12 object-cover rounded-lg border border-zinc-800 shrink-0" />
                  )}
                  <label className="cursor-pointer bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-zinc-300 px-4 py-2.5 rounded-lg transition">
                    {newImage ? '📷 Change Image' : '📷 Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        compressImage(file).then(setNewImage).catch(() => alert('Could not process that image — try a different file.'));
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="…or paste an image URL instead (uses far less storage)"
                  value={newImage.startsWith('data:') ? '' : newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs p-2 rounded-lg text-white"
                />
              </div>
            </div>
            <textarea placeholder="Description" rows={2} value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 text-sm p-2.5 rounded-lg text-white resize-none" />
            <textarea placeholder="What you get (one per line)" rows={3} value={newFeatures} onChange={e => setNewFeatures(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 text-sm p-2.5 rounded-lg text-white resize-none" />
            <textarea placeholder="Important Information (one per line)" rows={3} value={newImportantNotice} onChange={e => setNewImportantNotice(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 text-sm p-2.5 rounded-lg text-white resize-none" />

            {/* VARIANTS — optional. Lets one product offer multiple picks
                (e.g. different durations/regions), each with its own price,
                shown as "Choose Variant" cards on the service page. */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400">Variants (optional)</span>
                <button type="button" onClick={() => addVariantRow(setNewVariants)} className="text-xs font-bold text-red-400 hover:text-red-300 transition">+ Add Variant</button>
              </div>
              {newVariants.map((v, i) => (
                <div key={v.id} className="flex gap-2 items-center">
                  <input type="text" placeholder="Label (e.g. 3 Month - Mexico)" value={v.label} onChange={e => updateVariantRow(setNewVariants, i, 'label', e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-800 text-xs p-2 rounded-lg text-white" />
                  <input type="text" placeholder="Price" value={v.price} onChange={e => updateVariantRow(setNewVariants, i, 'price', e.target.value)} className="w-24 bg-zinc-900 border border-zinc-800 text-xs p-2 rounded-lg text-white" />
                  <input type="text" placeholder="Badge" value={v.badge} onChange={e => updateVariantRow(setNewVariants, i, 'badge', e.target.value)} className="w-24 bg-zinc-900 border border-zinc-800 text-xs p-2 rounded-lg text-white" />
                  <button type="button" onClick={() => removeVariantRow(setNewVariants, i)} className="text-red-400 hover:text-red-300 text-xs font-bold px-2">✕</button>
                </div>
              ))}
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={newFeatured} onChange={e => setNewFeatured(e.target.checked)} className="accent-red-600 w-4 h-4" />
              <span className="text-xs font-bold text-zinc-300">⭐ Feature this on the homepage carousel</span>
            </label>

            <div className="flex gap-2">
              <button onClick={handleAddProduct} className="bg-green-600 hover:bg-green-500 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition">
                Save Product Live 🚀
              </button>
              <button
                onClick={async () => {
                  const created = await handleAddProduct();
                  if (created) {
                    router.push(
                      `/admin/notifications?productId=${created.id}&productName=${encodeURIComponent(created.name)}&brandId=${encodeURIComponent(created.brandId)}`
                    );
                  }
                }}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition"
              >
                Save &amp; Notify Clients 🔔
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-zinc-900 bg-zinc-950">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead>
              <tr className="bg-zinc-900/50 text-zinc-400 text-xs uppercase border-b border-zinc-900 font-bold">
                <th className="p-4">Item Details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {displayedProducts.map(p => (
                <tr key={p.id} className="hover:bg-zinc-900/20">
                  <td className="p-4">
                    {editingId === p.id ? (
                      <div className="space-y-2">
                        <input type="text" value={pName} onChange={(e) => setPName(e.target.value)} className="bg-zinc-900 border border-zinc-800 text-white text-sm p-2 rounded w-full" placeholder="Product Name" />
                        <div className="flex items-center gap-2">
                          <img src={pImage} alt="" className="w-8 h-8 object-cover rounded border border-zinc-800 shrink-0" />
                          <label className="cursor-pointer bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-[11px] font-bold text-zinc-300 px-3 py-1.5 rounded transition">
                            📷 Change Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                compressImage(file).then(setPImage).catch(() => alert('Could not process that image — try a different file.'));
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <input
                          type="text"
                          placeholder="…or paste an image URL instead"
                          value={pImage.startsWith('data:') ? '' : pImage}
                          onChange={(e) => setPImage(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 text-[11px] p-1.5 rounded text-white"
                        />
                        <input type="text" value={pDesc} onChange={(e) => setPDesc(e.target.value)} className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs p-2 rounded w-full block" placeholder="Description" />
                        <textarea value={pFeatures} onChange={(e) => setPFeatures(e.target.value)} rows={2} className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs p-2 rounded w-full block resize-none" placeholder="What you get (one per line)" />
                        <textarea value={pImportantNotice} onChange={(e) => setPImportantNotice(e.target.value)} rows={2} className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs p-2 rounded w-full block resize-none" placeholder="Important Information (one per line)" />

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-zinc-500">Variants</span>
                            <button type="button" onClick={() => addVariantRow(setPVariants)} className="text-[11px] font-bold text-red-400 hover:text-red-300 transition">+ Add</button>
                          </div>
                          {pVariants.map((v, i) => (
                            <div key={v.id} className="flex gap-1.5 items-center">
                              <input type="text" placeholder="Label" value={v.label} onChange={e => updateVariantRow(setPVariants, i, 'label', e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-800 text-[11px] p-1.5 rounded text-white" />
                              <input type="text" placeholder="Price" value={v.price} onChange={e => updateVariantRow(setPVariants, i, 'price', e.target.value)} className="w-20 bg-zinc-900 border border-zinc-800 text-[11px] p-1.5 rounded text-white" />
                              <input type="text" placeholder="Badge" value={v.badge} onChange={e => updateVariantRow(setPVariants, i, 'badge', e.target.value)} className="w-20 bg-zinc-900 border border-zinc-800 text-[11px] p-1.5 rounded text-white" />
                              <button type="button" onClick={() => removeVariantRow(setPVariants, i)} className="text-red-400 hover:text-red-300 text-[11px] font-bold px-1">✕</button>
                            </div>
                          ))}
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={pFeatured} onChange={e => setPFeatured(e.target.checked)} className="accent-red-600 w-3.5 h-3.5" />
                          <span className="text-[11px] font-bold text-zinc-400">⭐ Featured on homepage</span>
                        </label>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-zinc-800 shrink-0" />
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {p.name}
                            {p.featured && <span title="Featured on homepage">⭐</span>}
                          </div>
                          <div className="text-xs text-zinc-500 line-clamp-1">{p.description}</div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    {editingId === p.id ? (
                      <select value={pCategory} onChange={(e) => setPCategory(e.target.value)} className="bg-zinc-900 border border-zinc-800 p-1.5 rounded text-xs text-white">
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs font-semibold px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300">
                        {p.category}
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-mono">{p.price}</td>
                  <td className="p-4 font-mono">
                    {editingId === p.id ? (
                      <div className="space-y-1.5">
                        <input
                          type="number"
                          min={0}
                          value={pStock}
                          onChange={(e) => setPStock(parseInt(e.target.value) || 0)}
                          className="w-20 bg-zinc-900 border border-zinc-800 text-white text-xs p-1.5 rounded"
                        />
                        <div className="flex gap-1">
                          <button type="button" onClick={() => setPStock(1)} className="bg-zinc-950 border border-amber-500/30 text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded hover:bg-amber-500/10 transition">Last Unit</button>
                          <button type="button" onClick={() => setPStock(0)} className="bg-zinc-950 border border-red-500/30 text-red-400 text-[9px] font-bold px-1.5 py-0.5 rounded hover:bg-red-500/10 transition">Out</button>
                        </div>
                      </div>
                    ) : (
                      <span className={p.stock <= 0 ? 'text-red-400 font-bold' : ''}>
                        {p.stock <= 0 ? 'Out of Stock' : `${p.stock} Units`}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {editingId === p.id ? (
                      <div className="space-x-1 whitespace-nowrap">
                        <button onClick={async () => {
                          const buildUpdates = (image: string) => ({ name: pName, category: pCategory, description: pDesc, price: pPrice, stock: pStock, image, features: pFeatures.split("\n").map(s => s.trim()).filter(Boolean), importantNotice: pImportantNotice.split("\n").map(s => s.trim()).filter(Boolean), variants: draftsToVariants(pVariants), featured: pFeatured });
                          let ok = await updateProductInCatalog(p.brandId, p.id, buildUpdates(pImage));
                          if (!ok && pImage) {
                            try {
                              const smaller = await recompressDataUrl(pImage, 400, 0.5);
                              ok = await updateProductInCatalog(p.brandId, p.id, buildUpdates(smaller));
                            } catch { /* fall through to alert below */ }
                          }
                          if (!ok) { alert("⚠️ Failed to save — your browser's storage is completely full, even after shrinking the image further. Please delete a few old/unused products to free up space, then try again."); return; }
                          refreshProducts(); setEditingId(null); setPVariants([]); setPFeatured(false);
                        }} className="bg-green-600 px-3 py-1.5 rounded text-xs font-bold text-white">Save</button>
                        <button onClick={() => setEditingId(null)} className="bg-zinc-800 px-3 py-1.5 rounded text-xs">Cancel</button>
                      </div>
                    ) : (
                      <div className="space-x-1 whitespace-nowrap">
                        <button onClick={() => { setEditingId(p.id); setPName(p.name); setPCategory(p.category); setPDesc(p.description); setPPrice(p.price); setPStock(p.stock); setPImage(p.image); setPFeatures((p.features || []).join("\n")); setPImportantNotice((p.importantNotice || []).join("\n")); setPVariants((p.variants || []).map((v) => ({ id: v.id, label: v.label, price: v.price, badge: v.badge || "" }))); setPFeatured(!!p.featured); }} className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded text-xs font-bold text-zinc-300">Edit</button>
                        <button type="button" onClick={() => router.push(`/admin/notifications?productId=${p.id}&productName=${encodeURIComponent(p.name)}&brandId=${encodeURIComponent(p.brandId)}`)} className="bg-amber-950/40 border border-amber-900/50 text-amber-400 px-2.5 py-1.5 rounded text-xs font-bold">🔔 Notify</button>
                        <button onClick={() => handleDeleteProduct(p.brandId, p.id)} className="bg-red-950/40 border border-red-900/50 text-red-400 px-2.5 py-1.5 rounded text-xs font-bold">Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 2 & 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <section className="bg-zinc-900/20 border border-zinc-900 p-6 rounded-2xl space-y-4">
          <div>
            <h2 className="text-xl font-bold">💰 B9CHICH Injector Management</h2>
            <p className="text-xs text-zinc-500">Inject balance into client accounts using their registered email (1 TND = 1 B9CHICH).</p>
          </div>
          <div className="space-y-3">
            <input type="email" placeholder="Target Client Email" value={targetEmail} onChange={(e) => setTargetEmail(e.target.value)} className="w-full bg-zinc-950 border border-zinc-900 p-3 rounded-xl text-sm text-white" />
            <input type="number" placeholder="Amount (TND)" value={b9chichToAdd} onChange={(e) => setB9chichToAdd(parseInt(e.target.value) || 0)} className="w-full bg-zinc-950 border border-zinc-900 p-3 rounded-xl text-sm text-white" />
            <button onClick={handleInjectB9chich} className="w-full bg-red-600 hover:bg-red-500 py-3 rounded-xl font-bold text-sm">Inject B9CHICH Balance 🚀</button>
            {feedbackMsg && <div className="p-3 bg-zinc-950 border border-zinc-800 text-xs rounded-xl text-zinc-300 font-mono">{feedbackMsg}</div>}
          </div>
        </section>

        <Link
          href="/admin/balance"
          className="group bg-zinc-900/20 border border-zinc-900 hover:border-red-500/50 p-6 rounded-2xl space-y-4 transition flex flex-col justify-between"
        >
          <div>
            <h2 className="text-xl font-bold">💳 Payment &amp; Billing</h2>
            <p className="text-xs text-zinc-500 mt-1">Chat with clients requesting balance top-ups and approve their payments.</p>
          </div>
          <span className="text-xs font-bold text-red-400 group-hover:text-red-300 transition">Open dashboard →</span>
        </Link>

        <Link
          href="/admin/notifications"
          className="group bg-zinc-900/20 border border-zinc-900 hover:border-red-500/50 p-6 rounded-2xl space-y-4 transition flex flex-col justify-between"
        >
          <div>
            <h2 className="text-xl font-bold">🔔 Client Notifications</h2>
            <p className="text-xs text-zinc-500 mt-1">Send updates to all clients or hand-pick who hears about it, and resend anytime.</p>
          </div>
          <span className="text-xs font-bold text-red-400 group-hover:text-red-300 transition">Open dashboard →</span>
        </Link>
      </div>

      {/* SECTION 2.5: LEADERBOARD ORDER BOOST */}
      <section className="bg-zinc-900/20 border border-zinc-900 p-6 rounded-2xl space-y-4 max-w-xl">
        <div>
          <h2 className="text-xl font-bold">🏆 Leaderboard Order Boost</h2>
          <p className="text-xs text-zinc-500">
            Manually add +1 order to a client's ranking in the "Top 10 Clients" section on the home page.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="Client Email"
            value={leaderboardEmail}
            onChange={(e) => setLeaderboardEmail(e.target.value)}
            className="flex-1 bg-zinc-950 border border-zinc-900 p-3 rounded-xl text-sm text-white"
          />
          <button
            onClick={handleBoostLeaderboard}
            className="bg-red-600 hover:bg-red-500 px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap"
          >
            +1 Order 🚀
          </button>
        </div>
        {leaderboardMsg && (
          <div className="p-3 bg-zinc-950 border border-zinc-800 text-xs rounded-xl text-zinc-300 font-mono">
            {leaderboardMsg}
          </div>
        )}
      </section>

      {/* SECTION 3.5: B9CHICH TRANSACTION HISTORY */}
      <section className="bg-zinc-900/20 border border-zinc-900 p-6 rounded-2xl space-y-4">
        <div>
          <h2 className="text-2xl font-bold">💸 B9CHICH Transaction History</h2>
          <p className="text-xs text-zinc-500">
            {transactions.length} transaction{transactions.length === 1 ? '' : 's'} · every injection you make and every purchase a client completes, logged automatically.
          </p>
        </div>
        <div className="overflow-x-auto rounded-xl border border-zinc-900 bg-zinc-950">
          <table className="w-full text-left text-sm min-w-[600px]">
            <thead>
              <tr className="bg-zinc-900/50 text-zinc-400 text-xs border-b border-zinc-900 font-bold">
                <th className="p-4">Date</th>
                <th className="p-4">Client</th>
                <th className="p-4">Type</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Balance After</th>
                <th className="p-4">Order Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-zinc-600 text-xs">
                    No transactions yet.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => {
                  const linkedOrder = t.orderId ? shopOrders.find((o) => o.id === t.orderId) : undefined;
                  return (
                    <tr key={t.id} className="hover:bg-zinc-900/20">
                      <td className="p-4 text-xs text-zinc-500">{formatTxnTime(t.createdAt)}</td>
                      <td className="p-4 text-xs font-bold">{t.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black ${
                          t.type === 'Injection' ? 'bg-green-500/10 text-green-400' : 'bg-sky-500/10 text-sky-400'
                        }`}>{t.type}</span>
                      </td>
                      <td className={`p-4 font-mono text-xs font-bold ${t.type === 'Injection' ? 'text-green-400' : 'text-red-400'}`}>
                        {t.type === 'Injection' ? '+' : '-'}{t.amount} B9CHICH
                      </td>
                      <td className="p-4 font-mono text-xs text-zinc-300">{t.balanceAfter} B9CHICH</td>
                      <td className="p-4">
                        {linkedOrder ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black ${
                            linkedOrder.status === 'Delivered' ? 'bg-green-500/10 text-green-400' :
                            linkedOrder.status === 'Cancelled' ? 'bg-red-500/10 text-red-400' :
                            linkedOrder.status === 'Processing' ? 'bg-sky-500/10 text-sky-400' :
                            'bg-yellow-500/10 text-yellow-400'
                          }`}>{linkedOrder.status}</span>
                        ) : (
                          <span className="text-[10px] text-zinc-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 4: ORDERS PIPELINE */}
      <section id="orders" className="scroll-mt-32 bg-zinc-900/20 border border-zinc-900 p-6 rounded-2xl space-y-4">
        <div>
          <h2 className="text-2xl font-bold">🇹🇳 Orders Management Status Pipeline</h2>
          <p className="text-xs text-zinc-500">
            {shopOrders.length} order{shopOrders.length === 1 ? '' : 's'} · reply to a client (e.g. ask for their account email) and update status — both show up live on their My Orders page.
          </p>
        </div>

        {shopOrders.length === 0 ? (
          <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-6 text-center text-xs text-zinc-600">
            No orders yet — they'll show up here as soon as a client checks out.
          </div>
        ) : (
          <div className="space-y-3">
            {shopOrders.map((o) => {
              const isExpanded = expandedOrderId === o.id;
              const messageCount = o.messages.length;
              return (
                <div key={o.id} className="rounded-xl border border-zinc-900 bg-zinc-950 p-4 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-mono text-zinc-500">{o.id}</p>
                      <p className="text-xs font-bold text-white">{o.email}</p>
                      <p className="text-[11px] text-zinc-600">{formatOrderTime(o.createdAt)}</p>
                    </div>
                    <span className="text-sm font-black text-amber-400">{o.totalCost.toFixed(2)} TND</span>
                  </div>

                  <div className="space-y-1 border-t border-zinc-900 pt-2">
                    {o.items.map((item, i) => (
                      <div key={i} className="text-xs text-zinc-300">
                        {item.productName}
                        {item.variantLabel ? ` — ${item.variantLabel}` : ''}
                        {item.quantity > 1 ? ` x${item.quantity}` : ''}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-900 pt-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black ${
                      o.status === 'Delivered' ? 'bg-green-500/10 text-green-400' :
                      o.status === 'Cancelled' ? 'bg-red-500/10 text-red-400' :
                      o.status === 'Processing' ? 'bg-sky-500/10 text-sky-400' :
                      'bg-yellow-500/10 text-yellow-400'
                    }`}>{o.status}</span>
                    <div className="space-x-1 whitespace-nowrap">
                      <button onClick={() => handleOrderStatusChange(o.id, 'Pending')} className="bg-zinc-900 text-xs px-2 py-1 rounded">Pending</button>
                      <button onClick={() => handleOrderStatusChange(o.id, 'Processing')} className="bg-sky-950 text-sky-400 text-xs px-2 py-1 rounded font-bold">Processing</button>
                      <button onClick={() => handleOrderStatusChange(o.id, 'Delivered')} className="bg-green-950 text-green-400 text-xs px-2 py-1 rounded font-bold">Delivered</button>
                      <button onClick={() => handleOrderStatusChange(o.id, 'Cancelled')} className="bg-red-950 text-red-400 text-xs px-2 py-1 rounded">Cancel</button>
                    </div>
                  </div>

                  <div className="border-t border-zinc-900 pt-3">
                    <button
                      onClick={() => setExpandedOrderId(isExpanded ? null : o.id)}
                      className="flex items-center gap-2 text-xs font-bold text-zinc-400 transition hover:text-red-400"
                    >
                      💬 {isExpanded ? 'Hide chat' : 'Chat with client'}
                      {messageCount > 0 && (
                        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">{messageCount}</span>
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 space-y-3 rounded-xl border border-zinc-900 bg-zinc-900/40 p-3">
                        {o.messages.length === 0 ? (
                          <p className="text-center text-[11px] text-zinc-600">No messages yet on this order.</p>
                        ) : (
                          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                            {o.messages.map((m) => (
                              <div key={m.id} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${
                                    m.sender === 'admin'
                                      ? 'rounded-tr-sm bg-red-600 text-white'
                                      : 'rounded-tl-sm border border-zinc-800 bg-zinc-950 text-zinc-200'
                                  }`}
                                >
                                  <p className="whitespace-pre-wrap">{m.text}</p>
                                  <p className={`mt-1 text-[10px] ${m.sender === 'admin' ? 'text-red-100/70' : 'text-zinc-500'}`}>
                                    {m.sender === 'admin' ? 'You' : 'Client'} · {formatOrderTime(m.createdAt)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <textarea
                            value={orderReplyDrafts[o.id] || ''}
                            onChange={(e) => setOrderReplyDrafts((prev) => ({ ...prev, [o.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendOrderMessage(o.id);
                              }
                            }}
                            rows={2}
                            placeholder="Type your reply…"
                            className="flex-1 resize-none rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-xs text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/30"
                          />
                          <button
                            onClick={() => handleSendOrderMessage(o.id)}
                            disabled={sendingOrderId === o.id || !(orderReplyDrafts[o.id] || '').trim()}
                            className="shrink-0 rounded-xl bg-red-600 px-4 text-xs font-black uppercase tracking-wide text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 5: SUPPORT TICKETS — full chat, right here in the dashboard */}
      <section id="tickets" className="scroll-mt-32 bg-zinc-900/20 border border-zinc-900 p-6 rounded-2xl space-y-4">
        <div>
          <h2 className="text-2xl font-bold">🎫 Support Tickets</h2>
          <p className="text-xs text-zinc-500 mt-1">
            {ticketCount} ticket{ticketCount === 1 ? '' : 's'} total · pick a ticket and reply directly.
          </p>
        </div>

        <AdminTicketCenter paneHeight="min-h-[480px] max-h-[600px]" />
      </section>

    </main>
    </AdminPinGate>
  );
}
