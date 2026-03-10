import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    const { lat, lng, type, order_closest, radius } = await req.json();

    if (!lat || !lng) {
      return new Response(
        JSON.stringify({ success: false, error: "lat and lng are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Pickup points always use TCG API (works in both sandbox and production)
    // ShipLogic sandbox does NOT support pickup points, so we always use TCG
    const TCG_API_KEY = Deno.env.get("TCG_API_KEY");
    const SHIPLOGIC_API_KEY = Deno.env.get("SHIPLOGIC_API_KEY");

    let apiUrl: string;
    let apiKey: string;
    let providerName: string;

    if (TCG_API_KEY && TCG_API_KEY.length > 5) {
      apiUrl = TCG_BASE_URL;
      apiKey = TCG_API_KEY;
      providerName = "The Courier Guy";
    } else if (SHIPLOGIC_API_KEY) {
      apiUrl = SHIPLOGIC_BASE_URL;
      apiKey = SHIPLOGIC_API_KEY;
      providerName = "ShipLogic (Sandbox)";
    } else {
      return new Response(
        JSON.stringify({ success: false, error: "No API key configured for pickup points" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build query params
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
    });
    if (type) params.set("type", type);
    if (order_closest !== undefined) params.set("order_closest", order_closest.toString());
    if (radius) params.set("radius", radius.toString());
    // Also support 'distance' as some APIs use that
    if (radius) params.set("distance", radius.toString());

    console.log(`Fetching pickup points near ${lat},${lng} (radius: ${radius || 'default'}) via ${providerName}`);

    const response = await fetch(`${apiUrl}/pickup-points?${params.toString()}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Pickup points fetch failed [${response.status}]:`, errorText);
      return new Response(
        JSON.stringify({ success: false, error: `Failed to fetch pickup points: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    
    // The API may return { count, pickup_points: [...] } or just an array
    const pickupPoints = data?.pickup_points || (Array.isArray(data) ? data : []);
    console.log(`Found ${Array.isArray(pickupPoints) ? pickupPoints.length : data?.count || 'unknown'} pickup points`);

    return new Response(
      JSON.stringify({
        success: true,
        provider: providerName,
        pickup_points: pickupPoints,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching pickup points:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
