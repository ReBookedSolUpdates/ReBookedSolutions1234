/**
 * Pickup Type Validation Utility
 * 
 * Single source of truth for:
 * - Valid pickup type values
 * - Pickup method validation
 * - Ensuring pickup data is consistent between top-level and nested delivery_data
 * 
 * Pickup types:
 * - "locker": Locker/parcel pickup at an approved location
 * - "door": Door-to-door delivery
 */

export type PickupType = "locker" | "door";

/**
 * Valid pickup types
 */
export const VALID_PICKUP_TYPES: PickupType[] = ["locker", "door"];

/**
 * Pickup locker data structure
 */
export interface PickupLockerData {
  location_id?: string;
  location_name?: string;
  provider_slug?: string;
  provider_name?: string;
  address?: string;
  [key: string]: any;
}

/**
 * Locker information from checkout
 */
export interface SelectedLocker {
  location_id?: string;
  id?: string;
  locationName?: string;
  name?: string;
  provider?: string;
  provider_slug?: string;
  address?: string;
  [key: string]: any;
}

/**
 * Validate that pickup_type is a valid value
 * 
 * @param pickupType - Pickup type to validate
 * @returns true if valid pickup type
 */
export function isValidPickupType(pickupType: any): pickupType is PickupType {
  return VALID_PICKUP_TYPES.includes(pickupType);
}

/**
 * Validate pickup type with error message
 * 
 * @param pickupType - Pickup type to validate
 * @returns Error message if invalid, null if valid
 */
export function getPickupTypeError(pickupType: any): string | null {
  if (pickupType === null || pickupType === undefined) {
    return "Delivery method is required";
  }

  if (!isValidPickupType(pickupType)) {
    return `Invalid delivery method: ${pickupType}. Must be one of: ${VALID_PICKUP_TYPES.join(", ")}`;
  }

  return null;
}

/**
 * Validate that locker pickup has required data
 * 
 * @param lockerData - Locker data to validate
 * @returns Error message if invalid, null if valid
 */
export function validateLockerData(
  lockerData: PickupLockerData | null | undefined
): string | null {
  if (!lockerData) {
    return "Locker information is required for locker pickup";
  }

  const locationId =
    lockerData.location_id || lockerData.id;
  if (!locationId) {
    return "Locker location ID is required";
  }

  return null;
}

/**
 * Validate that door delivery has required address
 * 
 * @param pickupAddressEncrypted - Encrypted pickup address (seller address for pickup)
 * @returns Error message if invalid, null if valid
 */
export function validateDoorDeliveryData(
  pickupAddressEncrypted: string | null | undefined
): string | null {
  if (!pickupAddressEncrypted || typeof pickupAddressEncrypted !== "string" || pickupAddressEncrypted.trim() === "") {
    return "Seller pickup address is required for door delivery";
  }

  return null;
}

/**
 * Normalize locker data from various formats
 * Handles different property names and structures
 * 
 * @param selectedLocker - Raw locker data from checkout
 * @returns Normalized locker data
 */
export function normalizeLockerData(
  selectedLocker: SelectedLocker | null | undefined
): PickupLockerData | null {
  if (!selectedLocker) return null;

  const locationId =
    selectedLocker.location_id ||
    selectedLocker.id ||
    selectedLocker.locationId;

  if (!locationId) return null;

  return {
    location_id: locationId,
    location_name:
      selectedLocker.locationName ||
      selectedLocker.name ||
      selectedLocker.location_name,
    provider_slug:
      selectedLocker.provider_slug ||
      selectedLocker.provider,
    provider_name:
      selectedLocker.provider_name ||
      selectedLocker.provider,
    address: selectedLocker.address,
  };
}

/**
 * Ensure pickup data is consistent across all locations
 * Sets both top-level and nested delivery_data fields
 * 
 * @param orderData - Order data to normalize
 * @param pickupType - Pickup type (locker or door)
 * @param lockerData - Optional locker data (if pickup type is locker)
 * @returns Normalized order data with consistent pickup fields
 */
