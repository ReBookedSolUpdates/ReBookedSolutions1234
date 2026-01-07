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
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Choose Delivery Method
        </h1>
        <p className="text-sm text-gray-600">
          Pick your preferred way to receive {bookTitle}
        </p>
      </div>

      {/* Compact Delivery Method Cards */}
      <div className="space-y-3">
        {/* Locker Option - Compact */}
        <div
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
            deliveryMethod === "locker"
              ? "bg-purple-50 border-purple-400"
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
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center"
              style={deliveryMethod === "locker" ? { borderColor: "#a855f7", backgroundColor: "#a855f7" } : { borderColor: "#d1d5db" }}>
              {deliveryMethod === "locker" && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 font-medium">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">BobGo Locker</span>
                {savedLocker && <Badge className="bg-green-100 text-green-800 text-xs">Saved</Badge>}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Pick up at a convenient locker location
              </p>
            </div>
          </div>
        </div>

        {/* Home Delivery Option - Compact */}
        <div
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
            deliveryMethod === "home"
              ? "bg-blue-50 border-blue-400"
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
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center"
              style={deliveryMethod === "home" ? { borderColor: "#3b82f6", backgroundColor: "#3b82f6" } : { borderColor: "#d1d5db" }}>
              {deliveryMethod === "home" && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 font-medium">
                <Home className="w-4 h-4" />
                <span className="text-sm">Home Delivery</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Courier delivers to your home
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Locker Selection - Compact Version */}
      {deliveryMethod === "locker" && (
        <Card className="border-purple-100 bg-purple-50">
          <CardContent className="p-4 space-y-3">
            {/* Saved Locker Display */}
            {savedLocker && !wantToChangeLocker && (
              <div className="p-3 bg-white border border-green-200 rounded-md">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm flex items-center gap-1.5 text-gray-900">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {savedLocker.name}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {savedLocker.address || savedLocker.full_address}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWantToChangeLocker(true)}
                  className="mt-3 w-full text-xs h-8"
                >
                  Change
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
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs font-medium text-blue-900 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {selectedLocker.name}
                </p>
                <Button
                  onClick={handleSaveLockerToProfile}
                  disabled={isSavingLocker}
                  size="sm"
                  variant="outline"
                  className="mt-2 w-full text-xs h-8"
                >
                  {isSavingLocker ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Saving
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4">
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel} className="text-xs h-8">
              Cancel
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onBack} className="text-xs h-8">
            <ArrowLeft className="w-3 h-3 mr-1" />
            Back
          </Button>
        </div>

        <Button
          size="sm"
          onClick={handleProceed}
          disabled={loading || (deliveryMethod === "locker" && !selectedLocker && !(savedLocker && !wantToChangeLocker))}
          className="text-xs h-8"
        >
          Next
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default Step1point5DeliveryMethod;
