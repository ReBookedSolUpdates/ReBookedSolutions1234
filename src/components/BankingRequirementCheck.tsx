import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  AlertTriangle,
  MapPin,
  Info,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BankingService } from "@/services/bankingService";
import type { BankingRequirementsStatus } from "@/types/banking";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import ManualAddressInput from "@/components/ManualAddressInput";
import { saveSimpleUserAddresses } from "@/services/simplifiedAddressService";
import { toast } from "sonner";

interface BankingRequirementCheckProps {
  onCanProceed: (canProceed: boolean) => void;
  children?: React.ReactNode;
}

interface AddressData {
  street: string;
  city: string;
  province: string;
  postalCode: string;
}

const BankingRequirementCheck: React.FC<BankingRequirementCheckProps> = ({
  onCanProceed,
  children,
}) => {
  const { user } = useAuth();
  const [bankingStatus, setBankingStatus] =
    useState<BankingRequirementsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [pickupAddress, setPickupAddress] = useState<AddressData | null>(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  useEffect(() => {
    if (user) {
      checkRequirements();
    }
  }, [user]);

  const handleSavePickupAddress = async (address: AddressData) => {
    if (!user) {
      toast.error("You must be logged in to save an address");
      return;
    }

    try {
      setIsSavingAddress(true);

      // Save the pickup address
      await saveSimpleUserAddresses(
        user.id,
        {
          streetAddress: address.street,
          city: address.city,
          province: address.province,
          postalCode: address.postalCode,
        },
        {
          streetAddress: address.street,
          city: address.city,
          province: address.province,
          postalCode: address.postalCode,
        },
        true // addresses are the same
      );

      toast.success("Pickup address saved! You can now add books.", {
        description: `${address.street}, ${address.city}`,
      });

      setPickupAddress(address);

      // Refresh requirements to update UI
      setTimeout(() => {
        checkRequirements(true);
      }, 500);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to save address";
      toast.error(errorMsg);
    } finally {
      setIsSavingAddress(false);
    }
  };

  const checkRequirements = async (forceRefresh = false) => {
    if (!user) return;

    try {
      setLoading(true);
      // Check for saved locker
      let hasSavedLocker = false;
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("preferred_delivery_locker_data")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.preferred_delivery_locker_data) {
          const lockerData = profile.preferred_delivery_locker_data as any;
          if (lockerData.id && lockerData.name) {
            hasSavedLocker = true;
          }
        }
      } catch (error) {
        // Failed to check locker
      }

      // Check pickup address from seller requirements
      const requirements = await BankingService.getSellerRequirements(user.id);


      // User can list if they have EITHER locker OR pickup address
      const canList = hasSavedLocker || requirements.hasPickupAddress;

      const status: BankingRequirementsStatus = {
        hasBankingInfo: true,
        hasPickupAddress: requirements.hasPickupAddress,
        isVerified: true,
        canListBooks: canList,
        missingRequirements: canList ? [] : [
          ...(hasSavedLocker ? [] : ["Locker saved OR "]),
          ...(requirements.hasPickupAddress ? [] : ["Pickup address required"]),
        ],
      };


      setBankingStatus(status);
      onCanProceed(status.canListBooks);
    } catch (error) {
      onCanProceed(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-book-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!bankingStatus) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Unable to verify selling requirements. Please refresh the page.
        </AlertDescription>
      </Alert>
    );
  }

  if (bankingStatus.canListBooks) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900 text-lg">
            Before you start, please enter your pickup address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-blue-800">
            Enter your home pickup address where buyers can collect books from you:
          </p>

          {/* Pickup Address Input Section */}
          <div className="p-4 bg-white rounded-lg border border-blue-200 space-y-4">
            <ManualAddressInput
              onAddressSelect={(addressData) => {
                setPickupAddress({
                  street: addressData.street || "",
                  city: addressData.city || "",
                  province: addressData.province || "",
                  postalCode: addressData.postalCode || "",
                });
              }}
              placeholder="Enter your home pickup address..."
              required
            />

            {/* Save Button */}
            {pickupAddress && (
              <Button
                onClick={() => handleSavePickupAddress(pickupAddress)}
                disabled={isSavingAddress}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSavingAddress ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving Address...
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-2" />
                    Save Pickup Address
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Info Box */}
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Note:</strong> You'll need a valid pickup address to list and sell books. This is where buyers will collect their purchases.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default BankingRequirementCheck;
