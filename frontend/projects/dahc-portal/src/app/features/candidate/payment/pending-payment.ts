/**
 * The payment session the candidate left for, so the return page can finish the submission even
 * when the gateway returns without the session id (how the browser learns it is open, OQ-C7).
 * Only ids are kept, in this tab's sessionStorage; no personal data.
 */
const KEY = 'gme-pending-payment';

export interface PendingPayment {
  readonly applicationId: string;
  readonly paymentSessionId: string;
}

export function savePendingPayment(payment: PendingPayment): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(payment));
  } catch {
    // Without storage the return URL must carry the session id.
  }
}

export function readPendingPayment(): PendingPayment | null {
  try {
    const stored = sessionStorage.getItem(KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : null;

    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as PendingPayment).applicationId === 'string' &&
      typeof (parsed as PendingPayment).paymentSessionId === 'string'
    ) {
      return parsed as PendingPayment;
    }
  } catch {
    // Unreadable: treat as none.
  }

  return null;
}

export function clearPendingPayment(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Nothing stored.
  }
}
