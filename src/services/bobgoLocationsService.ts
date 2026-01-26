import { supabase } from "@/integrations/supabase/client";

export interface BobGoLocation {
  id?: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
  hours?: string;
  phone?: string;
  [key: string]: any;
}

/**
 * Calculate bounding box from a center point
 * radiusKm: radius in kilometers (default 5km)
 */
function calculateBoundingBox(lat: number, lng: number, radiusKm: number = 5) {
  const latOffset = radiusKm / 111; // 1 degree latitude ≈ 111 km
  const lngOffset = radiusKm / (111 * Math.cos((lat * Math.PI) / 180)); // Adjust for latitude

  return {
    min_lat: lat - latOffset,
    max_lat: lat + latOffset,
    min_lng: lng - lngOffset,
    max_lng: lng + lngOffset,
  };
}

/**
 * Fetch nearby BobGo locations based on coordinates
 */
export async function getBobGoLocations(
  latitude: number,
  longitude: number,
  radiusKm: number = 5
): Promise<BobGoLocation[]> {
  try {
    // Validate input parameters
    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      return [];
    }

    const bounds = calculateBoundingBox(latitude, longitude, radiusKm);

    // Get auth session
    const { data: sessionData } = await supabase.auth.getSession();
    const authToken = sessionData?.session?.access_token;

    // Build query parameters
    const params = new URLSearchParams({
      min_lat: bounds.min_lat.toString(),
      max_lat: bounds.max_lat.toString(),
      min_lng: bounds.min_lng.toString(),
      max_lng: bounds.max_lng.toString(),
    });

    // Call the edge function via Supabase
    const { data, error } = await supabase.functions.invoke("bobgo-get-locations", {
      headers: {
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
      body: {
        min_lat: bounds.min_lat,
        max_lat: bounds.max_lat,
        min_lng: bounds.min_lng,
        max_lng: bounds.max_lng,
      },
    });

    if (error) {
      console.warn("BobGo locations fetch error:", error.message);
      return [];
    }

    if (!data) {
      return [];
    }

    let locations: BobGoLocation[] = [];

    // Handle different response structures from the edge function
    if (data.success && data.data) {
      // Structure: { success: true, data: {...} }
      const innerData = data.data;

      // Check if innerData is an array
      if (Array.isArray(innerData)) {
        locations = innerData;
      }
      // Check if innerData has a locations property
      else if (innerData.locations && Array.isArray(innerData.locations)) {
        locations = innerData.locations;
      }
      // Check if innerData has a results property (common API pattern)
      else if (innerData.results && Array.isArray(innerData.results)) {
        locations = innerData.results;
      }
      // If it's an object with location data, treat it as single item
      else if (typeof innerData === 'object' && innerData.name) {
        locations = [innerData];
      }
    }
    // Direct array response
    else if (Array.isArray(data)) {
      locations = data;
    }
    // Check for locations property at root level
    else if (data.locations && Array.isArray(data.locations)) {
      locations = data.locations;
    }
    // Check for results property at root level
    else if (data.results && Array.isArray(data.results)) {
      locations = data.results;
    }

    return locations;
  } catch (error) {
    // Log detailed error information for debugging
    if (error instanceof Error) {
      console.warn("BobGo locations service error:", {
        message: error.message,
        name: error.name,
      });
    } else {
      console.warn("BobGo locations service error:", error);
    }
    // Return empty array to allow UI to gracefully handle the error
    return [];
  }
}
