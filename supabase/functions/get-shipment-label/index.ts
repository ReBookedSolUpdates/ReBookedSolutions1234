import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SHIPLOGIC_BASE_URL = "https://api.shiplogic.com";
const TCG_BASE_URL = "https://api.portal.thecourierguy.co.za";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { shipment_id, order_id, label_type } = await req.json();

    if (!shipment_id && !order_id) {
      return new Response(
        JSON.stringify({ success: false, error: "Either shipment_id or order_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let shipId = shipment_id;
    let courierSlug: string | null = null;

    // Look up shipment_id from order if needed
    if (order_id && !shipment_id) {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? '';
      const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? '';
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

      const { data: order, error } = await supabase
        .from("orders")
        .select("delivery_data, selected_courier_slug")
        .eq("id", order_id)
        .single();

      if (error || !order) {
        return new Response(
          JSON.stringify({ success: false, error: "Order not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      shipId = (order.delivery_data as any)?.shipment_id;
      courierSlug = order.selected_courier_slug;

      if (!shipId) {
        return new Response(
          JSON.stringify({ success: false, error: "No shipment ID found for this order" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Determine API
    const SHIPLOGIC_API_KEY = Deno.env.get("SHIPLOGIC_API_KEY");
    const TCG_API_KEY = Deno.env.get("TCG_API_KEY");

    let apiUrl: string;
    let apiKey: string;
    let providerName: string;

    const useProduction = !!(TCG_API_KEY && TCG_API_KEY.length > 5);

    if (useProduction && (courierSlug === "tcg" || !courierSlug)) {
      apiUrl = TCG_BASE_URL;
      apiKey = TCG_API_KEY!;
      providerName = "The Courier Guy";
    } else {
      if (!SHIPLOGIC_API_KEY) {
        return new Response(
          JSON.stringify({ success: false, error: "SHIPLOGIC_API_KEY is not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      apiUrl = SHIPLOGIC_BASE_URL;
      apiKey = SHIPLOGIC_API_KEY;
      providerName = "ShipLogic (Sandbox)";
    }

    const labelPath = label_type === "sticker" ? "/shipments/label/stickers" : "/shipments/label";

    console.log(`Fetching ${label_type || 'waybill'} label for shipment ${shipId} via ${providerName}`);

    const response = await fetch(`${apiUrl}${labelPath}?id=${shipId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Label fetch failed [${response.status}]:`, errorText);
      return new Response(
        JSON.stringify({ success: false, error: `Label fetch failed: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log(`Label URL received for shipment ${shipId}`);

    // Update waybill_url on order if order_id provided
    if (order_id && data.url) {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? '';
      const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? '';
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

      await supabase
        .from("orders")
        .update({ waybill_url: data.url, updated_at: new Date().toISOString() })
        .eq("id", order_id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        provider: providerName,
        label: data,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching label:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
