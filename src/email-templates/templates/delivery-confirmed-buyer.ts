import { EMAIL_STYLES, EMAIL_FOOTER } from "@/email-templates/styles";

export interface DeliveryConfirmedBuyerData {
  buyerName: string;
  bookTitle: string;
  orderId: string;
}

export const createDeliveryConfirmedBuyerEmail = (
  data: DeliveryConfirmedBuyerData
): { subject: string; html: string; text: string } => {
  const subject = `Thank you — Order Received`;

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
      <h1 style="margin:0;font-size:22px;">Thank you — Order Received</h1>
    </div>
    <div style="padding:20px;">
      <p>Hello ${data.buyerName},</p>
      <p>
        Thanks for shopping with us! We hope you enjoy <strong>${data.bookTitle}</strong>.
      </p>
      <p>
        When you're done with it, you can list it on ReBooked Solutions and make your money back.
        Buy smart, sell smart — keep the cycle going. ♻️
      </p>
      <a href="https://rebookedsolutions.co.za/orders/${data.orderId}" class="btn">
        View Your Order
      </a>
      <p class="footer-text">
        Follow us & stay updated:
      </p>
      <div class="social-links">
        <a href="https://www.instagram.com/rebooked.solutions?igsh=M2ZsNjd2aTNmZmRh">Instagram</a>
        <a href="https://www.facebook.com/people/Rebooked-Solutions/61577195802238/?mibextid=wwXIfr&rdid=zzSy70C45G7ABaBF&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F16ngKMps6U%2F%3Fmibextid%3DwwXIfr">Facebook</a>
        <a href="https://www.tiktok.com/@rebooked.solution">TikTok</a>
        <a href="https://x.com/RebookedSol">X (Twitter)</a>
      </div>
      <p class="footer-text">
        If you need any assistance, feel free to email us at
        <a href="mailto:support@rebookedsolutions.co.za" style="color:#3ab26f;">support@rebookedsolutions.co.za</a>.
      </p>
      <p class="footer-text">
        Share ReBooked with your friends & family so they can save too.
        Together we make textbooks affordable.
      </p>
      <p class="slogan">"Pre-Loved Pages, New Adventure"</p>
      <p class="footer-text">— ReBooked Solutions</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `Thank you — Order Received\n\nHello ${data.buyerName},\n\nThanks for confirming receipt of ${data.bookTitle}. We will release payment to the seller shortly.\n\nView order: https://rebookedsolutions.co.za/orders/${data.orderId}\n\n— ReBooked Solutions`;

  return { subject, html, text };
};

export const sendDeliveryConfirmedBuyerEmail = async (
  emailData: DeliveryConfirmedBuyerData,
  emailService: any
): Promise<void> => {
  const template = createDeliveryConfirmedBuyerEmail(emailData);

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
