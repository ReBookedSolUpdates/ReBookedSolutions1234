import { EMAIL_STYLES, EMAIL_FOOTER, createEmailTemplate } from "@/email-templates/styles";

export interface OrderCollectionBuyerData {
  buyerName: string;
  orderId: string;
  bookTitles: string[];
  trackingReference?: string;
}

export const createOrderCollectionBuyerEmail = (
  data: OrderCollectionBuyerData
): { subject: string; html: string; text: string } => {
  const subject = "📦 Your Order is on the Way! - ReBooked Solutions";

  const html = createEmailTemplate(
    {
      title: "Order Collected and Shipping",
      headerType: "default",
      headerText: "📦 Your Order is on the Way!"
    },
    `
    <p>Hello ${data.buyerName},</p>
    
    <p><strong>Exciting news!</strong> Your order has been collected and is now being shipped to you.</p>
    
    <div class="info-box">
      <h3 style="margin-top: 0;">📚 Order Details</h3>
      <p><strong>Order ID:</strong> ${data.orderId}</p>
      <p><strong>Book(s):</strong> ${data.bookTitles.join(", ")}</p>
      ${data.trackingReference ? `<p><strong>Tracking Number:</strong> ${data.trackingReference}</p>` : ""}
    </div>
    
    <h3>📍 Tracking Your Shipment</h3>
    <p>${data.trackingReference 
      ? `Use the tracking number <strong>${data.trackingReference}</strong> to monitor your package's progress in real-time.` 
      : "Tracking information will be provided soon."
    }</p>
    
    <div class="info-box-success">
      <h3 style="margin-top: 0; color: #10b981;">✅ Status</h3>
      <p style="margin: 0;"><strong>Collected:</strong> Your book(s) have been safely collected from the seller and handed to our delivery partner.</p>
    </div>
    
    <h3>⏰ Expected Delivery</h3>
    <p>Your book(s) should arrive within 2-3 business days. You'll receive another notification once delivery is complete.</p>
    
    <h3>📋 What to Do Upon Delivery</h3>
    <ul>
      <li>Check that all books are in the condition described</li>
      <li>Verify that all items match your order</li>
      <li>If there are any issues, contact our support team immediately</li>
      <li>Confirm receipt to complete the transaction</li>
    </ul>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="https://rebookedsolutions.co.za/profile?tab=orders" class="btn">
        Track Your Shipment
      </a>
    </p>
    
    <p><strong>Questions?</strong> Contact us at <a href="mailto:support@rebookedsolutions.co.za" class="link">support@rebookedsolutions.co.za</a></p>
    
    <p>Thank you for shopping with ReBooked Solutions! Happy reading! 📖</p>
    <p>Best regards,<br><strong>The ReBooked Solutions Team</strong></p>
    `
  );

  const text = `
Your Order is on the Way!

Hello ${data.buyerName},

Exciting news! Your order has been collected and is now being shipped to you.

ORDER DETAILS:
- Order ID: ${data.orderId}
- Book(s): ${data.bookTitles.join(", ")}
${data.trackingReference ? `- Tracking Number: ${data.trackingReference}` : ""}

TRACKING YOUR SHIPMENT:
${data.trackingReference 
  ? `Use the tracking number ${data.trackingReference} to monitor your package's progress in real-time.`
  : "Tracking information will be provided soon."
}

STATUS:
Your book(s) have been safely collected from the seller and handed to our delivery partner.

EXPECTED DELIVERY:
Your book(s) should arrive within 2-3 business days. You'll receive another notification once delivery is complete.

WHAT TO DO UPON DELIVERY:
- Check that all books are in the condition described
- Verify that all items match your order
- If there are any issues, contact our support team immediately
- Confirm receipt to complete the transaction

Track Your Shipment: https://rebookedsolutions.co.za/profile?tab=orders

QUESTIONS?
Contact us at support@rebookedsolutions.co.za

Thank you for shopping with ReBooked Solutions! Happy reading! 📖

Best regards,
The ReBooked Solutions Team

"Pre-Loved Pages, New Adventures"
  `;

  return { subject, html, text };
};

export const sendOrderCollectionBuyerEmail = async (
  emailData: OrderCollectionBuyerData,
  emailService: any
): Promise<void> => {
  const template = createOrderCollectionBuyerEmail(emailData);

  try {
    await emailService.sendEmail({
      to: emailData.buyerName,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  } catch (error) {
    throw error;
  }
};
