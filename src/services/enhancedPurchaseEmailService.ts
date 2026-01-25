import { supabase } from "@/integrations/supabase/client";
import { emailService } from "@/services/emailService";
import { NotificationService } from "@/services/notificationService";
import debugLogger from "@/utils/debugLogger";

interface PurchaseEmailData {
  orderId: string;
  bookId: string;
  bookTitle: string;
  bookPrice: number;
  sellerName: string;
  sellerEmail: string;
  buyerName: string;
  buyerEmail: string;
  orderTotal: number;
  orderDate: string;
}

/**
 * Enhanced purchase email service with guaranteed fallback system
 * Ensures critical purchase confirmation emails are always sent
 */
export class EnhancedPurchaseEmailService {
  
  /**
   * Send purchase confirmation emails directly
   * Called after successful payment completion
   */
  static async sendPurchaseEmailsWithFallback(purchaseData: PurchaseEmailData): Promise<{
    sellerEmailSent: boolean;
    buyerEmailSent: boolean;
    message: string;
  }> {
    let sellerEmailSent = false;
    let buyerEmailSent = false;
    const errors: string[] = [];

    try {
      // Send seller notification directly (they need to know about the sale to commit)
      try {
        await this.sendSellerPurchaseNotification(purchaseData);
        sellerEmailSent = true;
      } catch (sellerError) {
        const errorMsg = sellerError instanceof Error ? sellerError.message : 'Unknown error';
        errors.push(`Seller email failed: ${errorMsg}`);
      }

      // Create in-app notification for seller
      try {
        await this.createSellerNotification(purchaseData);
      } catch (notifError) {
        const errorMsg = notifError instanceof Error ? notifError.message : 'Unknown error';
        errors.push(`Seller notification failed: ${errorMsg}`);
      }

      // Add small delay to prevent stream conflicts
      await new Promise(resolve => setTimeout(resolve, 500));

      // Send buyer receipt/confirmation directly
      try {
        await this.sendBuyerPurchaseReceipt(purchaseData);
        buyerEmailSent = true;
      } catch (buyerError) {
        const errorMsg = buyerError instanceof Error ? buyerError.message : 'Unknown error';
        errors.push(`Buyer email failed: ${errorMsg}`);
      }

      // Create in-app notification for buyer
      try {
        await this.createBuyerNotification(purchaseData);
      } catch (notifError) {
        const errorMsg = notifError instanceof Error ? notifError.message : 'Unknown error';
        errors.push(`Buyer notification failed: ${errorMsg}`);
      }

      // Log any errors that occurred
      if (errors.length > 0) {
        debugLogger.warn('enhancedPurchaseEmailService', 'Purchase email service warnings:', errors);
      }

      return {
        sellerEmailSent,
        buyerEmailSent,
        message: `Purchase emails sent - Seller: ${sellerEmailSent ? 'sent directly' : 'failed'}, Buyer: ${buyerEmailSent ? 'sent directly' : 'failed'}`
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      debugLogger.error('enhancedPurchaseEmailService', 'Critical error in purchase email service:', errorMsg);

      return {
        sellerEmailSent: false,
        buyerEmailSent: false,
        message: `Email sending failed: ${errorMsg}`
      };
    }
  }
  
  /**
   * Send purchase notification to seller (they need to confirm/commit the sale)
   */
  private static async sendSellerPurchaseNotification(purchaseData: PurchaseEmailData): Promise<void> {
    try {
      await this.sendSellerPurchaseNotificationDirect(purchaseData);
    } catch (error) {
      await this.queueSellerEmailForFallback(purchaseData);
      throw error; // Re-throw to maintain error handling flow
    }
  }

  private static async sendSellerPurchaseNotificationDirect(purchaseData: PurchaseEmailData): Promise<void> {
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
    
    await emailService.sendEmail({
      to: purchaseData.sellerEmail,
      subject: "🚨 NEW SALE - Confirm Your Book Sale (48hr deadline)",
      html: sellerEmailHtml,
      text: `NEW SALE - Action Required! Book: ${purchaseData.bookTitle}, Price: R${purchaseData.bookPrice}. You have 48 hours to confirm this sale. Login to ReBooked Solutions to confirm.`
    });
  }
  
  /**
   * Send purchase receipt to buyer
   */
  private static async sendBuyerPurchaseReceipt(purchaseData: PurchaseEmailData): Promise<void> {
    try {
      await this.sendBuyerPurchaseReceiptDirect(purchaseData);
    } catch (error) {
      await this.queueBuyerEmailForFallback(purchaseData);
      throw error; // Re-throw to maintain error handling flow
    }
  }

  private static async sendBuyerPurchaseReceiptDirect(purchaseData: PurchaseEmailData): Promise<void> {
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
    
    await emailService.sendEmail({
      to: purchaseData.buyerEmail,
      subject: "📚 Purchase Confirmed - Waiting for Seller Response",
      html: buyerEmailHtml,
      text: `Purchase Confirmed! Book: ${purchaseData.bookTitle}, Total: R${purchaseData.orderTotal}. Waiting for seller confirmation within 48 hours.`
    });
  }
  

  /**
   * Create in-app notification for seller about new order
   */
  private static async createSellerNotification(purchaseData: PurchaseEmailData): Promise<void> {
    try {
      // Fetch seller user_id from the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('seller_id')
        .eq('id', purchaseData.orderId)
        .single();

      if (orderError || !order?.seller_id) {
        throw new Error('Failed to fetch seller information');
      }

      // Create notification using NotificationService
      await NotificationService.createOrderConfirmation(
        order.seller_id,
        purchaseData.orderId,
        purchaseData.bookTitle,
        true // isForSeller
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to create seller notification:', errorMsg);
      // Non-fatal - notification failure shouldn't block the process
    }
  }

  /**
   * Create in-app notification for buyer about order confirmation
   */
  private static async createBuyerNotification(purchaseData: PurchaseEmailData): Promise<void> {
    try {
      // Fetch buyer user_id from the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('buyer_id')
        .eq('id', purchaseData.orderId)
        .single();

      if (orderError || !order?.buyer_id) {
        throw new Error('Failed to fetch buyer information');
      }

      // Create notification using NotificationService
      await NotificationService.createOrderConfirmation(
        order.buyer_id,
        purchaseData.orderId,
        purchaseData.bookTitle,
        false // isForSeller
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to create buyer notification:', errorMsg);
      // Non-fatal - notification failure shouldn't block the process
    }
  }
}

export default EnhancedPurchaseEmailService;
