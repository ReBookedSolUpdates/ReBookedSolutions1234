import { supabase } from "@/integrations/supabase/client";
import { IS_PRODUCTION } from "@/config/envParser";

// Unified delivery types
export interface UnifiedAddress {
  name?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  company?: string;
  streetAddress: string;
  unitNumber?: string;
  complex?: string;
  suburb?: string;
  city: string;
  province: string;
  postalCode: string;
  country?: string;
  type?: "residential" | "business";
  lat?: number;
  lng?: number;
}

export interface UnifiedParcel {
  reference?: string;
  description?: string;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  value?: number;
  packaging?: string;
}

export interface UnifiedShipmentRequest {
  collection?: UnifiedAddress;
  delivery?: UnifiedAddress;
  parcels: UnifiedParcel[];
  service_type?: "standard" | "express" | "overnight";
  special_instructions?: string;
  reference?: string;
  preferred_provider?: string;
  provider_slug?: string;
  service_level_code?: string;
  deliveryLocker?: UnifiedPickupPoint;
  sellerCollectionPickupPoint?: UnifiedPickupPoint;
}

export interface UnifiedPickupPoint {
  locationId: string;
  providerSlug: string;
}

export interface UnifiedQuoteRequest {
  from?: UnifiedAddress;
  to?: UnifiedAddress;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  service_type?: "standard" | "express" | "overnight";
  deliveryLocker?: UnifiedPickupPoint;
  sellerCollectionPickupPoint?: UnifiedPickupPoint;
  user_id?: string;
}

export interface UnifiedQuote {
  provider: string;
  provider_name: string;
  provider_slug: string;
  service_level_code: string;
  service_name: string;
  cost: number;
  price_excl?: number;
  currency?: string;
  transit_days: number;
  collection_cutoff?: string;
  estimated_delivery?: string;
  features: string[];
  terms?: string;
}

export interface UnifiedShipment {
  provider: string;
  shipment_id: string;
  tracking_number: string;
  labels?: string[];
  cost?: number;
  service_level_code?: string;
  collection_date?: string;
  estimated_delivery_date?: string;
  reference?: string;
  tracking_url?: string;
}

export interface UnifiedTrackingEvent {
  timestamp: string;
  status: string;
  location?: string;
  description?: string;
  signature?: string;
}

export interface UnifiedTrackingResponse {
  provider: string;
  tracking_number: string;
  custom_tracking_reference?: string;
  shipment_id?: string;
  status:
    | "pending"
    | "collected"
    | "in_transit"
    | "out_for_delivery"
    | "delivered"
    | "failed"
    | "cancelled";
  status_friendly?: string;
  current_location?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  events: UnifiedTrackingEvent[];
  recipient_signature?: string;
  proof_of_delivery?: string;
  tracking_url?: string;
  courier_name?: string;
  courier_slug?: string;
  courier_phone?: string;
  courier_logo?: string;
  service_level?: string;
  service_level_code?: string;
  merchant_name?: string;
  merchant_logo?: string;
  order_number?: string;
  channel_order_number?: string;
  created_at?: string;
  last_updated?: string;
  raw?: Record<string, unknown>;
  simulated?: boolean;
}

function toProvinceCode(input: string): string {
  const s = (input || "").toLowerCase().trim();
  // If it's a known province, return the full name properly capitalized for TCG
  const provinces: Record<string, string> = {
    "gp": "Gauteng",
    "gauteng": "Gauteng",
    "wc": "Western Cape",
    "western cape": "Western Cape",
    "kzn": "KwaZulu-Natal",
    "kwazulu-natal": "KwaZulu-Natal",
    "kwazulu natal": "KwaZulu-Natal",
    "ec": "Eastern Cape",
    "eastern cape": "Eastern Cape",
    "fs": "Free State",
    "free state": "Free State",
    "nw": "North West",
    "north west": "North West",
    "mp": "Mpumalanga",
    "mpumalanga": "Mpumalanga",
    "lp": "Limpopo",
    "limpopo": "Limpopo",
    "nc": "Northern Cape",
    "northern cape": "Northern Cape"
  };

  if (provinces[s]) return provinces[s];
  return input;
}

