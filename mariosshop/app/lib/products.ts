import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Shared product catalog. Seeded once with the same brands that used to be
 * hardcoded in services/page.tsx, then persisted in Supabase — so every
 * browser and deployment reads the same catalog.
 */

export interface ProductVariant {
  id: string;
  label: string;
  price: string;
  badge?: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Product {
  id: number;
  name: string;
  price: string;
  stock: number;
  description: string;
  features: string[];
  importantNotice: string[];
  image: string;
  variants?: ProductVariant[];
  reviews?: Review[];
  /** Shown in the homepage's Featured Products carousel when true. */
  featured?: boolean;
}

export interface BrandService {
  id: string;
  name: string;
  category: string;
  logo: string;
  description: string;
  products: Product[];
}

/** A single product, flattened out of its brand wrapper — this is the shape
 * the simple admin "Product Control" table works with (one row per
 * product, not per brand). */
export interface FlatProduct extends Product {
  category: string;
  brandId: string;
}

export const CATEGORIES = [
  'AI',
  'Gift Cards',
  'Gaming',
  'Game Top-Ups',
  'Streaming',
  'Subscriptions',
  'Software',
  'Accounts',
  'Mobile Apps',
  'Other',
];

const STORAGE_KEY = 'app_products';
const REALTIME_TABLE = 'site_catalog';

let realtimeClient: SupabaseClient | null = null;

function getRealtimeClient(): SupabaseClient | null {
  if (realtimeClient) return realtimeClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  realtimeClient = createClient(url, key);
  return realtimeClient;
}

const SEED_BRANDS: BrandService[] = [
  {
    id: 'steam',
    name: 'Steam',
    category: 'Gift Cards',
    logo: 'https://via.placeholder.com/300x180/18181b/ffffff?text=Steam',
    description: 'Steam Wallet digital gift codes & global top-ups.',
    products: [
      {
        id: 101,
        name: 'Steam Gift Card $10',
        price: '35 TND',
        stock: 12,
        description: 'Unlock games, software, and wallet balance on Steam instantly.',
        features: [
          'Instant digital delivery code',
          'Global activation on any Steam account',
          'No expiration date',
        ],
        importantNotice: [
          'Make sure your account region matches before redeeming.',
          'Digital codes are non-refundable once delivered.',
        ],
        image: 'https://via.placeholder.com/600x350/18181b/ffffff?text=Steam+Gift+Card',
        variants: [
          { id: 'v1', label: 'Steam $5', price: '18 TND' },
          { id: 'v2', label: 'Steam $10', price: '35 TND', badge: 'POPULAR' },
          { id: 'v3', label: 'Steam $20', price: '70 TND' },
        ],
        reviews: [
          { id: 'r1', author: 'KAST MD', rating: 5, date: '3 days ago', comment: 'Fast code delivery! Worked instantly on my account.' },
          { id: 'r2', author: 'Mohamed Oun', rating: 5, date: '1 week ago', comment: 'Thanks, best shop in Tunisia!' },
          { id: 'r3', author: 'gh-meddha', rating: 5, date: '2 weeks ago', comment: 'Bon qualité de service ⭐⭐⭐⭐⭐' },
        ],
      },
    ],
  },
  {
    id: 'claude',
    name: 'Claude AI',
    category: 'AI',
    logo: 'https://via.placeholder.com/300x180/18181b/ffffff?text=Claude+AI',
    description: 'Next-gen AI capabilities for research and coding.',
    products: [
      {
        id: 301,
        name: 'Claude AI Pro',
        price: '77.90 DT',
        stock: 8,
        description:
          'Unlock advanced AI capabilities with Claude AI Pro and enjoy faster, smarter, and more powerful performance on your personal account.',
        features: [
          'Faster responses and higher usage limits',
          'Access to more advanced Claude models',
          'Upload and analyze large documents',
          'Improved writing, reasoning, and coding assistance',
          'Better long-form analysis and research support',
        ],
        importantNotice: [
          'Make sure your account has no unpaid or failed payments before subscribing.',
          "If your previous plan just expired, wait until your account fully returns to the Free Plan before buying again.",
          'This is a personal account upgrade, not a shared account.',
        ],
        image: 'https://via.placeholder.com/600x350/18181b/ffffff?text=Claude+AI+Pro',
        variants: [
          { id: 'pro-1', label: 'Pro - 1 Month', price: '77.90 DT', badge: 'BEST VALUE' },
          { id: 'pro-5x', label: 'Max 5x - 1 Month', price: '339.00 DT' },
          { id: 'pro-20x', label: 'Max 20x - 1 Month', price: '639.00 DT' },
        ],
        reviews: [
          { id: 'cr1', author: 'Youssef B.', rating: 5, date: 'Yesterday', comment: 'Upgraded my personal account within 10 minutes. Super quick!' },
          { id: 'cr2', author: 'Amen Allah', rating: 5, date: '5 days ago', comment: 'Claude 3.5 Sonnet working flawlessly. Top service.' },
        ],
      },
    ],
  },
  {
    id: 'freefire',
    name: 'Free Fire',
    category: 'Game Top-Ups',
    logo: 'https://via.placeholder.com/300x180/18181b/ffffff?text=Free+Fire',
    description: 'Direct Free Fire diamond top-ups via Player ID.',
    products: [
      {
        id: 201,
        name: 'Free Fire Diamonds Top-Up',
        price: '7 TND',
        stock: 20,
        description: 'Instant top-up directly to your Free Fire account ID.',
        features: ['Direct ID delivery', 'Instant processing', '100% Safe'],
        importantNotice: ['Double check your Player ID before submitting.'],
        image: 'https://via.placeholder.com/600x350/18181b/ffffff?text=Free+Fire+Diamonds',
        variants: [
          { id: 'ff1', label: '210 Diamonds', price: '7 TND' },
          { id: 'ff2', label: '530 Diamonds', price: '16 TND', badge: 'POPULAR' },
        ],
        reviews: [
          { id: 'ffr1', author: 'Gamer_TN', rating: 5, date: '4 days ago', comment: 'Got my diamonds immediately. 10/10' },
        ],
      },
    ],
  },
];

async function readBrands(): Promise<BrandService[]> {
  const response = await fetch('/api/products', { cache: 'no-store' });
  if (!response.ok) throw new Error('Unable to load the shared product catalog');
  const parsed: unknown = await response.json();
  if (Array.isArray(parsed) && parsed.length > 0) return parsed as BrandService[];
  await writeBrands(SEED_BRANDS);
  return SEED_BRANDS;
}

async function writeBrands(brands: BrandService[]): Promise<boolean> {
  const response = await fetch('/api/products', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(brands),
  });
  return response.ok;
}

