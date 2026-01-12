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
  const [retryCount, setRetryCount] = useState(0);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);

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

      // Step 1: Only invoke create-order as fallback if order is still in pending state
      // The webhook should have already done this, so we check first
      if (bookId && order.buyer_id && order.seller_id &&
          (order.payment_status === "pending" || order.status === "pending")) {
        try {
          // IDEMPOTENCY CHECK: create-order is idempotent by payment_reference
          // It will return existing order if it was already created, and also mark book as sold again (safe)
          // Only invoke this if webhook might have failed (order is still pending)
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
            // Log but don't fail - webhook may have already processed this
          } else if (createOrderResult?.success) {
            // Book marked as sold (or already was)
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
        setLoading(false);
        return;
      }

      // Order found - handle payment confirmation flow
      let finalOrder = order;

      // Check if order processing is still pending (webhook may not have fired yet)
      if (order.payment_status === "pending" && order.status === "pending") {
        setIsConfirmingPayment(true);

        // Wait a bit for webhook to process, then retry (max 3 retries = ~6 seconds)
        if (retryCount < 3) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          setRetryCount(prev => prev + 1);
          setLoading(false);
          // The useEffect will trigger again with updated retryCount
          return;
        } else {
          // Fallback: trigger post-payment actions if webhook hasn't fired
          setIsConfirmingPayment(false);
          await handlePostPaymentActions(order);

          // Refetch order after post-payment actions
          const { data: updatedOrder, error: refetchError } = await supabase
            .from("orders")
            .select("*")
            .eq("payment_reference", cleanReference)
            .maybeSingle();

          if (refetchError || !updatedOrder) {
            throw new Error("Failed to retrieve updated order data");
          }
          finalOrder = updatedOrder;
        }
      }

      // Only trigger post-payment actions if order is still pending (webhook might not have fired)
      if (finalOrder.payment_status === "pending" || finalOrder.status === "pending") {
        setIsConfirmingPayment(true);
        await handlePostPaymentActions(finalOrder);

        // Refetch to get latest status
        const { data: refreshedOrder, error: refreshError } = await supabase
          .from("orders")
          .select("*")
          .eq("payment_reference", cleanReference)
          .maybeSingle();

        if (!refreshError && refreshedOrder) {
          finalOrder = refreshedOrder;
        }
      }

      setIsConfirmingPayment(false);

      // Log that user visited the success page
      if (finalOrder.buyer_id) {
        try {
          await supabase
            .from("activity_logs")
            .insert({
              user_id: finalOrder.buyer_id,
              type: "purchase",
              title: `Order Confirmation Viewed - ${finalOrder.items?.[0]?.book_title || 'Book'}`,
              description: `Checkout completed for order #${finalOrder.id}`,
              metadata: {
                order_id: finalOrder.id,
                payment_reference: cleanReference,
              },
            })
            .then(() => {})
            .catch(() => {});
        } catch (logError) {
          // Activity logging failed - continue anyway
        }
      }

      // Get the payment_reference from the order record
      const paymentReference = finalOrder.payment_reference || cleanReference;

      // FETCH FRESH BOOK DATA from DB instead of relying on order.items
      const { data: freshBookData, error: bookFetchError } = await supabase
        .from('books')
        .select('id, title, author, price, condition, image_url, description')
        .eq('id', finalOrder.book_id)
        .single();

      if (bookFetchError || !freshBookData) {
        throw new Error('Failed to fetch book details. Please try refreshing the page.');
      }

      // Extract delivery info from delivery_data - with fallback sources
      const deliveryData = finalOrder.delivery_data || {};

      // Delivery price: use order.selected_shipping_cost (stored in cents/kobo)
      const deliveryPrice = finalOrder.selected_shipping_cost || 0;

      // Delivery method: use order denormalized field
      const deliveryMethod = finalOrder.delivery_method || "Standard";

      // Extract metadata (includes buyer_id and platform fee)
      const metadata = finalOrder.metadata || {};

      // Seller name is already denormalized in order record
      const sellerName = finalOrder.seller_full_name || "Seller";

      // Validate critical order fields exist
      if (!finalOrder.id || !finalOrder.buyer_id || !finalOrder.seller_id || !finalOrder.book_id) {
        throw new Error('Incomplete order data. Please contact support.');
      }

      // Construct OrderConfirmation object from FRESH book data and order record
      // All prices are converted from kobo/cents to Rands for display
      const confirmation: OrderConfirmation = {
        order_id: finalOrder.payment_reference || finalOrder.id,
        payment_reference: paymentReference,
        book_id: finalOrder.book_id,
        seller_id: finalOrder.seller_id,
        seller_name: sellerName,
        buyer_id: finalOrder.buyer_id,
        book_title: freshBookData.title || "Book",
        book_author: freshBookData.author,
        book_description: freshBookData.description,
        book_condition: freshBookData.condition,
        book_price: freshBookData.price ? freshBookData.price / 100 : 0, // Convert from kobo to Rands
        delivery_method: deliveryMethod,
        delivery_price: deliveryPrice ? deliveryPrice / 100 : 0, // Convert from kobo to Rands
        platform_fee: metadata.platform_fee ? metadata.platform_fee / 100 : 20, // Default R20
        total_paid: finalOrder.amount ? finalOrder.amount / 100 : 0, // Convert from kobo to Rands
        created_at: finalOrder.created_at || new Date().toISOString(),
        status: finalOrder.status || "pending",
      };

      setOrderData(confirmation);
      setLoading(false);
    } catch (err) {
      console.error("Checkout success error:", err);
      setError(err instanceof Error ? err.message : "Failed to load order");
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
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600" />
          <div>
            {isConfirmingPayment ? (
              <>
                <p className="text-gray-700 font-medium">Confirming your payment...</p>
                <p className="text-sm text-gray-500 mt-2">
                  {retryCount > 0 ? `Checking payment status (${retryCount} of 3)...` : "This may take a moment"}
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-600">Loading your order confirmation...</p>
              </>
            )}
          </div>
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