/** Get quotes from shipping providers */
export const getAllDeliveryQuotes = async (
  request: UnifiedQuoteRequest,
): Promise<UnifiedQuote[]> => {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[DELIVERY_SERVICE][${requestId}] getAllDeliveryQuotes requested:`, {
    weight: request.weight,
    hasFrom: !!request.from,
    hasTo: !!request.to,
    hasDeliveryLocker: !!request.deliveryLocker,
    hasSellerLocker: !!request.sellerCollectionPickupPoint
  });

  try {
    const DEFAULT_BOOK = {
      weight: 2,
      length: 20,
      width: 20,
      height: 10,
      description: "Standard flyer"
    };

    // Determine shipment type based on what was passed in
    const hasCollectionLocker = !!(request.sellerCollectionPickupPoint?.locationId);
    const hasDeliveryLocker = !!(request.deliveryLocker?.locationId);

    // Validate we have enough info to build a valid request
    // Collection side: need either a locker OR a real from address
    const hasCollectionAddress = !!(
      request.from?.streetAddress?.trim() &&
      request.from?.city?.trim() &&
      request.from?.postalCode?.trim()
    );

    // Delivery side: need either a locker OR a real to address
    const hasDeliveryAddress = !!(
      request.to?.streetAddress?.trim() &&
      request.to?.city?.trim() &&
      request.to?.postalCode?.trim()
    );

    const hasCollection = hasCollectionLocker || hasCollectionAddress;
    const hasDelivery = hasDeliveryLocker || hasDeliveryAddress;

    // Relaxed validation: let the Edge Function handle the final decision
    // but log what we're sending for debugging
    console.log(`[DELIVERY_SERVICE][${requestId}] Validation state:`, {
      hasCollection,
      hasCollectionLocker,
      hasCollectionAddress,
      hasDelivery,
      hasDeliveryLocker,
      hasDeliveryAddress,
    });

    if (!hasCollection || !hasDelivery) {
      console.warn(`[DELIVERY_SERVICE][${requestId}] Partial route data. Attempting invocation anyway, Edge Function will validate.`, {
        hasCollection,
        hasDelivery
      });
      // We continue instead of returning fallback early, unless it's completely empty
      if (!hasCollection && !hasDelivery && !request.from && !request.to) {
        console.error(`[DELIVERY_SERVICE][${requestId}] No routing data at all. Returning fallback.`);
        return generateFallbackQuotes(request);
      }
    }

    console.log(`[DELIVERY_SERVICE][${requestId}] Building payload...`);

    // Build the payload — only ONE field per side, never both
    const body: Record<string, any> = {
      parcels: [
        {
          submitted_weight_kg: request.weight || DEFAULT_BOOK.weight,
          submitted_length_cm: request.length || DEFAULT_BOOK.length,
          submitted_width_cm: request.width || DEFAULT_BOOK.width,
          submitted_height_cm: request.height || DEFAULT_BOOK.height,
          parcel_description: DEFAULT_BOOK.description,
        },
      ],
      collection_min_date: new Date().toISOString().split("T")[0],
      delivery_min_date: new Date().toISOString().split("T")[0],
    };

    // COLLECTION SIDE — locker takes priority over address
    if (hasCollectionLocker) {
      // Locker collection — send pickup point ID only, NO collection_address
      body.collection_pickup_point_id = String(request.sellerCollectionPickupPoint!.locationId);
      body.collection_pickup_point_provider = request.sellerCollectionPickupPoint!.providerSlug || "tcg-locker";
    } else if (request.from) {
      // Door collection — send address only, NO pickup point ID
      body.collection_address = {
        street_address: (request.from.streetAddress || "").trim(),
        city: (request.from.city || "").trim(),
        code: (request.from.postalCode || "").trim(),
        country: "ZA",
        type: request.from.type || (request.from.company ? "business" : "residential"),
        ...(request.from.company?.trim() ? { company: request.from.company.trim() } : {}),
        ...(request.from.suburb?.trim() ? { local_area: request.from.suburb.trim() } : {}),
        ...(request.from.province?.trim() ? { zone: toProvinceCode(request.from.province) } : {}),
        ...(request.from.lat ? { lat: request.from.lat } : {}),
        ...(request.from.lng ? { lng: request.from.lng } : {}),
      };
    }

    // DELIVERY SIDE — locker takes priority over address
    if (hasDeliveryLocker) {
      // Locker delivery — send pickup point ID only, NO delivery_address
      body.delivery_pickup_point_id = String(request.deliveryLocker!.locationId);
      body.delivery_pickup_point_provider = request.deliveryLocker!.providerSlug || "tcg-locker";
    } else if (request.to) {
      // Door delivery — send address only, NO pickup point ID
      body.delivery_address = {
        street_address: (request.to.streetAddress || "").trim(),
        city: (request.to.city || "").trim(),
        code: (request.to.postalCode || "").trim(),
        country: "ZA",
        type: request.to.type || (request.to.company ? "business" : "residential"),
        ...(request.to.company?.trim() ? { company: request.to.company.trim() } : {}),
        ...(request.to.suburb?.trim() ? { local_area: request.to.suburb.trim() } : {}),
        ...(request.to.province?.trim() ? { zone: toProvinceCode(request.to.province) } : {}),
        ...(request.to.lat ? { lat: request.to.lat } : {}),
        ...(request.to.lng ? { lng: request.to.lng } : {}),
      };
    }

    console.log(`[DELIVERY_SERVICE][${requestId}] Invoking get-rates with body:`, body);

    const { data, error } = await supabase.functions.invoke("get-rates", { body });
    console.log(`[DELIVERY_SERVICE][${requestId}] get-rates response received:`, { success: !!data?.success, items: data?.rates?.length, error });

    if (error) {
      throw new Error(`Edge function error: ${error.message}`);
    }

    if (!data || !data.success) {
      const errorMsg = data?.error || data?.message || "Failed to fetch rates";
      console.warn(`[DELIVERY_SERVICE][${requestId}] API failure:`, errorMsg, data?.errors);
      return generateFallbackQuotes(request);
    }

    const topLevelRates = data.rates || [];
    let allRates: any[] = [];

    for (const item of topLevelRates) {
      if (item.rates && Array.isArray(item.rates)) {
        const providerName = item.provider || "Courier";
        for (const r of item.rates) {
          allRates.push({ ...r, _provider: providerName });
        }
      } else {
        allRates.push(item);
      }
    }

    let quotes: UnifiedQuote[] = allRates.map((r: any) => ({
      provider: r._provider || r.provider || "shipping",
      provider_name: r._provider || r.provider || "Courier",
      provider_slug: r.service_level?.code?.toLowerCase() || r.provider_slug || "tcg",
      service_level_code: r.service_level?.code || r.service_level_code || "",
      service_name: r.service_level?.name || r.service_name || "Standard",
      cost: r.rate || r.base_rate?.charge || 0,
      price_excl: r.rate_excluding_vat || undefined,
      currency: "ZAR",
      transit_days: r.service_level?.delivery_date_from
        ? calculateTransitDays(r.service_level.delivery_date_from)
        : (r.transit_days || 3),
      collection_cutoff: r.service_level?.collection_cut_off_time,
      estimated_delivery: r.service_level?.delivery_date_to,
      features: ["Tracking included"],
      terms: r.service_level?.description,
    }));

    if (!quotes.length) {
      return generateFallbackQuotes(request);
    }

    quotes.sort((a, b) => a.cost - b.cost);
    return quotes;
  } catch (err) {
    console.error("[DELIVERY_SERVICE] Failed to get delivery quotes:", err);
    return generateFallbackQuotes(request);
  }
};

/** Create shipment using new shipping API */
export const createUnifiedShipment = async (
  request: UnifiedShipmentRequest,
  selected?: UnifiedQuote,
): Promise<UnifiedShipment> => {
  console.log("[DELIVERY_SERVICE] createUnifiedShipment requested:", { reference: request.reference, selected: !!selected });
  const DEFAULT_BOOK = {
    weight: 2,
    length: 20,
    width: 20,
    height: 10,
    description: "Standard flyer"
  };

  const parcels = (request.parcels?.length ? request.parcels : [DEFAULT_BOOK]) as UnifiedParcel[];

  let quote = selected;
  if (!quote) {
    const quotes = await getAllDeliveryQuotes({
      from: request.collection,
      to: request.delivery,
      weight: parcels[0].weight || DEFAULT_BOOK.weight,
    });
    if (quotes.length === 0) throw new Error("No rates available");
    quote = quotes[0];
  }

  const body: Record<string, any> = {
    order_id: request.reference || `order-${Date.now()}`,
    parcels: parcels.map((p) => ({
      submitted_weight_kg: p.weight || DEFAULT_BOOK.weight,
      submitted_length_cm: p.length || DEFAULT_BOOK.length,
      submitted_width_cm: p.width || DEFAULT_BOOK.width,
      submitted_height_cm: p.height || DEFAULT_BOOK.height,
      parcel_description: p.description || DEFAULT_BOOK.description,
    })),
    service_level_code: quote.service_level_code,
    special_instructions_delivery: request.special_instructions || "",
    provider: quote.provider_slug,
    collection_min_date: new Date().toISOString().split("T")[0],
    delivery_min_date: new Date().toISOString().split("T")[0],
  };

  // COLLECTION SIDE — locker takes priority over address
  if (request.sellerCollectionPickupPoint?.locationId) {
    // Locker collection — send pickup point ID only, NO collection_address
    body.collection_pickup_point_id = String(request.sellerCollectionPickupPoint.locationId);
    body.collection_pickup_point_provider = request.sellerCollectionPickupPoint.providerSlug || "tcg-locker";
  } else if (request.collection?.streetAddress?.trim() && request.collection?.city?.trim() && request.collection?.postalCode?.trim()) {
    // Door collection — send address only, NO pickup point ID
    body.collection_address = {
      street_address: request.collection.streetAddress.trim(),
      local_area: request.collection.suburb?.trim() || "",
      city: request.collection.city.trim(),
      zone: toProvinceCode(request.collection.province || ""),
      country: "ZA",
      code: request.collection.postalCode.trim(),
      company: request.collection.company?.trim() || request.collection.name?.trim() || "",
      type: request.collection.type || (request.collection.company ? "business" : "residential"),
      ...(request.collection.lat ? { lat: request.collection.lat } : {}),
      ...(request.collection.lng ? { lng: request.collection.lng } : {}),
    };
    body.collection_contact = {
      name: request.collection.contactName?.trim() || request.collection.name?.trim() || "Seller",
      mobile_number: request.collection.phone?.trim() || "",
      email: request.collection.email?.trim() || "",
    };
  }

  // DELIVERY SIDE — locker takes priority over address
  if (request.deliveryLocker?.locationId) {
    // Locker delivery — send pickup point ID only, NO delivery_address
    body.delivery_pickup_point_id = String(request.deliveryLocker.locationId);
    body.delivery_pickup_point_provider = request.deliveryLocker.providerSlug || "tcg-locker";
  } else if (request.delivery?.streetAddress?.trim() && request.delivery?.city?.trim() && request.delivery?.postalCode?.trim()) {
    // Door delivery — send address only, NO pickup point ID
    body.delivery_address = {
      street_address: request.delivery.streetAddress.trim(),
      local_area: request.delivery.suburb?.trim() || "",
      city: request.delivery.city.trim(),
      zone: toProvinceCode(request.delivery.province || ""),
      country: "ZA",
      code: request.delivery.postalCode.trim(),
      company: request.delivery.company?.trim() || request.delivery.name?.trim() || "",
      type: request.delivery.type || (request.delivery.company ? "business" : "residential"),
      ...(request.delivery.lat ? { lat: request.delivery.lat } : {}),
      ...(request.delivery.lng ? { lng: request.delivery.lng } : {}),
    };
    body.delivery_contact = {
      name: request.delivery.contactName?.trim() || request.delivery.name?.trim() || "Buyer",
      mobile_number: request.delivery.phone?.trim() || "",
      email: request.delivery.email?.trim() || "",
    };
  }

  const { data, error } = await supabase.functions.invoke("create-shipment", {
    body,
  });
  console.log("[DELIVERY_SERVICE] create-shipment response:", { success: !!data?.success, error });

  if (error) throw new Error(error.message);
  if (!data?.success) throw new Error(data?.error || "Shipment creation failed");

  return {
    provider: data.provider || "shipping",
    shipment_id: data.shipment?.id || "",
    tracking_number: data.tracking_reference || "",
    cost: data.shipment?.rate?.charge?.amount,
    service_level_code: quote!.service_level_code,
    estimated_delivery_date: data.shipment?.estimated_delivery_to,
    reference: request.reference,
    tracking_url: undefined,
  };
};

/** Track shipment via new shipping API */
export const trackUnifiedShipment = async (
  trackingNumber: string,
  orderId?: string,
): Promise<UnifiedTrackingResponse> => {
  const { data, error } = await supabase.functions.invoke("track-shipment", {
    body: { tracking_reference: trackingNumber, order_id: orderId },
  });

  if (error) throw new Error(error.message);
  
  const t = data?.tracking || {};

  // TCG API returns { shipments: [{ status, tracking_events: [...], ... }] }
  const shipment = t.shipments?.[0] || t;

  // Map tracking_events from TCG format
  const rawEvents = shipment.tracking_events || shipment.checkpoints || shipment.events || [];
  const events = rawEvents.map((e: any) => ({
    timestamp: e.date || e.time || e.timestamp,
    status: (e.status || "").toLowerCase().replace(/_/g, "-"),
    location: e.location || e.zone || e.city,
    description: e.message || e.description || e.status_friendly || e.status,
    signature: e.signature,
  }));

  // Map TCG status to our unified status
  const rawStatus = (shipment.status || "pending").toLowerCase();
  const statusMap: Record<string, string> = {
    "collection-assigned": "pending",
    "collection-unassigned": "pending",
    "collected": "collected",
    "at-hub": "in_transit",
    "in-transit": "in_transit",
    "at-destination-hub": "in_transit",
    "out-for-delivery": "out_for_delivery",
    "delivery-assigned": "out_for_delivery",
    "delivered": "delivered",
    "cancelled": "cancelled",
    "returned-to-sender": "failed",
    "delivery-failed-attempt": "failed",
    "ready-for-pickup": "out_for_delivery",
  };

  return {
    provider: data?.provider || "shipping",
    tracking_number: shipment.short_tracking_reference || shipment.custom_tracking_reference || trackingNumber,
    custom_tracking_reference: shipment.custom_tracking_reference,
    shipment_id: String(shipment.id || ""),
    status: (statusMap[rawStatus] || rawStatus) as any,
    status_friendly: rawStatus.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
    current_location: shipment.current_branch_public_name || shipment.current_branch_name || "Unknown",
    estimated_delivery: shipment.estimated_delivery_to,
    actual_delivery: shipment.delivered_date,
    events,
    courier_name: data?.provider,
    courier_slug: shipment.selected_courier_slug,
    service_level: shipment.service_level_name,
    service_level_code: shipment.service_level_code,
    created_at: shipment.time_created,
    last_updated: shipment.time_modified,
    raw: data,
    simulated: false,
  };
};

function calculateTransitDays(deliveryDate: string): number {
  try {
    const delivery = new Date(deliveryDate);
    const now = new Date();
    const diff = Math.ceil((delivery.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  } catch {
    return 3;
  }
}

function detectProviderFromTrackingNumber(_trackingNumber: string): string {
  return "shipping";
}

function generateFallbackQuotes(request: UnifiedQuoteRequest): UnifiedQuote[] {
  // Set base price so that total (base + markup) is 120
  // Step2DeliveryOptions adds 15 markup, so base should be 105
  const basePrice = 105;
  return [
    {
      provider: "shipping",
      provider_name: "Standard Courier",
      provider_slug: "standard",
      service_level_code: "STANDARD",
      service_name: "Standard Delivery",
      cost: Math.round(basePrice),
      transit_days: 3,
      features: ["Reliable delivery", "Tracking included"],
    },
  ];
}

export default {
  getAllDeliveryQuotes,
  createUnifiedShipment,
  trackUnifiedShipment,
  detectProviderFromTrackingNumber,
};
