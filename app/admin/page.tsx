'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
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
} from '@/app/lib/products';

// 1. CATEGORIES LIST
const CATEGORIES = [
  "AI",
  "Gift Cards",
  "Gaming",
  "Game Top-Ups",
  "Streaming",
  "Software",
  "Accounts",
  "Mobile Apps",
  "Other"
];

export default function DirectGridAdmin() {
  const { addB9chich } = useAuth();

  // PRODUCTS — pulled from the real shared catalog (app/lib/products.ts),
  // the same one /services reads from. Adding/editing/deleting here now
  // actually shows up on the storefront instead of vanishing on refresh.
  const [products, setProducts] = useState<FlatProduct[]>([]);

  const refreshProducts = () => setProducts(getAllProductsFlat());

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

  // CREATE NEW PRODUCT STATE
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Gaming");
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState(10);
  const [newDesc, setNewDesc] = useState("");
  const [newImage, setNewImage] = useState("");

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

  // SITE TEXT STATE
  const [siteText, setSiteText] = useState({
    heroTitle: "Level Up Your Digital Marketplace Gaming",
    heroDesc: "Secure keys, immediate top-ups, and game cards natively available here in Tunisia.",
  });

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
  const handleAddProduct = () => {
    if (!newName || !newPrice) return alert("Please fill in the Product Name and Price!");
    addProductToCatalog({
      name: newName,
      category: newCategory,
      price: newPrice,
      stock: newStock,
      description: newDesc || "No description provided.",
      image: newImage || "https://via.placeholder.com/80/1e293b/ffffff?text=Product",
    });
    refreshProducts();
    setIsAdding(false);
    setNewName("");
    setNewCategory("Gaming");
    setNewPrice("");
    setNewStock(10);
    setNewDesc("");
    setNewImage("");
  };

  const handleDeleteProduct = (brandId: string, id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProductFromCatalog(brandId, id);
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
    <main className="min-h-screen bg-zinc-950 text-white font-sans p-6 pt-32 space-y-12 max-w-7xl mx-auto">
      
      <div>
        <h1 className="text-4xl font-black tracking-tight text-red-500">👑 MARIO'S CONTROL PANEL</h1>
        <p className="text-zinc-500 text-sm mt-1">Everything is layout-direct. No sidebar clicks required.</p>
      </div>

      <hr className="border-zinc-900" />

      {/* SECTION 1: PRODUCT CONTROL */}
      <section className="bg-zinc-900/20 border border-zinc-900 p-6 rounded-2xl space-y-6">
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
              <input type="text" placeholder="Image URL" value={newImage} onChange={e => setNewImage(e.target.value)} className="bg-zinc-900 border border-zinc-800 text-sm p-2.5 rounded-lg text-white col-span-1 md:col-span-2" />
            </div>
            <textarea placeholder="Description" rows={2} value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 text-sm p-2.5 rounded-lg text-white resize-none" />
            <button onClick={handleAddProduct} className="bg-green-600 hover:bg-green-500 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition">
              Save Product Live 🚀
            </button>
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
                        <input type="text" value={pImage} onChange={(e) => setPImage(e.target.value)} className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs p-2 rounded w-full block" placeholder="Image URL" />
                        <input type="text" value={pDesc} onChange={(e) => setPDesc(e.target.value)} className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs p-2 rounded w-full block" placeholder="Description" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-zinc-800 shrink-0" />
                        <div>
                          <div className="font-bold text-white">{p.name}</div>
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
                        <button onClick={() => { updateProductInCatalog(p.brandId, p.id, { name: pName, category: pCategory, description: pDesc, price: pPrice, stock: pStock, image: pImage }); refreshProducts(); setEditingId(null); }} className="bg-green-600 px-3 py-1.5 rounded text-xs font-bold text-white">Save</button>
                        <button onClick={() => setEditingId(null)} className="bg-zinc-800 px-3 py-1.5 rounded text-xs">Cancel</button>
                      </div>
                    ) : (
                      <div className="space-x-1 whitespace-nowrap">
                        <button onClick={() => { setEditingId(p.id); setPName(p.name); setPCategory(p.category); setPDesc(p.description); setPPrice(p.price); setPStock(p.stock); setPImage(p.image); }} className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded text-xs font-bold text-zinc-300">Edit</button>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

        <section className="bg-zinc-900/20 border border-zinc-900 p-6 rounded-2xl space-y-4">
          <div>
            <h2 className="text-xl font-bold">📝 Storefront Text Editor</h2>
            <p className="text-xs text-zinc-500">Rewrite titles and copy text visible on your app index storefront views.</p>
          </div>
          <div className="space-y-3">
            <input type="text" value={siteText.heroTitle} onChange={(e) => setSiteText({ ...siteText, heroTitle: e.target.value })} className="w-full bg-zinc-950 border border-zinc-900 p-3 rounded-xl text-sm text-zinc-200" />
            <textarea rows={2} value={siteText.heroDesc} onChange={(e) => setSiteText({ ...siteText, heroDesc: e.target.value })} className="w-full bg-zinc-950 border border-zinc-900 p-3 rounded-xl text-sm text-zinc-200 resize-none" />
            <button onClick={() => alert("Global text assets updated!")} className="w-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 py-3 rounded-xl font-bold text-xs">Publish Homepage Changes Live 💾</button>
          </div>
        </section>
      </div>

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
      <section className="bg-zinc-900/20 border border-zinc-900 p-6 rounded-2xl space-y-4">
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
      <section className="bg-zinc-900/20 border border-zinc-900 p-6 rounded-2xl space-y-4">
        <div>
          <h2 className="text-2xl font-bold">🎫 Support Tickets</h2>
          <p className="text-xs text-zinc-500 mt-1">
            {ticketCount} ticket{ticketCount === 1 ? '' : 's'} total · pick a ticket and reply directly.
          </p>
        </div>

        <AdminTicketCenter paneHeight="min-h-[480px] max-h-[600px]" />
      </section>

    </main>
  );
}
