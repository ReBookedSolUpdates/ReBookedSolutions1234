import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MapPin,
  Clock,
  Phone,
  Trash2,
  Edit,
  Loader2,
  Info,
  CheckCircle,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { BobGoLocation } from "@/services/bobgoLocationsService";

interface SavedLockersCardProps {
  isLoading?: boolean;
  onEdit?: () => void;
}

const SavedLockersCard = forwardRef<
  { loadSavedLockers: () => Promise<void> },
  SavedLockersCardProps
>(({ isLoading = false, onEdit }, ref) => {
  const [savedLocker, setSavedLocker] = useState<BobGoLocation | null>(null);
  const [isLoadingLockers, setIsLoadingLockers] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Expose loadSavedLockers function to parent component
  useImperativeHandle(ref, () => ({
    loadSavedLockers,
  }), []);

  // Load saved locker on mount
  useEffect(() => {
    loadSavedLockers();
  }, []);

  const loadSavedLockers = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIsLoadingLockers(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("preferred_delivery_locker_data")
        .eq("id", user.id)
        .single();

      if (error) {
        setIsLoadingLockers(false);
        return;
      }

      if (profile?.preferred_delivery_locker_data) {
        setSavedLocker(profile.preferred_delivery_locker_data as BobGoLocation);
      } else {
        setSavedLocker(null);
      }
      setIsLoadingLockers(false);
    } catch (error) {
      setIsLoadingLockers(false);
    }
  };

  const handleDeleteLocker = async () => {
    try {
      setIsDeleting(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          preferred_delivery_locker_data: null,
          preferred_pickup_locker_location_id: null,
          preferred_pickup_locker_provider_slug: null,
          preferred_delivery_locker_saved_at: null,
        })
        .eq("id", user.id);

      if (error) throw error;

      setSavedLocker(null);
      toast.success("Locker removed from profile");
    } catch (error) {
      toast.error("Failed to remove locker");
    } finally {
      setIsDeleting(false);
    }
  };

  const LockerCard = ({
    locker,
    isDeleting,
    onDelete,
    onImageSelect,
  }: {
    locker: BobGoLocation;
    isDeleting: boolean;
    onDelete: () => void;
    onImageSelect: (imageUrl: string) => void;
  }) => {
    return (
      <Card className="border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-slate-50 py-4 px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <MapPin className="h-5 w-5 text-blue-600" />
              {locker.name || "Saved Locker"}
            </CardTitle>
            <Badge className="bg-blue-100 text-blue-700 text-xs font-medium">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Image Section */}
          {(locker.image_url || locker.pickup_point_provider_logo_url) && (
            <div className="flex justify-center">
              <div
                className="cursor-pointer hover:opacity-80 transition-opacity max-w-sm w-full"
                onClick={() => onImageSelect(locker.image_url || locker.pickup_point_provider_logo_url || "")}
              >
                <img
                  src={locker.image_url || locker.pickup_point_provider_logo_url}
                  alt={locker.name}
                  className="w-full h-auto max-h-48 object-cover rounded-lg border border-green-200 shadow-sm"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          {/* Address Section */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Address</p>
            <p className="text-sm text-gray-800 leading-relaxed break-words">
              {locker.full_address || locker.address || "—"}
            </p>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Provider */}
            {locker.pickup_point_provider_name && (
              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-100">
                {locker.pickup_point_provider_logo_url && (
                  <img
                    src={locker.pickup_point_provider_logo_url}
                    alt="Provider"
                    className="h-5 w-5 object-contain flex-shrink-0"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-semibold uppercase">Provider</p>
                  <p className="text-sm text-gray-800 font-medium truncate">
                    {locker.pickup_point_provider_name}
                  </p>
                </div>
              </div>
            )}

            {/* Hours */}
            {locker.trading_hours && (
              <div className="flex items-start gap-2 p-3 bg-white rounded-lg border border-gray-100">
                <Clock className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-semibold uppercase">Hours</p>
                  <p className="text-sm text-gray-800">
                    {locker.trading_hours}
                  </p>
                </div>
              </div>
            )}

            {/* Phone */}
            {(locker.phone || locker.contact_phone) && (
              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-100">
                <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-semibold uppercase">Contact</p>
                  <a
                    href={`tel:${locker.phone || locker.contact_phone}`}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    {locker.phone || locker.contact_phone}
                  </a>
                </div>
              </div>
            )}

            {/* Distance */}
            {(locker.distance || locker.distance_km) && (
              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-100">
                <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-semibold uppercase">Distance</p>
                  <p className="text-sm text-gray-800 font-medium">
                    {typeof locker.distance === "number"
                      ? `${locker.distance.toFixed(1)} km`
                      : typeof locker.distance_km === "number"
                      ? `${locker.distance_km.toFixed(1)} km`
                      : "—"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Remove Button */}
          <Button
            onClick={onDelete}
            disabled={isDeleting}
            variant="outline"
            size="sm"
            className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-sm font-medium mt-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Removing...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Locker
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  };

  if (isLoading || isLoadingLockers) {
    return (
      <Card className="border-2 border-gray-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!savedLocker) {
    return (
      <Card className="border-2 border-gray-100">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 py-3 px-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4 text-gray-600" />
            Saved Locker
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Alert className="py-2 px-3">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              No saved locker yet. Search and save a locker location to see it here.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <LockerCard
        locker={savedLocker}
        isDeleting={isDeleting}
        onDelete={handleDeleteLocker}
        onImageSelect={setSelectedImage}
      />

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full shadow-xl">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Locker Image</h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-light"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 flex flex-col items-center justify-center max-h-96 overflow-auto">
              <img
                src={selectedImage}
                alt="Locker location"
                className="w-full h-auto rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
});

SavedLockersCard.displayName = "SavedLockersCard";

export default SavedLockersCard;
