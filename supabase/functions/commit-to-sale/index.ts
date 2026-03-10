import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate environment configuration
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Server configuration error",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create service role client for admin operations
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Authenticate user from JWT token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized - missing authorization header",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized - invalid token",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }


    // Parse request body
    let body = null;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid JSON body",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const {
      order_id,
      delivery_method,
      locker_id,
      locker_name,
      locker_address,
      locker_data,
    } = body || {};

    if (!order_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Order ID is required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }


    // Fetch the order with service role to bypass RLS for initial check
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Order not found",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // CRITICAL: Verify seller is committing to their own order
    // This is the RLS equivalent check for service role operations
    if (order.seller_id !== user.id) {
      console.warn(
        `[commit-to-sale] Unauthorized: User ${user.id} is not seller ${order.seller_id}`,
      );
      return new Response(
        JSON.stringify({
          success: false,
          error: "Only the seller can commit to this order",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate order status - allow 'paid' and 'pending' statuses
    const allowedStatuses = ["paid", "pending"];
    if (!allowedStatuses.includes(order.status)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Order cannot be committed in status: ${order.status}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }


    // Parse items from order
    let items: Array<{ title?: string; price?: number; book_id?: string }> = [];
    try {
      items = Array.isArray(order.items)
        ? order.items
        : order.items
          ? JSON.parse(order.items)
          : [];
    } catch {
      items = [];
    }

    // CRITICAL: Determine pickup type based on order's saved pickup_type
    // DO NOT default to "door" - if pickup_type is not set, that's an error condition
    // Only override if seller explicitly provided new locker data during commit
    let pickupType = order.pickup_type;
    const deliveryType = order.delivery_type || "door";

    if (!pickupType) {
      throw new Error("Order is missing pickup type configuration. Please contact support.");
    }

    // Only override pickup_type if seller explicitly provided locker data during commit
    if (delivery_method === "locker" && locker_data && locker_data.id) {
      pickupType = "locker";
    } else if (delivery_method === "locker" && locker_id && !pickupType.startsWith("locker")) {
      pickupType = "locker";
    }

    // Get seller pickup information based on type
    let pickupData: {
      type: string;
      location_id?: number;
      provider_slug?: string;
      locker_data?: unknown;
      address?: unknown;
    } | null = null;
    let pickupLockerLocationId: number | null = null;
    let pickupLockerProviderSlug = "pargo";
    let pickupLockerDataToSave: unknown = null;

    if (pickupType === "locker") {
      // Locker pickup - prioritize seller-selected locker from request body
      if (locker_data) {
        pickupData = {
          type: "locker",
          location_id: locker_data.id,
          provider_slug: locker_data.provider_slug || "pargo",
          locker_data: locker_data,
        };
        pickupLockerLocationId = locker_data.id;
        pickupLockerProviderSlug = locker_data.provider_slug || "pargo";
        pickupLockerDataToSave = locker_data;
      } else {
        // Fallback to order's stored locker info
        const pickupLocationId = order.pickup_locker_location_id;
        const pickupProviderSlug = order.pickup_locker_provider_slug;
        const pickupLockerData = order.pickup_locker_data;

        if (pickupLocationId && pickupProviderSlug) {
          pickupData = {
            type: "locker",
            location_id: pickupLocationId,
            provider_slug: pickupProviderSlug,
            locker_data: pickupLockerData,
          };
          pickupLockerLocationId = pickupLocationId;
          pickupLockerProviderSlug = pickupProviderSlug;
          pickupLockerDataToSave = pickupLockerData;
        } else if (pickupLockerData?.id && pickupLockerData?.provider_slug) {
          pickupData = {
            type: "locker",
            location_id: pickupLockerData.id,
            provider_slug: pickupLockerData.provider_slug,
            locker_data: pickupLockerData,
          };
          pickupLockerLocationId = pickupLockerData.id;
          pickupLockerProviderSlug = pickupLockerData.provider_slug;
          pickupLockerDataToSave = pickupLockerData;
        } else {
          // Fallback to seller profile for missing locker info
          const { data: sellerProfile } = await supabase
            .from("profiles")
            .select(
              "preferred_delivery_locker_location_id, preferred_delivery_locker_provider_slug, preferred_delivery_locker_data"
            )
            .eq("id", order.seller_id)
            .single();

          if (sellerProfile?.preferred_delivery_locker_location_id) {
            pickupData = {
              type: "locker",
              location_id: sellerProfile.preferred_delivery_locker_location_id,
              provider_slug:
                sellerProfile.preferred_delivery_locker_provider_slug || "pargo",
              locker_data: sellerProfile.preferred_delivery_locker_data,
            };
            pickupLockerLocationId =
              sellerProfile.preferred_delivery_locker_location_id;
            pickupLockerProviderSlug =
              sellerProfile.preferred_delivery_locker_provider_slug || "pargo";
            pickupLockerDataToSave = sellerProfile.preferred_delivery_locker_data;
          } else {
            throw new Error("Seller locker pickup information not found");
          }
        }
      }
    } else {
      // Door pickup - get physical address
      let pickupAddress: unknown = null;

      // Try order-level pickup address first
      if (order.pickup_address_encrypted) {
        try {
          const pickupResp = await supabase.functions.invoke("decrypt-address", {
            body: {
              table: "orders",
              target_id: order_id,
              address_type: "pickup",
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (pickupResp.data?.success) {
            pickupAddress = pickupResp.data.data;
          }
        } catch (e) {
        }
      }

      // Fallback to book-level pickup address
      if (!pickupAddress && order.book_id) {
        try {
          const { data: bookRow } = await supabase
            .from("books")
            .select("pickup_address_encrypted")
            .eq("id", order.book_id)
            .maybeSingle();

          if (bookRow?.pickup_address_encrypted) {
            const bookPickupResp = await supabase.functions.invoke(
              "decrypt-address",
              {
                body: {
                  table: "books",
                  target_id: order.book_id,
                  address_type: "pickup",
                },
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (bookPickupResp.data?.success) {
              pickupAddress = bookPickupResp.data.data;
            }
          }
        } catch (e) {
        }
      }

      // Final fallback to seller profile
      if (!pickupAddress) {
        const { data: sellerProfile } = await supabase
          .from("profiles")
          .select("pickup_address_encrypted")
          .eq("id", order.seller_id)
          .single();

        if (sellerProfile?.pickup_address_encrypted) {
          try {
            const profilePickupResp = await supabase.functions.invoke(
              "decrypt-address",
              {
                body: {
                  table: "profiles",
                  target_id: order.seller_id,
                  address_type: "pickup",
                },
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (profilePickupResp.data?.success) {
              pickupAddress = profilePickupResp.data.data;
            }
          } catch (e) {
            console.warn(
              "[commit-to-sale] Failed to decrypt seller profile pickup address:",
              e,
            );
          }
        }
      }

      if (!pickupAddress) {
        throw new Error("Seller pickup address not found");
      }

      pickupData = {
        type: "door",
        address: pickupAddress,
      };
    }

    // Get buyer delivery information
    let deliveryData: {
      type: string;
      location_id?: number;
      provider_slug?: string;
      locker_data?: unknown;
      address?: unknown;
    } | null = null;
    let shippingAddress: unknown = null;

    // Resolve buyer's physical delivery/shipping address
    const anyOrder = order as Record<string, unknown>;

    // Try order-level delivery address first
    if (anyOrder.delivery_address_encrypted) {
      try {
        const deliveryResp = await supabase.functions.invoke("decrypt-address", {
          body: {
            table: "orders",
            target_id: order_id,
            address_type: "delivery",
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (deliveryResp.data?.success) {
          shippingAddress = deliveryResp.data.data;
        }
      } catch (e) {
      }
    }

    // Fallback to shipping address on order
    if (!shippingAddress && anyOrder.shipping_address_encrypted) {
      try {
        const shippingResp = await supabase.functions.invoke("decrypt-address", {
          body: {
            table: "orders",
            target_id: order_id,
            address_type: "shipping",
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (shippingResp.data?.success) {
          shippingAddress = shippingResp.data.data;
        }
      } catch (e) {
      }
    }

    // Fallback to buyer profile
    if (!shippingAddress && order.buyer_id) {
      const { data: buyerProfile } = await supabase
        .from("profiles")
        .select("shipping_address_encrypted")
        .eq("id", order.buyer_id)
        .maybeSingle();

      if (buyerProfile?.shipping_address_encrypted) {
        try {
          const profileShippingResp = await supabase.functions.invoke(
            "decrypt-address",
            {
              body: {
                table: "profiles",
                target_id: order.buyer_id,
                address_type: "shipping",
              },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (profileShippingResp.data?.success) {
            shippingAddress = profileShippingResp.data.data;
          }
        } catch (e) {
          console.warn(
            "[commit-to-sale] Failed to decrypt buyer profile shipping address:",
            e,
          );
        }
      }
    }

    // Final fallback for locker deliveries: use seller's pickup address
    if (!shippingAddress && deliveryType === "locker" && order.seller_id) {
      const { data: sellerProfile } = await supabase
        .from("profiles")
        .select("pickup_address_encrypted")
        .eq("id", order.seller_id)
        .maybeSingle();

      if (sellerProfile?.pickup_address_encrypted) {
        try {
          const profilePickupResp = await supabase.functions.invoke(
            "decrypt-address",
            {
              body: {
                table: "profiles",
                target_id: order.seller_id,
                address_type: "pickup",
              },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (profilePickupResp.data?.success) {
            shippingAddress = profilePickupResp.data.data;
          }
        } catch (e) {
          console.warn(
            "[commit-to-sale] Failed to decrypt seller pickup address as fallback:",
            e,
          );
        }
      }
    }

    if (deliveryType === "locker") {
      // Locker delivery - get locker details from order
      const deliveryLocationId = order.delivery_locker_location_id;
      const deliveryProviderSlug = order.delivery_locker_provider_slug;
      const deliveryLockerData = order.delivery_locker_data;

      if (deliveryLocationId && deliveryProviderSlug) {
        deliveryData = {
          type: "locker",
          location_id: deliveryLocationId,
          provider_slug: deliveryProviderSlug,
          locker_data: deliveryLockerData,
          address: shippingAddress || null,
        };
      } else if (deliveryLockerData?.id && deliveryLockerData?.provider_slug) {
        deliveryData = {
          type: "locker",
          location_id: deliveryLockerData.id,
          provider_slug: deliveryLockerData.provider_slug,
          locker_data: deliveryLockerData,
          address: shippingAddress || null,
        };
      } else {
        // Fallback to buyer profile
        const { data: buyerProfile } = await supabase
          .from("profiles")
          .select(
            "preferred_delivery_locker_location_id, preferred_delivery_locker_provider_slug, preferred_delivery_locker_data"
          )
          .eq("id", order.buyer_id)
          .maybeSingle();

        if (buyerProfile?.preferred_delivery_locker_location_id) {
          deliveryData = {
            type: "locker",
            location_id: buyerProfile.preferred_delivery_locker_location_id,
            provider_slug:
              buyerProfile.preferred_delivery_locker_provider_slug || "pargo",
            locker_data: buyerProfile.preferred_delivery_locker_data,
            address: shippingAddress || null,
          };
        } else {
          throw new Error("Buyer locker delivery information not found");
        }
      }
    } else {
      // Door delivery - require physical address
      if (!shippingAddress) {
        throw new Error("Buyer shipping address not found");
      }
      deliveryData = {
        type: "door",
        address: shippingAddress,
      };
    }

    // Get contact information from order
    const sellerName = order.seller_full_name || "Seller";
    const buyerName = order.buyer_full_name || "Customer";
    const sellerEmail = order.seller_email || "seller@example.com";
    const buyerEmail = order.buyer_email || "buyer@example.com";
    const sellerPhone = order.seller_phone_number || "0000000000";
    const buyerPhone = order.buyer_phone_number || "0000000000";

    // Verify buyer selected a courier during checkout
    if (!order.selected_courier_slug || !order.selected_service_code) {
      throw new Error("No courier selected during checkout");
    }

    console.info(
      `[commit-to-sale] Using buyer's selected courier: ${order.selected_courier_name} - ${order.selected_service_name}`,
    );

    // Build parcels array in TCG/ShipLogic format
    const parcels = (items || []).map((item) => ({
      parcel_description: item?.title || "Book",
      submitted_weight_kg: 1,
      submitted_length_cm: 25,
      submitted_width_cm: 20,
      submitted_height_cm: 3,
    }));

    // Initialize selected courier info from order
    let selectedCourierSlug = order.selected_courier_slug;
    let selectedServiceCode = order.selected_service_code;
    let selectedShippingCost = order.selected_shipping_cost;
    let selectedCourierName = order.selected_courier_name;
    let selectedServiceName = order.selected_service_name;
    let rateQuote: {
      provider_slug: string;
      service_level_code: string;
      cost: number;
      provider_name?: string;
      carrier?: string;
      service_name: string;
      transit_days?: number;
    } | null = null;

    // If seller is using locker pickup, recalculate rates for locker-to-locker route
    if (pickupType === "locker" && deliveryType === "locker" && pickupData && deliveryData) {
      try {
        const getRatesResponse = await supabase.functions.invoke("get-rates", {
          body: {
            collection_pickup_point_id: String(pickupData.location_id),
            delivery_pickup_point_id: String(deliveryData.location_id),
            parcels,
            declared_value: parcels.reduce((sum, p) => sum + 100, 0),
          },
        });

        if (
          !getRatesResponse.error &&
          getRatesResponse.data?.success &&
          getRatesResponse.data?.rates?.length > 0
        ) {
          // Flatten rates - may be nested by provider
          let allRates: any[] = [];
          for (const item of getRatesResponse.data.rates) {
            if (item.rates && Array.isArray(item.rates)) {
              for (const r of item.rates) {
                allRates.push({ ...r, _provider: item.provider });
              }
            } else {
              allRates.push(item);
            }
          }
          
          if (allRates.length > 0) {
            const rate = allRates[0];
            rateQuote = {
              provider_slug: rate.provider_slug || selectedCourierSlug || "tcg",
              service_level_code: rate.service_level?.code || rate.service_level_code || selectedServiceCode,
              cost: rate.rate || rate.base_rate?.charge || selectedShippingCost || 0,
              provider_name: rate._provider || rate.provider || selectedCourierName,
              service_name: rate.service_level?.name || rate.service_name || selectedServiceName || "Standard",
              transit_days: rate.service_level?.delivery_date_from ? 3 : 3,
            };
            selectedCourierSlug = rateQuote.provider_slug;
            selectedServiceCode = rateQuote.service_level_code;
            selectedShippingCost = rateQuote.cost;
            selectedCourierName = rateQuote.provider_name;
            selectedServiceName = rateQuote.service_name;
          }
        }
      } catch (e) {
      }
    }

    // Build shipment payload in TCG/ShipLogic API format
    const collectionAddress: Record<string, unknown> = {};
    const collectionContact: Record<string, unknown> = {
      name: sellerName,
      mobile_number: sellerPhone,
      email: sellerEmail,
    };
    const deliveryAddress: Record<string, unknown> = {};
    const deliveryContact: Record<string, unknown> = {
      name: buyerName,
      mobile_number: buyerPhone,
      email: buyerEmail,
    };

    // Add pickup/collection information based on type
    if (pickupData!.type === "locker") {
      // For locker pickup, we still need a collection address for the API
      collectionAddress.street_address = "";
      collectionAddress.city = "";
      collectionAddress.zone = "ZA";
      collectionAddress.country = "ZA";
      collectionAddress.code = "";
    } else {
      const pickupAddress = pickupData!.address as Record<string, string>;
      collectionAddress.street_address =
        pickupAddress.street ||
        pickupAddress.streetAddress ||
        pickupAddress.street_address || "";
      collectionAddress.local_area =
        pickupAddress.local_area ||
        pickupAddress.suburb ||
        pickupAddress.city || "";
      collectionAddress.city =
        pickupAddress.city ||
        pickupAddress.local_area ||
        pickupAddress.suburb || "";
      collectionAddress.zone = pickupAddress.province || pickupAddress.provinceCode || pickupAddress.zone || "ZA";
      collectionAddress.code =
        pickupAddress.postalCode ||
        pickupAddress.postal_code ||
        pickupAddress.code || "";
      collectionAddress.country = pickupAddress.country || "ZA";
      collectionAddress.company = sellerName;
    }

    // Add delivery information based on type
    if (deliveryData!.type === "locker") {
      const shippingAddr = deliveryData!.address as Record<string, string> | null;
      if (shippingAddr) {
        deliveryAddress.street_address =
          shippingAddr.street ||
          shippingAddr.streetAddress ||
          shippingAddr.street_address || "";
        deliveryAddress.local_area =
          shippingAddr.local_area ||
          shippingAddr.suburb ||
          shippingAddr.city || "";
        deliveryAddress.city =
          shippingAddr.city ||
          shippingAddr.local_area ||
          shippingAddr.suburb || "";
        deliveryAddress.zone = shippingAddr.province || shippingAddr.provinceCode || shippingAddr.zone || "ZA";
        deliveryAddress.code =
          shippingAddr.postalCode ||
          shippingAddr.postal_code ||
          shippingAddr.code || "";
        deliveryAddress.country = shippingAddr.country || "ZA";
      }
    } else {
      const shippingAddr = deliveryData!.address as Record<string, string>;
      deliveryAddress.street_address =
        shippingAddr.street ||
        shippingAddr.streetAddress ||
        shippingAddr.street_address || "";
      deliveryAddress.local_area =
        shippingAddr.local_area ||
        shippingAddr.suburb ||
        shippingAddr.city || "";
      deliveryAddress.city =
        shippingAddr.city ||
        shippingAddr.local_area ||
        shippingAddr.suburb || "";
      deliveryAddress.zone = shippingAddr.province || shippingAddr.provinceCode || shippingAddr.zone || "ZA";
      deliveryAddress.code =
        shippingAddr.postalCode ||
        shippingAddr.postal_code ||
        shippingAddr.code || "";
      deliveryAddress.country = shippingAddr.country || "ZA";
    }

    // Create shipment via unified create-shipment edge function (non-fatal)
    let shipmentData: Record<string, unknown> = {};
    let shipmentError: string | null = null;
    try {
      const shipmentBody: any = {
        order_id,
        collection_contact: collectionContact,
        delivery_contact: deliveryContact,
        parcels,
        service_level_code: selectedServiceCode,
        declared_value: parcels.length * 100,
        special_instructions_collection: "",
        special_instructions_delivery: "",
        customer_reference_name: "Order no.",
        customer_reference: order_id,
        provider: selectedCourierSlug === "shiplogic" ? undefined : selectedCourierSlug,
      };

      if (pickupType === "locker") {
        shipmentBody.collection_pickup_point_id = String(pickupData!.location_id);
      } else {
        shipmentBody.collection_address = collectionAddress;
      }

      if (deliveryType === "locker") {
        shipmentBody.delivery_pickup_point_id = String(deliveryData!.location_id);
      } else {
        shipmentBody.delivery_address = deliveryAddress;
      }

      const shipmentResponse = await supabase.functions.invoke(
        "create-shipment",
        {
          body: shipmentBody,
        }
      );

      if (shipmentResponse.error) {
        shipmentError = `Shipment creation failed: ${shipmentResponse.error.message || "Unknown"}`;
        console.error("[commit-to-sale]", shipmentError);
      } else if (shipmentResponse.data?.success) {
        shipmentData = {
          shipment_id: shipmentResponse.data.shipment?.id,
          tracking_number: shipmentResponse.data.tracking_reference,
          waybill_url: null, // Fetched separately via get-shipment-label
          provider: shipmentResponse.data.provider,
        };
      } else {
        shipmentError = `Shipment creation failed: ${shipmentResponse.data?.error || "Unknown"}`;
        console.error("[commit-to-sale]", shipmentError);
      }
    } catch (e) {
      shipmentError = `Shipment creation exception: ${e instanceof Error ? e.message : String(e)}`;
      console.error("[commit-to-sale]", shipmentError);
    }

    // Build updated delivery_data
    const deliveryDataUpdate: Record<string, unknown> = {
      ...(order.delivery_data || {}),
      courier: selectedCourierSlug || "tcg",
      provider: selectedCourierName || "The Courier Guy",
      provider_slug: selectedCourierSlug,
      service_level: selectedServiceName || "Standard",
      service_level_code: selectedServiceCode,
      rate_amount: typeof selectedShippingCost === 'number' ? selectedShippingCost / 100 : 0,
      delivery_price: selectedShippingCost,
      shipment_id: shipmentData.shipment_id,
      waybill_url: shipmentData.waybill_url,
      pickup_type: pickupType,
      delivery_type: deliveryType,
    };

    // Add locker details if both are locker shipments
    if (pickupType === "locker" && deliveryType === "locker") {
      deliveryDataUpdate.zone_type = "locker-to-locker";
      deliveryDataUpdate.pickup_locker = pickupData!.locker_data;
      deliveryDataUpdate.delivery_locker = deliveryData!.locker_data;
    }

    // Add delivery quote info from rate quote if available
    if (rateQuote) {
      deliveryDataUpdate.delivery_quote = {
        price: rateQuote.cost / 100,
        courier: selectedCourierSlug || "tcg",
        zone_type:
          pickupType === "locker" && deliveryType === "locker"
            ? "locker-to-locker"
            : "door",
        description: `${rateQuote.provider_name} - ${rateQuote.service_name}`,
        service_name: rateQuote.service_name,
        provider_name: rateQuote.provider_name,
        provider_slug: rateQuote.provider_slug,
        estimated_days: rateQuote.transit_days,
        service_level_code: rateQuote.service_level_code,
      };
    }

    // Update order with commitment and shipment details
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "committed",
        committed_at: new Date().toISOString(),
        delivery_status: "scheduled",
        tracking_number: shipmentData.tracking_number || order.tracking_number || null,
        selected_courier_slug: selectedCourierSlug,
        selected_service_code: selectedServiceCode,
        selected_shipping_cost: selectedShippingCost,
        selected_courier_name: selectedCourierName,
        selected_service_name: selectedServiceName,
        delivery_data: deliveryDataUpdate,
        pickup_type: pickupType,
        pickup_locker_location_id:
          pickupType === "locker"
            ? pickupLockerLocationId || pickupData?.location_id
            : order.pickup_locker_location_id,
        pickup_locker_provider_slug:
          pickupType === "locker"
            ? pickupLockerProviderSlug || pickupData?.provider_slug
            : order.pickup_locker_provider_slug,
        pickup_locker_data:
          pickupType === "locker"
            ? pickupLockerDataToSave || pickupData?.locker_data
            : order.pickup_locker_data,
        delivery_type: deliveryType,
        delivery_locker_location_id:
          deliveryType === "locker"
            ? deliveryData!.location_id
            : order.delivery_locker_location_id,
        delivery_locker_provider_slug:
          deliveryType === "locker"
            ? deliveryData!.provider_slug
            : order.delivery_locker_provider_slug,
        delivery_locker_data:
          deliveryType === "locker"
            ? deliveryData!.locker_data
            : order.delivery_locker_data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id);

    if (updateError) {
      throw new Error("Failed to update order");
    }


    // Send email notifications
    const deliveryMethodText =
      deliveryType === "locker" ? "to your selected locker" : "to your address";
    const pickupMethodText =
      pickupType === "locker" ? "from your selected locker" : "from your address";

    // Buyer email
    const buyerHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">🎉 Order Confirmed!</h1>
        <p>Great news, ${buyerName}!</p>
        <p>${sellerName} has confirmed your order and is preparing your book(s) for delivery ${deliveryMethodText}.</p>
        <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h2 style="margin-top: 0;">📚 Order Details</h2>
          <p><strong>Order ID:</strong> ${order_id}</p>
          <p><strong>Book(s):</strong> ${(items || [])
        .map((item) => item.title || "Book")
        .join(", ")}</p>
          <p><strong>Seller:</strong> ${sellerName}</p>
          <p><strong>Delivery Method:</strong> ${deliveryType === "locker" ? "Locker Delivery" : "Door-to-Door"
      }</p>
          <p><strong>Estimated Delivery:</strong> 2-3 business days</p>
          ${shipmentData.tracking_number
        ? `<p><strong>Tracking Number:</strong> ${shipmentData.tracking_number}</p>`
        : ""
      }
        </div>
        <p>Happy reading! 📖</p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
        <p style="font-size: 12px; color: #6B7280;">
          This is an automated message from ReBooked Solutions.<br />
          For assistance, contact: support@rebookedsolutions.co.za
        </p>
      </div>
    `;

    // Seller email
    const sellerHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">✅ Order Commitment Confirmed!</h1>
        <p>Thank you, ${sellerName}!</p>
        <p>You've successfully committed to sell your book(s). The buyer has been notified and pickup has been scheduled ${pickupMethodText}.</p>
        <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h2 style="margin-top: 0;">📋 Order Details</h2>
          <p><strong>Order ID:</strong> ${order_id}</p>
          <p><strong>Book(s):</strong> ${(items || [])
        .map((item) => item.title || "Book")
        .join(", ")}</p>
          <p><strong>Buyer:</strong> ${buyerName}</p>
          <p><strong>Pickup Method:</strong> ${pickupType === "locker" ? "Locker Pickup" : "Door-to-Door"
      }</p>
          ${shipmentData.tracking_number
        ? `<p><strong>Tracking Number:</strong> ${shipmentData.tracking_number}</p>`
        : ""
      }
        </div>
        <p>${pickupType === "locker"
        ? "Please drop off your package at the selected locker location."
        : "A courier will contact you within 24 hours to arrange pickup."
      }</p>
        <p>Thank you for selling with ReBooked Solutions! 📚</p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
        <p style="font-size: 12px; color: #6B7280;">
          This is an automated message from ReBooked Solutions.<br />
          For assistance, contact: support@rebookedsolutions.co.za
        </p>
      </div>
    `;

    // Send emails (non-blocking)
    try {
      await supabase.functions.invoke("send-email", {
        body: {
          to: buyerEmail,
          subject: "Order Confirmed - Pickup Scheduled",
          html: buyerHtml,
        },
      });
    } catch (e) {
    }

    try {
      await supabase.functions.invoke("send-email", {
        body: {
          to: sellerEmail,
          subject: "Order Commitment Confirmed - Prepare for Pickup",
          html: sellerHtml,
        },
      });
    } catch (e) {
    }

    // Create notifications for both parties
    const notifications: Array<{
      user_id: string;
      type: string;
      title: string;
      message: string;
    }> = [];

    if (order.buyer_id) {
      notifications.push({
        user_id: order.buyer_id,
        type: "success",
        title: "Order Confirmed",
        message: `Your order has been confirmed and will be delivered ${deliveryMethodText}. Tracking: ${shipmentData.tracking_number || "TBA"
          }`,
      });
    }

    if (order.seller_id) {
      notifications.push({
        user_id: order.seller_id,
        type: "success",
        title: "Order Committed",
        message: `You have successfully committed to the order. Pickup ${pickupMethodText}. Tracking: ${shipmentData.tracking_number || "TBA"
          }`,
      });
    }

    if (notifications.length > 0) {
      try {
        await supabase.from("notifications").insert(notifications);
      } catch (e) {
      }
    }


    return new Response(
      JSON.stringify({
        success: true,
        message: shipmentError
          ? "Order committed successfully but shipment creation had issues. Our team will follow up."
          : "Order committed successfully",
        tracking_number: shipmentData.tracking_number || null,
        waybill_url: shipmentData.waybill_url || null,
        pickup_type: pickupType,
        delivery_type: deliveryType,
        shipment_warning: shipmentError || undefined,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
