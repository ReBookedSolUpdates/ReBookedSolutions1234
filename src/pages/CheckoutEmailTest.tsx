import React, { useState } from "react";
import { Mail, AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from "lucide-react";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { emailService } from "@/services/emailService";
import { OrderConfirmation } from "@/types/checkout";
import Step4Confirmation from "@/components/checkout/Step4Confirmation";

interface TestPurchaseData {
  orderId: string;
  bookId: string;
  bookTitle: string;
  bookPrice: string;
  sellerName: string;
  sellerEmail: string;
  buyerName: string;
  buyerEmail: string;
  orderTotal: string;
  orderDate: string;
}

interface EmailResult {
  success: boolean;
  message: string;
  sellerEmailSent?: boolean;
  buyerEmailSent?: boolean;
  errors?: string[];
}

const CheckoutEmailTest: React.FC = () => {
  const [formData, setFormData] = useState<TestPurchaseData>({
    orderId: "TEST-" + Date.now().toString().slice(-8),
    bookId: "book-12345",
    bookTitle: "The Great Gatsby",
    bookPrice: "150.00",
    sellerName: "John Seller",
    sellerEmail: "seller@example.com",
    buyerName: "Jane Buyer",
    buyerEmail: "buyer@example.com",
    orderTotal: "200.00",
    orderDate: new Date().toISOString().split("T")[0],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [emailResult, setEmailResult] = useState<EmailResult | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.bookTitle.trim()) newErrors.bookTitle = "Book title is required";
    if (!formData.sellerName.trim()) newErrors.sellerName = "Seller name is required";
    if (!formData.sellerEmail.trim()) newErrors.sellerEmail = "Seller email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.sellerEmail)) {
      newErrors.sellerEmail = "Invalid seller email format";
    }
    if (!formData.buyerName.trim()) newErrors.buyerName = "Buyer name is required";
    if (!formData.buyerEmail.trim()) newErrors.buyerEmail = "Buyer email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.buyerEmail)) {
      newErrors.buyerEmail = "Invalid buyer email format";
    }
    if (!formData.bookPrice || parseFloat(formData.bookPrice) <= 0) {
      newErrors.bookPrice = "Valid book price is required";
    }
    if (!formData.orderTotal || parseFloat(formData.orderTotal) <= 0) {
      newErrors.orderTotal = "Valid order total is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendTestSellerEmail = async (purchaseData: {
    orderId: string;
    bookTitle: string;
    bookPrice: number;
    sellerName: string;
    sellerEmail: string;
    buyerName: string;
    orderDate: string;
  }): Promise<boolean> => {
    const sellerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #e74c3c; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">🚨 New Book Sale - Action Required!</h1>
        </div>
        <div style="padding: 30px; background-color: #f8f9fa;">
          <p>Hello ${purchaseData.sellerName},</p>
          <p><strong>Great news!</strong> Someone just purchased your book and is waiting for confirmation.</p>

          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #e17055; margin-top: 0;">⏰ ACTION REQUIRED WITHIN 48 HOURS</h3>
            <p><strong>You must confirm this sale to proceed with the order.</strong></p>
          </div>

          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2d3436; margin-top: 0;">Sale Details</h3>
            <p><strong>Book:</strong> ${purchaseData.bookTitle}</p>
            <p><strong>Price:</strong> R${purchaseData.bookPrice}</p>
            <p><strong>Buyer:</strong> ${purchaseData.buyerName}</p>
            <p><strong>Order ID:</strong> ${purchaseData.orderId}</p>
            <p><strong>Order Date:</strong> ${purchaseData.orderDate}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${window.location.origin}/books"
               style="background-color: #00b894; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              CONFIRM SALE NOW
            </a>
          </div>

          <p><strong>What happens next:</strong></p>
          <ul>
            <li>Log in to your ReBooked Solutions account</li>
            <li>Click "Commit Sale" for this book</li>
            <li>We'll arrange pickup from your location</li>
            <li>You'll receive payment after delivery</li>
          </ul>

          <p style="color: #e17055;"><strong>Important:</strong> If you don't confirm within 48 hours, the order will be automatically cancelled and refunded.</p>

          <p>Thank you for using ReBooked Solutions!</p>
        </div>
      </div>
    `;

    try {
      await emailService.sendEmail({
        to: purchaseData.sellerEmail,
        subject: "🚨 NEW SALE - Confirm Your Book Sale (48hr deadline)",
        html: sellerEmailHtml,
        text: `NEW SALE - Action Required! Book: ${purchaseData.bookTitle}, Price: R${purchaseData.bookPrice}. You have 48 hours to confirm this sale. Login to ReBooked Solutions to confirm.`,
      });
      return true;
    } catch (error) {
      console.error("Failed to send seller email:", error);
      return false;
    }
  };

  const sendTestBuyerEmail = async (purchaseData: {
    orderId: string;
    bookTitle: string;
    bookPrice: number;
    sellerName: string;
    buyerName: string;
    buyerEmail: string;
    orderTotal: number;
    orderDate: string;
  }): Promise<boolean> => {
    const buyerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #00b894; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">📚 Purchase Confirmed!</h1>
        </div>
        <div style="padding: 30px; background-color: #f8f9fa;">
          <p>Hello ${purchaseData.buyerName},</p>
          <p><strong>Thank you for your purchase!</strong> Your payment has been processed successfully.</p>

          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #00b894; margin-top: 0;">Order Summary</h3>
            <p><strong>Book:</strong> ${purchaseData.bookTitle}</p>
            <p><strong>Price:</strong> R${purchaseData.bookPrice}</p>
            <p><strong>Seller:</strong> ${purchaseData.sellerName}</p>
            <p><strong>Order ID:</strong> ${purchaseData.orderId}</p>
            <p><strong>Order Date:</strong> ${purchaseData.orderDate}</p>
            <p><strong>Total Paid:</strong> R${purchaseData.orderTotal}</p>
          </div>

          <div style="background-color: #e8f4fd; border: 1px solid #74b9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0984e3; margin-top: 0;">⏳ Waiting for Seller Confirmation</h3>
            <p>The seller has 48 hours to confirm your order. Once confirmed, your book will be shipped immediately.</p>
          </div>

          <p><strong>What happens next:</strong></p>
          <ul>
            <li>The seller will confirm your order within 48 hours</li>
            <li>Once confirmed, your book will be shipped immediately</li>
            <li>You'll receive tracking information via SMS/email</li>
            <li>Delivery typically takes 1-3 business days</li>
          </ul>

          <p><strong>If the seller doesn't confirm:</strong> You'll receive a full automatic refund within 48 hours.</p>

          <p>Thank you for choosing ReBooked Solutions!</p>
        </div>
      </div>
    `;

    try {
      await emailService.sendEmail({
        to: purchaseData.buyerEmail,
        subject: "📚 Purchase Confirmed - Waiting for Seller Response",
        html: buyerEmailHtml,
        text: `Purchase Confirmed! Book: ${purchaseData.bookTitle}, Total: R${purchaseData.orderTotal}. Waiting for seller confirmation within 48 hours.`,
      });
      return true;
    } catch (error) {
      console.error("Failed to send buyer email:", error);
      return false;
    }
  };

  const handleSendTestEmails = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors below");
      return;
    }

    setIsLoading(true);
    setEmailResult(null);

    try {
      const purchaseData = {
        orderId: formData.orderId,
        bookId: formData.bookId,
        bookTitle: formData.bookTitle,
        bookPrice: parseFloat(formData.bookPrice),
        sellerName: formData.sellerName,
        sellerEmail: formData.sellerEmail,
        buyerName: formData.buyerName,
        buyerEmail: formData.buyerEmail,
        orderTotal: parseFloat(formData.orderTotal),
        orderDate: formData.orderDate,
      };

      // Send both emails in parallel
      const [sellerEmailSent, buyerEmailSent] = await Promise.all([
        sendTestSellerEmail(purchaseData),
        sendTestBuyerEmail(purchaseData),
      ]);

      const success = sellerEmailSent && buyerEmailSent;

      setEmailResult({
        success,
        message: success
          ? "Both emails sent successfully!"
          : "One or more emails failed to send. Check the details below.",
        sellerEmailSent,
        buyerEmailSent,
      });

      if (success) {
        toast.success("Test emails sent successfully! ✅", {
          description: "Check your inbox for both seller and buyer confirmation emails.",
          duration: 5000,
        });
      } else {
        toast.warning("Partial success", {
          description:
            "Some emails may have failed. Check the results below for details.",
          duration: 5000,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send test emails";
      setEmailResult({
        success: false,
        message: errorMessage,
      });
      toast.error("Error sending test emails", {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const buildOrderConfirmation = (): OrderConfirmation => {
    return {
      order_id: formData.orderId,
      payment_reference: formData.orderId,
      book_id: formData.bookId,
      seller_id: "test-seller-id",
      buyer_id: "test-buyer-id",
      book_title: formData.bookTitle,
      book_price: parseFloat(formData.bookPrice),
      delivery_method: "Standard Delivery",
      delivery_price: 50,
      platform_fee: 20,
      total_paid: parseFloat(formData.orderTotal),
      created_at: formData.orderDate,
      status: "pending_commit",
    };
  };

  const loadSampleData = () => {
    setFormData({
      orderId: "TEST-" + Date.now().toString().slice(-8),
      bookId: "book-98765",
      bookTitle: "To Kill a Mockingbird",
      bookPrice: "175.50",
      sellerName: "Alice Bookstore",
      sellerEmail: "alice.bookstore@example.com",
      buyerName: "Bob Reader",
      buyerEmail: "bob.reader@example.com",
      orderTotal: "245.50",
      orderDate: new Date().toISOString().split("T")[0],
    });
    setEmailResult(null);
    toast.success("Sample data loaded!");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                Email Sending Test Page
              </h1>
            </div>
            <p className="text-gray-600">
              Simulate a book purchase and trigger buyer/seller confirmation emails without
              creating real orders or processing payments.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Test Purchase Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSendTestEmails} className="space-y-6">
                    {/* Order Information */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm">
                          1
                        </span>
                        Order Information
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="orderId" className="text-gray-700">
                            Order ID
                          </Label>
                          <Input
                            id="orderId"
                            name="orderId"
                            value={formData.orderId}
                            onChange={handleInputChange}
                            placeholder="e.g., TEST-12345678"
                            disabled
                            className="bg-gray-100"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Auto-generated unique ID
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="orderDate" className="text-gray-700">
                            Order Date
                          </Label>
                          <Input
                            id="orderDate"
                            name="orderDate"
                            type="date"
                            value={formData.orderDate}
                            onChange={handleInputChange}
                            className={errors.orderDate ? "border-red-500" : ""}
                          />
                          {errors.orderDate && (
                            <p className="text-xs text-red-500 mt-1">{errors.orderDate}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Book Information */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm">
                          2
                        </span>
                        Book Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="bookTitle" className="text-gray-700">
                            Book Title *
                          </Label>
                          <Input
                            id="bookTitle"
                            name="bookTitle"
                            value={formData.bookTitle}
                            onChange={handleInputChange}
                            placeholder="e.g., The Great Gatsby"
                            className={errors.bookTitle ? "border-red-500" : ""}
                          />
                          {errors.bookTitle && (
                            <p className="text-xs text-red-500 mt-1">{errors.bookTitle}</p>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="bookId" className="text-gray-700">
                              Book ID
                            </Label>
                            <Input
                              id="bookId"
                              name="bookId"
                              value={formData.bookId}
                              onChange={handleInputChange}
                              placeholder="e.g., book-12345"
                            />
                          </div>
                          <div>
                            <Label htmlFor="bookPrice" className="text-gray-700">
                              Book Price (R) *
                            </Label>
                            <Input
                              id="bookPrice"
                              name="bookPrice"
                              type="number"
                              step="0.01"
                              min="0"
                              value={formData.bookPrice}
                              onChange={handleInputChange}
                              placeholder="e.g., 150.00"
                              className={errors.bookPrice ? "border-red-500" : ""}
                            />
                            {errors.bookPrice && (
                              <p className="text-xs text-red-500 mt-1">{errors.bookPrice}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Seller Information */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm">
                          3
                        </span>
                        Seller Information
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="sellerName" className="text-gray-700">
                            Seller Name *
                          </Label>
                          <Input
                            id="sellerName"
                            name="sellerName"
                            value={formData.sellerName}
                            onChange={handleInputChange}
                            placeholder="e.g., John Seller"
                            className={errors.sellerName ? "border-red-500" : ""}
                          />
                          {errors.sellerName && (
                            <p className="text-xs text-red-500 mt-1">{errors.sellerName}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="sellerEmail" className="text-gray-700">
                            Seller Email *
                          </Label>
                          <Input
                            id="sellerEmail"
                            name="sellerEmail"
                            type="email"
                            value={formData.sellerEmail}
                            onChange={handleInputChange}
                            placeholder="e.g., seller@example.com"
                            className={errors.sellerEmail ? "border-red-500" : ""}
                          />
                          {errors.sellerEmail && (
                            <p className="text-xs text-red-500 mt-1">{errors.sellerEmail}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Buyer Information */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm">
                          4
                        </span>
                        Buyer Information
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="buyerName" className="text-gray-700">
                            Buyer Name *
                          </Label>
                          <Input
                            id="buyerName"
                            name="buyerName"
                            value={formData.buyerName}
                            onChange={handleInputChange}
                            placeholder="e.g., Jane Buyer"
                            className={errors.buyerName ? "border-red-500" : ""}
                          />
                          {errors.buyerName && (
                            <p className="text-xs text-red-500 mt-1">{errors.buyerName}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="buyerEmail" className="text-gray-700">
                            Buyer Email *
                          </Label>
                          <Input
                            id="buyerEmail"
                            name="buyerEmail"
                            type="email"
                            value={formData.buyerEmail}
                            onChange={handleInputChange}
                            placeholder="e.g., buyer@example.com"
                            className={errors.buyerEmail ? "border-red-500" : ""}
                          />
                          {errors.buyerEmail && (
                            <p className="text-xs text-red-500 mt-1">{errors.buyerEmail}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Total */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm">
                          5
                        </span>
                        Order Total
                      </h3>
                      <div className="grid grid-cols-1">
                        <div>
                          <Label htmlFor="orderTotal" className="text-gray-700">
                            Order Total (R) *
                          </Label>
                          <Input
                            id="orderTotal"
                            name="orderTotal"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.orderTotal}
                            onChange={handleInputChange}
                            placeholder="e.g., 200.00"
                            className={errors.orderTotal ? "border-red-500" : ""}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Includes book price + delivery fee + platform fee
                          </p>
                          {errors.orderTotal && (
                            <p className="text-xs text-red-500 mt-1">{errors.orderTotal}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending Test Emails...
                          </>
                        ) : (
                          <>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Test Emails
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={loadSampleData}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        Load Sample Data
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Results Section */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-4">
                {/* Email Result Card */}
                {emailResult && (
                  <Card
                    className={
                      emailResult.success
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    }
                  >
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {emailResult.success ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-green-900">Success</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <span className="text-red-900">Failed</span>
                          </>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm font-medium">{emailResult.message}</p>

                      {emailResult.sellerEmailSent !== undefined && (
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            {emailResult.sellerEmailSent ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span>
                              Seller Email:{" "}
                              <span
                                className={
                                  emailResult.sellerEmailSent
                                    ? "text-green-700 font-medium"
                                    : "text-red-700 font-medium"
                                }
                              >
                                {emailResult.sellerEmailSent ? "Sent" : "Failed"}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {emailResult.buyerEmailSent ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span>
                              Buyer Email:{" "}
                              <span
                                className={
                                  emailResult.buyerEmailSent
                                    ? "text-green-700 font-medium"
                                    : "text-red-700 font-medium"
                                }
                              >
                                {emailResult.buyerEmailSent ? "Sent" : "Failed"}
                              </span>
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Info Card */}
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold mb-2">ℹ️ How This Works</p>
                    <ul className="text-xs space-y-1">
                      <li>✓ No real payment processing</li>
                      <li>✓ No database mutations</li>
                      <li>✓ No orders are created</li>
                      <li>✓ Only tests email delivery</li>
                      <li>✓ Uses existing email functions</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                {/* Receipt Preview Toggle */}
                {emailResult?.success && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowReceipt(!showReceipt)}
                  >
                    {showReceipt ? (
                      <>
                        <EyeOff className="mr-2 h-4 w-4" />
                        Hide Receipt Preview
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Show Receipt Preview
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Receipt Preview Section */}
          {showReceipt && emailResult?.success && (
            <div className="mt-8">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">
                  Receipt Preview
                </h2>
                <Step4Confirmation
                  orderData={buildOrderConfirmation()}
                  onViewOrders={() => {}}
                  onContinueShopping={() => {}}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutEmailTest;
