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

### 1. **Wallet Credit Notification**
- **File**: `templates/wallet-credit-notification.ts`
- **Purpose**: Notify seller when payment is added to their wallet
- **Recipient**: Seller
- **Use Case**: After successful delivery and payment processing

### 2. **Seller Credit Notification**
- **File**: `templates/seller-credit-notification.ts`
- **Purpose**: Alternative notification for seller payment confirmation
- **Recipient**: Seller
- **Use Case**: Payment confirmation and wallet updates

### 3. **Pending Commit Email**
- **File**: `templates/pending-commit.ts`
- **Purpose**: Urgent reminder for seller to confirm/commit to sale
- **Recipient**: Seller
- **Use Case**: After purchase, seller has 48 hours to confirm
- **Key**: Includes deadline warning

### 4. **Denial Email**
- **File**: `templates/denial.ts`
- **Purpose**: Notify seller of delivery issues causing payment delays
- **Recipient**: Seller
- **Use Case**: When there are issues with order delivery

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
