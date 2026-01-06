// Central export point for all email templates and utilities
export { EMAIL_STYLES, EMAIL_FOOTER, createEmailTemplate, type EmailTemplate, type EmailTemplateData } from './styles';
export { EMAIL_TEMPLATES, getTemplateById, getTemplatesByCategory, getAllTemplateCategories } from './registry';

// Template modules
export { createWalletCreditNotificationEmail, sendWalletCreditNotificationEmail, type WalletCreditNotificationData } from './templates/wallet-credit-notification';
export { createSellerCreditNotificationEmail, sendSellerCreditNotificationEmail, type SellerCreditNotificationData } from './templates/seller-credit-notification';
export { createPendingCommitEmail, sendPendingCommitEmail, type PendingCommitEmailData } from './templates/pending-commit';
export { createDenialEmailTemplate, sendDenialEmail, type DenialEmailData } from './templates/denial';
