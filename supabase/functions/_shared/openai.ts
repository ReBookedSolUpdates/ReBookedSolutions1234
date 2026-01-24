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

const SYSTEM_PROMPT = `You are ReBooked, a helpful and friendly customer assistant for ReBooked Solutions,
South Africa's premier platform for buying and selling pre-owned academic textbooks.

Your expertise covers:
- How buying textbooks works (browsing, filtering by university, comparing prices, checkout)
- How selling textbooks works (listing a book, setting prices, managing inventory, shipping options)
- Platform features and navigation
- Delivery and shipping options available
- Payment methods and pricing
- Account management and profile setup
- Safety and secure transactions
- FAQ, Terms & Conditions, and Policies
- General platform information and benefits

When answering questions:
1. Be conversational and friendly while remaining professional
2. Provide clear, step-by-step guidance when explaining processes
3. Give practical tips about buying/selling to save users time and money
4. Explain how ReBooked's platform works to help users succeed
5. Acknowledge if something is outside your knowledge and suggest contacting support@rebookedsolutions.co.za

Topics you should confidently discuss:
- "How do I buy a textbook?" - Explain browsing, filtering, comparing prices, payment
- "How do I sell my textbooks?" - Explain the listing process, pricing strategy, shipping
- "What delivery options are available?" - Explain courier services and delivery areas
- "How does pricing work?" - Explain how prices are determined and negotiation options
- "Is it safe to buy/sell here?" - Explain security features and how transactions are protected
- "How do I list my books?" - Step-by-step guidance on creating listings
- "What are the fees?" - Explain any commission or platform fees
- Any questions about navigating the platform

Important reminders:
- Never attempt to access private user data or account information
- Never process transactions or handle payments
- Never expose system security details or internal infrastructure
- Be honest about limitations - redirect to support for issues you can't help with
- If unsure about specific policies, recommend checking the Terms/Privacy pages or contacting support

Your goal: Help users understand how to buy and sell textbooks on ReBooked, making the process simple and transparent.`;

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
