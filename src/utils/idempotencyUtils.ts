/**
 * Frontend Idempotency Utility
 * 
 * Prevents duplicate order submissions by tracking payment references
 * and preventing the same order from being created multiple times.
 * 
 * This complements server-side DB constraints by adding client-side protection.
 */

/**
 * Idempotency tracking key stored in sessionStorage
 * Maps payment_reference to order_id to prevent duplicates
 */
const IDEMPOTENCY_STORAGE_KEY = "order_idempotency_map";

/**
 * Timeout for idempotency tracking (30 minutes)
 * After this, the same payment_reference can be used again
 */
const IDEMPOTENCY_TIMEOUT_MS = 30 * 60 * 1000;

interface IdempotencyRecord {
  paymentReference: string;
  orderId: string;
  timestamp: number;
}

/**
 * Get all stored idempotency records
 * 
 * @returns Map of payment_reference -> idempotency record
 */
function getStoredRecords(): Record<string, IdempotencyRecord> {
  try {
    const stored = sessionStorage.getItem(IDEMPOTENCY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Save idempotency records to storage
 */
function saveRecords(records: Record<string, IdempotencyRecord>): void {
  try {
    sessionStorage.setItem(IDEMPOTENCY_STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.warn("Failed to save idempotency records", error);
  }
}

/**
 * Check if a payment reference has been used to create an order
 * Returns the order ID if found, null if not found
 * 
 * @param paymentReference - Payment reference to check
 * @returns Cached order ID if exists and not expired, null otherwise
 */
export function getCachedOrderId(
  paymentReference: string | null | undefined
): string | null {
  if (!paymentReference) return null;

  const records = getStoredRecords();
  const record = records[paymentReference];

  if (!record) return null;

  // Check if record is still valid (not expired)
  const age = Date.now() - record.timestamp;
  if (age > IDEMPOTENCY_TIMEOUT_MS) {
    // Record is expired, delete it
    delete records[paymentReference];
    saveRecords(records);
    return null;
  }

  return record.orderId;
}

/**
 * Register a new order creation with its payment reference
 * This marks the payment_reference as "claimed" for idempotency
 * 
 * @param paymentReference - Payment reference for the order
 * @param orderId - ID of the created order
 */
export function registerOrderCreation(
  paymentReference: string,
  orderId: string
): void {
  if (!paymentReference || !orderId) return;

  const records = getStoredRecords();

  // Don't overwrite if already exists (idempotency)
  if (records[paymentReference]) {
    return;
  }

  records[paymentReference] = {
    paymentReference,
    orderId,
    timestamp: Date.now(),
  };

  saveRecords(records);
}

/**
 * Clear idempotency record for a payment reference
 * Use this if order creation failed and you want to retry
 * 
 * @param paymentReference - Payment reference to clear
 */
export function clearIdempotencyRecord(
  paymentReference: string
): void {
  if (!paymentReference) return;

  const records = getStoredRecords();
  delete records[paymentReference];
  saveRecords(records);
}

/**
 * Clear all expired idempotency records
 * Call this periodically to clean up old entries
 */
export function cleanupExpiredRecords(): void {
  const records = getStoredRecords();
  const now = Date.now();
  let hasChanges = false;

  for (const [key, record] of Object.entries(records)) {
    if (now - record.timestamp > IDEMPOTENCY_TIMEOUT_MS) {
      delete records[key];
      hasChanges = true;
    }
  }

  if (hasChanges) {
    saveRecords(records);
  }
}

/**
 * Check if a payment reference is currently being processed
 * Returns true if the payment_reference has been registered recently
 * 
 * @param paymentReference - Payment reference to check
 * @returns true if this payment_reference has been claimed (order creation in progress or completed)
 */
export function isPaymentReferenceClaimed(
  paymentReference: string | null | undefined
): boolean {
  return getCachedOrderId(paymentReference) !== null;
}

/**
 * Get all currently tracked payment references
 * Useful for debugging or UI display
 * 
 * @returns Array of payment references
 */
export function getTrackedPaymentReferences(): string[] {
  const records = getStoredRecords();
  return Object.keys(records).filter((ref) => {
    const record = records[ref];
    const age = Date.now() - record.timestamp;
    return age <= IDEMPOTENCY_TIMEOUT_MS;
  });
}

/**
 * Clear all idempotency records
 * Use with caution - only for testing or user logout
 */
export function clearAllRecords(): void {
  sessionStorage.removeItem(IDEMPOTENCY_STORAGE_KEY);
}
