import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface ChatHistoryRequest {
  user_id: string;
  limit?: number;
}

interface ChatHistoryMessage {
  id: string;
  user_message: string;
  bot_response: string;
  timestamp: string;
  page_url: string;
}

interface ChatHistoryResponse {
  messages: ChatHistoryMessage[];
  total: number;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json()) as ChatHistoryRequest;

    // Validate required fields
    if (!body.user_id) {
      return new Response(
        JSON.stringify({ error: "user_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get authorization header to verify session
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role (auto-provided by Supabase)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Initialize Supabase client with user token to verify ownership
    const token = authHeader.replace("Bearer ", "");
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey);
    const { data: userData } = await supabaseUser.auth.getUser(token);

    // Verify that the requested user_id matches the authenticated user
    if (!userData.user || userData.user.id !== body.user_id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch chat messages from activity_logs
    const limit = Math.min(body.limit || 50, 100); // Cap at 100

    const { data: logs, error, count } = await supabase
      .from("activity_logs")
      .select("id, metadata, created_at", { count: "exact" })
      .eq("user_id", body.user_id)
      .eq("action", "chatbot_message")
      .order("created_at", { ascending: false })
      .range(0, limit - 1);

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch history" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Transform logs to chat history format
    const messages: ChatHistoryMessage[] = (logs || [])
      .filter((log) => {
        return (
          log.metadata &&
          typeof log.metadata === "object" &&
          "user_message" in log.metadata &&
          "bot_response" in log.metadata
        );
      })
      .map((log) => {
        const metadata = log.metadata as Record<string, unknown>;
        return {
          id: log.id,
          user_message: (metadata.user_message as string) || "",
          bot_response: (metadata.bot_response as string) || "",
          timestamp: log.created_at,
          page_url: (metadata.page_url as string) || "",
        };
      });

    console.log(`Fetched ${messages.length} chat messages for user ${body.user_id}`);

    return new Response(
      JSON.stringify({ messages, total: count || 0 } as ChatHistoryResponse),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chat history error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
