import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { callOpenAI, OpenAIMessage } from "../_shared/openai.ts";
import { moderateContent, shouldFlagResponse } from "../_shared/moderation.ts";

interface ChatSubmitRequest {
  message: string;
  conversation_history: Array<{ role: "user" | "assistant"; content: string }>;
  session_id: string | null;
  page_url: string;
  is_logged_in: boolean;
  user_id: string | null;
}

interface ChatSubmitResponse {
  success: boolean;
  response: string;
  is_flagged: boolean;
  flag_reason: string | null;
  message_id: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const body = (await req.json()) as ChatSubmitRequest;

    // Validate required fields
    if (!body.message || !body.message.trim()) {
      return new Response(
        JSON.stringify({
          success: false,
          response: "Message cannot be empty",
          is_flagged: false,
          flag_reason: null,
          message_id: "",
        }),
        { status: 400, headers: corsHeaders },
      );
    }

    // 1. Moderate user input
    const inputModerationResult = moderateContent(body.message);
    if (inputModerationResult.is_flagged) {
      return new Response(
        JSON.stringify({
          success: false,
          response: "",
          is_flagged: true,
          flag_reason: inputModerationResult.reason,
          message_id: "",
        }),
        { status: 200, headers: corsHeaders },
      );
    }

    // 2. Prepare messages for OpenAI (include conversation history for context)
    const messagesForOpenAI: OpenAIMessage[] = [
      ...body.conversation_history,
      { role: "user", content: body.message },
    ];

    // 3. Call OpenAI API
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    const model = Deno.env.get("OPENAI_MODEL") || "gpt-3.5-turbo";

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          response: "Chatbot service is temporarily unavailable. Please try again later.",
          is_flagged: false,
          flag_reason: null,
          message_id: "",
        }),
        { status: 503, headers: corsHeaders },
      );
    }

    const openAIResult = await callOpenAI(messagesForOpenAI, apiKey, model);

    if (!openAIResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          response: "Failed to generate response. Please try again.",
          is_flagged: false,
          flag_reason: null,
          message_id: "",
        }),
        { status: 500, headers: corsHeaders },
      );
    }

    // 4. Moderate bot response
    const responseModerationResult = shouldFlagResponse(openAIResult.response);
    if (responseModerationResult.is_flagged) {
      return new Response(
        JSON.stringify({
          success: false,
          response: "",
          is_flagged: true,
          flag_reason: responseModerationResult.reason,
          message_id: "",
        }),
        { status: 200, headers: corsHeaders },
      );
    }

    // 5. Generate message ID
    const messageId = crypto.randomUUID();

    // 6. Log to activity_logs (background task - don't block response)
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const metadata = {
          type: "chatbot_interaction",
          user_message: body.message,
          bot_response: openAIResult.response,
          session_id: body.session_id,
          is_logged_in: body.is_logged_in,
          page_url: body.page_url,
          model,
          tokens_used: openAIResult.tokens_used,
          is_flagged: false,
          flag_reason: null,
          flag_type: null,
        };

        // Get client IP and User-Agent from request
        const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";
        const userAgent = req.headers.get("user-agent") || "unknown";

        await supabase.from("activity_logs").insert({
          user_id: body.user_id,
          action: "chatbot_message",
          entity_type: "chatbot",
          metadata,
          ip_address: clientIp,
          user_agent: userAgent,
        });
      }
    } catch (logError) {
      console.error("Failed to log chatbot interaction:", logError);
      // Don't fail the response if logging fails
    }

    // 7. Return successful response
    return new Response(
      JSON.stringify({
        success: true,
        response: openAIResult.response,
        is_flagged: false,
        flag_reason: null,
        message_id: messageId,
      }),
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    console.error("Chat submit error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        response: "An error occurred. Please try again.",
        is_flagged: false,
        flag_reason: null,
        message_id: "",
      }),
      { status: 500, headers: corsHeaders },
    );
  }
});
