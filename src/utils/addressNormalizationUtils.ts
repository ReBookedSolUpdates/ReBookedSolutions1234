/**
 * Address Normalization Utility
 * 
 * Single source of truth for:
 * - Province code ↔ full name mapping
 * - Field name normalization (camelCase ↔ snake_case)
 * - Address validation
 * - Province code normalization
 * 
 * All address operations should normalize through these functions to ensure consistency
 */

// South African provinces with both codes and full names
export const PROVINCE_MAPPING = {
  EC: "Eastern Cape",
  FS: "Free State",
  GP: "Gauteng",
  KZN: "KwaZulu-Natal",
  LP: "Limpopo",
  MP: "Mpumalanga",
  NC: "Northern Cape",
  NW: "North West",
  WC: "Western Cape",
};

// Reverse mapping: full name → code
export const PROVINCE_CODE_MAPPING: Record<string, string> = Object.entries(
  PROVINCE_MAPPING
).reduce((acc, [code, name]) => {
  acc[name] = code;
  acc[name.toLowerCase()] = code;
  return acc;
}, {} as Record<string, string>);

// Common abbreviations and alternate names → standard code
const PROVINCE_ALIASES: Record<string, string> = {
  gau: "GP",
  gauteng: "GP",
  "kwazulu-natal": "KZN",
  kwazulu: "KZN",
  kzn: "KZN",
  "western cape": "WC",
  "wc": "WC",
  "free state": "FS",
  fs: "FS",
  limpopo: "LP",
  lp: "LP",
  mpumalanga: "MP",
  mp: "MP",
  "northern cape": "NC",
  nc: "NC",
  "north west": "NW",
  nw: "NW",
  "eastern cape": "EC",
  ec: "EC",
  // Alternate formats
  "kwa-zulu natal": "KZN",
  "kwazulu natal": "KZN",
};

/**
 * Canonical Address shape used internally
 * All services and components should normalize to/from this shape
 */
export interface CanonicalAddress {
  street: string;
  city: string;
  province: string; // Full name (e.g., "Gauteng")
  provinceCode?: string; // 2-letter code (e.g., "GP")
  postalCode: string;
  country?: string;
  phone?: string;
  additionalInfo?: string;
}

/**
 * Raw address shape that might come from various sources
 * (form inputs, API responses, encrypted payloads, etc.)
 */
export interface RawAddress {
  [key: string]: any;
  // Common variations
  street?: string;
  streetAddress?: string;
  street_address?: string;
  city?: string;
  province?: string;
  state?: string;
  provinceCode?: string;
  province_code?: string;
  postalCode?: string;
  postal_code?: string;
  zip?: string;
  country?: string;
  phone?: string;
  additionalInfo?: string;
  additional_info?: string;
  formattedAddress?: string;
}

/**
 * Normalize province name or code to canonical full name
 * Handles various formats: "Gauteng", "GP", "gau", "GAU", etc.
 * 
 * @param provinceInput - Province name, code, or alias
 * @returns Full province name (e.g., "Gauteng") or null if invalid
 */
export function normalizeProvinceName(
  provinceInput: string | null | undefined
): string | null {
  if (!provinceInput) return null;

  const trimmed = provinceInput.trim();

  // Check if it's already a full name
  if (PROVINCE_CODE_MAPPING[trimmed]) {
    return PROVINCE_MAPPING[PROVINCE_CODE_MAPPING[trimmed] as keyof typeof PROVINCE_MAPPING];
  }

  // Check aliases (handles lowercase and alternate names)
  const alias = PROVINCE_ALIASES[trimmed.toLowerCase()];
  if (alias) {
    return PROVINCE_MAPPING[alias as keyof typeof PROVINCE_MAPPING];
  }

  // Check if it's a valid code (case-insensitive)
  const code = trimmed.toUpperCase();
  if (PROVINCE_MAPPING[code as keyof typeof PROVINCE_MAPPING]) {
    return PROVINCE_MAPPING[code as keyof typeof PROVINCE_MAPPING];
  }

  return null;
}

/**
 * Normalize province input to 2-letter code
 * 
 * @param provinceInput - Province name, code, or alias
 * @returns 2-letter province code (e.g., "GP") or null if invalid
 */
export function normalizeProvinceCode(
  provinceInput: string | null | undefined
): string | null {
  if (!provinceInput) return null;

  const trimmed = provinceInput.trim();

  // Check aliases first (handles all variations)
  const alias = PROVINCE_ALIASES[trimmed.toLowerCase()];
  if (alias) return alias;

  // Check if it's a full name
  const code = PROVINCE_CODE_MAPPING[trimmed];
  if (code) return code;

  // Check if it's already a code (case-insensitive)
  const upperCode = trimmed.toUpperCase();
  if (PROVINCE_MAPPING[upperCode as keyof typeof PROVINCE_MAPPING]) {
    return upperCode;
  }

  return null;
}

