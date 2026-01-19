import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  MapPin,
  Loader2,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Save,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import BobGoLockerSelector from "@/components/checkout/BobGoLockerSelector";
import { BobGoLocation } from "@/services/bobgoLocationsService";

interface Step1point5DeliveryMethodProps {
  bookTitle: string;
  onSelectDeliveryMethod: (
    method: "home" | "locker",
    locker?: BobGoLocation | null
  ) => void;
  onBack: () => void;
  onCancel?: () => void;
  loading?: boolean;
  preSelectedMethod?: "home" | "locker" | null;
}

const Step1point5DeliveryMethod: React.FC<Step1point5DeliveryMethodProps> = ({
  bookTitle,
  onSelectDeliveryMethod,
  onBack,
  onCancel,
  loading = false,
  preSelectedMethod = null,
}) => {
  const [deliveryMethod, setDeliveryMethod] = useState<"home" | "locker">(preSelectedMethod || "locker");
  const [selectedLocker, setSelectedLocker] = useState<BobGoLocation | null>(null);
  const [savedLocker, setSavedLocker] = useState<BobGoLocation | null>(null);
  const [isLoadingSavedLocker, setIsLoadingSavedLocker] = useState(true);
  const [isSavingLocker, setIsSavingLocker] = useState(false);
  const [wantToChangeLocker, setWantToChangeLocker] = useState(false);

  // Load saved locker from profile on mount
  useEffect(() => {
    loadSavedLocker();
  }, []);

  // Auto-select delivery method and locker when clicking locker option
  const handleSelectLockerMethod = (currentSavedLocker: BobGoLocation | null) => {
    setDeliveryMethod("locker");
    // Automatically select the saved locker if it exists
    if (currentSavedLocker) {
      setSelectedLocker(currentSavedLocker);
    }
  };

  const loadSavedLocker = async () => {
    try {
      setIsLoadingSavedLocker(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIsLoadingSavedLocker(false);
        return;
      }

      // Fetch user profile with locker preferences
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("preferred_delivery_locker_data")
        .eq("id", user.id)
        .single();

      if (error) {
        setIsLoadingSavedLocker(false);
        return;
      }

      if (profile?.preferred_delivery_locker_data) {
        const lockerData = profile.preferred_delivery_locker_data as BobGoLocation;
        setSavedLocker(lockerData);
      }
    } catch (error) {
    } finally {
      setIsLoadingSavedLocker(false);
    }
  };

  const handleSaveLockerToProfile = async () => {
    if (!selectedLocker) {
      toast.error("Please select a locker first");
      return;
    }

    try {
      setIsSavingLocker(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to save locker");
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
          `You already have "${oldLockerName}" saved as your locker.\n\nDo you want to replace it with "${selectedLocker.name}"?`
        );
        if (!proceed) {
          setIsSavingLocker(false);
          return;
        }
      }

      // Update user profile with full locker data
      const { error } = await supabase
        .from("profiles")
        .update({
          preferred_delivery_locker_data: selectedLocker,
          preferred_pickup_locker_location_id: selectedLocker.id ? parseInt(selectedLocker.id) : null,
          preferred_pickup_locker_provider_slug: selectedLocker.provider_slug || null,
          preferred_delivery_locker_saved_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      setSavedLocker(selectedLocker);
      toast.success("Locker saved! 🎉", {
        description: `${selectedLocker.name} is now saved to your profile`,
      });
    } catch (error) {
      toast.error("Failed to save locker to profile");
    } finally {
      setIsSavingLocker(false);
    }
  };

  const handleProceed = () => {
    if (deliveryMethod === "home") {
      onSelectDeliveryMethod("home", null);
    } else if (deliveryMethod === "locker") {
      // Use saved locker if no custom locker selected and we're not changing
      const lockerToUse = selectedLocker || (savedLocker && !wantToChangeLocker ? savedLocker : null);

      if (!lockerToUse) {
        toast.error("Please select a locker location");
        return;
      }
      onSelectDeliveryMethod("locker", lockerToUse);
    }
  };

  if (isLoadingSavedLocker) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-semibold mb-2">Loading your preferences...</h3>
            <p className="text-gray-600">Checking for saved locker location</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Choose Delivery Method
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Pick your preferred way to receive {bookTitle}
        </p>
      </div>

      {/* Delivery Method Cards */}
      <div className="space-y-4 sm:space-y-5">
        {/* Locker Option */}
        <div
          className={`p-5 sm:p-6 border-2 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md ${
            deliveryMethod === "locker"
              ? "bg-purple-50 border-purple-400 shadow-md"
              : "bg-white border-gray-200 hover:border-purple-300"
          }`}
          onClick={() => handleSelectLockerMethod(savedLocker)}
          role="radio"
          aria-checked={deliveryMethod === "locker"}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleSelectLockerMethod(savedLocker);
            }
          }}
        >
          <div className="flex items-start gap-4">
            <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-row"
              style={deliveryMethod === "locker" ? { borderColor: "#a855f7", backgroundColor: "#a855f7" } : { borderColor: "#d1d5db" }}>
              {deliveryMethod === "locker" && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 font-semibold mb-1">
                <MapPin className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <span className="text-base sm:text-lg">BobGo Locker</span>
                {savedLocker && <Badge className="bg-green-100 text-green-800 text-xs ml-auto">Saved</Badge>}
              </div>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Pick up at a convenient locker location near you
              </p>
            </div>
          </div>
        </div>

        {/* Home Delivery Option */}
        <div
          className={`p-5 sm:p-6 border-2 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md ${
            deliveryMethod === "home"
              ? "bg-blue-50 border-blue-400 shadow-md"
              : "bg-white border-gray-200 hover:border-blue-300"
          }`}
          onClick={() => {
            setDeliveryMethod("home");
            setSelectedLocker(null);
          }}
          role="radio"
          aria-checked={deliveryMethod === "home"}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setDeliveryMethod("home");
              setSelectedLocker(null);
            }
          }}
        >
          <div className="flex items-start gap-4">
            <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center"
              style={deliveryMethod === "home" ? { borderColor: "#3b82f6", backgroundColor: "#3b82f6" } : { borderColor: "#d1d5db" }}>
              {deliveryMethod === "home" && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 font-semibold mb-1">
                <Home className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-base sm:text-lg">Home Delivery</span>
              </div>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Courier delivers directly to your home address
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Locker Selection Section */}
      {deliveryMethod === "locker" && (
        <Card className="border border-purple-200 bg-purple-50 shadow-md">
          <CardContent className="p-5 sm:p-6 space-y-5">
            {/* Saved Locker Display */}
            {savedLocker && !wantToChangeLocker && (
              <div className="p-4 sm:p-5 bg-white border-2 border-green-200 rounded-lg shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1">
                    <p className="font-semibold text-sm sm:text-base flex items-center gap-2 text-gray-900 mb-1">
                      <div className="p-1 bg-green-100 rounded-full">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      {savedLocker.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {savedLocker.address || savedLocker.full_address}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWantToChangeLocker(true)}
                  className="w-full border-2 py-2 text-sm font-medium"
                >
                  Change Locker
                </Button>
              </div>
            )}

            {/* Locker Selector */}
            {!savedLocker || wantToChangeLocker ? (
              <div>
                <BobGoLockerSelector
                  onLockerSelect={setSelectedLocker}
                  selectedLockerId={selectedLocker?.id}
                  title="Select Locker"
                  description="Enter an address to find nearby locations"
                  showCardLayout={false}
                />
              </div>
            ) : null}

            {/* Selected Different Locker */}
            {selectedLocker && savedLocker && selectedLocker.id !== savedLocker.id && (
              <div className="p-4 sm:p-5 bg-white border-2 border-blue-200 rounded-lg shadow-sm">
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                  <div className="p-1 bg-blue-100 rounded-full">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  {selectedLocker.name}
                </p>
                <Button
                  onClick={handleSaveLockerToProfile}
                  disabled={isSavingLocker}
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700 py-2 text-sm font-medium"
                >
                  {isSavingLocker ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving Locker...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save to Profile
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-6 sm:pt-8 border-t mt-8">
        <Button
          variant="outline"
          onClick={onBack}
          className="px-5 py-3 sm:py-4 text-base font-medium border-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Back</span>
          <span className="sm:hidden">Back</span>
        </Button>

        <div className="flex gap-3 flex-1">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="px-5 py-3 sm:py-4 text-base font-medium border-2"
            >
              <X className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Cancel</span>
              <span className="sm:hidden">Cancel</span>
            </Button>
          )}

          <Button
            onClick={handleProceed}
            disabled={loading || (deliveryMethod === "locker" && !selectedLocker && !(savedLocker && !wantToChangeLocker))}
            className="flex-1 px-6 py-3 sm:py-4 text-base font-semibold bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
          >
            Next
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Step1point5DeliveryMethod;
