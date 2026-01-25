// BobPay Edge Function client
// Routes to production or development edge functions based on VITE_PRODUCTION flag

import { supabase } from "@/integrations/supabase/client";

const PRODUCTION_FLAG = import.meta.env.VITE_PRODUCTION === "true" ? "true" : "false";

/**
 * Get the correct function name based on VITE_PRODUCTION flag
 * If VITE_PRODUCTION is true, use production functions
 * If VITE_PRODUCTION is false, use development functions
 */
function getFunctionName(baseName: string): string {
  if (PRODUCTION_FLAG === "true") {
    return baseName;
  }
  return `production_${baseName}`;
}

/**
 * Invoke a BobPay edge function with the correct function name based on VITE_PRODUCTION
 */
export async function invokeBobPayFunction<T = unknown>(
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
      ...options?.headers,
    };

    // Include auth header if provided
    if (options?.authToken) {
      headers['Authorization'] = `Bearer ${options.authToken}`;
    }

    const { data, error } = await supabase.functions.invoke(correctFunctionName, {
      body: options?.body,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
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
 * Initialize BobPay payment
 */
export async function initializeBobPayPayment(payload: Record<string, unknown>) {
  return invokeBobPayFunction("bobpay-initialize-payment", { body: payload });
}

/**
 * Process BobPay refund
 */
export async function processBobPayRefund(payload: Record<string, unknown>) {
  return invokeBobPayFunction("bobpay-refund", { body: payload });
}
