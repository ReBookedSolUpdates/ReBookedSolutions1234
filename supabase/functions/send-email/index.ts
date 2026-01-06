import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  test?: boolean;
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 60 * 1000,
};

function checkRateLimit(clientIP: string, to: string) {
  const key = `${clientIP}-${to}`;
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
    return { allowed: true };
  }

  if (record.count >= RATE_LIMIT.maxRequests) {
    return { allowed: false, resetTime: record.resetTime };
  }

  record.count++;
  return { allowed: true };
}

serve(async (req) => {
  console.log("📧 send-email called:", req.method);

  /* -------------------- CORS -------------------- */
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        error: "METHOD_NOT_ALLOWED",
        message: "Only POST requests are allowed",
      }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  /* -------------------- CONTENT-TYPE GUARD -------------------- */
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    console.error("❌ Invalid Content-Type:", contentType);
    return new Response(
      JSON.stringify({
        success: false,
        error: "INVALID_CONTENT_TYPE",
        message: "Content-Type must be application/json",
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  /* -------------------- SAFE JSON PARSE -------------------- */
  let emailRequest: EmailRequest;

  try {
    const rawBody = await req.text();

    if (!rawBody || rawBody.trim() === "") {
      throw new Error("Empty request body");
    }

    emailRequest = JSON.parse(rawBody);
  } catch (err) {
    console.error("❌ JSON parse failed:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: "INVALID_JSON",
        message: "Request body must be valid JSON",
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  /* -------------------- BASIC VALIDATION -------------------- */
  if (!emailRequest.to || !emailRequest.subject) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "INVALID_PAYLOAD",
        message: "Missing required email data",
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  console.log("📧 Email payload received:", {
    to: emailRequest.to,
    subject: emailRequest.subject,
    test: emailRequest.test,
  });

  /* -------------------- TEST MODE -------------------- */
  if (emailRequest.test === true) {
    return new Response(
      JSON.stringify({
        success: true,
        message: "Email service reachable and JSON parsing works",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  /* -------------------- RATE LIMIT -------------------- */
  const clientIP = req.headers.get("x-forwarded-for") || "unknown";
  const toEmail = Array.isArray(emailRequest.to)
    ? emailRequest.to[0]
    : emailRequest.to;

  const rateCheck = checkRateLimit(clientIP, toEmail);
  if (!rateCheck.allowed) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests",
      }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Retry-After": String(
            Math.ceil((rateCheck.resetTime! - Date.now()) / 1000),
          ),
        },
      },
    );
  }

  /* -------------------- SMTP -------------------- */
  const smtpKey = Deno.env.get("BREVO_SMTP_KEY");
  const smtpUser =
    Deno.env.get("BREVO_SMTP_USER") || "8e237b002@smtp-brevo.com";
  const defaultFrom =
    Deno.env.get("DEFAULT_FROM_EMAIL") ||
    "info@rebookedsolutions.co.za";

  if (!smtpKey) {
    console.error("❌ SMTP key missing");
    return new Response(
      JSON.stringify({
        success: false,
        error: "SMTP_NOT_CONFIGURED",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const client = new SMTPClient({
    connection: {
      hostname: "smtp-relay.brevo.com",
      port: 587,
      tls: true,
      auth: {
        username: smtpUser,
        password: smtpKey,
      },
    },
  });

  try {
    await client.send({
      from: emailRequest.from || defaultFrom,
      to: Array.isArray(emailRequest.to)
        ? emailRequest.to
        : [emailRequest.to],
      subject: emailRequest.subject,
      content: emailRequest.text || "",
      html: emailRequest.html,
      replyTo: emailRequest.replyTo,
    });

    await client.close();

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("❌ SMTP send failed:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: "EMAIL_SEND_FAILED",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
