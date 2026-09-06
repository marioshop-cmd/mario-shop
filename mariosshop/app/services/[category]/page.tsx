import { redirect } from 'next/navigation';

// This route is intentionally disabled — product browsing now lives entirely
// on /services (with ?brandId=&productId= for deep links), so any old link
// or leftover navigation that still points here just bounces back there.
export default function CategoryPage() {
  redirect('/services');
}
