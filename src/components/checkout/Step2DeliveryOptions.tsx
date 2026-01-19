import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Truck,
  MapPin,
  Clock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  X,
  Edit3,
  CheckCircle,
} from "lucide-react";
import { CheckoutAddress, DeliveryOption } from "@/types/checkout";
import { toast } from "sonner";
import { getAllDeliveryQuotes, type UnifiedQuote } from "@/services/unifiedDeliveryService";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import BobGoLockerSelector from "@/components/checkout/BobGoLockerSelector";
import { BobGoLocation } from "@/services/bobgoLocationsService";
import { getProvinceFromLocker } from "@/utils/provinceExtractorUtils";
import { useAuth } from "@/contexts/AuthContext";

interface Step2DeliveryOptionsProps {
  buyerAddress: CheckoutAddress;
  sellerAddress: CheckoutAddress | null;
  sellerLockerData?: BobGoLocation | null;
  sellerPreferredPickupMethod?: "locker" | "pickup" | null;
  onSelectDelivery: (option: DeliveryOption) => void;
  onBack: () => void;
  onCancel?: () => void;
  onEditAddress?: () => void;
  selectedDelivery?: DeliveryOption;
  preSelectedLocker?: BobGoLocation | null;
}

const Step2DeliveryOptions: React.FC<Step2DeliveryOptionsProps> = ({
  buyerAddress,
  sellerAddress,
  sellerLockerData,
  sellerPreferredPickupMethod,
  onSelectDelivery,
  onBack,
  onCancel,
  onEditAddress,
  selectedDelivery,
  preSelectedLocker,
}) => {
  const { user } = useAuth();
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [quotes, setQuotes] = useState<UnifiedQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocker, setSelectedLocker] = useState<BobGoLocation | null>(null);
  const [lockerRatesLoading, setLockerRatesLoading] = useState(false);
  const [localSelectedDelivery, setLocalSelectedDelivery] = useState<DeliveryOption | undefined>(selectedDelivery);

  useEffect(() => {
    // If a locker was pre-selected in Step1.5, automatically calculate locker rates
    if (preSelectedLocker) {
      setSelectedLocker(preSelectedLocker);
      recalculateRatesForLocker(preSelectedLocker);
    } else {
      fetchDeliveryOptions();
    }
  }, [buyerAddress, sellerAddress, sellerLockerData, preSelectedLocker]);

  useEffect(() => {
    // Recalculate rates when a locker is selected
    if (selectedLocker && selectedDelivery?.courier === "bobgo") {
      recalculateRatesForLocker(selectedLocker);
    } else if (!selectedLocker && selectedDelivery?.courier === "bobgo") {
      // Revert to original home delivery rates if locker is deselected
      fetchDeliveryOptions();
    }
  }, [selectedLocker]);

  useEffect(() => {
    // Sync prop selection to local state
    setLocalSelectedDelivery(selectedDelivery);
  }, [selectedDelivery]);

  useEffect(() => {
    // Auto-select first delivery option when locker options are loaded and none is selected yet
    if (deliveryOptions.length > 0 && !localSelectedDelivery && preSelectedLocker) {
      const firstOption = deliveryOptions[0];
      setLocalSelectedDelivery(firstOption);
    }
  }, [deliveryOptions, preSelectedLocker]);

  const recalculateRatesForLocker = async (locker: BobGoLocation) => {
    setLockerRatesLoading(true);
    setError(null);

    try {
      if (!locker.id || !locker.provider_slug) {
        throw new Error("Locker is missing required information (ID or provider slug)");
      }

      // Determine if seller has only locker (no physical address)
      const sellerHasOnlyLocker = !sellerAddress && sellerLockerData;

      // Validate provider slug for locker-to-locker shipments
      if (sellerHasOnlyLocker && locker.provider_slug && sellerLockerData?.provider_slug) {
        if (locker.provider_slug !== sellerLockerData.provider_slug) {
          throw new Error(
            `Locker provider mismatch: Seller's locker uses "${sellerLockerData.provider_slug}" but you selected a "${locker.provider_slug}" locker. For locker-to-locker delivery, both must use the same provider.`
          );
        }
      }

      const quoteRequest: any = {
        to: {
          streetAddress: buyerAddress.street,
          suburb: buyerAddress.city,
          city: buyerAddress.city,
          province: buyerAddress.province,
          postalCode: buyerAddress.postal_code,
        },
        weight: 1,
        deliveryLocker: {
          locationId: locker.id || "",
          providerSlug: locker.provider_slug || "",
        },
        user_id: user?.id,
      };

      // If seller has only locker, use it as the collection point; otherwise use address
      if (sellerHasOnlyLocker && sellerLockerData?.id && sellerLockerData?.provider_slug) {
        quoteRequest.from = {
          streetAddress: "",
          city: "",
          province: "",
          postalCode: "",
        };
        quoteRequest.sellerCollectionPickupPoint = {
          locationId: sellerLockerData.id,
          providerSlug: sellerLockerData.provider_slug,
        };
      } else if (sellerAddress) {
        quoteRequest.from = {
          streetAddress: sellerAddress.street,
          suburb: sellerAddress.city,
          city: sellerAddress.city,
          province: sellerAddress.province,
          postalCode: sellerAddress.postal_code,
        };
      } else {
        throw new Error("No seller address or locker location available for rate calculation");
      }

      const quotesResp = await getAllDeliveryQuotes(quoteRequest);

      setQuotes(quotesResp);

      const DELIVERY_MARKUP = 15;
      const options: DeliveryOption[] = quotesResp.map((q) => ({
        courier: "bobgo",
        service_name: q.service_name,
        price: q.cost + DELIVERY_MARKUP,
        estimated_days: q.transit_days,
        description: `${q.provider_name} - ${q.features?.join(", ") || "Tracked"}`,
        zone_type: "locker",
        provider_name: q.provider_name,
        provider_slug: q.provider_slug,
        service_level_code: q.service_level_code,
      }));

      if (options.length > 0) {
        setDeliveryOptions(options);
      }
    } catch (err) {
      setError("Failed to recalculate rates for locker delivery");
      toast.warning("Could not update rates for locker");
    } finally {
      setLockerRatesLoading(false);
      setLoading(false);
    }
  };

  const fetchDeliveryOptions = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use seller's preferred pickup method to determine which address to use for rates
      const useLockerForRates =
        sellerPreferredPickupMethod === "locker" && sellerLockerData?.id && sellerLockerData?.provider_slug;
      const useAddressForRates =
        sellerPreferredPickupMethod === "pickup" && sellerAddress;

      // Fallback if no preference: use locker if available, otherwise use address
      const sellerHasOnlyLocker = !sellerAddress && sellerLockerData;

      if ((useLockerForRates || sellerHasOnlyLocker) && sellerLockerData?.id && sellerLockerData?.provider_slug) {
        const quotesResp = await getAllDeliveryQuotes({
          from: {
            streetAddress: "",
            city: "",
            province: "",
            postalCode: "",
          },
          to: {
            streetAddress: buyerAddress.street,
            suburb: buyerAddress.city,
            city: buyerAddress.city,
            province: buyerAddress.province,
            postalCode: buyerAddress.postal_code,
          },
          weight: 1,
          sellerCollectionPickupPoint: {
            locationId: sellerLockerData.id,
            providerSlug: sellerLockerData.provider_slug,
          },
          user_id: user?.id,
        });

        setQuotes(quotesResp);

        const DELIVERY_MARKUP = 15;
        const options: DeliveryOption[] = quotesResp.map((q) => ({
          courier: "bobgo",
          service_name: q.service_name,
          price: q.cost + DELIVERY_MARKUP,
          estimated_days: q.transit_days,
          description: `${q.provider_name} - ${q.features?.join(", ") || "Tracked"}`,
          zone_type: "locker",
          provider_name: q.provider_name,
          provider_slug: q.provider_slug,
          service_level_code: q.service_level_code,
        }));

        if (options.length === 0) {
          throw new Error("No quotes available");
        }

        setDeliveryOptions(options);
      } else if (useAddressForRates || (sellerAddress && !sellerHasOnlyLocker)) {
        const quotesResp = await getAllDeliveryQuotes({
          from: {
            streetAddress: sellerAddress.street,
            suburb: sellerAddress.city,
            city: sellerAddress.city,
            province: sellerAddress.province,
            postalCode: sellerAddress.postal_code,
          },
          to: {
            streetAddress: buyerAddress.street,
            suburb: buyerAddress.city,
            city: buyerAddress.city,
            province: buyerAddress.province,
            postalCode: buyerAddress.postal_code,
          },
          weight: 1,
          user_id: user?.id,
        });

        setQuotes(quotesResp);

        const DELIVERY_MARKUP = 15;
        const options: DeliveryOption[] = quotesResp.map((q) => ({
          courier: "bobgo",
          service_name: q.service_name,
          price: q.cost + DELIVERY_MARKUP,
          estimated_days: q.transit_days,
          description: `${q.provider_name} - ${q.features?.join(", ") || "Tracked"}`,
          zone_type: buyerAddress.province === sellerAddress.province
            ? (buyerAddress.city === sellerAddress.city ? "local" : "provincial")
            : "national",
          provider_name: q.provider_name,
          provider_slug: q.provider_slug,
          service_level_code: q.service_level_code,
        }));

        if (options.length === 0) {
          throw new Error("No quotes available");
        }

        setDeliveryOptions(options);
      } else {
        throw new Error("No seller address or locker location available");
      }
    } catch (err) {
      setError("Failed to load delivery options");

      // Determine zone for fallback
      let fallbackZoneType: "local" | "provincial" | "national" | "locker" = "national";
      if (sellerAddress && buyerAddress) {
        fallbackZoneType = buyerAddress.province === sellerAddress.province
          ? (buyerAddress.city === sellerAddress.city ? "local" : "provincial")
          : "national";
      } else if (!sellerAddress && sellerLockerData) {
        fallbackZoneType = "locker";
      }

      setDeliveryOptions([
        {
          courier: "bobgo",
          service_name: "Standard Delivery",
          price: 107,
          estimated_days: 3,
          description: "Estimated rate - tracking included",
          zone_type: fallbackZoneType,
        },
      ]);
      toast.warning("Using estimated delivery rate");
    } finally {
      setLoading(false);
    }
  };

  const getZoneBadgeColor = (zoneType: string) => {
    switch (zoneType) {
      case "local":
        return "bg-green-100 text-green-800";
      case "provincial":
        return "bg-blue-100 text-blue-800";
      case "national":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-semibold mb-2">
              Loading Delivery Options
            </h3>
            <p className="text-gray-600">Calculating shipping costs...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || deliveryOptions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">
              Unable to Load Delivery Options
            </h3>
            <p className="text-gray-600 mb-4">
              {error || "No delivery options available for this route"}
            </p>
            <div className="space-x-4">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={fetchDeliveryOptions}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Shipping Options
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Choose your preferred delivery method
        </p>
      </div>

      {/* Address Summary */}
      <Card className="border border-gray-200 shadow-md">
        <CardHeader className="pb-4 border-b border-gray-100">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            Delivery To
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                {preSelectedLocker ? (
                  <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
                    <p className="text-sm font-semibold text-purple-900 mb-1">
                      📍 {preSelectedLocker.name}
                    </p>
                    <p className="text-sm text-purple-800">
                      {preSelectedLocker.address || preSelectedLocker.full_address}
                    </p>
                    {preSelectedLocker.provider_slug && (
                      <p className="text-xs text-purple-700 mt-2">
                        Provider: {preSelectedLocker.pickup_point_provider_name || preSelectedLocker.provider_slug}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                    <p className="text-sm font-semibold text-gray-900 mb-1">Your Delivery Address</p>
                    <p className="text-sm text-gray-700">
                      {buyerAddress.street}, {buyerAddress.city},{" "}
                      {buyerAddress.province} {buyerAddress.postal_code}
                    </p>
                  </div>
                )}
              </div>
              {onEditAddress && !preSelectedLocker && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEditAddress}
                  className="mt-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Options grouped by courier */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Available Services</h2>
        <Accordion type="multiple" className="space-y-3">
          {Object.entries(
            quotes.reduce<Record<string, UnifiedQuote[]>>((acc, q) => {
              const key = q.provider_name || "Unknown";
              (acc[key] ||= []).push(q);
              return acc;
            }, {})
          ).map(([courier, items]) => (
            <AccordionItem key={courier} value={courier} className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              <AccordionTrigger className="px-5 sm:px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-base sm:text-lg font-semibold text-gray-900">{courier}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-0">
                <div className="divide-y">
                  {items.map((q, idx) => {
                    let zoneType: "local" | "provincial" | "national" | "locker" = "national";
                    if (sellerAddress && buyerAddress) {
                      zoneType = buyerAddress.province === sellerAddress.province
                        ? buyerAddress.city === sellerAddress.city
                          ? "local"
                          : "provincial"
                        : "national";
                    } else if (!sellerAddress && sellerLockerData) {
                      zoneType = "locker";
                    }

                    const option: DeliveryOption = {
                      courier: "bobgo",
                      service_name: q.service_name,
                      price: q.cost + 15,
                      estimated_days: typeof q.transit_days === "number" ? q.transit_days : 3,
                      description: `${courier}`,
                      zone_type: zoneType,
                      provider_name: q.provider_name,
                      provider_slug: q.provider_slug,
                      service_level_code: q.service_level_code,
                    };
                    const isSelected = !!localSelectedDelivery &&
                      localSelectedDelivery.service_name === option.service_name &&
                      localSelectedDelivery.price === option.price;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between gap-4 p-4 sm:p-5 transition-colors cursor-pointer ${
                          isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                        }`}
                        onClick={() => { setLocalSelectedDelivery(option); onSelectDelivery(option); }}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                            <span className="font-semibold text-gray-900">{q.service_name}</span>
                            <span className="text-lg font-bold text-green-600">R{(q.cost + 15).toFixed(2)}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-600">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {option.estimated_days} day{option.estimated_days > 1 ? "s" : ""}
                            </span>
                            {q.collection_cutoff && (
                              <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-amber-800 font-medium">
                                Cut-off: {q.collection_cutoff}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          className={`shrink-0 inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold transition-all border-2 whitespace-nowrap ${
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600 shadow-md"
                              : "bg-white text-gray-900 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                          }`}
                          onClick={(e) => { e.stopPropagation(); onSelectDelivery(option); }}
                        >
                          {isSelected ? "✓ Selected" : "Select"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Disclaimer about same-day delivery */}
      <Alert className="bg-amber-50 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          Note: “Same day delivery” refers to the courier service level. The seller must first confirm/commit the order before pickup can be scheduled.
        </AlertDescription>
      </Alert>


      {!localSelectedDelivery && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please select a delivery option to continue.
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center gap-3 pt-6 border-t">
        <Button
          variant="outline"
          onClick={onBack}
          className="py-2 px-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Back</span>
          <span className="sm:hidden">←</span>
        </Button>

        <div className="flex gap-3">
          {onCancel && (
            <Button
              variant="ghost"
              onClick={onCancel}
              className="py-2 px-4"
            >
              <X className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Cancel</span>
            </Button>
          )}
          <Button
            onClick={() => localSelectedDelivery && onSelectDelivery(localSelectedDelivery)}
            disabled={!localSelectedDelivery}
            className="py-2 px-4 bg-blue-600 hover:bg-blue-700"
          >
            Next: Payment
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Step2DeliveryOptions;
