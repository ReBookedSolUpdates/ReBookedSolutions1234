import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  Package,
  Truck,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { OrderSummary, OrderConfirmation } from "@/types/checkout";
import { AppliedCoupon } from "@/types/coupon";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import PaymentErrorHandler, {
  classifyPaymentError,
  PaymentError,
} from "@/components/payments/PaymentErrorHandler";
import { logError, getUserFriendlyErrorMessage } from "@/utils/errorLogging";
import { sendPurchaseWebhook } from "@/utils/webhookUtils";
import CouponInput from "./CouponInput";
import {
  getCachedOrderId,
  registerOrderCreation,
  isPaymentReferenceClaimed,
} from "@/utils/idempotencyUtils";
import {
  validatePickupSetup,
  normalizeLockerData,
  normalizePickupData,
} from "@/utils/pickupTypeValidationUtils";
import {
  normalizeAddressFields,
  prepareForStorage,
} from "@/utils/addressNormalizationUtils";

interface Step3PaymentProps {
  orderSummary: OrderSummary;
  onBack: () => void;
  onPaymentSuccess: (orderData: OrderConfirmation) => void;
  onPaymentError: (error: string) => void;
  userId: string;
  onCouponChange?: (coupon: AppliedCoupon | null) => void;
}

const Step3Payment: React.FC<Step3PaymentProps> = ({
  orderSummary,
  onBack,
  onPaymentSuccess,
  onPaymentError,
  userId,
  onCouponChange,
}) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<PaymentError | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [retryCount, setRetryCount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const isMobile = useIsMobile();

  // Calculate subtotal including delivery and fees
  const calculateSubtotal = (): number => {
    const platformFee = orderSummary.platform_fee || 20;
    return (
      orderSummary.book_price +
      orderSummary.delivery_price +
      platformFee
    );
  };

  const subtotal = calculateSubtotal();

  // Calculate total with applied coupon
  const calculateTotalWithCoupon = (): number => {
    const couponDiscount = appliedCoupon?.discountAmount || 0;
    return Math.max(0, subtotal - couponDiscount);
  };

  const totalWithCoupon = calculateTotalWithCoupon();

  const handleCouponApply = (coupon: AppliedCoupon) => {
    setAppliedCoupon(coupon);
    if (onCouponChange) {
      onCouponChange(coupon);
    }
  };

  const handleCouponRemove = () => {
    setAppliedCoupon(null);
    if (onCouponChange) {
      onCouponChange(null);
    }
  };

  // Fetch user email only
  React.useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const email = await getUserEmail();
        setUserEmail(email);
      } catch (err) {
      }
    };
    fetchUserEmail();
  }, []);

  const handleBobPayPayment = async () => {
    setProcessing(true);
    setError(null);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user?.email) {
        throw new Error("User authentication error");
      }

      const customPaymentId = `ORDER-${Date.now()}-${userId}`;

      // Check for duplicate order submission (idempotency)
      const cachedOrderId = getCachedOrderId(customPaymentId);
      if (cachedOrderId) {
        throw new Error(`Order already being processed. Order ID: ${cachedOrderId}. Please wait and check your account.`);
      }

      // Validate pickup setup based on delivery method
      const pickupType = orderSummary.delivery_method === "locker" ? "locker" : "door";
      const pickupErrors = validatePickupSetup(
        pickupType,
        orderSummary.delivery_method === "locker" ? orderSummary.selected_locker : null,
        orderSummary.delivery_method === "door" ? orderSummary.seller_address : null
      );
      if (pickupErrors.length > 0) {
        throw new Error(`Pickup validation failed: ${pickupErrors.join("; ")}`);
      }
      const baseUrl = window.location.origin;

      // Step 1: Fetch buyer and seller profiles for denormalized data
      const { data: buyerProfile, error: buyerError } = await supabase
        .from("profiles")
        .select("id, full_name, name, first_name, last_name, email, phone_number")
        .eq("id", userId)
        .single();

      if (buyerError || !buyerProfile) {
        throw new Error("Failed to fetch buyer profile");
      }

      const { data: sellerProfile, error: sellerError } = await supabase
        .from("profiles")
        .select("id, full_name, name, first_name, last_name, email, phone_number, pickup_address_encrypted")
        .eq("id", orderSummary.book.seller_id)
        .single();

      if (sellerError || !sellerProfile) {
        throw new Error("Failed to fetch seller profile");
      }

      const buyerFullName = buyerProfile.full_name || buyerProfile.name || `${buyerProfile.first_name || ''} ${buyerProfile.last_name || ''}`.trim() || 'Buyer';
      const sellerFullName = sellerProfile.full_name || sellerProfile.name || `${sellerProfile.first_name || ''} ${sellerProfile.last_name || ''}`.trim() || 'Seller';

      // Prepare locker data if delivery method is locker
      const deliveryType = orderSummary.delivery_method === "locker" ? "locker" : "door";
      const deliveryLockerData = orderSummary.delivery_method === "locker" ? orderSummary.selected_locker : null;
      const deliveryLockerLocationId = orderSummary.delivery_method === "locker" ? orderSummary.selected_locker?.id : null;

      // Step 2: Encrypt the shipping address (only for door deliveries)
      let shipping_address_encrypted = "";
      if (deliveryType === "door") {
        const shippingObject = {
          streetAddress: orderSummary.buyer_address.street,
          city: orderSummary.buyer_address.city,
          province: orderSummary.buyer_address.province,
          postalCode: orderSummary.buyer_address.postal_code,
          country: orderSummary.buyer_address.country,
          phone: orderSummary.buyer_address.phone,
          additional_info: orderSummary.buyer_address.additional_info,
        };

        const { data: encResult, error: encError } = await supabase.functions.invoke(
          'encrypt-address',
          { body: { object: shippingObject } }
        );

        if (encError || !encResult?.success || !encResult?.data) {
          throw new Error(encError?.message || 'Failed to encrypt shipping address');
        }

        shipping_address_encrypted = JSON.stringify(encResult.data);
      }

      // Step 3: Create the order (before payment)

      const { data: createdOrder, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            buyer_email: buyerProfile.email || userData.user.email,
            buyer_full_name: buyerFullName,
            seller_id: orderSummary.book.seller_id,
            seller_email: sellerProfile.email || "",
            seller_full_name: sellerFullName,
            buyer_phone_number: buyerProfile.phone_number || "",
            seller_phone_number: sellerProfile.phone_number || "",
            pickup_address_encrypted: sellerProfile.pickup_address_encrypted || "",
            amount: Math.round(orderSummary.total_price * 100),
            status: "pending",
            payment_reference: customPaymentId,
            buyer_id: userId,
            book_id: orderSummary.book.id,
            delivery_option: orderSummary.delivery.service_name,
            payment_status: "pending",

            items: [
              {
                type: "book",
                book_id: orderSummary.book.id,
                book_title: orderSummary.book.title,
                price: Math.round(orderSummary.book_price * 100),
                quantity: 1,
                condition: orderSummary.book.condition,
                seller_id: orderSummary.book.seller_id,
              },
            ],

            shipping_address_encrypted,

            delivery_data: {
              delivery_method: orderSummary.delivery.service_name,
              delivery_price: Math.round(orderSummary.delivery_price * 100),
              courier: orderSummary.delivery.courier,
              estimated_days: orderSummary.delivery.estimated_days,
              pickup_address: orderSummary.seller_address,
              pickup_locker_data: orderSummary.seller_locker_data || null,
              delivery_quote: orderSummary.delivery,
              delivery_type: deliveryType,
            },

            metadata: {
              buyer_id: userId,
              platform_fee: 2000,
              seller_amount: Math.round(orderSummary.book_price * 100) - 2000,
              original_total: orderSummary.total_price,
              original_book_price: orderSummary.book_price,
              original_delivery_price: orderSummary.delivery_price,
              coupon_code: orderSummary.coupon_code || null,
              coupon_discount: orderSummary.coupon_discount ? Math.round(orderSummary.coupon_discount * 100) : null,
              original_book_price_before_discount: orderSummary.subtotal_before_discount ? Math.round(orderSummary.subtotal_before_discount * 100) : null,
            },

            total_amount: orderSummary.total_price,
            selected_courier_name: orderSummary.delivery.provider_name || orderSummary.delivery.courier,
            selected_courier_slug: orderSummary.delivery.provider_slug || orderSummary.delivery.courier,
            selected_service_code: orderSummary.delivery.service_level_code || "",
            selected_service_name: orderSummary.delivery.service_name,
            selected_shipping_cost: orderSummary.delivery_price,
            delivery_type: deliveryType,
            delivery_locker_data: deliveryLockerData,
            delivery_locker_location_id: deliveryLockerLocationId,
          },
        ])
        .select()
        .single();

      if (orderError) {
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      // Step 3.5: Process affiliate earning if seller was referred
      supabase.functions.invoke('process-affiliate-earning', {
        body: {
          book_id: orderSummary.book.id,
          order_id: createdOrder.id,
          seller_id: orderSummary.book.seller_id,
        },
      }).then(() => {
      }).catch((affiliateErr) => {
      });

      // Step 4: Initialize BobPay payment with the order_id
      const paymentRequest = {
        order_id: createdOrder.id,
        amount: orderSummary.total_price,
        email: buyerProfile.email || userData.user.email,
        mobile_number: buyerProfile.phone_number || "",
        item_name: orderSummary.book.title,
        item_description: `Book purchase - ${orderSummary.book.author || "Unknown Author"}`,
        custom_payment_id: customPaymentId,
        notify_url: `${baseUrl}/api/bobpay-webhook`,
        success_url: `${baseUrl}/checkout/success?reference=${customPaymentId}`,
        pending_url: `${baseUrl}/checkout/pending?reference=${customPaymentId}`,
        cancel_url: `${baseUrl}/checkout/cancel?reference=${customPaymentId}`,
        buyer_id: userId,
      };

      const { data: bobpayResult, error: bobpayError } = await supabase.functions.invoke(
        "bobpay-initialize-payment",
        { body: paymentRequest }
      );

      if (bobpayError || !bobpayResult?.success) {
        throw new Error(
          bobpayError?.message || bobpayResult?.error || "Failed to initialize BobPay payment"
        );
      }

      const paymentUrl = bobpayResult.data?.payment_url;
      if (!paymentUrl) {
        throw new Error("No payment URL received from BobPay");
      }

      toast.success("Redirecting to payment page...");

      // Open payment page in the same tab
      window.location.href = paymentUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Payment initialization failed";
      const classifiedError = classifyPaymentError(errorMessage);
      setError(classifiedError);
      onPaymentError(errorMessage);
      toast.error("Payment initialization failed", {
        description: classifiedError.message,
        duration: 5000,
      });
    } finally {
      setProcessing(false);
    }
  };



  const handleRetryPayment = () => {
    setError(null);
    setRetryCount((prev) => prev + 1);

    if (retryCount >= 2) {
      toast.warning(
        "Multiple payment attempts detected. Please contact support if issues persist.",
      );
    }
  };

  const handleContactSupport = () => {
    const subject = "Payment Issue - ReBooked Solutions";
    const body = `
I'm experiencing payment issues:

Order Details:
- Book: ${orderSummary.book.title}
- Total: R${orderSummary.total_price}
- Error: ${error?.message || "Unknown error"}

Retry Count: ${retryCount}
User ID: ${userId}
Time: ${new Date().toISOString()}
`;

    const mailtoLink = `mailto:support@rebookedsolutions.co.za?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, "_blank");
  };

  // Get user email for payment
  const getUserEmail = async () => {
    const { data: userData, error } = await supabase.auth.getUser();
    if (error || !userData.user?.email) {
      throw new Error("User authentication error");
    }
    return userData.user.email;
  };


  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment</h1>
        <p className="text-gray-600">Review and complete your purchase</p>
      </div>

      {/* Coupon Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Have a Coupon?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CouponInput
            subtotal={subtotal}
            onCouponApply={handleCouponApply}
            onCouponRemove={handleCouponRemove}
            appliedCoupon={appliedCoupon}
            disabled={processing}
          />
        </CardContent>
      </Card>

      {/* Order Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Book Details */}
          <div className="flex items-center gap-3">
            {orderSummary.book.image_url && (
              <img
                src={orderSummary.book.image_url}
                alt={orderSummary.book.title}
                className="w-16 h-20 object-cover rounded border"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            )}
            <div className="flex-1">
              <h3 className="font-medium">{orderSummary.book.title}</h3>
              <p className="text-sm text-gray-600">
                {orderSummary.book.author}
              </p>
              <p className="text-sm text-gray-500">
                {orderSummary.book.condition}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">
                R{orderSummary.book_price.toFixed(2)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Coupon Discount */}
          {appliedCoupon && appliedCoupon.discountAmount > 0 && (
            <>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    Coupon Discount ({appliedCoupon.code})
                  </p>
                  <p className="text-sm text-gray-600">
                    Promotion applied successfully
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    -R{appliedCoupon.discountAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Delivery Details */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded">
              <Truck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">
                {orderSummary.delivery.service_name}
              </p>
              <p className="text-sm text-gray-600">
                {orderSummary.delivery.description}
              </p>
              <p className="text-sm text-gray-500">
                Estimated: {orderSummary.delivery.estimated_days} business day
                {orderSummary.delivery.estimated_days > 1 ? "s" : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">
                R{orderSummary.delivery_price.toFixed(2)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Platform Processing Fee */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">
                Platform Processing Fee
              </p>
              <p className="text-sm text-gray-600">
                Secure payment processing and order management
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">
                R{(orderSummary.platform_fee || 20).toFixed(2)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Total */}
          <div className="space-y-2">
            {appliedCoupon && appliedCoupon.discountAmount > 0 ? (
              <>
                <div className="flex justify-between items-center text-base font-semibold">
                  <span className="text-gray-500">Original Total</span>
                  <span className="text-gray-400 line-through">
                    R{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-green-600">Total After Discount</span>
                  <span className="text-green-600">
                    R{totalWithCoupon.toFixed(2)}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span className="text-green-600">
                  R{subtotal.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Address Card */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm">
            <p>{orderSummary.buyer_address.street}</p>
            <p>
              {orderSummary.buyer_address.city},{" "}
              {orderSummary.buyer_address.province}{" "}
              {orderSummary.buyer_address.postal_code}
            </p>
            <p>{orderSummary.buyer_address.country}</p>
          </div>
        </CardContent>
      </Card>

      {error && (
        <PaymentErrorHandler
          error={error}
          onRetry={handleRetryPayment}
          onContactSupport={handleContactSupport}
          onBack={onBack}
        />
      )}

      {/* Payment Information */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium">Secure Payment</h3>
              <p className="text-sm text-gray-600">
                Powered by BobPay - Your payment information is encrypted and
                secure
              </p>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <ul className="list-disc list-inside space-y-1">
              <li>Payment will be processed immediately</li>
              <li>You'll receive an email confirmation</li>
              <li>Seller will be notified to prepare shipment</li>
              <li>You can track your order in your account</li>
            </ul>
          </div>
        </CardContent>
      </Card>



      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6">
        <Button variant="outline" onClick={onBack} disabled={processing}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Button
          onClick={handleBobPayPayment}
          disabled={processing}
          className="w-full px-8 py-3 text-lg"
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Complete Payment
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Step3Payment;
