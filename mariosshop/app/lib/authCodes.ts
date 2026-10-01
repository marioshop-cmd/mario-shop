export type CodePurpose = 'register' | 'login' | 'reset';

interface CodeResponse {
  success: boolean;
  message?: string;
  /** Only present if the email failed to send (e.g. Resend not configured
   * yet) — a fallback so the flow doesn't dead-end while that's sorted out. */
  devCode?: string;
}

async function callAuthCodes(payload: Record<string, unknown>): Promise<CodeResponse> {
  try {
    const response = await fetch('/api/auth-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('auth-codes request failed:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
}

/** Always issues a brand new code and emails it, replacing any code that
 * was already pending for this email+purpose. */
export function requestAuthCode(email: string, purpose: CodePurpose): Promise<CodeResponse> {
  return callAuthCodes({ action: 'request', email, purpose });
}

/** Checks the code against what was emailed. Codes are single-use — a
 * successful verify consumes it, so a second attempt with the same code
 * will fail even if it hasn't expired yet. */
export function verifyAuthCode(email: string, code: string, purpose: CodePurpose): Promise<CodeResponse> {
  return callAuthCodes({ action: 'verify', email, purpose, code });
}