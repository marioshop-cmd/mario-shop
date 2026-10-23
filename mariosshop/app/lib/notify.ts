export async function notify(table: string, id: string): Promise<void> {
  const url = process.env.N8N_ORDER_WEBHOOK_URL;
  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (!url || !secret) return;

  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-secret': secret,
      },
      body: JSON.stringify({ record: { table, id } }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (error) {
    console.error('notify failed', error);
  }
}