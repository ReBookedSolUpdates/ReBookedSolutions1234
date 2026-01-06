// Banking configuration and utilities

export const SA_BANKS = [
  "Absa Bank",
  "Capitec Bank",
  "First National Bank (FNB)",
  "Nedbank",
  "Standard Bank",
  "Investec Bank",
  "Johannesburg Consolidation Services",
  "HSBC Bank",
  "Postbank",
  "Tyme Bank",
  "African Bank",
  "Bidvest Bank",
] as const;

type SouthAfricanBankName = (typeof SA_BANKS)[number];

const BANK_CODES: Record<SouthAfricanBankName, string> = {
  "Absa Bank": "632005",
  "Capitec Bank": "470010",
  "First National Bank (FNB)": "250655",
  "Nedbank": "198765",
  "Standard Bank": "051001",
  "Investec Bank": "100009",
  "Johannesburg Consolidation Services": "079005",
  "HSBC Bank": "404140",
  "Postbank": "100050",
  "Tyme Bank": "143631",
  "African Bank": "050390",
  "Bidvest Bank": "449990",
};

/**
 * Get bank code for a given South African bank name
 */
export const getBankCode = (bankName: SouthAfricanBankName): string => {
  return BANK_CODES[bankName] || "";
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate South African account number (9-11 digits)
 */
export const isValidAccountNumber = (accountNumber: string): boolean => {
  const cleaned = accountNumber.replace(/\s/g, "");
  return /^\d{9,11}$/.test(cleaned);
};
