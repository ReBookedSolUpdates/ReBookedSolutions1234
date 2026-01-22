import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookDetailsRequest {
  frontCoverUrl: string;
  backCoverUrl: string;
  insidePagesUrl: string;
  hints?: {
    curriculum?: string;
    grade?: string;
  };
}

interface BookDetailsResponse {
  success: boolean;
  data?: {
    title: string;
    author: string;
    isbn?: string;
    description: string;
    condition: "New" | "Good" | "Better" | "Average" | "Below Average";
    grade?: string;
    curriculum?: "CAPS" | "Cambridge" | "IEB";
    category?: string;
    estimatedPrice?: number;
    quantity: number;
    confidence?: Record<string, number>;
  };
  error?: string;
  message?: string;
}

// Validate that URL is from Supabase Storage
function isValidSupabaseStorageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes("supabase.co") || 
           urlObj.hostname.includes("localhost") ||
           urlObj.hostname.includes("127.0.0.1");
  } catch {
    return false;
  }
}

// System prompt for book extraction
function getSystemPrompt(): string {
  return `You are an expert book analyst specialized in South African textbooks with years of experience in evaluating educational materials. You will analyze three book images (front cover, back cover, inside pages) and extract detailed, comprehensive information.

Your task:
1. Extract the book title from the cover (be precise, include edition if visible)
2. Extract the author name(s)
3. Look for ISBN number (on back cover or inside)
4. Assess book condition based on visual appearance using these criteria:
   - New: Pristine, no visible wear, spine intact, pages crisp
   - Good: Minimal wear, no markings, pages clean, binding tight
   - Better: Light wear on cover/spine, minimal page yellowing, no tears
   - Average: Noticeable wear, some markings possible, pages may be yellowed
   - Below Average: Significant wear, markings, loose pages, damage visible
5. Identify grade level if visible (e.g., "Grade 10", "Grade 11", etc.)
6. Detect curriculum type: CAPS, Cambridge, or IEB (South African curricula)
7. Determine the subject/category of the book (e.g., Mathematics, English, Biology, etc.)
8. **CRITICAL - Generate a rich, detailed description (3-5 sentences) that includes:**
   - What the book covers (topics, chapters if visible)
   - The target audience/grade level
   - **A clear statement about the physical condition** (e.g., "This copy is in Good condition with minimal wear on the spine and clean, unmarked pages.")
   - Any notable features (color illustrations, practice exercises, exam prep content)
   - Edition/publication year if visible
9. Estimate a fair market price in ZAR based on:
   - Grade level (higher grades tend to have higher prices)
   - Curriculum type (IEB/Cambridge may price differently than CAPS)
   - Book condition (New > Good > Better > Average > Below Average)
   - Estimated age/edition
   - Current market rates for similar books

For price estimation guidelines:
- New textbooks: R150-R800 depending on grade/curriculum
- Good condition: 70-90% of new price
- Better condition: 60-80% of new price
- Average condition: 50-70% of new price
- Below Average: 30-50% of new price

DESCRIPTION EXAMPLES:
- Good: "This Grade 11 CAPS Mathematics textbook covers algebra, geometry, trigonometry, and statistics with comprehensive worked examples. This copy is in Good condition with a tight binding, clean pages, and only minor wear on the cover corners. Features full-color diagrams and end-of-chapter exercises ideal for exam preparation."
- Average: "A comprehensive IEB English Home Language textbook for Grade 10 covering literature analysis, creative writing, and grammar. This copy shows Average condition with visible wear on the spine, some page yellowing, and light pencil markings that can be erased. Includes prescribed poetry and short story selections."
- Below Average: "Cambridge IGCSE Biology textbook covering cells, genetics, and ecology with detailed laboratory experiment guides. This copy is in Below Average condition with a loose binding, dog-eared pages, and highlighting throughout—recommended for budget-conscious buyers who need the content rather than pristine pages."

Always respond with valid JSON in this exact format:
{
  "title": "string",
  "author": "string",
  "isbn": "string or null",
  "description": "string (3-5 sentences, MUST include condition statement and book content details)",
  "condition": "New|Good|Better|Average|Below Average",
  "grade": "string or null (e.g., 'Grade 10')",
  "curriculum": "CAPS|Cambridge|IEB or null",
  "category": "string (subject/category of the book)",
  "estimatedPrice": number,
  "confidence": {
    "title": 0-100,
    "author": 0-100,
    "isbn": 0-100,
    "condition": 0-100,
    "grade": 0-100,
    "curriculum": 0-100,
    "price": 0-100
  }
}`;
}

// Build vision prompt for images
function buildVisionPrompt(hint?: { curriculum?: string; grade?: string }): string {
  let prompt = `Analyze these three book images carefully to extract comprehensive book details.

Image 1: Front cover - Extract title, author, edition, grade level, and visual indicators of the book's subject matter
Image 2: Back cover - Look for ISBN, curriculum indicators, blurb text, and additional information about the book's contents
Image 3: Inside pages - Assess physical condition (page quality, markings, wear), look for curriculum type, edition info, table of contents, or chapter headings

Extract ALL the following information in JSON format. Pay special attention to:
1. Writing a DETAILED description (3-5 sentences) that describes what the book covers AND includes a clear statement about its physical condition
2. Accurately assessing the book's condition based on visible wear, markings, and page quality`;

  if (hint?.curriculum) {
    prompt += `\n\nHint: User indicated curriculum is likely ${hint.curriculum}. Confirm or correct this based on visual evidence.`;
  }
  if (hint?.grade) {
    prompt += `\n\nHint: User indicated grade level is likely ${hint.grade}. Confirm or correct this based on visual evidence.`;
  }

  prompt += `\n\nRespond ONLY with valid JSON, no additional text. Ensure the description is rich, informative, and includes condition details.`;
  return prompt;
}

