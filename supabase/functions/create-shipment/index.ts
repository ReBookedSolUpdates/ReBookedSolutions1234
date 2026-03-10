import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SHIPLOGIC_BASE_URL = "https://api.shiplogic.com";
const TCG_BASE_URL = "https://api.portal.thecourierguy.co.za";

interface CreateShipmentRequest {
  order_id: string;
  collection_address: {
    type?: string;
    company?: string;
    street_address: string;
    local_area?: string;
    city: string;
    zone?: string;
    country?: string;
    code: string;
    lat?: number;
    lng?: number;
  };
  collection_pickup_point_id?: string;
  collection_contact: {
    name: string;
    mobile_number?: string;
    email?: string;
  };
  delivery_address: {
    type?: string;
    company?: string;
    street_address: string;
    local_area?: string;
    city: string;
    zone?: string;
    country?: string;
    code: string;
    lat?: number;
    lng?: number;
  };
  delivery_pickup_point_id?: string;
  delivery_contact: {
    name: string;
    mobile_number?: string;
    email?: string;
  };
  parcels: {
    parcel_description?: string;
    submitted_length_cm: number;
    submitted_width_cm: number;
    submitted_height_cm: number;
    submitted_weight_kg: number;
  }[];
  service_level_code: string;
  declared_value?: number;
  special_instructions_collection?: string;
  special_instructions_delivery?: string;
  collection_min_date?: string;
  delivery_min_date?: string;
  mute_notifications?: boolean;
  provider?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: CreateShipmentRequest = await req.json();
    console.log("Creating shipment for order:", body.order_id);

    // Validate required fields
    if (!body.order_id || !body.collection_address || !body.delivery_address || 
        !body.collection_contact || !body.delivery_contact || !body.parcels || 
        !body.service_level_code) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Set defaults
    if (!body.collection_address.country) body.collection_address.country = "ZA";
    if (!body.delivery_address.country) body.delivery_address.country = "ZA";

    const today = new Date().toISOString();
    if (!body.collection_min_date) body.collection_min_date = today;
    if (!body.delivery_min_date) body.delivery_min_date = today;

    // Determine API to use
    const SHIPLOGIC_API_KEY = Deno.env.get("SHIPLOGIC_API_KEY");
    const TCG_API_KEY = Deno.env.get("TCG_API_KEY");
    const IE_API_KEY = Deno.env.get("IE_API_KEY");

    let apiUrl: string;
    let apiKey: string;
    let providerName: string;

    const useProduction = !!(TCG_API_KEY && TCG_API_KEY.length > 5);

    if (useProduction && body.provider === "tcg" && TCG_API_KEY) {
      apiUrl = TCG_BASE_URL;
      apiKey = TCG_API_KEY;
      providerName = "The Courier Guy";
    } else if (useProduction && body.provider === "ie" && IE_API_KEY) {
      apiUrl = TCG_BASE_URL;
      apiKey = IE_API_KEY;
      providerName = "Internet Express";
    } else if (useProduction && TCG_API_KEY) {
      apiUrl = TCG_BASE_URL;
      apiKey = TCG_API_KEY;
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

    // Build shipment payload
    const shipmentPayload: any = {
      parcels: body.parcels,
      service_level_code: body.service_level_code,
      declared_value: body.declared_value,
      special_instructions_collection: body.special_instructions_collection || "",
      special_instructions_delivery: body.special_instructions_delivery || "",
      collection_min_date: body.collection_min_date,
      delivery_min_date: body.delivery_min_date,
      mute_notifications: body.mute_notifications ?? false,
      customer_reference_name: "Order no.",
      customer_reference: body.order_id,
    };

    // Collection side
    if (body.collection_pickup_point_id) {
      shipmentPayload.collection_pickup_point_id = String(body.collection_pickup_point_id);
      shipmentPayload.collection_pickup_point_provider = "tcg-locker";
      // No collection_address
    } else {
      shipmentPayload.collection_address = body.collection_address;
    }
    shipmentPayload.collection_contact = body.collection_contact;

    // Delivery side
    if (body.delivery_pickup_point_id) {
      shipmentPayload.delivery_pickup_point_id = String(body.delivery_pickup_point_id);
      shipmentPayload.delivery_pickup_point_provider = "tcg-locker";
      // No delivery_address
    } else {
      shipmentPayload.delivery_address = body.delivery_address;
    }
    shipmentPayload.delivery_contact = body.delivery_contact;

    console.log(`Sending shipment to ${providerName}:`, JSON.stringify(shipmentPayload).substring(0, 300));

    const response = await fetch(`${apiUrl}/shipments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(shipmentPayload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error(`${providerName} shipment creation failed [${response.status}]:`, JSON.stringify(responseData));
      return new Response(
        JSON.stringify({ success: false, error: `Shipment creation failed: ${JSON.stringify(responseData)}`, provider: providerName }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Shipment created with ${providerName}:`, JSON.stringify(responseData).substring(0, 300));

    // Update order in database with shipment data
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? '';
    const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? '';
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const trackingRef = responseData.custom_tracking_reference || responseData.short_tracking_reference || '';
    
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        tracking_number: trackingRef,
        delivery_status: "collection-assigned",
        tracking_data: responseData,
        selected_courier_name: providerName,
        selected_courier_slug: body.provider || (useProduction ? "tcg" : "shiplogic"),
        selected_service_code: body.service_level_code,
        selected_service_name: responseData.service_level_name || body.service_level_code,
        waybill_url: null,
        delivery_data: {
          shipment_id: responseData.id,
          provider: providerName,
          tracking_reference: trackingRef,
          status: responseData.status,
          estimated_collection: responseData.estimated_collection,
          estimated_delivery_from: responseData.estimated_delivery_from,
          estimated_delivery_to: responseData.estimated_delivery_to,
          created_at: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.order_id);

    if (updateError) {
      console.error("Order update failed (shipment was still created):", updateError);
    } else {
      console.log("Order updated with tracking data");
    }

    return new Response(
      JSON.stringify({
        success: true,
        provider: providerName,
        shipment: responseData,
        tracking_reference: trackingRef,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating shipment:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
