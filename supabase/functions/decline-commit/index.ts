import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  console.log("[decline-order] Function invoked");

  try {
    const { order_id, seller_id, reason } = await req.json();
    console.log(`[decline-order] Processing order: ${order_id}, seller: ${seller_id}`);

    if (!order_id || !seller_id) {
      console.error("[decline-order] Missing required parameters");
      return new Response(
        JSON.stringify({
          success: false,
          error: "MISSING_PARAMETERS",
          message: "order_id and seller_id are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.error("[decline-order] Missing Supabase configuration");
      return new Response(
        JSON.stringify({
          success: false,
          error: "ENVIRONMENT_CONFIG_ERROR",
          message: "Supabase configuration missing",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get order details - must be in pending status
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, buyer_id, seller_id, buyer_email, seller_email, buyer_full_name, seller_full_name, payment_reference, amount, total_amount, status, book_id, items")
      .eq("id", order_id)
      .eq("seller_id", seller_id)
      .eq("status", "pending")
      .maybeSingle();

    if (orderError) {
      console.error("[decline-order] Database error fetching order:", orderError.message);
      return new Response(
        JSON.stringify({
          success: false,
          error: "DATABASE_ERROR",
          message: "Failed to fetch order from database",
          details: orderError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!order) {
      console.log("[decline-order] Order not found or not in pending status, checking why...");
      
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("id, seller_id, status")
        .eq("id", order_id)
        .maybeSingle();

      let errorMessage = "Order not found";
      if (existingOrder) {
        if (existingOrder.seller_id !== seller_id) {
          errorMessage = "You are not authorized to decline this order";
        } else if (existingOrder.status !== "pending") {
          errorMessage = `Order is in ${existingOrder.status} status and cannot be declined`;
        }
      }

      console.error(`[decline-order] ${errorMessage}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: "ORDER_NOT_FOUND",
          message: errorMessage,
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[decline-order] Order found: ${order.id}, status: ${order.status}`);

    const buyer = {
      id: order.buyer_id,
      email: order.buyer_email,
      name: order.buyer_full_name || "Customer"
    };

    const seller = {
      id: order.seller_id,
      email: order.seller_email,
      name: order.seller_full_name || "Seller"
    };

    // Update order status to declined
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "declined",
        declined_at: new Date().toISOString(),
        decline_reason: reason || "Seller declined to commit",
      })
      .eq("id", order_id);

    if (updateError) {
      console.error("[decline-order] Failed to update order status:", updateError.message);
      return new Response(
        JSON.stringify({
          success: false,
          error: "ORDER_UPDATE_FAILED",
          message: "Failed to update order status",
          details: updateError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("[decline-order] Order status updated to declined");

    // Restore book availability - mark book as not sold and restore quantity
    try {
      let bookId = order.book_id;

      if (!bookId && order.items) {
        const items = Array.isArray(order.items) ? order.items : [];
        if (items.length > 0 && items[0].book_id) {
          bookId = items[0].book_id;
        }
      }

      if (bookId) {
        console.log(`[decline-order] Restoring book availability for book: ${bookId}`);
        
        const { data: bookData, error: bookFetchError } = await supabase
          .from("books")
          .select("sold, available_quantity, sold_quantity, initial_quantity")
          .eq("id", bookId)
          .single();

        if (bookFetchError) {
          console.error("[decline-order] Failed to fetch book:", bookFetchError.message);
        } else if (bookData) {
          console.log(`[decline-order] Current book state: initial=${bookData.initial_quantity}, sold_qty=${bookData.sold_quantity}, available=${bookData.available_quantity}, sold_flag=${bookData.sold}`);
          
          // Constraint: (initial_quantity >= sold_quantity) AND ((initial_quantity - sold_quantity) = available_quantity)
          const currentSoldQty = bookData.sold_quantity || 0;
          const initialQty = bookData.initial_quantity || 1;
          
          // Only decrement sold_quantity if it's greater than 0
          if (currentSoldQty > 0) {
            const newSoldQuantity = currentSoldQty - 1;
            // available_quantity MUST equal initial_quantity - sold_quantity to satisfy the constraint
            const newAvailableQuantity = initialQty - newSoldQuantity;

            console.log(`[decline-order] Restoring: newSoldQty=${newSoldQuantity}, newAvailableQty=${newAvailableQuantity}`);

            // Validate before update to ensure constraint will be satisfied
            if (initialQty >= newSoldQuantity && newAvailableQuantity === (initialQty - newSoldQuantity)) {
              const { error: bookUpdateError } = await supabase
                .from("books")
                .update({
                  sold: newSoldQuantity >= initialQty, // Only mark as sold if all copies are sold
                  available_quantity: newAvailableQuantity,
                  sold_quantity: newSoldQuantity,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", bookId);

              if (bookUpdateError) {
                console.error("[decline-order] Failed to restore book:", bookUpdateError.message);
              } else {
                console.log("[decline-order] Book availability restored successfully");
              }
            } else {
              console.error(`[decline-order] Invalid state: Would violate constraint. initial=${initialQty}, newSold=${newSoldQuantity}, newAvailable=${newAvailableQuantity}`);
            }
          } else {
            // sold_quantity is already 0 - book wasn't actually marked as sold for this order
            // Just ensure the book is marked as available with consistent quantities
            const expectedAvailable = initialQty; // Since sold_quantity is 0
            
            console.log(`[decline-order] sold_quantity already 0, ensuring consistent state`);
            
            const { error: bookUpdateError } = await supabase
              .from("books")
              .update({
                sold: false,
                available_quantity: expectedAvailable,
                sold_quantity: 0,
                updated_at: new Date().toISOString(),
              })
              .eq("id", bookId);

            if (bookUpdateError) {
              console.error("[decline-order] Failed to update book status:", bookUpdateError.message);
            } else {
              console.log("[decline-order] Book marked as available");
            }
          }
        }
      }
    } catch (bookRestoreError) {
      console.error("[decline-order] Error restoring book:", bookRestoreError);
    }

    // Process BobPay refund if payment reference exists
    let refundResult: { success: boolean; error?: string } = { success: false };
    if (order.payment_reference) {
      console.log("[decline-order] Processing refund for payment reference:", order.payment_reference);

      try {
        const refundResponse = await fetch(
          `${SUPABASE_URL}/functions/v1/bobpay-refund`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            },
            body: JSON.stringify({
              order_id: order_id,
              reason: reason || "Order declined by seller",
            }),
          }
        );

        refundResult = await refundResponse.json();
        console.log("[decline-order] Refund result:", refundResult.success ? "Success" : "Failed");
      } catch (refundError) {
        console.error("[decline-order] Refund error:", refundError);
        refundResult = {
          success: false,
          error: refundError instanceof Error ? refundError.message : String(refundError),
        };
      }
    }

    // Create database notifications
    try {
      console.log("[decline-order] Creating notifications");
      const notifications = [];

      if (buyer.id) {
        notifications.push(
          supabase.from("order_notifications").insert({
            order_id: order_id,
            user_id: buyer.id,
            type: "order_declined",
            title: "Order Declined",
            message: `Your order has been declined by the seller. ${refundResult?.success
              ? "Refund processed and will appear in 3-5 business days."
              : "Refund is being processed."
              }`,
            read: false,
          })
        );
      }

      if (seller.id) {
        notifications.push(
          supabase.from("order_notifications").insert({
            order_id: order_id,
            user_id: seller.id,
            type: "order_declined",
            title: "Order Decline Confirmed",
            message: `You have successfully declined the order. The buyer has been notified and refunded.`,
            read: false,
          })
        );
      }

      const notificationResults = await Promise.allSettled(notifications);
      console.log("[decline-order] Notifications created:", notificationResults.length);
    } catch (notificationError) {
      console.error("[decline-order] Notification error:", notificationError);
    }

    // Send email notifications
    try {
      console.log("[decline-order] Sending email notifications");
      const emailPromises = [];

      if (buyer.email) {
        const buyerHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<h2 style="color: #dc2626;">❌ Order Declined</h2>
<p>Hello ${buyer.name},</p>
<p>We're sorry to inform you that your order has been declined by the seller.</p>
<h3>📋 Order Details</h3>
<p><strong>Order ID:</strong> ${order_id}</p>
<p><strong>Amount:</strong> R${order.total_amount?.toFixed(2) || "0.00"}</p>
<p><strong>Reason:</strong> ${reason || "Seller declined to commit"}</p>
${refundResult?.success ? `
<h3 style="color: #16a34a;">💰 Refund Information</h3>
<p><strong>Processing Time:</strong> 3-5 business days</p>
<p>✅ Your refund has been successfully processed.</p>
` : `
<h3 style="color: #f59e0b;">⚠️ Refund Processing</h3>
<p>Your refund is being processed and will appear in your account within 3-5 business days.</p>
`}
<p>We apologize for any inconvenience. Please feel free to browse our marketplace for similar books from other sellers.</p>
<p><a href="https://rebookedsolutions.co.za/books" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Browse Books</a></p>
<hr style="margin: 20px 0;">
<p style="font-size: 12px; color: #666;">This is an automated message from ReBooked Solutions.<br>Please do not reply to this email.<br>For assistance, contact: support@rebookedsolutions.co.za<br>Visit us at: https://rebookedsolutions.co.za</p>
<p style="font-size: 10px; color: #999;">T&Cs apply. "Pre-Loved Pages, New Adventures"</p>
</div>`;

        const buyerText = `Order Declined - Refund Processed\n\nHello ${buyer.name},\n\nWe're sorry to inform you that your order has been declined by the seller.\n\nOrder Details:\nOrder ID: ${order_id}\nAmount: R${order.total_amount?.toFixed(2) || "0.00"}\nReason: ${reason || "Seller declined to commit"}\n\n${refundResult?.success ? "Your refund has been successfully processed and will appear in your account within 3-5 business days." : "Your refund is being processed and will appear in your account within 3-5 business days."}\n\nBrowse Books: https://rebookedsolutions.co.za/books\n\nThis is an automated message from ReBooked Solutions.\nFor assistance, contact: support@rebookedsolutions.co.za`;

        emailPromises.push(
          fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            },
            body: JSON.stringify({
              to: buyer.email,
              subject: "Order Declined - Refund Processed",
              html: buyerHtml,
              text: buyerText,
            }),
          })
        );
      }

      if (seller.email) {
        const sellerHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<h2 style="color: #16a34a;">✅ Order Decline Confirmed</h2>
<p>Hello ${seller.name},</p>
<p>You have successfully declined the order commitment.</p>
<h3>📋 Order Details</h3>
<p><strong>Order ID:</strong> ${order_id}</p>
<p><strong>Reason:</strong> ${reason || "You declined to commit"}</p>
<p>The buyer has been notified and their payment has been refunded. Your book stock has been automatically restored.</p>
<hr style="margin: 20px 0;">
<p style="font-size: 12px; color: #666;">This is an automated message from ReBooked Solutions.<br>Please do not reply to this email.<br>For assistance, contact: support@rebookedsolutions.co.za<br>Visit us at: https://rebookedsolutions.co.za</p>
<p style="font-size: 10px; color: #999;">T&Cs apply. "Pre-Loved Pages, New Adventures"</p>
</div>`;

        const sellerText = `Order Decline Confirmation\n\nHello ${seller.name},\n\nYou have successfully declined the order commitment.\n\nOrder Details:\nOrder ID: ${order_id}\nReason: ${reason || "You declined to commit"}\n\nThe buyer has been notified and their payment has been refunded. Your book stock has been automatically restored.\n\nThis is an automated message from ReBooked Solutions.\nFor assistance, contact: support@rebookedsolutions.co.za`;

        emailPromises.push(
          fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            },
            body: JSON.stringify({
              to: seller.email,
              subject: "Order Decline Confirmation",
              html: sellerHtml,
              text: sellerText,
            }),
          })
        );
      }

      await Promise.allSettled(emailPromises);
      console.log("[decline-order] Emails sent");
    } catch (emailError) {
      console.error("[decline-order] Email error:", emailError);
    }

    console.log("[decline-order] Order declined successfully");
    return new Response(
      JSON.stringify({
        success: true,
        message: "Order declined successfully. Stock has been automatically released.",
        details: {
          order_id,
          status: "declined",
          declined_at: new Date().toISOString(),
          refund_processed: refundResult?.success || false,
          notifications_sent: {
            buyer: !!buyer.email,
            seller: !!seller.email,
          },
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[decline-order] Unexpected error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "UNEXPECTED_ERROR",
        message: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
