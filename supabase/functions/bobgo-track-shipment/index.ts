import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { parseRequestBody } from "../_shared/safe-body-parser.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let tracking_number: string | null = null;

    // Handle GET requests with tracking number in query params
    if (req.method === "GET") {
      const url = new URL(req.url);
      tracking_number = url.searchParams.get("tracking_number") || url.searchParams.get("tracking_reference");
    }

    // Handle POST requests with tracking number in body
    if (!tracking_number && req.method === "POST") {
      const bodyResult = await parseRequestBody<{ tracking_number?: string; tracking_reference?: string }>(req, corsHeaders);
      if (!bodyResult.success) return bodyResult.errorResponse!;
      tracking_number = bodyResult.data!.tracking_number || bodyResult.data!.tracking_reference || null;
    }

    if (!tracking_number) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing tracking_number parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[track-shipment] Tracking number: ${tracking_number}`);

    const isProduction = Deno.env.get("VITE_PRODUCTION") === "true";
    const BOBGO_API_KEY = Deno.env.get(isProduction ? "BOBGO_API_KEY" : "PRODUCTION_BOBGO_API_KEY");

    // Resolve base URL - BobGo API v2
    function resolveBaseUrl(): string {
      const env = (Deno.env.get(isProduction ? "BOBGO_BASE_URL" : "PRODUCTION_BOBGO_BASE_URL") || "").trim().replace(/\/+$/, "");
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
    console.log(`[track-shipment] Using base URL: ${BOBGO_BASE_URL}`);

    let trackingInfo: Record<string, unknown>;
    let simulated = false;

    if (!BOBGO_API_KEY) {
      console.log("[track-shipment] No API key found, returning simulated data");
      simulated = true;
      trackingInfo = {
        tracking_number,
        status: "in_transit",
        status_friendly: "In Transit",
        current_location: "Cape Town Hub",
        estimated_delivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        checkpoints: [
          {
            time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: "collected",
            status_friendly: "Collected",
            message: "Package collected from sender",
            location: "Seller Hub",
          },
          {
            time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            status: "in-transit",
            status_friendly: "In Transit",
            message: "Package in transit to destination",
            location: "Regional Hub",
          },
        ],
        provider: "bobgo",
        simulated: true,
      };
    } else {
      try {
        // BobGo API tracking endpoint: GET /tracking?tracking_reference={tracking_number}
        const trackingUrl = `${BOBGO_BASE_URL}/tracking?tracking_reference=${encodeURIComponent(tracking_number)}`;
        console.log(`[track-shipment] Fetching from: ${trackingUrl}`);

        const resp = await fetch(trackingUrl, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${BOBGO_API_KEY}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        });

        console.log(`[track-shipment] BobGo API response status: ${resp.status}`);

        if (!resp.ok) {
          const text = await resp.text().catch(() => "");
          console.error(`[track-shipment] BobGo API error: ${resp.status} - ${text}`);
          throw new Error(`BobGo API returned ${resp.status}: ${text || resp.statusText}`);
        }

        const data = await resp.json();
        console.log(`[track-shipment] BobGo API response:`, JSON.stringify(data).substring(0, 500));

        // BobGo returns array or single object
        const shipmentData = Array.isArray(data) ? data[0] : data;

        if (!shipmentData) {
          throw new Error("No tracking data returned from BobGo API");
        }

        // Get the latest checkpoint for current location
        const checkpoints = shipmentData.checkpoints || [];
        const latestCheckpoint = checkpoints.length > 0 ? checkpoints[0] : null;

        trackingInfo = {
          // Standard tracking fields
          tracking_number: shipmentData.shipment_tracking_reference || shipmentData.id || tracking_number,
          custom_tracking_reference: shipmentData.custom_tracking_reference,
          shipment_id: shipmentData.id,

          // Status
          status: shipmentData.status,
          status_friendly: shipmentData.status_friendly || shipmentData.status,

          // Courier info
          provider: "bobgo",
          courier_slug: shipmentData.courier_slug,
          courier_name: shipmentData.courier_name,
          courier_phone: shipmentData.courier_phone,
          courier_logo: shipmentData.courier_logo,
          service_level: shipmentData.service_level,

          // BobGo branding logos
          bobgo_logo: shipmentData.bob_go_logo,
          bobgo_logo_white: shipmentData.bob_go_logo_white,
          bobgo_logo_black: shipmentData.bob_go_logo_black,

          // Location
          current_location: latestCheckpoint?.location || latestCheckpoint?.city || "Unknown",

          // Timestamps
          created_at: shipmentData.shipment_time_created,
          updated_at: shipmentData.last_checkpoint_time,

          // Checkpoints (tracking events)
          checkpoints: checkpoints.map((checkpoint: Record<string, unknown>) => ({
            time: checkpoint.time,
            status: checkpoint.status,
            status_friendly: checkpoint.status_friendly || checkpoint.status,
            location: checkpoint.location || "",
            city: checkpoint.city || "",
            zone: checkpoint.zone || "",
            country: checkpoint.country || "",
            message: checkpoint.message || "",
          })),

          // Movement events
          shipment_movement_events: shipmentData.shipment_movement_events,

          // Merchant info
          merchant_name: shipmentData.merchant_name,
          merchant_logo: shipmentData.merchant_logo,

          // Order info
          order_number: shipmentData.order_number,
          channel_order_number: shipmentData.channel_order_number,

          // Raw response for debugging
          raw: data,
        };
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        console.error(`[track-shipment] Error fetching from BobGo:`, errorMessage);

        // Return error with simulated fallback
        simulated = true;
        trackingInfo = {
          tracking_number,
          status: "unknown",
          status_friendly: "Status Unknown",
          current_location: "Unknown",
          checkpoints: [],
          provider: "bobgo",
          simulated: true,
          api_error: errorMessage,
        };
      }
    }

    return new Response(
      JSON.stringify({ success: true, tracking: trackingInfo, simulated }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to track shipment";
    console.error(`[track-shipment] Unexpected error:`, errorMessage);

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
