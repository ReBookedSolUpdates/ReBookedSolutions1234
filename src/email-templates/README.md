# Email Templates - Centralized Folder

All email templates for ReBooked Solutions are now consolidated under this single folder for better organization and maintainability.

## 📁 Folder Structure

```
src/email-templates/
├── styles.ts                    # Centralized email styling and utilities
├── registry.ts                  # All available email templates registry
├── index.ts                     # Central export point
├── templates/
│   ├── wallet-credit-notification.ts    # Wallet payment notifications
│   ├── seller-credit-notification.ts    # Seller payment notifications
│   ├── pending-commit.ts                # Seller action required (48hr deadline)
│   └── denial.ts                        # Payment delay notifications
└── README.md                    # This file
```

## 🎯 Usage

### Importing Templates

```typescript
// Import styles and utilities
import { EMAIL_STYLES, EMAIL_FOOTER, createEmailTemplate } from '@/email-templates';

// Import specific templates
import { 
  createWalletCreditNotificationEmail,
  createSellerCreditNotificationEmail,
  createPendingCommitEmail,
  createDenialEmailTemplate
} from '@/email-templates';

// Import registry for all templates
import { EMAIL_TEMPLATES, getTemplateById, getTemplatesByCategory } from '@/email-templates';
```

### Creating an Email

```typescript
const emailData = {
  sellerName: "John Seller",
  bookTitle: "Python Basics",
  bookPrice: 250.00,
  creditAmount: 225.00,
  orderId: "ORD-12345",
  newBalance: 500.00
};

const email = createWalletCreditNotificationEmail(emailData);
// Returns: { subject, html, text }

await emailService.sendEmail({
  to: sellerEmail,
  subject: email.subject,
  html: email.html,
  text: email.text
});
```

## 📧 Available Templates

### **Order Management Templates**

#### 1. **Pending Commit Email** (Seller Action Required)
- **File**: `templates/pending-commit.ts`
- **Purpose**: Urgent reminder for seller to confirm/commit to sale within 48 hours
- **Recipient**: Seller
- **Use Case**: After buyer purchases, seller must confirm within 48 hours
- **Includes**: Deadline warning, earnings breakdown, action link

#### 2. **Order Confirmed - Buyer** (Book on the Way)
- **File**: `templates/order-confirmed-buyer.ts`
- **Purpose**: Notify buyer that seller has confirmed and book is on the way
- **Recipient**: Buyer
- **Use Case**: When seller commits to sale and prepares for pickup
- **Includes**: Order details, delivery method, tracking info

#### 3. **Order Confirmed - Seller** (Prepare for Pickup)
- **File**: `templates/order-confirmed-seller.ts`
- **Purpose**: Confirm seller commitment and ask to prepare for pickup
- **Recipient**: Seller
- **Use Case**: After seller commits to order
- **Includes**: Pickup instructions, payment confirmation timeline

#### 4. **Order Declined - Buyer** (Refund Processed)
- **File**: `templates/order-declined-buyer.ts`
- **Purpose**: Notify buyer when seller declines and refund is processed
- **Recipient**: Buyer
- **Use Case**: When seller declines to commit to sale
- **Includes**: Refund status, order details, next steps

#### 5. **Order Declined - Seller** (Confirmation)
- **File**: `templates/order-declined-seller.ts`
- **Purpose**: Confirm seller's decline of order
- **Recipient**: Seller
- **Use Case**: After seller declines commitment
- **Includes**: Stock restoration confirmation, next steps

#### 6. **Order Collection - Buyer** (Tracking Info)
- **File**: `templates/order-collection-buyer.ts`
- **Purpose**: Notify buyer that order has been collected and is shipping
- **Recipient**: Buyer
- **Use Case**: When courier collects book from seller
- **Includes**: Tracking number, expected delivery date

#### 7. **Order Collection - Seller** (Confirmation)
- **File**: `templates/order-collection-seller.ts`
- **Purpose**: Confirm that order has been collected
- **Recipient**: Seller
- **Use Case**: After courier collects book from seller
- **Includes**: Payment status, tracking reference

### **Payment & Notification Templates**

#### 8. **Wallet Credit Notification**
- **File**: `templates/wallet-credit-notification.ts`
- **Purpose**: Notify seller when payment is added to their wallet
- **Recipient**: Seller
- **Use Case**: After successful delivery and payment processing
- **Includes**: Transaction details, new balance, payout options

#### 9. **Seller Credit Notification**
- **File**: `templates/seller-credit-notification.ts`
- **Purpose**: Alternative notification for seller payment confirmation
- **Recipient**: Seller
- **Use Case**: Payment confirmation and wallet updates
- **Includes**: Credit amount, transaction details, next steps

#### 10. **Denial Email** (Payment Delayed)
- **File**: `templates/denial.ts`
- **Purpose**: Notify seller of delivery issues causing payment delays
- **Recipient**: Seller
- **Use Case**: When there are issues with order delivery
- **Includes**: Issue explanation, what happens next, investigation timeline

## 🎨 Styling

All templates use centralized styles defined in `styles.ts`:

- **Colors**: Green (#3ab26f) for success, Red (#dc2626) for errors, Yellow (#f59e0b) for warnings
- **Components**: Info boxes, buttons, timeline steps, headers, footers
- **Responsive**: Mobile-friendly HTML emails

## 🔧 Adding New Templates

To add a new email template:

1. Create a new file in `templates/` folder
2. Define the data interface
3. Create the template function
4. Export from `index.ts`
5. Add to registry in `registry.ts` if needed

Example structure:
```typescript
// templates/new-template.ts
export interface NewEmailData {
  recipientName: string;
  // ... other fields
}

export const createNewEmail = (data: NewEmailData) => {
  const subject = "...";
  const html = `...`;
  const text = `...`;
  return { subject, html, text };
};
```

## 📝 Best Practices

1. **Always use centralized styles** - Import and use `EMAIL_STYLES` and `EMAIL_FOOTER`
2. **Include both HTML and text** - Ensure email works in all clients
3. **Use `createEmailTemplate()`** - Maintains consistent structure across all emails
4. **Test before sending** - Use the testing utilities in the codebase
5. **Keep templates simple** - Don't mix logic with templates

## 🔄 Migration Complete ✅

All email templates have been consolidated into the `src/email-templates/` folder. Legacy template files from `src/utils/emailTemplates/` have been removed:
- ❌ Removed: `src/utils/emailTemplates/denialEmailTemplate.ts`
- ❌ Removed: `src/utils/emailTemplates/pendingCommitTemplate.ts`
- ❌ Removed: `src/utils/emailTemplates/sellerCreditNotificationTemplate.ts`
- ❌ Removed: `src/utils/emailTemplates/walletCreditNotificationTemplate.ts`

**All imports should now use the canonical location:**
- ✅ `@/email-templates` (primary location)
- ✅ `@/email-templates/templates/*` (for direct template imports)

## 📚 References

- **Email Service**: `src/services/emailService.ts`
- **Enhanced Email Service**: `src/services/enhancedPurchaseEmailService.ts`
- **Sending Emails**: Examples in various components and services

---

**Last Updated**: January 2025
**Maintained by**: ReBooked Solutions Team
