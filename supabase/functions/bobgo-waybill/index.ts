import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { getBobGoConfig } from "../_shared/bobgo-config.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("order_id");
    const trackingRef = url.searchParams.get("tracking_reference");

    const config = getBobGoConfig(req);
    console.log("[get-waybill] Config:", { baseUrl: config.baseUrl, hasApiKey: config.hasApiKey });

    if (!config.hasApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "MISSING_BOBGO_API_KEY", missing: config.apiKeyEnvName }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let trackingNumber = trackingRef;

    // If order_id provided, look up the tracking number
    if (!trackingNumber && orderId) {
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

      trackingNumber = order.tracking_number;
    }

    if (!trackingNumber) {
      return new Response(
        JSON.stringify({ success: false, error: "MISSING_TRACKING", message: "Please provide order_id or tracking_reference as a query parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[get-waybill] Fetching waybill for:", trackingNumber);

    // BobGo waybill endpoint: GET /shipments/waybill?tracking_references=["ref1","ref2"]
    // The tracking_references parameter expects a JSON array
    const trackingRefsParam = JSON.stringify([trackingNumber]);
    const waybillUrl = `${config.baseUrl}/shipments/waybill?tracking_references=${encodeURIComponent(trackingRefsParam)}`;
    
    console.log("[get-waybill] Waybill URL:", waybillUrl);

    const waybillResp = await fetch(waybillUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        Accept: "application/pdf, application/json",
      },
    });

    console.log("[get-waybill] BobGo response status:", waybillResp.status);

    if (!waybillResp.ok) {
      const text = await waybillResp.text().catch(() => "");
      console.error("[get-waybill] BobGo API error:", text);
      return new Response(
        JSON.stringify({ success: false, error: "BOBGO_WAYBILL_FAILED", status: waybillResp.status, response: text }),
        { status: waybillResp.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const contentType = waybillResp.headers.get("content-type") || "";
    console.log("[get-waybill] Content-Type:", contentType);

    if (!contentType.includes("application/pdf")) {
      const json = await waybillResp.json().catch(() => null);
      console.log("[get-waybill] Non-PDF response:", json);
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
        "Content-Disposition": `inline; filename=waybill_${trackingNumber}.pdf`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const error = e as Error;
    console.error("[get-waybill] Unexpected error:", error?.message);
    return new Response(
      JSON.stringify({ success: false, error: "UNEXPECTED_ERROR", message: error?.message || String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