export async function getAllBrands(): Promise<BrandService[]> {
  return readBrands();
}

/** Flattens every brand's products into one row-per-product list — what the
 * admin's simple product table works with. */
export async function getAllProductsFlat(): Promise<FlatProduct[]> {
  return (await readBrands()).flatMap((brand) =>
    brand.products.map((p) => ({ ...p, category: brand.category, brandId: brand.id }))
  );
}

/** Products marked "featured" in Product Control, shaped for the homepage
 * carousel (FeaturedProducts.tsx) — publisher comes from the parent brand's
 * name, since individual products don't track that themselves. */
export interface FeaturedCarouselItem {
  id: string;
  publisher: string;
  title: string;
  price: string;
  image: string;
  link: string;
}

export async function getFeaturedProducts(): Promise<FeaturedCarouselItem[]> {
  return (await readBrands()).flatMap((brand) =>
    brand.products
      .filter((p) => p.featured)
      .map((p) => ({
        id: String(p.id),
        publisher: brand.name.toUpperCase(),
        title: p.name,
        price: p.price,
        image: p.image,
        // Individual products aren't deep-linkable to their own URL yet —
        // this sends people to browse services generally.
        link: '/services',
      }))
  );
}

/** Adds a brand-new product. Since the admin form doesn't deal in variants
 * or existing brands, each new product becomes its own single-product
 * "brand" tile on the storefront, filed under the chosen category. */
