// Centralized BobGo API configuration
// Environment variable naming:
// - Production: BOBGO_API_KEY, BOBGO_BASE_URL
// - Sandbox/Dev: BOBGO_SANDBOX_API_KEY, BOBGO_SANDBOX_BASE_URL

export function getBobGoConfig() {
  // Environment variable naming:
  // - Production (BOBGO_PRODUCTION=true): PRODUCTION_BOBGO_API_KEY, PRODUCTION_BOBGO_BASE_URL
  // - Non-production (BOBGO_PRODUCTION=false): BOBGO_API_KEY, BOBGO_BASE_URL
  const isProduction = Deno.env.get("BOBGO_PRODUCTION") === "true";

  const apiKey = isProduction
    ? Deno.env.get("PRODUCTION_BOBGO_API_KEY")
    : Deno.env.get("BOBGO_API_KEY");

  const baseUrlEnv = isProduction
    ? Deno.env.get("PRODUCTION_BOBGO_BASE_URL")
    : Deno.env.get("BOBGO_BASE_URL");

  const baseUrl = resolveBaseUrl(baseUrlEnv || "");

  return {
    apiKey: apiKey?.trim() || "",
    baseUrl,
    isProduction,
    hasApiKey: !!(apiKey && apiKey.trim()),
    apiKeyEnvName: isProduction ? "PRODUCTION_BOBGO_API_KEY" : "BOBGO_API_KEY",
    baseUrlEnvName: isProduction ? "PRODUCTION_BOBGO_BASE_URL" : "BOBGO_BASE_URL",
  };
}

function resolveBaseUrl(env: string): string {
  const cleaned = env.trim().replace(/\/+$/, "");
  
  if (!cleaned) {
    return "https://api.bobgo.co.za/v2";
  }
  
  // Handle sandbox URL correction
  if (cleaned.includes("sandbox.bobgo.co.za") && !cleaned.includes("api.sandbox.bobgo.co.za")) {
    return "https://api.sandbox.bobgo.co.za/v2";
  }
  
  // Ensure /v2 suffix
  if (cleaned.includes("bobgo.co.za") && !/\/v2$/.test(cleaned)) {
    return cleaned + "/v2";
  }
  
  return cleaned;
}
