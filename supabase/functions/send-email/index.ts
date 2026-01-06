import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

function checkRateLimit(clientIP: string, to: string): { allowed: boolean; resetTime?: number } {
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
  console.log("📧 send-email function called, method:", req.method);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    console.log("❌ Method not allowed:", req.method);
    return new Response(
      JSON.stringify({
        success: false,
        error: "METHOD_NOT_ALLOWED",
        message: "Email endpoint only accepts POST requests",
      }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const emailRequest: EmailRequest = await req.json();
    console.log("📧 Email request received:", {
      to: emailRequest.to,
      subject: emailRequest.subject,
      test: emailRequest.test
    });

    const smtpKey = Deno.env.get("BREVO_SMTP_KEY");
    const smtpUser = Deno.env.get("BREVO_SMTP_USER") || "8e237b002@smtp-brevo.com";
    const defaultFrom = Deno.env.get("DEFAULT_FROM_EMAIL") || "noreply@rebookedsolutions.co.za";

    if (emailRequest.test === true) {
      console.log("🧪 Test mode - checking config:", {
        hasSmtpKey: !!smtpKey,
        smtpUser
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "Connection test successful",
          config: {
            host: "smtp-relay.brevo.com",
            port: 587,
            hasAuth: !!smtpKey && !!smtpUser,
          },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const clientIP = req.headers.get("x-forwarded-for") || "unknown";
    const toEmail = Array.isArray(emailRequest.to) ? emailRequest.to[0] : emailRequest.to;
    const rateCheck = checkRateLimit(clientIP, toEmail);

    if (!rateCheck.allowed) {
      console.log("⚠️ Rate limit exceeded for:", clientIP, toEmail);
      return new Response(
        JSON.stringify({
          success: false,
          error: "RATE_LIMIT_EXCEEDED",
          message: "Too many email requests from this client",
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil((rateCheck.resetTime! - Date.now()) / 1000)),
          },
        }
      );
    }

    console.log("🔧 SMTP config:", {
      hasSmtpKey: !!smtpKey,
      smtpUser,
      defaultFrom
    });

    if (!smtpKey) {
      console.error("❌ BREVO_SMTP_KEY not configured");
      throw new Error("BREVO_SMTP_KEY environment variable is required");
    }

    console.log("📤 Creating SMTP client...");
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

    const toAddresses = Array.isArray(emailRequest.to) ? emailRequest.to : [emailRequest.to];
    const fromAddress = emailRequest.from || defaultFrom;

    console.log("📨 Sending email to:", toAddresses);

    await client.send({
      from: fromAddress,
      to: toAddresses,
      subject: emailRequest.subject,
      content: emailRequest.text || "",
      html: emailRequest.html,
      replyTo: emailRequest.replyTo,
    });

    await client.close();

    console.log("✅ Email sent successfully:", {
      to: emailRequest.to,
      subject: emailRequest.subject,
    });

    return new Response(
      JSON.stringify({
        success: true,
        messageId: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        details: {
          accepted: toAddresses,
          rejected: [],
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Email sending error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack");

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return new Response(
      JSON.stringify({
        success: false,
        error: "EMAIL_SEND_FAILED",
        message: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
