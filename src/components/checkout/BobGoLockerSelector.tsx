import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Loader2,
  Clock,
  Phone,
  Navigation,
  Info,
  CheckCircle,
  Save,
} from "lucide-react";
import { fetchSuggestions, fetchAddressDetails, type Suggestion } from "@/services/addressAutocompleteService";
import { getBobGoLocations, type BobGoLocation } from "@/services/bobgoLocationsService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface PudoLockerSelectorProps {
  onLockerSelect: (locker: BobGoLocation) => void;
  onAfterSave?: (locker: BobGoLocation) => void;
  selectedLockerId?: string;
  title?: string;
  description?: string;
  showCardLayout?: boolean;
  requiredProviderSlug?: string | null;
}

const PudoLockerSelector: React.FC<PudoLockerSelectorProps> = ({
  onLockerSelect,
  onAfterSave,
  selectedLockerId,
  title = "Select a Pudo Locker",
  description = "Find and select a nearby Courier Guy Pudo locker",
  showCardLayout = true,
  requiredProviderSlug = null,
}) => {
  const { refreshProfile } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [locations, setLocations] = useState<BobGoLocation[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [showLocations, setShowLocations] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [savingLockerId, setSavingLockerId] = useState<string | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search for addresses
  const handleSearch = async (value: string) => {
    setSearchInput(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!value.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await fetchSuggestions(value);
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch (error) {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  // Handle address selection and fetch BobGo locations
  const handleSelectAddress = async (placeId: string, description: string) => {
    setSearchInput(description);
    setSelectedAddress(description);
    setShowDropdown(false);

    try {
      setIsLoadingLocations(true);
      const details = await fetchAddressDetails(placeId);

      if (details && details.lat && details.lng) {
        try {
          const lat = typeof details.lat === 'string' ? parseFloat(details.lat) : details.lat;
          const lng = typeof details.lng === 'string' ? parseFloat(details.lng) : details.lng;

          // Fetch nearby pickup point locations - using "locker" type like in Profile
          const nearbyLocations = await getBobGoLocations(lat, lng, 10, "locker");

          // Sync with Profile logic: The service already returns the correct results, no need for restrictive frontend filtering
          let filteredLocations = nearbyLocations;

          // Apply user instruction: "we just use:tcg-locker"
          // If a requiredProviderSlug is passed (from seller), we must use it.
          // Otherwise, we default to tcg-locker (Pudo) as per user preference.
          const providerToFilter = requiredProviderSlug || "tcg-locker";

          filteredLocations = nearbyLocations.filter(
            (loc: BobGoLocation) => loc.provider_slug === providerToFilter
          );

          setLocations(filteredLocations);
          setShowLocations(true);
        } catch (locationsError) {
          // Log location fetch error but don't crash
          console.warn("Failed to fetch Pudo locations:", locationsError);
          setLocations([]);
          setShowLocations(true);
        }
      } else {
        setLocations([]);
      }
    } catch (error) {
      console.warn("Failed to fetch address details:", error);
      setLocations([]);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  // Save locker to profile
  const handleSaveLockerToProfile = async (location: BobGoLocation) => {
    try {
      setSavingLockerId(location.id || "");

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to save a locker");
        return;
      }

      // Check if a locker is already saved
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("preferred_delivery_locker_data")
        .eq("id", user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      const hasSavedLocker = profile?.preferred_delivery_locker_data;

      // If a locker is already saved, show confirmation
      if (hasSavedLocker) {
        const oldLockerName = (hasSavedLocker as any)?.name || "your saved locker";
        const proceed = window.confirm(
          `You already have "${oldLockerName}" saved as your locker.\n\nDo you want to replace it with "${location.name}"?`
        );
        if (!proceed) {
          setSavingLockerId(null);
          return;
        }
      }

      // Safe numeric ID handling for integer DB column
      const lockerId = location.id ? String(location.id) : null;
      const numericLockerId = lockerId && !isNaN(Number(lockerId)) ? parseInt(lockerId) : null;

      const { error } = await supabase
        .from("profiles")
        .update({
          preferred_delivery_locker_data: location,
          preferred_pickup_locker_location_id: numericLockerId,
          preferred_pickup_locker_provider_slug: location.provider_slug || null,
          preferred_delivery_locker_saved_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Locker saved! 🎉", {
        description: `${location.name} is now saved to your profile`,
      });

      // Refresh profile in context instead of reloading page
      await refreshProfile();

      if (onAfterSave) {
        onAfterSave(location);
      }
    } catch (error) {
      toast.error("Failed to save locker to profile");
    } finally {
      setSavingLockerId(null);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  const formatAddress = (addr: any): string => {
    if (!addr) return "";
    if (typeof addr === "string") return addr;
    if (typeof addr === "object") {
      const parts = [
        addr.street_address || addr.address,
        addr.city,
        addr.code || addr.postal_code,
        addr.country
      ].filter(Boolean);
      return parts.length > 0 ? parts.join(", ") : JSON.stringify(addr);
    }
    return String(addr);
  };

  const content = (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        {description}
      </p>

      {/* Provider Filtering Alert */}
      {requiredProviderSlug && (
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 text-xs">
            Showing only {requiredProviderSlug === 'tcg-locker' ? 'Pudo' : requiredProviderSlug} lockers to match the seller's collection point.
          </AlertDescription>
        </Alert>
      )}

      {/* Address Search Input */}
      <div className="relative" ref={dropdownRef}>
        <Label htmlFor="pudo-locker-search">Search Address</Label>
        <div className="relative mt-2">
          <Input
            id="pudo-locker-search"
            type="text"
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Enter an address to find nearby Pudo lockers..."
            className="pr-10"
          />
          {/* Mini Loading Indicator */}
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-book-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-book-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-book-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute z-[70] w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.place_id}
                onClick={() =>
                  handleSelectAddress(suggestion.place_id, suggestion.description)
                }
                className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors border-b last:border-b-0 text-sm"
                type="button"
              >
                {suggestion.description}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoadingLocations && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      )}

      {/* Pudo Locations List */}
      {locations.length > 0 && !isLoadingLocations && (
        <div className="space-y-3">
          <h3 className="font-medium text-sm text-gray-700">
            {locations.length} Pudo lockers found
            {selectedAddress && ` near ${selectedAddress}`}
          </h3>
          <div className="max-h-96 overflow-y-auto space-y-3 border border-gray-200 rounded-lg p-2 bg-gray-50/50">
            {locations.map((location, index) => {
              const isSelected = selectedLockerId === location.id;
              return (
                <div
                  key={location.id || index}
                  className={`p-3 bg-white border rounded-xl hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row gap-3 items-start ${
                    isSelected
                      ? "border-book-500 bg-book-50/50"
                      : "border-book-100"
                  }`}
                  onClick={() => onLockerSelect(location)}
                >
                  {/* Image on Left - Desktop Only, Centered Mobile */}
                  {(location.image_url || location.pickup_point_provider_logo_url) && (
                    <div
                      className="flex justify-center sm:justify-start flex-shrink-0 w-full sm:w-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(location.image_url || location.pickup_point_provider_logo_url || null);
                      }}
                    >
                      <img
                        src={location.image_url || location.pickup_point_provider_logo_url}
                        alt={location.name || "Location image"}
                        className="w-full sm:w-20 sm:h-20 h-32 object-cover rounded-lg border border-gray-100 cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Content Section */}
                  <div className="flex-1 w-full min-w-0">
                  {/* Header Section with Name and Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <h4 className="font-bold text-base text-gray-900 flex items-center gap-1.5 truncate">
                      <MapPin className="h-4 w-4 text-book-600 flex-shrink-0" />
                      {location.name || location.human_name || location.location_name || location.title || `Locker ${index + 1}`}
                    </h4>
                    <div className="flex items-center gap-2">
                      {location.pickup_point_provider_name && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 h-5 px-1.5 text-[10px] uppercase font-bold tracking-wider">
                          {location.pickup_point_provider_name}
                        </Badge>
                      )}
                      {location.type && (
                        <Badge variant="secondary" className="bg-book-50 text-book-700 hover:bg-book-100 border-none h-5 px-1.5 text-[10px] uppercase font-bold tracking-wider">
                          {location.type}
                        </Badge>
                      )}
                      {isSelected && (
                        <Badge className="bg-green-100 text-green-700 border-none h-5 px-1.5 text-[10px] uppercase font-bold">
                          Selected
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Main Content Grid - More Compact */}
                  <div className="space-y-2">
                    {/* Address & Hours Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                      {/* Full Address */}
                      {(location.full_address || location.address) && (
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Address</p>
                          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                            {formatAddress(location.full_address || location.address)}
                          </p>
                        </div>
                      )}

                      {/* Operating Hours */}
                      {location.trading_hours && (
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-0.5">
                            <Clock className="h-3.5 w-3.5" /> Hours
                          </p>
                          <p className="text-xs text-gray-600 line-clamp-1">
                            {location.trading_hours}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* ID and Details Row */}
                    <div className="flex flex-wrap gap-x-4 gap-y-2 py-2 border-y border-gray-50">
                      {location.id && (
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ID</span>
                          <span className="text-xs font-mono text-gray-600">{location.id}</span>
                        </div>
                      )}

                      {(location.distance || location.distance_km) && (
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Distance</span>
                          <span className="text-xs text-gray-600 font-medium">
                            {typeof location.distance === "number"
                              ? `${location.distance.toFixed(1)} km`
                              : typeof location.distance_km === "number"
                              ? `${location.distance_km.toFixed(1)} km`
                              : location.distance || location.distance_km}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Save to Profile Button - More Compact */}
                    <div className="pt-1">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveLockerToProfile(location);
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto min-w-[140px] h-8 text-xs border-book-200 text-book-700 hover:bg-book-50 hover:border-book-300 rounded-lg font-medium"
                      >
                        {savingLockerId === location.id ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-3 w-3 mr-2" />
                            Save to Profile
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Locations Found */}
      {selectedAddress && locations.length === 0 && !isLoadingLocations && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            No Pudo locker locations available in this area. You can try searching a nearby suburb or major shopping center.
          </AlertDescription>
        </Alert>
      )}

      {/* Info Alert - Show when no search has been done yet */}
      {!selectedAddress && locations.length === 0 && !isLoadingLocations && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Search for an address above to find nearby Pudo locker locations.
            Click on any location to select it for delivery.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  if (showCardLayout) {
    return (
      <>
        <Card className="border-2 border-book-100 hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-book-50 to-book-100">
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-book-600" />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {content}
          </CardContent>
        </Card>

        {/* Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-auto">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Location Image</h3>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-light"
                >
                  ×
                </button>
              </div>
              <div className="p-4 flex items-center justify-center">
                <img
                  src={selectedImage}
                  alt="Location"
                  className="w-full h-auto rounded"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {content}
      {/* Image Modal for non-card layout */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Location Image</h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-light"
              >
                ×
              </button>
            </div>
            <div className="p-4 flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Location"
                className="w-full h-auto rounded"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PudoLockerSelector;