export async function addProduct(input: {
  name: string;
  category: string;
  price: string;
  stock: number;
  description: string;
  image: string;
  features?: string[];
  importantNotice?: string[];
  variants?: ProductVariant[];
  featured?: boolean;
}): Promise<FlatProduct | null> {
  const brands = await readBrands();
  const productId = Date.now();

  const newProduct: Product = {
    id: productId,
    name: input.name,
    price: input.price,
    stock: input.stock,
    description: input.description,
    features: input.features ?? [],
    importantNotice: input.importantNotice ?? [],
    image: input.image,
    ...(input.variants && input.variants.length ? { variants: input.variants } : {}),
    ...(input.featured ? { featured: true } : {}),
  };

  const brandId = `custom-${productId}`;
  const newBrand: BrandService = {
    id: brandId,
    name: input.name,
    category: input.category,
    logo: input.image,
    description: input.description,
    products: [newProduct],
  };

  brands.unshift(newBrand);
  // Previously this ignored whether the save actually worked — if
  // localStorage was full (easy to hit once several base64 product images
  // pile up), the write would silently fail and the admin form would just
  // reset as if it succeeded, with nothing actually added.
  const saved = await writeBrands(brands);
  if (!saved) return null;

  return { ...newProduct, category: input.category, brandId };
}

export async function updateProduct(
  brandId: string,
  productId: number,
  updates: Partial<{
    name: string;
    category: string;
    price: string;
    stock: number;
    description: string;
    image: string;
    features: string[];
    importantNotice: string[];
    variants: ProductVariant[];
    featured: boolean;
  }>
): Promise<boolean> {
  const brands = await readBrands();
  const brandIdx = brands.findIndex((b) => b.id === brandId);
  if (brandIdx === -1) return false;

  const productIdx = brands[brandIdx].products.findIndex((p) => p.id === productId);
  if (productIdx === -1) return false;

  const { category, ...productUpdates } = updates;
  brands[brandIdx].products[productIdx] = {
    ...brands[brandIdx].products[productIdx],
    ...productUpdates,
  };
  if (category !== undefined) brands[brandIdx].category = category;
  if (updates.name !== undefined && brands[brandIdx].products.length === 1) {
    brands[brandIdx].name = updates.name;
  }
  if (updates.image !== undefined && brands[brandIdx].products.length === 1) {
    brands[brandIdx].logo = updates.image;
  }

  return writeBrands(brands);
}

/** Deletes a single product; if it was the last product in its brand, the
 * now-empty brand tile is removed too. */
export async function deleteProduct(brandId: string, productId: number): Promise<boolean> {
  const brands = await readBrands();
  const brandIdx = brands.findIndex((b) => b.id === brandId);
  if (brandIdx === -1) return false;

  brands[brandIdx].products = brands[brandIdx].products.filter((p) => p.id !== productId);

  const nextBrands = brands[brandIdx].products.length === 0 ? brands.filter((b) => b.id !== brandId) : brands;

  return writeBrands(nextBrands);
}

/** Reduces a product's stock count after a purchase (called from checkout).
 * Clamps at 0 so stock never goes negative even if two tabs check out at
 * the same time. Silently no-ops if the brand/product no longer exists. */
export async function decrementStock(brandId: string, productId: number, quantity: number): Promise<boolean> {
  const brands = await readBrands();
  const brandIdx = brands.findIndex((b) => b.id === brandId);
  if (brandIdx === -1) return false;

  const productIdx = brands[brandIdx].products.findIndex((p) => p.id === productId);
  if (productIdx === -1) return false;

  const currentStock = brands[brandIdx].products[productIdx].stock;
  brands[brandIdx].products[productIdx] = {
    ...brands[brandIdx].products[productIdx],
    stock: Math.max(0, currentStock - quantity),
  };

  return writeBrands(brands);
}

export function onProductsChanged(callback: () => void): () => void {
  const client = getRealtimeClient();
  const channel = client
    ?.channel('site-catalog-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: REALTIME_TABLE },
      callback,
    )
    .subscribe();

  // Keep a fallback for deployments where Realtime has not yet been enabled.
  const interval = window.setInterval(callback, 30000);
  return () => {
    window.clearInterval(interval);
    if (channel) void client?.removeChannel(channel);
  };
}