async function callOpenAIVision(
  imageUrls: [string, string, string],
  hints?: { curriculum?: string; grade?: string }
): Promise<any> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: 1500,
      messages: [
        {
          role: "system",
          content: getSystemPrompt(),
        },
        {
          role: "user",
          content: [
            { type: "text", text: buildVisionPrompt(hints) },
            { type: "image_url", image_url: { url: imageUrls[0], detail: "high" } },
            { type: "image_url", image_url: { url: imageUrls[1], detail: "high" } },
            { type: "image_url", image_url: { url: imageUrls[2], detail: "high" } },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("OpenAI API error:", error);
    throw new Error(`OpenAI API error: ${error.error?.message || "Unknown error"}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content;
}

function parseExtractedData(rawText: string): any {
  try {
    // Try to extract JSON from the response (in case there's extra text)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    throw new Error(`Failed to parse extracted data: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
}

serve(async (req) => {
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
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  /* -------------------- CONTENT-TYPE GUARD -------------------- */
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "INVALID_CONTENT_TYPE",
        message: "Content-Type must be application/json",
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  /* -------------------- SAFE JSON PARSE -------------------- */
  let bookRequest: BookDetailsRequest;
  try {
    const rawBody = await req.text();
    if (!rawBody || rawBody.trim() === "") {
      throw new Error("Empty request body");
    }
    bookRequest = JSON.parse(rawBody);
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "INVALID_JSON",
        message: "Request body must be valid JSON",
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  /* -------------------- VALIDATION -------------------- */
  const { frontCoverUrl, backCoverUrl, insidePagesUrl, hints } = bookRequest;

  if (!frontCoverUrl || !backCoverUrl || !insidePagesUrl) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "INVALID_PAYLOAD",
        message: "Missing required image URLs (frontCoverUrl, backCoverUrl, insidePagesUrl)",
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Validate URLs are from Supabase Storage
  if (!isValidSupabaseStorageUrl(frontCoverUrl) || 
      !isValidSupabaseStorageUrl(backCoverUrl) || 
      !isValidSupabaseStorageUrl(insidePagesUrl)) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "INVALID_URLS",
        message: "All image URLs must be from Supabase Storage",
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  /* -------------------- PROCESS WITH TIMEOUT -------------------- */
  try {
    // Set 45-second timeout for AI processing (increased for richer descriptions)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI processing timeout (>45s)")), 45000)
    );

    const extractionPromise = (async () => {
      const rawContent = await callOpenAIVision(
        [frontCoverUrl, backCoverUrl, insidePagesUrl],
        hints
      );

      const extractedData = parseExtractedData(rawContent);

      // Validate extracted data structure
      if (!extractedData.title || !extractedData.author) {
        throw new Error("Could not extract title or author from images");
      }

      // Ensure description includes condition if AI didn't include it
      let description = extractedData.description || "Book description not available from images";
      const conditionKeywords = ["condition", "wear", "pages", "binding", "pristine", "markings"];
      const hasConditionInfo = conditionKeywords.some(keyword => 
        description.toLowerCase().includes(keyword)
      );
      
      if (!hasConditionInfo && extractedData.condition) {
        // Append condition info if missing
        const conditionDescriptions: Record<string, string> = {
          "New": "This copy is in New condition with pristine pages and no visible wear.",
          "Good": "This copy is in Good condition with minimal wear and clean pages.",
          "Better": "This copy is in Better condition with light wear and well-maintained pages.",
          "Average": "This copy is in Average condition with noticeable wear but remains fully usable.",
          "Below Average": "This copy is in Below Average condition with significant wear—ideal for budget-conscious buyers.",
        };
        description = `${description} ${conditionDescriptions[extractedData.condition] || ""}`;
      }

      // Build response with extracted data
      const response: BookDetailsResponse = {
        success: true,
        data: {
          title: extractedData.title,
          author: extractedData.author,
          isbn: extractedData.isbn || undefined,
          description: description,
          condition: extractedData.condition || "Good",
          grade: extractedData.grade || undefined,
          curriculum: extractedData.curriculum || undefined,
          category: extractedData.category || undefined,
          estimatedPrice: extractedData.estimatedPrice || 0,
          quantity: 1,
          confidence: extractedData.confidence,
        },
      };

      return response;
    })();

    const result = await Promise.race([extractionPromise, timeoutPromise]);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Extraction error:", errorMessage);
    
    // Provide helpful error context
    let message = errorMessage;
    if (errorMessage.includes("timeout")) {
      message = "AI processing took too long. Please try again or enter details manually.";
    } else if (errorMessage.includes("Could not extract")) {
      message = "Could not read text from images. Please ensure images are clear and well-lit.";
    } else if (errorMessage.includes("OPENAI_API_KEY")) {
      message = "AI service is not properly configured.";
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: "EXTRACTION_FAILED",
        message: message,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