export function normalizePickupData(
  orderData: Record<string, any>,
  pickupType: PickupType,
  lockerData?: PickupLockerData | null
): Record<string, any> {
  const normalized = { ...orderData };

  // Ensure top-level pickup_type is set
  normalized.pickup_type = pickupType;

  // Ensure delivery_data exists
  if (!normalized.delivery_data) {
    normalized.delivery_data = {};
  }

  // Set delivery type in nested structure
  normalized.delivery_data.delivery_type = pickupType;

  if (pickupType === "locker") {
    // Ensure locker data is set in both locations
    const normalizedLocker = normalizeLockerData(lockerData);

    if (normalizedLocker) {
      // Top-level locker fields
      normalized.pickup_locker_location_id =
        normalizedLocker.location_id;
      normalized.pickup_locker_data = normalizedLocker;
      normalized.pickup_locker_provider_slug =
        normalizedLocker.provider_slug;

      // Nested in delivery_data
      normalized.delivery_data.pickup_locker_data = normalizedLocker;
      normalized.delivery_data.pickup_locker_location_id =
        normalizedLocker.location_id;
    }

    // Clear door-specific fields
    normalized.pickup_address_encrypted = null;
  } else if (pickupType === "door") {
    // Door delivery: ensure pickup address is set
    // (address should come from seller profile, set before calling this)

    // Clear locker-specific fields
    normalized.pickup_locker_location_id = null;
    normalized.pickup_locker_data = null;
    normalized.pickup_locker_provider_slug = null;
    normalized.delivery_data.pickup_locker_data = null;
    normalized.delivery_data.pickup_locker_location_id = null;
  }

  return normalized;
}

/**
 * Validate complete pickup setup for order creation
 * Ensures all required data is present based on pickup type
 * 
 * @param pickupType - Pickup type to validate
 * @param lockerData - Locker data (if pickup type is locker)
 * @param pickupAddressEncrypted - Encrypted pickup address (if pickup type is door)
 * @returns Array of validation errors (empty if valid)
 */
export function validatePickupSetup(
  pickupType: any,
  lockerData?: PickupLockerData | null,
  pickupAddressEncrypted?: string | null
): string[] {
  const errors: string[] = [];

  // Validate pickup type
  const typeError = getPickupTypeError(pickupType);
  if (typeError) {
    errors.push(typeError);
    return errors; // Return early if no valid type
  }

  if (pickupType === "locker") {
    const lockerError = validateLockerData(lockerData);
    if (lockerError) {
      errors.push(lockerError);
    }
  } else if (pickupType === "door") {
    const doorError = validateDoorDeliveryData(pickupAddressEncrypted);
    if (doorError) {
      errors.push(doorError);
    }
  }

  return errors;
}

/**
 * Check if pickup data is consistent across both storage locations
 * (top-level fields and delivery_data nested fields)
 * 
 * @param orderData - Order data to check
 * @returns true if consistent, false otherwise
 */
export function isPickupDataConsistent(
  orderData: Record<string, any>
): boolean {
  const pickupType = orderData.pickup_type;
  const deliveryType = orderData.delivery_data?.delivery_type;

  // Both should match
  if (pickupType !== deliveryType) {
    return false;
  }

  // If locker, locker data should be in both places
  if (pickupType === "locker") {
    const topLevelLocker = orderData.pickup_locker_data;
    const nestedLocker = orderData.delivery_data?.pickup_locker_data;

    // At least one should be present
    if (!topLevelLocker && !nestedLocker) {
      return false;
    }
  }

  return true;
}

/**
 * Get a descriptive name for a pickup type
 * 
 * @param pickupType - Pickup type
 * @returns User-friendly name
 */
export function getPickupTypeLabel(pickupType: PickupType): string {
  switch (pickupType) {
    case "locker":
      return "Locker/Parcel Pickup";
    case "door":
      return "Door-to-Door Delivery";
    default:
      return "Unknown Delivery Method";
  }
}
