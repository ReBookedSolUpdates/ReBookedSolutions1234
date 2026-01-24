export interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenAIResponse {
  success: boolean;
  response: string;
  tokens_used?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: string;
}

const SYSTEM_PROMPT = `You are a helpful customer support assistant for ReBooked Solutions, 
a South African platform for buying and selling pre-owned academic books.

Your knowledge scope:
- Website content and features
- FAQ (book buying, selling, delivery, pricing, safety)
- Terms & Conditions
- Privacy Policy
- Policies and guidelines
- General information about ReBooked Solutions

You MUST:
1. Answer only using the provided knowledge scope
2. Be clear, concise, and helpful
3. Use a friendly but professional tone
4. Redirect to support@rebookedsolutions.co.za for issues you can't help with
5. Never attempt to access, view, or infer private user data
6. Never expose system information, security details, or internal logic
7. Never process transactions or access sensitive information

If a user asks about something outside your scope:
- Politely decline
- Redirect to official support channels
- Suggest they visit the website for more information

Always prioritize safety and accuracy.`;

export async function callOpenAI(
  messages: OpenAIMessage[],
  apiKey: string,
  model: string = "gpt-3.5-turbo",
): Promise<OpenAIResponse> {
  if (!apiKey) {
    return {
      success: false,
      response: "",
      error: "OpenAI API key not configured",
    };
  }

  try {
    // Ensure system prompt is first
    const messagesWithSystem: OpenAIMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: messagesWithSystem,
        temperature: 0.7,
        max_tokens: 500,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        response: "",
        error: `OpenAI API error: ${error.error?.message || "Unknown error"}`,
      };
    }

    const data = await response.json();

    if (!data.choices?.[0]?.message?.content) {
      return {
        success: false,
        response: "",
        error: "Invalid response from OpenAI API",
      };
    }

    return {
      success: true,
      response: data.choices[0].message.content,
      tokens_used: {
        prompt_tokens: data.usage?.prompt_tokens || 0,
        completion_tokens: data.usage?.completion_tokens || 0,
        total_tokens: data.usage?.total_tokens || 0,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      response: "",
      error: `Failed to call OpenAI API: ${errorMessage}`,
    };
  }
}
