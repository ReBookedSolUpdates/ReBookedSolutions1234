// BobGo Edge Function client
// Automatically passes VITE_PRODUCTION as x-production header to edge functions

import { supabase } from "@/integrations/supabase/client";

const PRODUCTION_FLAG = import.meta.env.VITE_PRODUCTION === "true" ? "true" : "false";

/**
 * Invoke a BobGo edge function with the x-production header automatically set
 */
export async function invokeBobGoFunction<T = unknown>(
  functionName: string,
  options?: {
    body?: Record<string, unknown>;
    method?: "GET" | "POST";
  }
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: options?.body,
      headers: {
        "x-production": PRODUCTION_FLAG,
      },
    });

    if (error) {
      return { data: null, error };
    }

    return { data: data as T, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Get shipping rates
 */
export async function getBobGoRates(payload: Record<string, unknown>) {
  return invokeBobGoFunction("bobgo-get-rates", { body: payload });
}

/**
 * Create a shipment
 */
export async function createBobGoShipment(payload: Record<string, unknown>) {
  return invokeBobGoFunction("bobgo-create-shipment", { body: payload });
}

/**
 * Track a shipment
 */
export async function trackBobGoShipment(trackingNumber: string) {
  return invokeBobGoFunction("bobgo-track-shipment", { 
    body: { tracking_number: trackingNumber } 
  });
}

/**
 * Cancel a shipment
 */
export async function cancelBobGoShipment(payload: Record<string, unknown>) {
  return invokeBobGoFunction("bobgo-cancel-shipment", { body: payload });
}

/**
 * Get waybill URL - returns PDF
 */
export function getBobGoWaybillUrl(orderId?: string, trackingRef?: string): string {
  const params = new URLSearchParams();
  if (orderId) params.set("order_id", orderId);
  if (trackingRef) params.set("tracking_reference", trackingRef);
  params.set("x-production", PRODUCTION_FLAG);
  
  return `https://kbpjqzaqbqukutflwixf.supabase.co/functions/v1/bobgo-get-waybill?${params.toString()}`;
}
