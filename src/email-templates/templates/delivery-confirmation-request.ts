import { EMAIL_STYLES, EMAIL_FOOTER } from "@/email-templates/styles";

export interface DeliveryConfirmationRequestData {
  buyerName: string;
  orderId: string;
  bookTitles: string[];
  deadlineDate: string;
}

export const createDeliveryConfirmationRequestEmail = (
  data: DeliveryConfirmationRequestData
): { subject: string; html: string; text: string } => {
  const subject = `Confirm your delivery — ReBooked Solutions`;

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
      <h1 style="margin:0;font-size:22px;">📦 Did You Receive Your Books?</h1>
    </div>
    <div style="padding:20px;">
      <p>Hello ${data.buyerName},</p>
      <p>
        We believe your order has been delivered. Please confirm that you've received your book(s):
      </p>
      <div style="margin: 20px 0; padding: 15px; background-color: #f3fef7; border-left: 4px solid #3ab26f; border-radius: 5px;">
        <strong>Order ID:</strong> ${data.orderId.slice(-8)}<br>
        <strong>Books:</strong> ${data.bookTitles.join(", ")}<br>
        <strong>Confirm by:</strong> ${data.deadlineDate}
      </div>
      
      <p><strong>Why we need this confirmation:</strong></p>
      <ul>
        <li>Confirms the seller's payment can be released</li>
        <li>Protects you and the seller</li>
        <li>Helps us maintain quality service</li>
      </ul>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://rebookedsolutions.co.za/orders/${data.orderId}?confirm=yes" class="btn" style="background-color: #10b981; margin-right: 10px;">
          Yes, I Received It
        </a>
        <a href="https://rebookedsolutions.co.za/orders/${data.orderId}?confirm=no" class="btn" style="background-color: #dc2626;">
          No, There's an Issue
        </a>
      </div>

      <div style="margin: 20px 0; padding: 15px; background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 5px;">
        <strong style="color: #92400e;">⏰ Important:</strong> You have until <strong>${data.deadlineDate}</strong> to confirm. If you don't respond, the order will be automatically confirmed.
      </div>

      <p class="footer-text">
        Questions? Contact us at
        <a href="mailto:support@rebookedsolutions.co.za" style="color:#3ab26f;">support@rebookedsolutions.co.za</a>.
      </p>
      <p class="slogan">"Pre-Loved Pages, New Adventure"</p>
      <p class="footer-text">— ReBooked Solutions</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `Confirm your delivery\n\nHello ${data.buyerName},\n\nWe believe your order has been delivered. Please confirm receipt:\n\nOrder ID: ${data.orderId.slice(-8)}\nBooks: ${data.bookTitles.join(", ")}\nConfirm by: ${data.deadlineDate}\n\nYes, I received it: https://rebookedsolutions.co.za/orders/${data.orderId}?confirm=yes\nNo, there's an issue: https://rebookedsolutions.co.za/orders/${data.orderId}?confirm=no\n\n— ReBooked Solutions`;

  return { subject, html, text };
};

export const sendDeliveryConfirmationRequestEmail = async (
  emailData: DeliveryConfirmationRequestData,
  emailService: any
): Promise<void> => {
  const template = createDeliveryConfirmationRequestEmail(emailData);

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
