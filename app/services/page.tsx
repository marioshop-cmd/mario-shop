 'use client';



import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useAuth } from '../context/AuthContext';

import { useCart } from '../context/CartContext';

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



// Categories list for Left Sidebar

const CATEGORIES = [

  "All",

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



// Quick Tag Pills below Search Bar

const QUICK_TAGS = [

  { label: "Subscriptions", category: "Accounts", icon: "🔄" },

  { label: "Top ups", category: "Game Top-Ups", icon: "⚡" },

  { label: "Gift Cards", category: "Gift Cards", icon: "🎁" },

  { label: "Games", category: "Gaming", icon: "🎮" },

  { label: "Software", category: "Software", icon: "🏷️" },

  { label: "Streaming", category: "Streaming", icon: "📺" },

  { label: "AI Tools", category: "AI", icon: "🏷️" },

  { label: "Accounts", category: "Accounts", icon: "🏷️" }

];



export default function ServicesPage() {

  const { currentUser } = useAuth();

  const { addToCart, openCart, totalCartItemsCount } = useCart();



  const [brands, setBrands] = useState<BrandService[]>([]);



  useEffect(() => {

    setBrands(getAllBrands());

    const unsubscribe = onProductsChanged(() => setBrands(getAllBrands()));

    return unsubscribe;

  }, []);



  const [selectedCategory, setSelectedCategory] = useState("All");

  const [selectedBrand, setSelectedBrand] = useState<BrandService | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [selectedVariantId, setSelectedVariantId] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState("");



  // Filter Brands

  const filteredBrands = brands.filter((brand) => {

    const matchesCat = selectedCategory === "All" || brand.category === selectedCategory;

    const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||

                          brand.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesSearch;

  });



  const handleOpenProduct = (product: Product) => {

    setSelectedProduct(product);

    if (product.variants && product.variants.length > 0) {

      setSelectedVariantId(product.variants[0].id);

    }

  };



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

  };



  return (

    <div className="min-h-screen bg-zinc-950 text-white font-sans p-6 pt-24 max-w-7xl mx-auto space-y-8 relative">

     

      {/* FLOATING PANIER / CART BUTTON (TOP RIGHT) */}

      <button

        onClick={openCart}

        className="fixed top-6 right-6 z-40 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-amber-400/30 transition transform hover:scale-105"

      >

        <span className="text-lg">🧺</span>

        <span className="text-xs uppercase tracking-wider font-extrabold">9ofa / Cart</span>

        {totalCartItemsCount > 0 && (

          <span className="bg-white text-red-600 text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center">

            {totalCartItemsCount}

          </span>

        )}

      </button>



      {/* ---------------------------------------------------- */}

      {/* VIEW 3: PRODUCT DETAIL & ORDER PAGE WITH REVIEWS      */}

      {/* ---------------------------------------------------- */}

      {selectedProduct ? (

        <div className="space-y-10 animate-fadeIn">

         

          {/* Top Bar Navigation */}

          <div className="flex items-center justify-between border-b border-zinc-900 pb-4">

            <button

              onClick={() => setSelectedProduct(null)}

              className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2"

            >

              ← Back to Products

            </button>

            <span className="text-xs text-zinc-500 font-mono">

              Mario's Shop / {selectedBrand?.name || 'Product'} / {selectedProduct.name}

            </span>

          </div>



          {/* MAIN PRODUCT ORDER GRID */}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-zinc-900/30 border border-zinc-900 rounded-3xl p-6 md:p-8">

           

            {/* LEFT: DESCRIPTION & OPTIONS */}

            <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">

              <div className="space-y-6">

                <div>

                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-red-950/60 text-red-400 border border-red-900/80 rounded-lg">

                    Description

                  </span>

                  <h1 className="text-3xl font-black text-white mt-3">{selectedProduct.name}</h1>

                  <p className="text-zinc-400 text-xs mt-2 leading-relaxed">

                    {selectedProduct.description}

                  </p>

                </div>



                {/* Features */}

                {selectedProduct.features && (

                  <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-4 space-y-2">

                    <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">

                      What you get with {selectedProduct.name}:

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

                      Important Information:

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

                <div className="flex items-center justify-between">

                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">

                    {selectedProduct.variants ? 'Select Plan / Option:' : 'Availability:'}

                  </h4>

                  <span

                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${

                      selectedProduct.stock > 0

                        ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'

                        : 'text-red-400 border-red-500/30 bg-red-500/10'

                    }`}

                  >

                    {selectedProduct.stock > 0 ? `${selectedProduct.stock} in stock` : 'Sold Out'}

                  </span>

                </div>



                {selectedProduct.variants && (

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                    {selectedProduct.variants.map((variant) => {

                      const isSelected = selectedVariantId === variant.id;

                      return (

                        <button

                          key={variant.id}

                          onClick={() => setSelectedVariantId(variant.id)}

                          className={`relative border rounded-2xl p-4 text-center transition flex flex-col justify-between items-center ${

                            isSelected

                              ? 'bg-red-950/20 border-red-500 text-white shadow-lg shadow-red-500/10'

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



                {/* CHANGED BUTTON: "7AT FEL 9OFA 🧺" */}

                <button

                  onClick={handleAddToCart}

                  disabled={selectedProduct.stock <= 0}

                  className={`w-full py-4 font-black text-sm rounded-2xl transition shadow-xl flex items-center justify-center gap-2 mt-4 ${

                    selectedProduct.stock > 0

                      ? 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-red-600/20 cursor-pointer'

                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none'

                  }`}

                >

                  <span>{selectedProduct.stock > 0 ? '7AT FEL 9OFA 🧺' : 'SOLD OUT'}</span>

                </button>

              </div>



            </div>



            {/* RIGHT: IMAGE BANNER */}

            <div className="lg:col-span-5 flex items-center justify-center bg-zinc-950 border border-zinc-800/80 rounded-2xl overflow-hidden p-4">

              <img

                src={selectedProduct.image}

                alt={selectedProduct.name}

                className={`w-full h-auto max-h-[420px] object-cover rounded-xl transition ${

                  selectedProduct.stock <= 0 ? 'grayscale opacity-60' : ''

                }`}

              />

            </div>



          </div>



          {/* CUSTOMER REVIEWS SECTION */}

          <div className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-6 md:p-8 space-y-6">

            <div className="flex items-center justify-between border-b border-zinc-900 pb-4">

              <h3 className="text-xl font-bold text-white flex items-center gap-2">

                <span>⭐</span> Customer Reviews ({selectedProduct.reviews?.length || 0})

              </h3>

              <button className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-300 px-3 py-1.5 rounded-xl transition">

                + Write a Review

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

                No reviews yet for this product. Be the first to leave one!

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

              🍄 MARIO'S SHOP & SERVICES

            </h1>

            <p className="text-zinc-400 text-sm">

              {selectedBrand

                ? `Explore products under ${selectedBrand.name}`

                : "Search or filter by categories below to browse gift cards, top-ups, and accounts."}

            </p>



            {!selectedBrand && (

              <div className="w-full space-y-4">

                {/* SEARCH BAR */}

                <div className="w-full relative">

                  <input

                    type="text"

                    placeholder="Search services (e.g. Steam, Claude AI, Free Fire)..."

                    value={searchQuery}

                    onChange={(e) => setSearchQuery(e.target.value)}

                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-red-500 text-white shadow-2xl placeholder-zinc-500 text-center"

                  />

                </div>



                {/* CATEGORY TAG PILLS BELOW SEARCH BAR */}

                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">

                  {QUICK_TAGS.map((tag) => {

                    const isActive = selectedCategory === tag.category;

                    return (

                      <button

                        key={tag.label}

                        onClick={() => setSelectedCategory(tag.category)}

                        className={`px-4 py-2 rounded-full text-xs font-bold border transition flex items-center gap-1.5 ${

                          isActive

                            ? 'bg-red-950/40 border-red-500 text-red-500 shadow-lg shadow-red-500/20'

                            : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-red-500/50 hover:text-white'

                        }`}

                      >

                        <span>{tag.label}</span>

                        <span className="text-xs">{tag.icon}</span>

                      </button>

                    );

                  })}

                </div>

              </div>

            )}

          </div>



          {!selectedBrand ? (

            /* BRAND CATALOG LAYOUT WITH SIDEBAR + MAIN GRID */

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-2">

             

              {/* LEFT SIDEBAR: CATEGORIES */}

              <aside className="space-y-4">

                <div className="bg-zinc-900/40 border border-zinc-900 p-5 rounded-2xl">

                  <h2 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-4">

                    Categories

                  </h2>

                  <div className="flex flex-col space-y-1">

                    {CATEGORIES.map((cat) => (

                      <button

                        key={cat}

                        onClick={() => setSelectedCategory(cat)}

                        className={`text-left px-3 py-2.5 rounded-xl text-xs font-bold transition ${

                          selectedCategory === cat

                            ? 'bg-red-600 text-white shadow-md shadow-red-600/20'

                            : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'

                        }`}

                      >

                        {cat}

                      </button>

                    ))}

                  </div>

                </div>

              </aside>



              {/* MAIN CONTENT AREA: BRANDS GRID */}

              <main className="lg:col-span-3 space-y-4">

                <div className="flex justify-between items-center border-b border-zinc-900 pb-3">

                  <h2 className="text-lg font-bold text-white">{selectedCategory} Services</h2>

                  <span className="text-xs text-zinc-500">{filteredBrands.length} Available</span>

                </div>



                {filteredBrands.length === 0 ? (

                  <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-12 text-center text-zinc-500 text-sm">

                    No services found matching your search.

                  </div>

                ) : (

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                    {filteredBrands.map((brand) => (

                      <div

                        key={brand.id}

                        onClick={() => setSelectedBrand(brand)}

                        className="bg-zinc-900/40 border border-zinc-900 hover:border-red-500/50 rounded-2xl p-5 cursor-pointer transition transform hover:-translate-y-1 shadow-lg group flex flex-col justify-between"

                      >

                        <div className="space-y-3">

                          <img

                            src={brand.logo}

                            alt={brand.name}

                            className="w-full h-32 object-cover rounded-xl bg-zinc-950 border border-zinc-800"

                          />

                          <div>

                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-zinc-950 border border-zinc-800 rounded text-red-400">

                              {brand.category}

                            </span>

                            <h3 className="font-bold text-white text-lg mt-2 group-hover:text-red-500 transition">

                              {brand.name}

                            </h3>

                            <p className="text-zinc-500 text-xs mt-1 line-clamp-2">

                              {brand.description}

                            </p>

                          </div>

                        </div>



                        <div className="pt-4 mt-4 border-t border-zinc-900/80 flex items-center justify-between">

                          <span className="text-xs text-zinc-400 font-medium">

                            {brand.products.length} Products

                          </span>

                          <span className="text-xs font-bold text-red-500 group-hover:translate-x-1 transition">

                            View All →

                          </span>

                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </main>



            </div>

          ) : (

            /* BRAND PRODUCTS LIST */

            <div className="space-y-6">

              <div className="flex items-center justify-between bg-zinc-900/40 border border-zinc-900 p-4 rounded-2xl">

                <button

                  onClick={() => setSelectedBrand(null)}

                  className="bg-zinc-950 border border-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-bold"

                >

                  ← Back to Services

                </button>

                <h2 className="text-xl font-bold text-white">{selectedBrand.name} Products</h2>

              </div>



              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

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

                          Sold Out

                        </div>

                      )}

                      <span

                        className={`text-[10px] font-black px-2 py-1 rounded-lg border uppercase tracking-wide ${

                          outOfStock

                            ? 'text-red-400 border-red-500/30 bg-zinc-950/90'

                            : 'text-emerald-400 border-emerald-500/30 bg-zinc-950/90'

                        }`}

                      >

                        {outOfStock ? 'Out of Stock' : `${product.stock} in stock`}

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

                          {outOfStock ? 'Unavailable' : product.price}

                        </span>

                        <span className={`text-xs font-bold transition ${outOfStock ? 'text-zinc-600' : 'text-red-500 group-hover:translate-x-1'}`}>

                          {outOfStock ? 'View Details →' : 'View Options & Buy →'}

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





    </div>

  );

} 

