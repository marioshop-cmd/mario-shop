 'use client';
import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../language/LanguageContext';
import {
  getAllBrands,
  onProductsChanged,
  type BrandService,
  type Product,
  type ProductVariant,
} from '../lib/products';
// Helper to extract numbers from price string (e.g. "35 TND" -> 35, "77.90 DT" -> 77.9)
const parsePrice = (priceStr: string): number => {
  const match = priceStr.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
};
// Categories list for Left Sidebar (internal values stay in English — they
// must match brand.category in the product data — display label is
// translated separately via CATEGORY_KEYS below)
const CATEGORIES = [
  "All",
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

// Maps each internal category value to its translation key
const CATEGORY_KEYS: Record<string, string> = {
  "All": "cat_all",
  "AI": "cat_ai",
  "Gift Cards": "cat_giftcards",
  "Gaming": "cat_gaming",
  "Game Top-Ups": "cat_gametopups",
  "Streaming": "cat_streaming",
  "Subscriptions": "cat_subscriptions",
  "Software": "cat_software",
  "Accounts": "cat_accounts",
  "Mobile Apps": "cat_mobileapps",
  "Other": "cat_other",
};

// Quick Tag Pills below Search Bar — each shows a live count of products
// in that category instead of a decorative emoji icon.
const QUICK_TAGS = [
  { labelKey: "tag_subscriptions", category: "Accounts" },
  { labelKey: "tag_topups", category: "Game Top-Ups" },
  { labelKey: "tag_giftcards", category: "Gift Cards" },
  { labelKey: "tag_games", category: "Gaming" },
  { labelKey: "tag_software", category: "Software" },
  { labelKey: "tag_streaming", category: "Streaming" },
  { labelKey: "tag_aitools", category: "AI" },
  { labelKey: "tag_accounts", category: "Accounts" }
];
function ServicesPageInner() {
  const { currentUser } = useAuth();
  const { addToCart, openCart, totalCartItemsCount } = useCart();
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [brands, setBrands] = useState<BrandService[]>([]);
  useEffect(() => {
    const refresh = () => {
      getAllBrands().then(setBrands).catch((error: unknown) => {
        console.error('Unable to load services:', error);
      });
    };
    refresh();
    const unsubscribe = onProductsChanged(refresh);
    return unsubscribe;
  }, []);
  const [selectedCategory, setSelectedCategory] = useState("All");
  // Live product count per category — recomputes whenever `brands` changes,
  // so adding/removing a product updates these counts automatically.
  const categoryProductCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const brand of brands) {
      counts[brand.category] = (counts[brand.category] || 0) + brand.products.length;
    }
    return counts;
  }, [brands]);
  const [selectedBrand, setSelectedBrand] = useState<BrandService | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Deep-link support: ?brandId=steam&productId=101 (e.g. from a client's
  // notification toast) jumps straight to that product's detail view
  // instead of dropping the user on the general services grid.
  useEffect(() => {
    if (brands.length === 0) return;
    const brandId = searchParams.get('brandId');
    const productIdParam = searchParams.get('productId');
    if (!brandId || !productIdParam) return;

    const productId = Number(productIdParam);
    const brand = brands.find((b) => b.id === brandId);
    const product = brand?.products.find((p) => p.id === productId);
    if (!brand || !product) return;

    setSelectedBrand(brand);
    setSelectedProduct(product);
    if (product.variants && product.variants.length > 0) {
      setSelectedVariantId(product.variants[0].id);
    }
  }, [brands, searchParams]);
  const [sortOrder, setSortOrder] = useState<"default" | "name-asc" | "most-products">("default");
  // Filter Brands
  const filteredBrands = brands
    .filter((brand) => {
      const matchesCat = selectedCategory === "All" || brand.category === selectedCategory;
      const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            brand.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === "name-asc") return a.name.localeCompare(b.name);
      if (sortOrder === "most-products") return b.products.length - a.products.length;
      return 0; // "default" keeps original catalog order
    });
  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    if (product.variants && product.variants.length > 0) {
      setSelectedVariantId(product.variants[0].id);
    }
  };
  // Opening a product from the "Related products" rail works the same way
  // as opening one from the catalog grid, except the brand can be different
  // from the one currently selected — so it's set explicitly here.
  const handleOpenRelatedProduct = (brand: BrandService, product: Product) => {
    setSelectedBrand(brand);
    setSelectedProduct(product);
    setSelectedVariantId(product.variants && product.variants.length > 0 ? product.variants[0].id : "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  // Same-category products shown below the purchase panel. Recomputes
  // whenever the catalog refreshes or the viewer opens a different product.
  const relatedProducts = useMemo(() => {
    if (!selectedProduct || !selectedBrand) return [];
    return brands
      .filter((brand) => brand.category === selectedBrand.category)
      .flatMap((brand) =>
        brand.products
          .filter((product) => product.id !== selectedProduct.id)
          .map((product) => ({ brand, product }))
      )
      .slice(0, 6);
  }, [brands, selectedBrand, selectedProduct]);
  // Add item to Cart / 9ofa — now goes through the global cart context so
  // it's available (and syncs) across every page, not just this one.
  const handleAddToCart = () => {
    if (!selectedProduct || selectedProduct.stock <= 0) return;
    const selectedVariant = selectedProduct.variants?.find(v => v.id === selectedVariantId);
    const priceString = selectedVariant ? selectedVariant.price : selectedProduct.price;
    const priceNumeric = parsePrice(priceString);
    const cartItemId = `${selectedProduct.id}-${selectedVariantId || 'default'}`;
    addToCart({
      cartItemId,
      name: selectedProduct.name,
      variantLabel: selectedVariant?.label,
      image: selectedProduct.image,
      priceNumeric,
      brandId: selectedBrand?.id,
      productId: selectedProduct.id,
    });
    // Take the user straight into checkout instead of leaving them on the
    // product page after adding — openCart() opens the cart/checkout
    // drawer that's already wired up site-wide.
    openCart();
  };
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      <div className="p-6 pt-24 max-w-7xl mx-auto space-y-8 relative">
     
      {/* ---------------------------------------------------- */}
      {/* VIEW 3: PRODUCT DETAIL & ORDER PAGE WITH REVIEWS      */}
      {/* ---------------------------------------------------- */}
      {selectedProduct ? (
        <div className="space-y-10 animate-fadeIn">
         
          {/* Top Bar Navigation */}
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
            <button
              onClick={() => {
                setSelectedProduct(null);
                setSelectedBrand(null);
              }}
              className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2"
            >
              {t('back_to_products')}
            </button>
            <span className="text-xs text-zinc-500 font-mono">
              Mario's Shop / {selectedBrand?.name || 'Product'} / {selectedProduct.name}
            </span>
          </div>
          {/* MAIN PRODUCT ORDER GRID
              Mobile-first order matches the reference recording: image →
              category/stock badges → title/description → options → price
              → add to cart → refund note. `order-*` classes handle the
              mobile stacking while explicit `lg:col-start-*` pins each side
              back to its desktop column regardless of DOM/order changes. */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-zinc-950/60 backdrop-blur-md border border-zinc-800/60 rounded-3xl p-6 md:p-8">

            {/* LEFT: DESCRIPTION & OPTIONS */}
            <div className="order-2 lg:order-1 lg:col-start-1 lg:col-span-7 space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white">{selectedProduct.name}</h1>
                  <p className="text-zinc-400 text-xs mt-2 leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>
                {/* Features */}
                {selectedProduct.features && selectedProduct.features.length > 0 && (
                  <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-4 space-y-2">
                    <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                      {t('what_you_get_with')} {selectedProduct.name}:
                    </h4>
                    <ul className="space-y-1.5 pt-1">
                      {selectedProduct.features.map((feature, i) => (
                        <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                          <span className="text-amber-500 font-bold">⚡</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Rules / Important Info */}
                {selectedProduct.importantNotice && (
                  <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-4 space-y-2">
                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">
                      {t('important_information')}
                    </h4>
                    <ul className="space-y-1.5 pt-1">
                      {selectedProduct.importantNotice.map((note, i) => (
                        <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                          <span className="text-zinc-500">•</span>
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {/* STOCK & PURCHASE */}
              <div className="space-y-4 pt-6 border-t border-zinc-900">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  {selectedProduct.variants && selectedProduct.variants.length > 0 ? t('select_plan_option') : t('availability_label')}
                </h4>
                {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {selectedProduct.variants.map((variant) => {
                      const isSelected = selectedVariantId === variant.id;
                      return (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariantId(variant.id)}
                          className={`relative border rounded-2xl p-4 text-center transition flex flex-col justify-between items-center ${
                            isSelected
                              ? 'bg-amber-950/20 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          {variant.badge && (
                            <span className="absolute -top-2.5 bg-red-600 text-[9px] font-black text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {variant.badge}
                            </span>
                          )}
                          <span className="text-xs font-bold block">{variant.label}</span>
                          <span className="text-sm font-black text-white mt-2">{variant.price}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {/* PRICE — resolves to the selected variant's price if this
                    product has variants, otherwise the product's own price.
                    Previously this value was only used internally for the
                    cart total and never actually shown on screen. */}
                <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('you_pay')}</span>
                  <span className="text-2xl font-black text-white">
                    {selectedProduct.variants && selectedProduct.variants.length > 0
                      ? selectedProduct.variants.find((v) => v.id === selectedVariantId)?.price || selectedProduct.variants[0]?.price
                      : selectedProduct.price}
                  </span>
                </div>

                {/* CHANGED BUTTON: "7AT FEL 9OFA 🧺" */}
                <button
                  onClick={handleAddToCart}
                  disabled={selectedProduct.stock <= 0}
                  className={`w-full py-4 font-black text-sm rounded-2xl transition shadow-xl flex items-center justify-center gap-2 ${
                    selectedProduct.stock > 0
                      ? 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-red-600/20 cursor-pointer'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none'
                  }`}
                >
                  <span>{selectedProduct.stock > 0 ? `${t('add_to_cart')} 🧺` : t('sold_out').toUpperCase()}</span>
                </button>
                {/* Refund note — plain text for now; wire this into
                    translations.ts (e.g. `refund_policy_prefix` /
                    `refund_policy_link`) if multi-language support is needed. */}
                <p className="text-center text-[11px] text-zinc-500">
                  By buying this product, you agree to our{' '}
                  <a href="/refund-policy" className="text-amber-500 hover:text-amber-400 underline">
                    refund policy
                  </a>
                  .
                </p>
              </div>
            </div>
            {/* RIGHT (mobile: TOP): PRODUCT IMAGE + BADGES
                Leads on mobile so the shopper sees the product before the
                copy, matching the reference recording. */}
            <div className="order-1 lg:order-2 lg:col-start-8 lg:col-span-5 space-y-3">
              <div className="relative h-64 sm:h-80 lg:h-[420px] bg-zinc-950 border border-zinc-800/80 rounded-2xl overflow-hidden">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className={`absolute inset-0 w-full h-full object-cover transition ${
                    selectedProduct.stock <= 0 ? 'grayscale opacity-60' : ''
                  }`}
                />

                {/* Soft glass/vignette overlay */}
                <div className="pointer-events-none absolute inset-0 z-20 rounded-2xl ring-1 ring-inset ring-white/5" />
              </div>
              {/* Category + stock badges, sitting right under the image —
                  this is the row the reference recording shows here. */}
              <div className="flex items-center gap-2 flex-wrap">
                {selectedBrand?.category && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded-lg">
                    {t(CATEGORY_KEYS[selectedBrand.category] || selectedBrand.category)}
                  </span>
                )}
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                    selectedProduct.stock > 0
                      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                      : 'text-red-400 border-red-500/30 bg-red-500/10'
                  }`}
                >
                  {selectedProduct.stock > 0 ? `${selectedProduct.stock} ${t('in_stock')}` : t('sold_out')}
                </span>
              </div>
            </div>
          </div>

          {/* RELATED PRODUCTS — same category, excludes the current product */}
          {relatedProducts.length > 0 && (
            <div className="bg-zinc-950/60 backdrop-blur-md border border-zinc-800/60 rounded-3xl p-6 md:p-8 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                <h3 className="text-xl font-bold text-white">Related products</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">You may like</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedProducts.map(({ brand, product }: { brand: BrandService; product: Product }) => (
                  <div
                    key={`${brand.id}-${product.id}`}
                    onClick={() => handleOpenRelatedProduct(brand, product)}
                    className="rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-900/40 hover:border-red-500/40 cursor-pointer transition group"
                  >
                    <div className="relative w-full aspect-[16/9]">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover transition group-hover:scale-105"
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-bold text-zinc-200 group-hover:text-red-400 transition truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">{product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CUSTOMER REVIEWS SECTION */}
          <div className="bg-zinc-950/60 backdrop-blur-md border border-zinc-800/60 rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>⭐</span> {t('customer_reviews')} ({selectedProduct.reviews?.length || 0})
              </h3>
              <button className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-300 px-3 py-1.5 rounded-xl transition">
                {t('write_a_review')}
              </button>
            </div>
            {selectedProduct.reviews && selectedProduct.reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedProduct.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-4 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/30">
                            {rev.author.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-white">{rev.author}</span>
                        </div>
                        <span className="text-[10px] text-zinc-500">{rev.date}</span>
                      </div>
                      <div className="text-amber-400 text-xs">
                        {"★".repeat(rev.rating)}
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        "{rev.comment}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-zinc-500">
                {t('no_reviews_yet')}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ---------------------------------------------------- */
        /* VIEW 1 & 2: CATALOG WITH SIDEBAR + CENTER SEARCH     */
        /* ---------------------------------------------------- */
        <div className="space-y-8">
         
          {/* CENTERED HEADER, SEARCH BAR & QUICK TAG PILLS */}
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-5">
            <h1 className="text-4xl font-black tracking-tight text-red-500">
              {t('services_hero_title')}
            </h1>
            <p className="text-zinc-400 text-sm">
              {selectedBrand
                ? `${t('explore_products_under')} ${selectedBrand.name}`
                : t('services_hero_sub')}
            </p>
            {!selectedBrand && (
              <div className="w-full space-y-4">
                {/* SEARCH BAR */}
                <div className="w-full relative">
                  <input
                    type="text"
                    placeholder={t('search_services_placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-red-500 text-white shadow-2xl placeholder-zinc-500 text-center"
                  />
                </div>
                {/* CATEGORY TAG PILLS BELOW SEARCH BAR */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                  {QUICK_TAGS.map((tag, index) => {
                    const isActive = selectedCategory === tag.category;
                    return (
                      <button
                        key={tag.labelKey}
                        onClick={() => setSelectedCategory(tag.category)}
                        style={{ '--beam-delay': `${(index % 4) * 0.6}s` } as React.CSSProperties}
                        className={`border-beam px-5 py-3 rounded-full text-sm font-bold border transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-95 ${
                          isActive
                            ? 'bg-red-950/40 border-red-500 text-red-500 shadow-lg shadow-red-500/20'
                            : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-red-500/50 hover:text-white'
                        }`}
                      >
                        <span>{t(tag.labelKey)}</span>
                        <span
                          key={categoryProductCounts[tag.category] || 0}
                          className={`count-pop text-xs font-black rounded-full px-2 py-0.5 min-w-[22px] text-center ${
                            isActive ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {categoryProductCounts[tag.category] || 0}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          {!selectedBrand ? (
            /* BRAND CATALOG LAYOUT WITH SIDEBAR + MAIN GRID */
            <div className="pt-2">
             
              {/* MAIN CONTENT AREA: BRANDS GRID */}
              <main className="space-y-4 bg-zinc-950/60 backdrop-blur-md border border-zinc-800/60 rounded-3xl p-6 md:p-8">
                <div className="flex flex-wrap justify-end items-center gap-3 border-b border-zinc-900 pb-3">
                  <div className="flex items-center gap-2">
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
                      className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-bold rounded-xl px-3 py-2 outline-none focus:border-red-500"
                    >
                      <option value="default">{t('sort_default')}</option>
                      <option value="name-asc">{t('sort_name_asc')}</option>
                      <option value="most-products">{t('sort_most_products')}</option>
                    </select>
                    {(selectedCategory !== "All" || searchQuery) && (
                      <button
                        onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
                        className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-zinc-300 rounded-xl px-3 py-2 transition"
                      >
                        {t('clear_filters')}
                      </button>
                    )}
                  </div>
                </div>

                {selectedCategory !== "All" && (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-red-950/40 border border-red-500/40 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full">
                      {t(CATEGORY_KEYS[selectedCategory] || selectedCategory)}
                      <button onClick={() => setSelectedCategory("All")} className="hover:text-white transition">×</button>
                    </span>
                  </div>
                )}

                {filteredBrands.length === 0 ? (
                  <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-12 text-center text-zinc-500 text-sm">
                    {t('no_services_found')}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredBrands.map((brand) => {
                      // "From" price = the cheapest price across this
                      // brand's products/variants, matching the reference
                      // card's "From X" line.
                      const allPrices = brand.products.flatMap((p) =>
                        p.variants && p.variants.length ? p.variants.map((v) => parsePrice(v.price)) : [parsePrice(p.price)]
                      );
                      const fromPrice = Math.min(...allPrices);

                      return (
                        <div
                          key={brand.id}
                          onClick={() => {
                            // Brands with exactly one product skip the extra
                            // "Products" list screen and go straight to that
                            // product's full page — less clicking for the
                            // common single-product case.
                            if (brand.products.length === 1) {
                              setSelectedBrand(brand);
                              setSelectedProduct(brand.products[0]);
                              setSelectedVariantId(brand.products[0].variants?.[0]?.id || "");
                            } else {
                              setSelectedBrand(brand);
                            }
                          }}
                          className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/50 hover:border-red-500/40 hover:shadow-lg hover:shadow-red-500/10 rounded-2xl overflow-hidden cursor-pointer transition transform hover:-translate-y-1 group flex flex-col"
                        >
                          <div className="relative w-full h-40">
                            <img
                              src={brand.logo}
                              alt={brand.name}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          </div>

                          <div className="p-5 flex flex-col flex-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                              {t(CATEGORY_KEYS[brand.category] || brand.category)}
                            </span>
                            <h3 className="font-bold text-white text-lg mt-1 group-hover:text-red-500 transition">
                              {brand.name}
                            </h3>
                            <p className="text-xs text-zinc-500 mt-1">
                              {t('from_price_label')} {fromPrice.toFixed(2)} DT
                            </p>

                            <button className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-sm font-bold transition">
                              {t('buy_now')}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </main>

              {/* CAN'T FIND IT? — moved from sidebar to a centered banner
                  below the grid so the product listing gets the full width */}
              <div className="max-w-xl mx-auto mt-10 bg-gradient-to-b from-red-950/30 to-zinc-900/40 border border-red-900/40 p-6 rounded-2xl text-center space-y-3">
                <div className="w-11 h-11 mx-auto rounded-full bg-red-600/15 border border-red-500/40 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-black text-white">{t('cant_find_it_title')}</p>
                  <p className="text-xs text-zinc-400 mt-1">{t('cant_find_it_desc')}</p>
                </div>
                <a
                  href="/contact?tab=ticket"
                  className="inline-block bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition"
                >
                  {t('contact_us_button')}
                </a>
              </div>
            </div>
          ) : (
            /* BRAND PRODUCTS LIST */
            <div className="space-y-6 bg-zinc-950/60 backdrop-blur-md border border-zinc-800/60 rounded-3xl p-6 md:p-8">
              <div className="flex items-center justify-between bg-zinc-900/40 border border-zinc-900 p-4 rounded-2xl">
                <button
                  onClick={() => setSelectedBrand(null)}
                  className="bg-zinc-950 border border-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-bold"
                >
                  {t('back_to_services')}
                </button>
                <h2 className="text-xl font-bold text-white">{selectedBrand.name} {t('products_suffix')}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {selectedBrand.products.map((product) => {
                  const outOfStock = product.stock <= 0;
                  return (
                    <div
                      key={product.id}
                      onClick={() => handleOpenProduct(product)}
                      className={`relative overflow-hidden bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 cursor-pointer transition shadow-lg group space-y-4 ${
                        outOfStock ? 'opacity-80' : 'hover:border-red-500/50'
                      }`}
                    >
                      {outOfStock && (
                        <div className="absolute top-3 -right-9 z-10 w-32 rotate-45 bg-red-600 py-1 text-center text-[10px] font-black uppercase tracking-wider text-white shadow-lg">
                          {t('sold_out')}
                        </div>
                      )}
                      <span
                        className={`text-[10px] font-black px-2 py-1 rounded-lg border uppercase tracking-wide ${
                          outOfStock
                            ? 'text-red-400 border-red-500/30 bg-zinc-950/90'
                            : 'text-emerald-400 border-emerald-500/30 bg-zinc-950/90'
                        }`}
                      >
                        {outOfStock ? t('out_of_stock') : `${product.stock} ${t('in_stock')}`}
                      </span>
                      <img
                        src={product.image}
                        alt={product.name}
                        className={`w-full h-40 object-cover rounded-xl bg-zinc-950 transition ${
                          outOfStock ? 'grayscale opacity-60' : ''
                        }`}
                      />
                      <div>
                        <h3 className={`font-bold text-base transition ${outOfStock ? 'text-zinc-400' : 'text-white group-hover:text-red-400'}`}>
                          {product.name}
                        </h3>
                        <p className="text-zinc-500 text-xs line-clamp-2 mt-1">{product.description}</p>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-zinc-900">
                        <span className={`text-base font-black ${outOfStock ? 'text-zinc-500' : 'text-white'}`}>
                          {outOfStock ? t('unavailable') : product.price}
                        </span>
                        <span className={`text-xs font-bold transition ${outOfStock ? 'text-zinc-600' : 'text-red-500 group-hover:translate-x-1'}`}>
                          {outOfStock ? t('view_details') : t('view_options_buy')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes countPop {
          0% { transform: scale(0.5); opacity: 0.4; }
          60% { transform: scale(1.25); opacity: 1; }
          100% { transform: scale(1); }
        }
        .count-pop {
          animation: countPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @media (prefers-reduced-motion: reduce) {
          .count-pop { animation: none !important; }
        }

        /* A bright point of light continuously travels around the pill's
           border, like a slow-spinning halo — smooth, not a hard blink. */
        @property --beam-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes beamSpin {
          to { --beam-angle: 360deg; }
        }
        .border-beam {
          position: relative;
          isolation: isolate;
        }
        .border-beam::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1.5px;
          background: conic-gradient(
            from var(--beam-angle),
            transparent 0deg,
            transparent 220deg,
            rgba(239, 68, 68, 0.35) 260deg,
            rgba(239, 68, 68, 1) 300deg,
            rgba(239, 68, 68, 0.35) 340deg,
            transparent 360deg
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: beamSpin 2.6s linear infinite;
          animation-delay: var(--beam-delay, 0s);
          pointer-events: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .border-beam::before { animation: none !important; }
        }
      `}</style>
    </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center text-xs text-zinc-500">
          Loading…
        </div>
      }
    >
      <ServicesPageInner />
    </Suspense>
  );
}