/**
 * Validate postal code is 4 digits (South African format)
 * 
 * @param postalCode - Postal code to validate
 * @returns true if valid 4-digit postal code
 */
export function validatePostalCode(
  postalCode: string | null | undefined
): boolean {
  if (!postalCode) return false;
  const trimmed = postalCode.trim();
  return /^\d{4}$/.test(trimmed);
}

/**
 * Validate that a postal code is 4 digits and return error message if invalid
 * 
 * @param postalCode - Postal code to validate
 * @returns null if valid, error message if invalid
 */
export function getPostalCodeError(
  postalCode: string | null | undefined
): string | null {
  if (!postalCode) {
    return "Postal code is required";
  }
  if (!validatePostalCode(postalCode)) {
    return "Postal code must be 4 digits (e.g., 1234)";
  }
  return null;
}

/**
 * Normalize a raw address object to canonical form
 * Handles field name variations and normalizes province/postal code
 * 
 * @param rawAddress - Address object with any field naming conventions
 * @returns Normalized canonical address or null if required fields missing
 */
export function normalizeAddressFields(
  rawAddress: RawAddress | null | undefined
): CanonicalAddress | null {
  if (!rawAddress || typeof rawAddress !== "object") {
    return null;
  }

  // Extract and normalize street (try all variations)
  const street = (
    rawAddress.street ||
    rawAddress.streetAddress ||
    rawAddress.street_address ||
    ""
  ).trim();

  if (!street) {
    return null; // Street is required
  }

  // Extract and normalize city
  const city = (rawAddress.city || "").trim();
  if (!city) {
    return null; // City is required
  }

  // Extract and normalize province
  const provinceInput =
    rawAddress.province || rawAddress.state || rawAddress.province_code || "";
  const normalizedProvince = normalizeProvinceName(provinceInput);
  const normalizedProvinceCode = normalizeProvinceCode(provinceInput);

  if (!normalizedProvince || !normalizedProvinceCode) {
    return null; // Invalid province
  }

  // Extract and normalize postal code
  const postalCodeInput =
    rawAddress.postalCode ||
    rawAddress.postal_code ||
    rawAddress.zip ||
    "";
  const postalCode = postalCodeInput.trim();

  if (!validatePostalCode(postalCode)) {
    return null; // Invalid postal code
  }

  // Extract optional fields
  const country =
    (rawAddress.country || "South Africa").trim() || "South Africa";
  const phone = (rawAddress.phone || "").trim() || undefined;
  const additionalInfo =
    (rawAddress.additionalInfo || rawAddress.additional_info || "").trim() ||
    undefined;

  return {
    street,
    city,
    province: normalizedProvince,
    provinceCode: normalizedProvinceCode,
    postalCode,
    country,
    phone: phone || undefined,
    additionalInfo,
  };
}

/**
 * Validate address structure - check all required fields are present and valid
 * Returns array of error messages (empty array = valid)
 * 
 * @param address - Address object to validate
 * @returns Array of error messages (empty if valid)
 */
export function validateAddressStructure(
  address: RawAddress | null | undefined
): string[] {
  const errors: string[] = [];

  if (!address || typeof address !== "object") {
    return ["Address is required"];
  }

  // Check street
  const street = (
    address.street ||
    address.streetAddress ||
    address.street_address ||
    ""
  ).trim();
  if (!street) {
    errors.push("Street address is required");
  }

  // Check city
  const city = (address.city || "").trim();
  if (!city) {
    errors.push("City is required");
  }

  // Check province
  const provinceInput =
    address.province || address.state || address.province_code || "";
  if (!normalizeProvinceName(provinceInput)) {
    errors.push(
      "Invalid province. Please select a valid South African province"
    );
  }

  // Check postal code
  const postalCodeError = getPostalCodeError(
    address.postalCode || address.postal_code || address.zip
  );
  if (postalCodeError) {
    errors.push(postalCodeError);
  }

  return errors;
}

/**
 * Ensure address has both province code and full name
 * Completes the address with both formats if one is missing
 * 
 * @param address - Canonical address
 * @returns Address with both province code and full name
 */
