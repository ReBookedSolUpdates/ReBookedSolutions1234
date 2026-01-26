// Get Pickup Points Edge Function (Production Variant)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("PRODUCTION_BOBGO_API_KEY");
    if (!apiKey) {
      console.error("PRODUCTION_BOBGO_API_KEY not configured");
      return new Response(
        JSON.stringify({
          success: false,
          error: "API key not configured",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Parse query parameters
    const url = new URL(req.url);
    const params = new URLSearchParams();

    // Allowed query parameters
    const allowedParams = [
      "location_id",
      "provider_slug",
      "lat",
      "lng",
      "min_lat",
      "max_lat",
      "min_lng",
      "max_lng",
      "stacked_height",
      "stacked_width",
      "stacked_length",
      "total_weight",
    ];

    for (const param of allowedParams) {
      const value = url.searchParams.get(param);
      if (value) {
        params.set(param, value);
      }
    }

    // BobGo production API
    const baseUrl = "https://api.bobgo.co.za/v2";
    const queryString = params.toString();
    const apiUrl = `${baseUrl}/locations${queryString ? `?${queryString}` : ""}`;

    console.log("Fetching pickup points from:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    const responseText = await response.text();
    console.log("Response status:", response.status);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("Failed to parse response as JSON:", responseText.substring(0, 200));
      return new Response(
        JSON.stringify({
          success: false,
          error: `API returned non-JSON response (status ${response.status})`,
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!response.ok) {
      console.error("BobGo API error:", data);
      return new Response(
        JSON.stringify({
          success: false,
          error: data.message || data.error || `Request failed with status ${response.status}`,
        }),
        {
          status: response.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("Successfully fetched pickup points");
    return new Response(
      JSON.stringify({
        success: true,
        data,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching pickup points:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch pickup points";
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
