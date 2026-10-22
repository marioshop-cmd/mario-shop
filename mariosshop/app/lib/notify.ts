export async function notify(details: string) {
  const url = process.env.N8N_ORDER_WEBHOOK_URL;
  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (!url || !secret) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-secret": secret },
      body: JSON.stringify({ orderId: details, total: "" }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (e) {
    console.error("notify failed", e);
  }
}