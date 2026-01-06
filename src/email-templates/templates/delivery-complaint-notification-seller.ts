import { EMAIL_STYLES, EMAIL_FOOTER } from "@/email-templates/styles";

export interface DeliveryComplaintNotificationSellerData {
  sellerName: string;
  orderId: string;
  bookTitle: string;
  buyerName: string;
  feedback: string;
}

export const createDeliveryComplaintNotificationSellerEmail = (
  data: DeliveryComplaintNotificationSellerData
): { subject: string; html: string; text: string } => {
  const subject = `Issue finalising order — ReBooked Solutions`;

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
      <h1 style="margin:0;font-size:22px;">Issue Finalising Order</h1>
    </div>
    <div style="padding:20px;">
      <p>Hello ${data.sellerName},</p>
      <p>
        We encountered an issue while finalising Order ID: <strong>${data.orderId.slice(-8)}</strong> for <strong>${data.bookTitle}</strong>.
        Our team is investigating and may contact you for more information.
      </p>
      <a href="https://rebookedsolutions.co.za/seller/orders/${data.orderId}" class="btn">
        View Order
      </a>
      <p class="footer-text">
        Follow us for updates:
      </p>
      <div class="social-links">
        <a href="https://www.instagram.com/rebooked.solutions?igsh=M2ZsNjd2aTNmZmRh">Instagram</a>
        <a href="https://www.facebook.com/people/Rebooked-Solutions/61577195802238/?mibextid=wwXIfr&rdid=zzSy70C45G7ABaBF&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F16ngKMps6U%2F%3Fmibextid%3DwwXIfr">Facebook</a>
        <a href="https://www.tiktok.com/@rebooked.solution">TikTok</a>
        <a href="https://x.com/RebookedSol">X (Twitter)</a>
      </div>
      <p class="footer-text">
        If you need any help, email us at
        <a href="mailto:support@rebookedsolutions.co.za" style="color:#3ab26f;">support@rebookedsolutions.co.za</a>.
      </p>
      <p class="slogan">"Pre-Loved Pages, New Adventure"</p>
      <p class="footer-text">— ReBooked Solutions</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `Issue finalising order\n\nHello ${data.sellerName},\n\nWe encountered an issue while finalising Order ID: ${data.orderId.slice(-8)} for ${data.bookTitle}. Our team is investigating and may contact you for more information.\n\nView order: https://rebookedsolutions.co.za/seller/orders/${data.orderId}`;

  return { subject, html, text };
};

export const sendDeliveryComplaintNotificationSellerEmail = async (
  emailData: DeliveryComplaintNotificationSellerData,
  emailService: any
): Promise<void> => {
  const template = createDeliveryComplaintNotificationSellerEmail(emailData);

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
