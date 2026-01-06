import { EMAIL_STYLES, EMAIL_FOOTER } from "@/email-templates/styles";

export interface SellerWaitingForDeliveryConfirmationData {
  sellerName: string;
  orderId: string;
  bookTitles: string[];
  deadlineDate: string;
}

export const createSellerWaitingForDeliveryConfirmationEmail = (
  data: SellerWaitingForDeliveryConfirmationData
): { subject: string; html: string; text: string } => {
  const subject = `Waiting for buyer confirmation — ReBooked Solutions`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
  ${EMAIL_STYLES}
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0;font-size:22px;">⏳ Awaiting Buyer Confirmation</h1>
    </div>
    <div style="padding:20px;">
      <p>Hello ${data.sellerName},</p>
      <p>
        Your book(s) have been delivered! We're now waiting for the buyer to confirm receipt.
      </p>
      <div style="margin: 20px 0; padding: 15px; background-color: #f3fef7; border-left: 4px solid #3ab26f; border-radius: 5px;">
        <strong>Order ID:</strong> ${data.orderId.slice(-8)}<br>
        <strong>Books:</strong> ${data.bookTitles.join(", ")}<br>
        <strong>Buyer Confirmation Deadline:</strong> ${data.deadlineDate}
      </div>
      
      <div style="margin: 20px 0; padding: 15px; background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 5px;">
        <strong style="color: #166534;">✅ Payment Status:</strong> Once the buyer confirms delivery, your payment will be released to your account within 1-2 business days.
      </div>

      <p><strong>What happens next:</strong></p>
      <ol>
        <li>Buyer has until <strong>${data.deadlineDate}</strong> to confirm receipt</li>
        <li>If they confirm, your payment is released immediately</li>
        <li>If they don't confirm within 48 hours, the order auto-confirms and payment is released</li>
        <li>You'll receive an email notification once payment is processed</li>
      </ol>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://rebookedsolutions.co.za/seller/orders/${data.orderId}" class="btn">
          View Order Details
        </a>
      </div>

      <p class="footer-text">
        Thank you for using ReBooked Solutions! If you have any questions, contact us at
        <a href="mailto:support@rebookedsolutions.co.za" style="color:#3ab26f;">support@rebookedsolutions.co.za</a>.
      </p>
      <p class="slogan">"Pre-Loved Pages, New Adventure"</p>
      <p class="footer-text">— ReBooked Solutions</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `Waiting for buyer confirmation\n\nHello ${data.sellerName},\n\nYour book(s) have been delivered and we're awaiting buyer confirmation.\n\nOrder ID: ${data.orderId.slice(-8)}\nBooks: ${data.bookTitles.join(", ")}\nBuyer confirmation deadline: ${data.deadlineDate}\n\nOnce confirmed, your payment will be released within 1-2 business days.\n\nView order: https://rebookedsolutions.co.za/seller/orders/${data.orderId}\n\n— ReBooked Solutions`;

  return { subject, html, text };
};

export const sendSellerWaitingForDeliveryConfirmationEmail = async (
  emailData: SellerWaitingForDeliveryConfirmationData,
  emailService: any
): Promise<void> => {
  const template = createSellerWaitingForDeliveryConfirmationEmail(emailData);

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