export function ensureCompleteProvince(
  address: CanonicalAddress
): CanonicalAddress {
  const province = address.province;

  // Extract code if province is a full name
  let code = address.provinceCode;
  if (!code) {
    code = normalizeProvinceCode(province);
  }

  // Extract full name if province is a code
  let fullName = province;
  if (!fullName || /^[A-Z]{2}$/.test(fullName)) {
    fullName = normalizeProvinceName(address.province || code) || province;
  }

  return {
    ...address,
    province: fullName,
    provinceCode: code,
  };
}

/**
 * Convert canonical address to flat object with snake_case keys (for form submission)
 * Useful for serializing to form data or API requests that expect snake_case
 * 
 * @param address - Canonical address
 * @returns Object with snake_case keys
 */
export function canonicalToSnakeCase(
  address: CanonicalAddress
): Record<string, any> {
  return {
    street: address.street,
    street_address: address.street,
    city: address.city,
    province: address.province,
    province_code: address.provinceCode,
    postal_code: address.postalCode,
    postalCode: address.postalCode, // Also include camelCase for compatibility
    country: address.country,
    phone: address.phone,
    additional_info: address.additionalInfo,
    additionalInfo: address.additionalInfo, // Also include camelCase for compatibility
  };
}

/**
 * Convert canonical address to camelCase object (for encryption/service payloads)
 * 
 * @param address - Canonical address
 * @returns Object with camelCase keys
 */
export function canonicalToCamelCase(
  address: CanonicalAddress
): Record<string, any> {
  return {
    street: address.street,
    streetAddress: address.street,
    city: address.city,
    province: address.province,
    provinceCode: address.provinceCode,
    postalCode: address.postalCode,
    country: address.country,
    phone: address.phone,
    additionalInfo: address.additionalInfo,
  };
}

/**
 * Convert canonical address to a format suitable for database storage
 * Includes both full names and codes for province
 *
 * @param address - Canonical address
 * @returns Normalized address ready for storage
 */
export function prepareForStorage(
  address: CanonicalAddress
): CanonicalAddress {
  return ensureCompleteProvince(address);
}

/**
 * Prepare address for encryption - comprehensive helper that:
 * - Accepts any address object with any field naming convention
 * - Normalizes all field names to camelCase
 * - Preserves optional fields (complex, unitNumber, suburb)
 * - Ensures complete province data
 * - Validates required fields are present
 * - Returns standardized payload ready for encryption
 *
 * This is the RECOMMENDED function to use before calling encrypt-address
 *
 * @param rawAddress - Address object with any field naming conventions
 * @returns Standardized address object with all fields in camelCase, ready for encryption
 * @throws Error if required fields are missing or invalid
 */
export function prepareAddressForEncryption(
  rawAddress: RawAddress | CanonicalAddress | null | undefined
): Record<string, any> {
  if (!rawAddress || typeof rawAddress !== "object") {
    throw new Error("Address is required");
  }

  // First normalize the required fields using existing logic
  const normalized = normalizeAddressFields(rawAddress);
  if (!normalized) {
    throw new Error("Failed to normalize address - check all required fields");
  }

  // Ensure complete province data
  const withProvince = ensureCompleteProvince(normalized);

  // Build the encryption payload in camelCase format
  const encryptionPayload: Record<string, any> = {
    street: withProvince.street,
    city: withProvince.city,
    province: withProvince.province,
    provinceCode: withProvince.provinceCode,
    postalCode: withProvince.postalCode,
    country: withProvince.country || "South Africa",
  };

  // Add optional fields if present in the original address
  const phone = (rawAddress as any).phone || (rawAddress as any).phone_number;
  if (phone && typeof phone === "string" && phone.trim()) {
    encryptionPayload.phone = phone.trim();
  }

  const additionalInfo = (rawAddress as any).additionalInfo || (rawAddress as any).additional_info;
  if (additionalInfo && typeof additionalInfo === "string" && additionalInfo.trim()) {
    encryptionPayload.additionalInfo = additionalInfo.trim();
  }

  // Preserve optional address components if present (complex, unitNumber, suburb)
  const complex = (rawAddress as any).complex;
  if (complex && typeof complex === "string" && complex.trim()) {
    encryptionPayload.complex = complex.trim();
  }

  const unitNumber = (rawAddress as any).unitNumber || (rawAddress as any).unit_number;
  if (unitNumber && typeof unitNumber === "string" && unitNumber.trim()) {
    encryptionPayload.unitNumber = unitNumber.trim();
  }

  const suburb = (rawAddress as any).suburb;
  if (suburb && typeof suburb === "string" && suburb.trim()) {
    encryptionPayload.suburb = suburb.trim();
  }

  return encryptionPayload;
}
