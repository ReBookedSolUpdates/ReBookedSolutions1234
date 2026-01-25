import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { getBobGoConfig } from "../_shared/bobgo-config.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    let body = null;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const {
      order_id,
      provider_slug,
      service_level_code,
      parcels,
      reference,
      pickup_address,
      pickup_contact_name,
      pickup_contact_phone,
      pickup_contact_email,
      pickup_locker_location_id,
      delivery_address,
      delivery_contact_name,
      delivery_contact_phone,
      delivery_contact_email,
      delivery_locker_location_id,
      declared_value,
      timeout,
    } = body || {};

    if (!order_id) throw new Error("Order ID is required");
    if (!provider_slug) throw new Error("Provider slug is required");
    if (!service_level_code) throw new Error("Service level code is required");
    if (!parcels || !Array.isArray(parcels) || parcels.length === 0) {
      throw new Error("Parcels array is required");
    }

    const config = getBobGoConfig(req);

    if (!config.hasApiKey) {
      throw new Error(`BobGo API key not configured (${config.apiKeyEnvName})`);
    }

    console.log("[create-shipment] Config:", { baseUrl: config.baseUrl, hasApiKey: config.hasApiKey });

    // Build BobGo API payload - shipments endpoint uses collection_contact_name (not full_name)
    const bobgoPayload: Record<string, unknown> = {
      parcels: parcels.map((p: Record<string, unknown>) => ({
        description: p.description || "Book",
        submitted_length_cm: p.length || 10,
        submitted_width_cm: p.width || 10,
        submitted_height_cm: p.height || 10,
        submitted_weight_kg: p.weight || 1,
        custom_parcel_reference: "",
      })),
      service_level_code,
      provider_slug,
      declared_value: declared_value || 0,
      timeout: timeout || 20000,
    };

    // Validate and format address for BobGo
    const formatAddressForBobGo = (addr: Record<string, unknown>) => {
      if (!addr) return null;

      const streetAddress = (addr.street_address || addr.streetAddress || addr.street || "").toString().trim();
      const localArea = (addr.local_area || addr.suburb || "").toString().trim();
      const city = (addr.city || "").toString().trim();
      const province = (addr.province || addr.zone || "").toString().trim();
      const postalCode = (addr.code || addr.postalCode || addr.postal_code || "").toString().trim();
      const country = (addr.country || "").toString().trim();

      const formattedCountry = country && country.length > 0 && country.toUpperCase() !== "SOUTH AFRICA" ? country : "ZA";
      const formattedZone = province && province.length > 0 ? province.toUpperCase().substring(0, 3) : "GP";
      const formattedCity = city || localArea || "";

      const result: Record<string, string> = {
        street_address: streetAddress,
        local_area: localArea || city,
        city: formattedCity,
        zone: formattedZone,
        code: postalCode,
        country: formattedCountry,
      };
      
      if (addr.company) {
        result.company = addr.company.toString().trim();
      }
      
      return result;
    };

    // Add collection (pickup) information
    if (pickup_locker_location_id) {
      bobgoPayload.collection_pickup_point_location_id = pickup_locker_location_id;
    } else if (pickup_address) {
      const formattedPickupAddress = formatAddressForBobGo(pickup_address);
      if (!formattedPickupAddress?.street_address && !formattedPickupAddress?.local_area) {
        throw new Error("Pickup address must have at least street_address or local_area");
      }
      bobgoPayload.collection_address = formattedPickupAddress;
    } else {
      throw new Error("Either pickup address or locker location required");
    }

    // Pickup contact - shipments endpoint uses collection_contact_name
    if (!pickup_contact_name) throw new Error("Pickup contact name is required");
    if (!pickup_contact_phone) throw new Error("Pickup contact phone is required");
    if (!pickup_contact_email) throw new Error("Pickup contact email is required");

    bobgoPayload.collection_contact_name = pickup_contact_name.toString().trim();
    bobgoPayload.collection_contact_mobile_number = pickup_contact_phone.toString().trim();
    bobgoPayload.collection_contact_email = pickup_contact_email.toString().trim();

    // Add delivery information
    if (delivery_locker_location_id) {
      bobgoPayload.delivery_pickup_point_location_id = delivery_locker_location_id;
    } else if (delivery_address) {
      const formattedDeliveryAddress = formatAddressForBobGo(delivery_address);
      if (!formattedDeliveryAddress?.street_address && !formattedDeliveryAddress?.local_area) {
        throw new Error("Delivery address must have at least street_address or local_area");
      }
      bobgoPayload.delivery_address = formattedDeliveryAddress;
    } else {
      throw new Error("Either delivery address or locker location required");
    }

    // Delivery contact - shipments endpoint uses delivery_contact_name
    if (!delivery_contact_name) throw new Error("Delivery contact name is required");
    if (!delivery_contact_phone) throw new Error("Delivery contact phone is required");
    if (!delivery_contact_email) throw new Error("Delivery contact email is required");

    bobgoPayload.delivery_contact_name = delivery_contact_name.toString().trim();
    bobgoPayload.delivery_contact_mobile_number = delivery_contact_phone.toString().trim();
    bobgoPayload.delivery_contact_email = delivery_contact_email.toString().trim();

    // Add tracking reference if provided
    if (reference) {
      bobgoPayload.custom_tracking_reference = reference;
    }

    console.log("[create-shipment] Payload:", JSON.stringify(bobgoPayload).substring(0, 500));

    // Make request to BobGo API
    const bobgoResponse = await fetch(`${config.baseUrl}/shipments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bobgoPayload),
    });

    const bobgoData = await bobgoResponse.json();
    console.log("[create-shipment] BobGo response status:", bobgoResponse.status);
    console.log("[create-shipment] BobGo response:", JSON.stringify(bobgoData).substring(0, 500));

    if (!bobgoResponse.ok) {
      throw new Error(`BobGo shipment HTTP ${bobgoResponse.status}: ${JSON.stringify(bobgoData)}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        shipment_id: bobgoData.id,
        tracking_number: bobgoData.tracking_reference,
        waybill_url: bobgoData.waybill_url || null,
        submission_status: bobgoData.submission_status,
        bobgo_response: bobgoData,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[create-shipment] Error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
