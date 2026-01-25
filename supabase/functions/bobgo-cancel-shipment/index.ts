import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { parseRequestBody } from "../_shared/safe-body-parser.ts";
import { getBobGoConfig } from "../_shared/bobgo-config.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const bodyResult = await parseRequestBody<{
      order_id?: string;
      shipment_id?: string;
      tracking_number?: string;
      reason?: string;
    }>(req, corsHeaders);
    if (!bodyResult.success) return bodyResult.errorResponse!;

    const { order_id, shipment_id, tracking_number, reason } = bodyResult.data!;

    if (!order_id && !shipment_id && !tracking_number) {
      return new Response(
        JSON.stringify({ success: false, error: "order_id, shipment_id, or tracking_number required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get order from database
    let orderQuery = supabase
      .from("orders")
      .select("id, tracking_number, delivery_data, status, pickup_type, delivery_type");

    if (order_id) {
      orderQuery = orderQuery.eq("id", order_id);
    } else if (tracking_number) {
      orderQuery = orderQuery.eq("tracking_number", tracking_number);
    } else if (shipment_id) {
      orderQuery = orderQuery.eq("delivery_data->>shipment_id", shipment_id.toString());
    }

    const { data: order, error: orderError } = await orderQuery.maybeSingle();

    if (orderError) {
      return new Response(
        JSON.stringify({ success: false, error: `Database error: ${orderError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!order) {
      return new Response(
        JSON.stringify({ success: false, error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate cancellation is possible
    const cancellableStatuses = [
      'paid', 'pending_commit', 'committed', 'pickup_scheduled',
      'in_transit', 'out_for_delivery', 'pickup_attempted'
    ];

    if (!cancellableStatuses.includes(order.status)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Cannot cancel order with status: ${order.status}`,
          message: "Order can only be cancelled if not yet delivered or already cancelled"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const identifier = order.tracking_number;

    if (!identifier) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Order has no tracking number - cannot cancel shipment",
          message: "This order may not have been shipped yet"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const config = getBobGoConfig(req);
    console.log("[cancel-shipment] Config:", { baseUrl: config.baseUrl, hasApiKey: config.hasApiKey });

    if (!config.hasApiKey) {
      // Simulate cancellation
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "cancelled",
          cancellation_reason: reason || "Cancelled (simulated - no API key)",
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (updateError) {
        return new Response(
          JSON.stringify({ success: false, error: `Failed to update order: ${updateError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          simulated: true,
          message: "Order cancelled in database (API key not configured)",
          order_id: order.id,
          tracking_number: identifier,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    try {
      // BobGo cancel endpoint: POST /shipments/cancel with { tracking_reference: "..." }
      console.log("[cancel-shipment] Cancelling:", identifier);
      
      const resp = await fetch(`${config.baseUrl}/shipments/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          tracking_reference: identifier,
        }),
      });

      console.log("[cancel-shipment] BobGo response status:", resp.status);

      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        console.error("[cancel-shipment] BobGo API error:", text);

        // Still update the order in database
        await supabase
          .from("orders")
          .update({
            status: "cancelled",
            cancellation_reason: reason || `API error: ${text}`,
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);

        return new Response(
          JSON.stringify({
            success: false,
            error: `BobGo API error: ${text}`,
            message: "Order marked as cancelled in database, but BobGo API call failed",
            order_updated: true,
          }),
          { status: resp.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await resp.json();
      console.log("[cancel-shipment] BobGo response:", JSON.stringify(data).substring(0, 300));

      // Update order in database
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "cancelled",
          cancellation_reason: reason || "Cancelled via API",
          cancelled_at: new Date().toISOString(),
          delivery_data: {
            ...(order.delivery_data as Record<string, unknown> || {}),
            cancellation_response: data,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (updateError) {
        return new Response(
          JSON.stringify({
            success: true,
            warning: "Shipment cancelled with BobGo but database update failed",
            bobgo_response: data,
            db_error: updateError.message,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Shipment cancelled successfully",
          order_id: order.id,
          tracking_number: identifier,
          bobgo_response: data,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Cancel failed";
      console.error("[cancel-shipment] Error:", errorMessage);

      await supabase
        .from("orders")
        .update({
          status: "cancelled",
          cancellation_reason: reason || `Error: ${errorMessage}`,
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          message: "Order marked as cancelled in database, but API call failed",
          order_updated: true,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal error";
    console.error("[cancel-shipment] Unexpected error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
