import { EMAIL_STYLES, EMAIL_FOOTER, createEmailTemplate } from "@/email-templates/styles";

export interface OrderCollectionSellerData {
  sellerName: string;
  orderId: string;
  bookTitles: string[];
  trackingReference?: string;
}

export const createOrderCollectionSellerEmail = (
  data: OrderCollectionSellerData
): { subject: string; html: string; text: string } => {
  const subject = "📦 Order Collected Successfully - ReBooked Solutions";

  const html = createEmailTemplate(
    {
      title: "Order Collected",
      headerType: "default",
      headerText: "📦 Order Collected Successfully!"
    },
    `
    <p>Hello ${data.sellerName},</p>
    
    <p><strong>Great news!</strong> Your book(s) have been successfully collected and is now being shipped to the buyer.</p>
    
    <div class="info-box">
      <h3 style="margin-top: 0;">📚 Order Details</h3>
      <p><strong>Order ID:</strong> ${data.orderId}</p>
      <p><strong>Book(s):</strong> ${data.bookTitles.join(", ")}</p>
      ${data.trackingReference ? `<p><strong>Tracking Number:</strong> ${data.trackingReference}</p>` : ""}
    </div>
    
    <h3>✅ What's Next?</h3>
    <ul>
      <li>Your book(s) are in transit to the buyer</li>
      <li>Once the buyer receives and confirms delivery, your payment will be processed</li>
      <li>You'll receive a payment confirmation email</li>
      <li>Funds will be added to your wallet instantly</li>
    </ul>
    
    <div class="info-box-success">
      <h3 style="margin-top: 0; color: #10b981;">💰 Payment Status</h3>
      <p style="margin: 0;">Payment is pending buyer confirmation. You'll be notified as soon as it's processed.</p>
    </div>
    
    <h3>📊 Track This Order</h3>
    <p>You can check the status of this order and your payment status anytime in your seller dashboard.</p>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="https://rebookedsolutions.co.za/profile?tab=orders" class="btn">
        View Your Orders
      </a>
    </p>
    
    <p><strong>Questions?</strong> Contact us at <a href="mailto:support@rebookedsolutions.co.za" class="link">support@rebookedsolutions.co.za</a></p>
    
    <p>Thank you for selling with ReBooked Solutions! 📚</p>
    <p>Best regards,<br><strong>The ReBooked Solutions Team</strong></p>
    `
  );

  const text = `
Order Collected Successfully

Hello ${data.sellerName},

Great news! Your book(s) have been successfully collected and is now being shipped to the buyer.

ORDER DETAILS:
- Order ID: ${data.orderId}
- Book(s): ${data.bookTitles.join(", ")}
${data.trackingReference ? `- Tracking Number: ${data.trackingReference}` : ""}

WHAT'S NEXT?
- Your book(s) are in transit to the buyer
- Once the buyer receives and confirms delivery, your payment will be processed
- You'll receive a payment confirmation email
- Funds will be added to your wallet instantly

PAYMENT STATUS:
Payment is pending buyer confirmation. You'll be notified as soon as it's processed.

TRACK THIS ORDER:
You can check the status of this order and your payment status anytime in your seller dashboard.

View Your Orders: https://rebookedsolutions.co.za/profile?tab=orders

QUESTIONS?
Contact us at support@rebookedsolutions.co.za

Thank you for selling with ReBooked Solutions! 📚

Best regards,
The ReBooked Solutions Team

"Pre-Loved Pages, New Adventures"
  `;

  return { subject, html, text };
};

export const sendOrderCollectionSellerEmail = async (
  emailData: OrderCollectionSellerData,
  emailService: any
): Promise<void> => {
  const template = createOrderCollectionSellerEmail(emailData);

  try {
    await emailService.sendEmail({
      to: emailData.sellerName,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  } catch (error) {
    throw error;
  }
};
