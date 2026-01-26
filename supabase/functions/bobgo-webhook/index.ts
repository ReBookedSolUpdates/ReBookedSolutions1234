import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * Parse environment variable as boolean
 * Normalizes by trimming and lowercasing before comparison
 */
function parseEnvBool(value?: string): boolean {
  if (!value) {
    return false;
  }
  return value.trim().toLowerCase() === 'true';
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const isProductionEnv = parseEnvBool(Deno.env.get("VITE_PRODUCTION"));
const WEBHOOK_SECRET = Deno.env.get(isProductionEnv ? "BOBGO_WEBHOOK_SECRET" : "PRODUCTION_BOBGO_WEBHOOK_SECRET") || "";

async function verifySignature(rawBody: string, signatureHeader?: string | null): Promise<boolean> {
  if (!WEBHOOK_SECRET) return true;
  if (!signatureHeader) return false;
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
    const hexSignature = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hexSignature === signatureHeader;
  } catch {
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  try {
    const rawText = await req.text();
    const sigHeader = req.headers.get("x-bobgo-signature") || req.headers.get("x-signature") || null;
    const verified = await verifySignature(rawText, sigHeader);
    if (!verified && WEBHOOK_SECRET) {
      return new Response(
        JSON.stringify({ success: false, error: "Signature verification failed" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let event: any;
    try {
      event = JSON.parse(rawText);
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const eventType = event?.event_type || event?.type || event?.event || "unknown";
    const payload = event?.data || event;

    try {
      await supabase.from("delivery_automation_log").insert({
        action: `bobgo_webhook_${eventType}`,
        status: "received",
        provider: "bobgo",
        response_data: event,
        created_at: new Date().toISOString(),
      });
    } catch (logErr) {
    }

    switch (eventType) {
      case "shipment.tracking_event.created":
      case "tracking.updated": {
        const tracking_number = payload?.tracking_reference || payload?.tracking_number || payload?.shipment?.tracking_number;
        const status = payload?.status || payload?.event_status;
        const location = payload?.location || payload?.current_location;
        if (tracking_number) {
          try {
            const { data: orders } = await supabase
              .from("orders")
              .select("id")
              .eq("tracking_number", tracking_number)
              .limit(1);
            if (orders && orders.length > 0) {
              await supabase
                .from("orders")
                .update({
                  delivery_status: status || "in_transit",
                  tracking_data: {
                    last_checked: new Date().toISOString(),
                    courier_status: status,
                    current_location: location,
                    last_event: payload,
                  },
                  updated_at: new Date().toISOString(),
                })
                .eq("id", orders[0].id);
            }
          } catch (err) {
          }
        }
        break;
      }
      case "shipment.created":
      case "shipment.submitted": {
        const shipmentId = payload?.id || payload?.shipment_id;
        const tracking = payload?.tracking_number || payload?.tracking_reference;
        if (shipmentId && tracking) {
          try {
            await supabase
              .from("orders")
              .update({ tracking_number: tracking, delivery_status: "submitted", updated_at: new Date().toISOString() })
              .eq("delivery_data->>shipment_id", shipmentId);
          } catch (err) {
          }
        }
        break;
      }
      case "shipment.delivered": {
        const tracking_number = payload?.tracking_reference || payload?.tracking_number;
        if (tracking_number) {
          try {
            const { data: updatedOrderRow, error: updatedOrderError } = await supabase
              .from("orders")
              .update({ status: "completed", delivery_status: "delivered", updated_at: new Date().toISOString() })
              .eq("tracking_number", tracking_number)
              .select("id, book_id, seller_id, buyer_id, buyer_email")
              .single();

            if (updatedOrderError) {
              throw updatedOrderError;
            }

            // Create notification for buyer to confirm receipt
            if (updatedOrderRow && updatedOrderRow.buyer_id) {
              try {
                await supabase.from("order_notifications").insert({
                  order_id: updatedOrderRow.id,
                  user_id: updatedOrderRow.buyer_id,
                  type: "delivery_confirmation_needed",
                  title: "Your Book Has Arrived!",
                  message: "Your book has been delivered. Please confirm receipt to complete the transaction.",
                  read: false,
                });
              } catch (notifErr) {
              }

              // Send delivery confirmation request email to buyer
              try {
                const { data: buyerData } = await supabase
                  .from("users")
                  .select("email, full_name")
                  .eq("id", updatedOrderRow.buyer_id)
                  .single();

                if (buyerData?.email) {
                  const deadlineDate = new Date();
                  deadlineDate.setHours(deadlineDate.getHours() + 48);
                  const deadlineDateStr = deadlineDate.toLocaleDateString('en-ZA', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  // Fetch book title
                  let bookTitle = "Your Book";
                  try {
                    const { data: bookData } = await supabase
                      .from("books")
                      .select("title")
                      .eq("id", updatedOrderRow.book_id)
                      .single();
                    if (bookData?.title) {
                      bookTitle = bookData.title;
                    }
                  } catch (bookErr) {
                  }

                  await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                    },
                    body: JSON.stringify({
                      templateId: 'delivery-confirmation-request',
                      to: buyerData.email,
                      data: {
                        buyerName: buyerData.full_name || 'Buyer',
                        orderId: updatedOrderRow.id,
                        bookTitles: [bookTitle],
                        deadlineDate: deadlineDateStr,
                      }
                    })
                  });
                }
              } catch (emailErr) {
              }
            }

            // Send seller waiting email to seller
            if (updatedOrderRow && updatedOrderRow.seller_id) {
              try {
                const { data: sellerData } = await supabase
                  .from("users")
                  .select("email, full_name")
                  .eq("id", updatedOrderRow.seller_id)
                  .single();

                if (sellerData?.email) {
                  const deadlineDate = new Date();
                  deadlineDate.setHours(deadlineDate.getHours() + 48);
                  const deadlineDateStr = deadlineDate.toLocaleDateString('en-ZA', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  // Fetch book title
                  let bookTitle = "Your Book";
                  try {
                    const { data: bookData } = await supabase
                      .from("books")
                      .select("title")
                      .eq("id", updatedOrderRow.book_id)
                      .single();
                    if (bookData?.title) {
                      bookTitle = bookData.title;
                    }
                  } catch (bookErr) {
                  }

                  await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                    },
                    body: JSON.stringify({
                      templateId: 'seller-waiting-for-delivery-confirmation',
                      to: sellerData.email,
                      data: {
                        sellerName: sellerData.full_name || 'Seller',
                        orderId: updatedOrderRow.id,
                        bookTitles: [bookTitle],
                        deadlineDate: deadlineDateStr,
                      }
                    })
                  });
                }
              } catch (emailErr) {
              }
            }

            try {
              const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
              const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
              if (updatedOrderRow) {
                await fetch(`${SUPABASE_URL}/functions/v1/process-affiliate-earning`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                  },
                  body: JSON.stringify({
                    book_id: updatedOrderRow.book_id || null,
                    order_id: updatedOrderRow.id,
                    seller_id: updatedOrderRow.seller_id,
                  })
                });
              }
            } catch (affErr) {
            }
          } catch (err) {
          }
        }
        break;
      }
      case "shipment.cancelled": {
        const tracking_number = payload?.tracking_reference || payload?.tracking_number;
        if (tracking_number) {
          try {
            await supabase
              .from("orders")
              .update({
                status: "cancelled",
                delivery_status: "cancelled",
                cancellation_reason: payload?.cancellation_reason || "Cancelled by courier",
                cancelled_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("tracking_number", tracking_number);
          } catch (err) {
          }
        }
        break;
      }
      default:
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Webhook handler error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
