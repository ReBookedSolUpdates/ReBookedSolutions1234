import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { parseRequestBody } from "../_shared/safe-body-parser.ts";
import { getBobGoConfig } from "../_shared/bobgo-config.ts";

serve(async (req) => {
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

    console.log("[track-shipment] Tracking number:", tracking_number);

    const config = getBobGoConfig(req);
    console.log("[track-shipment] Config:", { baseUrl: config.baseUrl, hasApiKey: config.hasApiKey });

    let trackingInfo: Record<string, unknown>;
    let simulated = false;

    if (!config.hasApiKey) {
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
        // BobGo tracking endpoint: GET /tracking?tracking_reference={tracking_number}
        const trackingUrl = `${config.baseUrl}/tracking?tracking_reference=${encodeURIComponent(tracking_number)}`;
        console.log("[track-shipment] Fetching from:", trackingUrl);

        const resp = await fetch(trackingUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        console.log("[track-shipment] BobGo response status:", resp.status);

        if (!resp.ok) {
          const text = await resp.text().catch(() => "");
          console.error("[track-shipment] BobGo API error:", resp.status, text);
          throw new Error(`BobGo API returned ${resp.status}: ${text || resp.statusText}`);
        }

        const data = await resp.json();
        console.log("[track-shipment] BobGo response:", JSON.stringify(data).substring(0, 500));

        const shipmentData = Array.isArray(data) ? data[0] : data;

        if (!shipmentData) {
          throw new Error("No tracking data returned from BobGo API");
        }

        const checkpoints = shipmentData.checkpoints || shipmentData.tracking_events || [];
        const latestCheckpoint = checkpoints.length > 0 ? checkpoints[0] : null;

        trackingInfo = {
          tracking_number: shipmentData.tracking_reference || shipmentData.shipment_tracking_reference || shipmentData.id || tracking_number,
          custom_tracking_reference: shipmentData.custom_tracking_reference,
          shipment_id: shipmentData.id || shipmentData.shipment_id,
          status: shipmentData.status,
          status_friendly: shipmentData.status_friendly || shipmentData.status,
          provider: "bobgo",
          courier_slug: shipmentData.courier_slug || shipmentData.provider_slug,
          courier_name: shipmentData.courier_name || shipmentData.provider_name,
          courier_phone: shipmentData.courier_phone,
          courier_logo: shipmentData.courier_logo,
          service_level: shipmentData.service_level || shipmentData.service_level_code,
          current_location: latestCheckpoint?.location || latestCheckpoint?.city || "Unknown",
          created_at: shipmentData.shipment_time_created || shipmentData.time_created,
          updated_at: shipmentData.last_checkpoint_time || shipmentData.time_modified,
          checkpoints: checkpoints.map((checkpoint: Record<string, unknown>) => ({
            time: checkpoint.time || checkpoint.date,
            status: checkpoint.status,
            status_friendly: checkpoint.status_friendly || checkpoint.status,
            location: checkpoint.location || "",
            city: checkpoint.city || "",
            zone: checkpoint.zone || "",
            country: checkpoint.country || "",
            message: checkpoint.message || "",
          })),
          raw: data,
        };
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        console.error("[track-shipment] Error:", errorMessage);

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
    console.error("[track-shipment] Unexpected error:", errorMessage);

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
