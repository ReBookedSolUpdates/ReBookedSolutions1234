// BobGo Edge Function client
// Routes to production or development edge functions based on VITE_PRODUCTION flag

import { supabase } from "@/integrations/supabase/client";
import { IS_PRODUCTION } from "@/config/envParser";

const PRODUCTION_FLAG = IS_PRODUCTION ? "true" : "false";

/**
 * Get the correct function name based on VITE_PRODUCTION flag
 * If VITE_PRODUCTION is true, use standard bobgo-* functions
 * If VITE_PRODUCTION is false, use production_bobgo-* functions
 */
function getFunctionName(baseName: string): string {
  if (PRODUCTION_FLAG === "true") {
    return baseName;
  }
  return `production_${baseName}`;
}

/**
 * Invoke a BobGo edge function with the correct function name based on VITE_PRODUCTION
 */
export async function invokeBobGoFunction<T = unknown>(
  functionName: string,
  options?: {
    body?: Record<string, unknown>;
    method?: "GET" | "POST";
    headers?: Record<string, string>;
    authToken?: string;
  }
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const correctFunctionName = getFunctionName(functionName);
    const headers: Record<string, string> = {
      "x-production": PRODUCTION_FLAG,
      ...options?.headers,
    };

    // Include auth header if provided
    if (options?.authToken) {
      headers['Authorization'] = `Bearer ${options.authToken}`;
    }

    const { data, error } = await supabase.functions.invoke(correctFunctionName, {
      body: options?.body,
      headers,
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
