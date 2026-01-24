import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const isProductionEnv = Deno.env.get("VITE_PRODUCTION") === "true";

function resolveBaseUrl() {
  const env = (Deno.env.get(isProductionEnv ? "BOBGO_BASE_URL" : "PRODUCTION_BOBGO_BASE_URL") || "").trim().replace(/\/+$/, "");
  if (!env) return "https://api.bobgo.co.za/v2";
  if (env.includes("sandbox.bobgo.co.za") && !env.includes("api.sandbox.bobgo.co.za")) {
    return "https://api.sandbox.bobgo.co.za/v2";
  }
  if (env.includes("bobgo.co.za") && !/\/v2$/.test(env)) {
    return env + "/v2";
  }
  return env;
}

const BOBGO_BASE_URL = resolveBaseUrl();
const BOBGO_API_KEY = (Deno.env.get(isProductionEnv ? "BOBGO_API_KEY" : "PRODUCTION_BOBGO_API_KEY") || "").trim();

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("order_id");

    if (!BOBGO_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "MISSING_BOBGO_API_KEY" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!orderId) {
      return new Response(
        JSON.stringify({ success: false, error: "MISSING_ORDER_ID", message: "Please provide order_id as a query parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("tracking_number")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ success: false, error: "ORDER_NOT_FOUND", message: "Could not find order with provided ID" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!order.tracking_number) {
      return new Response(
        JSON.stringify({ success: false, error: "NO_TRACKING_NUMBER", message: "Order does not have a tracking number yet" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const waybillResp = await fetch(
      `${BOBGO_BASE_URL}/shipments/${encodeURIComponent(order.tracking_number)}/waybill`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${BOBGO_API_KEY}`,
          Accept: "application/pdf, application/json",
        },
      }
    );

    if (!waybillResp.ok) {
      const text = await waybillResp.text().catch(() => "");
      return new Response(
        JSON.stringify({ success: false, error: "BOBGO_WAYBILL_FAILED", status: waybillResp.status, response: text }),
        { status: waybillResp.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const contentType = waybillResp.headers.get("content-type") || "";
    if (!contentType.includes("application/pdf")) {
      const json = await waybillResp.json().catch(() => null);
      return new Response(
        JSON.stringify({ success: false, error: "UNEXPECTED_CONTENT_TYPE", content_type: contentType, data: json }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const pdf = new Uint8Array(await waybillResp.arrayBuffer());
    return new Response(pdf, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=waybill_${order.tracking_number}.pdf`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const error = e as Error;
    return new Response(
      JSON.stringify({ success: false, error: "UNEXPECTED_ERROR", message: error?.message || String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
