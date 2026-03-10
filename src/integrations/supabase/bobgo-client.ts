// DEPRECATED: This file is kept for backwards compatibility.
// All shipping functions now route through the new unified shipping edge functions.
// Import from '@/integrations/supabase/shipping-client' instead.

export {
  getShippingRates as getBobGoRates,
  createShipment as createBobGoShipment,
  trackShipment as trackBobGoShipment,
  cancelShipment as cancelBobGoShipment,
  getShipmentLabel,
  invokeShippingFunction as invokeBobGoFunction,
} from './shipping-client';

/**
 * @deprecated Use getShipmentLabel({ order_id }) instead
 */
export function getBobGoWaybillUrl(orderId?: string, trackingRef?: string): string {
  // This URL pattern no longer applies - use getShipmentLabel() instead
  console.warn('getBobGoWaybillUrl is deprecated. Use getShipmentLabel() from shipping-client instead.');
  return '';
}
