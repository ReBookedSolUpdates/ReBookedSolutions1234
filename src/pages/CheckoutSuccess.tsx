import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { OrderConfirmation } from "@/types/checkout";
import Step4Confirmation from "@/components/checkout/Step4Confirmation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnhancedPurchaseEmailService } from "@/services/enhancedPurchaseEmailService";

const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState<OrderConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reference = searchParams.get("reference");

  useEffect(() => {
    if (!reference) {
      setError("No order reference provided");
      setLoading(false);
      return;
    }

    fetchOrderData();
  }, [reference]);

  /**
   * Handle post-payment actions: mark book as sold, send emails, create notifications
   * This acts as a fallback in case the webhook didn't fire or failed
   */
  const handlePostPaymentActions = async (order: any) => {
    try {
      // Processing post-payment actions

      const bookItem = order.items?.[0];
      const bookId = bookItem?.book_id || order.book_id;

      // Step 1: Invoke create-order function to mark book as sold
      // This is a fallback mechanism in case the webhook didn't fire
      if (bookId && order.buyer_id && order.seller_id) {
        try {
          // Invoking create-order function

          const { data: createOrderResult, error: createOrderError } = await supabase.functions.invoke(
            'create-order',
            {
              body: {
                buyer_id: order.buyer_id,
                seller_id: order.seller_id,
                book_id: bookId,
                delivery_option: order.delivery_option || "delivery",
                shipping_address_encrypted: order.shipping_address_encrypted || "",
                payment_reference: order.payment_reference,
                selected_courier_slug: order.selected_courier_slug,
                selected_service_code: order.selected_service_code,
                selected_courier_name: order.selected_courier_name,
                selected_service_name: order.selected_service_name,
                selected_shipping_cost: order.selected_shipping_cost,
                delivery_type: order.delivery_type || "door",
                delivery_locker_data: order.delivery_locker_data || null,
                delivery_locker_location_id: order.delivery_locker_location_id || null,
                delivery_locker_provider_slug: order.delivery_locker_provider_slug || null,
              }
            }
          );

          if (createOrderError) {
            // Don't throw - this might be expected if already marked
          } else if (createOrderResult?.success) {
            // Book marked as sold
          }
        } catch (functionError) {
          // Continue with other actions even if function call fails
        }
      }

      // Step 2: Send emails via EnhancedPurchaseEmailService
      const buyerName = order.buyer_full_name || "Buyer";
      const sellerName = order.seller_full_name || "Seller";
      const bookTitle = bookItem?.book_title || "Book";
      const bookPrice = bookItem?.price ? bookItem.price / 100 : 0;
      const orderTotal = order.amount ? order.amount / 100 : 0;

      try {
        await EnhancedPurchaseEmailService.sendPurchaseEmailsWithFallback({
          orderId: order.id,
          bookId: bookId || "",
          bookTitle,
          bookPrice,
          sellerName,
          sellerEmail: order.seller_email || "",
          buyerName,
          buyerEmail: order.buyer_email || "",
          orderTotal,
          orderDate: new Date(order.created_at).toLocaleDateString(),
        });
        // Purchase emails sent
      } catch (emailError) {
      }

      // Step 3: Update order status to pending_commit if still pending
      if (order.status === "pending" || order.payment_status === "pending") {
        try {
          const { error: updateError } = await supabase
            .from("orders")
            .update({
              payment_status: "paid",
              status: "pending_commit",
              updated_at: new Date().toISOString(),
            })
            .eq("id", order.id);

          if (updateError) {
            // Failed to update status
          } else {
            // Order status updated
          }
        } catch (updateError) {
        }
      }

      // All post-payment actions completed
    } catch (error) {
      // Don't throw - show success page anyway as order was created
    }
  };

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetching order data
      // Clean the reference - remove any suffixes like ":1" that may be appended by payment providers
      const cleanReference = reference ? reference.split(':')[0] : reference;

      // Fetch the order directly from orders table using payment_reference
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("payment_reference", cleanReference)
        .maybeSingle();

      if (orderError || !order) {
        setError("Order not found. Please check your reference number. Your payment may still be processing.");
        // Give user a longer time to see the error
        return;
      }

      // Order found

      // Check if order processing is still pending (webhook may not have fired yet)
      if (order.payment_status === "pending" && order.status === "pending") {
        // Wait a bit for webhook to process, then retry
        await new Promise(resolve => setTimeout(resolve, 2000));
        return fetchOrderData(); // Retry fetching
      }

      // Only trigger post-payment actions if order is still pending (webhook might not have fired)
      // This is now a FALLBACK mechanism only
      if (order.payment_status === "pending" || order.status === "pending") {
        await handlePostPaymentActions(order);
      }

      // Log that user visited the success page
      if (order.buyer_id) {
        try {
          await supabase
            .from("activity_logs")
            .insert({
              user_id: order.buyer_id,
              type: "purchase",
              title: `Order Confirmation Viewed - ${order.items?.[0]?.book_title || 'Book'}`,
              description: `Checkout completed for order #${order.id}`,
              metadata: {
                order_id: order.id,
                payment_reference: cleanReference,
              },
            })
            .then(() => {})
            .catch(() => {});
        } catch (logError) {
          // Activity logging failed
        }
      }

      // Get the payment_reference from the order record
      const paymentReference = order.payment_reference || cleanReference;

      // Extract book info from items array
      const bookItem = order.items?.[0];

      // Extract delivery info from delivery_data - with multiple fallback sources
      const deliveryData = order.delivery_data || {};

      // Fallback delivery price from order.selected_shipping_cost if delivery_data.delivery_price is missing
      const deliveryPrice = deliveryData?.delivery_price !== undefined
        ? deliveryData.delivery_price
        : order.selected_shipping_cost || 0;

      // Fallback delivery method from order.delivery_type or delivery_method
      const deliveryMethod = deliveryData?.delivery_method
        || order.delivery_method
        || (order.delivery_type === "locker" ? "BobGo Locker" : "Home Delivery")
        || "Standard";

      // Extract metadata (includes buyer_id and platform fee)
      const metadata = order.metadata || {};

      // Fetch seller profile for seller name (if available)
      let sellerName: string | undefined;
      try {
        const { data: sellerProfile } = await supabase
          .from("profiles")
          .select("full_name, name, first_name, last_name")
          .eq("id", order.seller_id)
          .single();

        if (sellerProfile) {
          sellerName = sellerProfile.full_name || sellerProfile.name ||
            `${sellerProfile.first_name || ''} ${sellerProfile.last_name || ''}`.trim();
        }
      } catch (err) {
        // Seller name fetch failed, continue without it
      }

      // Construct OrderConfirmation object from order data
      // All prices are converted from kobo/cents to Rands for display
      const confirmation: OrderConfirmation = {
        order_id: order.payment_reference || order.id,
        payment_reference: paymentReference,
        book_id: bookItem?.book_id || "",
        seller_id: order.seller_id,
        seller_name: sellerName,
        buyer_id: metadata.buyer_id || order.buyer_id || "",
        book_title: bookItem?.book_title || "Book",
        book_author: bookItem?.author, // Book author from order items
        book_description: bookItem?.description, // Book description from order items
        book_condition: bookItem?.condition, // Book condition from order items
        book_price: bookItem?.price ? bookItem.price / 100 : 0, // Convert from kobo to Rands
        delivery_method: deliveryMethod, // Use consistent delivery method field
        delivery_price: deliveryPrice ? deliveryPrice / 100 : 0, // Convert from kobo to Rands with fallback
        platform_fee: metadata.platform_fee ? metadata.platform_fee / 100 : 20, // Convert from kobo to Rands (default R20)
        total_paid: order.amount ? order.amount / 100 : 0, // Convert from kobo to Rands
        created_at: order.created_at || new Date().toISOString(),
        status: order.status || "pending",
      };

      setOrderData(confirmation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrders = () => {
    navigate("/profile", { state: { tab: "orders" } });
  };

  const handleContinueShopping = () => {
    navigate("/books");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your order confirmation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold">Unable to Load Order</p>
              <p>{error}</p>
              <p className="text-sm text-gray-600 mt-2">
                Reference: {reference ? reference.split(':')[0] : 'N/A'}
              </p>
            </div>
          </AlertDescription>
        </Alert>

        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Try Again
          </Button>
          <Button onClick={handleContinueShopping}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Order data could not be retrieved. Please contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <Step4Confirmation
        orderData={orderData}
        onViewOrders={handleViewOrders}
        onContinueShopping={handleContinueShopping}
      />
    </div>
  );
};

export default CheckoutSuccess;
