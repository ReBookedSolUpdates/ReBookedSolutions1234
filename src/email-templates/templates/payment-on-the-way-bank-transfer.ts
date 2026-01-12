import { EMAIL_STYLES, EMAIL_FOOTER } from "@/email-templates/styles";

export interface PaymentOnTheWayBankTransferData {
  sellerName: string;
  bookTitle: string;
  orderId: string;
}

export const createPaymentOnTheWayBankTransferEmail = (
  data: PaymentOnTheWayBankTransferData
): { subject: string; html: string; text: string } => {
  const subject = `Payment on the way — ReBooked Solutions`;

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
      <h1 style="margin:0;font-size:22px;">Payment on the Way</h1>
    </div>
    <div style="padding:20px;">
      <p>Hello ${data.sellerName},</p>
      <p>
        The buyer has confirmed delivery of <strong>${data.bookTitle}</strong>
        (Order ID: ${data.orderId.slice(-8)}). Your payment is now being processed.
      </p>
      <a href="https://rebookedsolutions.co.za/seller/orders/${data.orderId}" class="btn">
        View Order
      </a>
      <p class="footer-text">
        Keep sharing your <strong>ReBooked Mini</strong> — the more you share, the more chances to earn and receive updates like this!
      </p>
      <p class="footer-text">
        Follow us for updates and tips:
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

  const text = `Payment on the way\n\nHello ${data.sellerName},\n\nThe buyer has confirmed delivery of ${data.bookTitle} (Order ID: ${data.orderId.slice(-8)}). We will process your payment and notify you once released.\n\nView order: https://rebookedsolutions.co.za/seller/orders/${data.orderId}`;

  return { subject, html, text };
};

export const sendPaymentOnTheWayBankTransferEmail = async (
  emailData: PaymentOnTheWayBankTransferData,
  emailService: any
): Promise<void> => {
  const template = createPaymentOnTheWayBankTransferEmail(emailData);

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
