import { useEffect, useRef } from "react";
import { ActivityService } from "@/services/activityService";
import debugLogger from "@/utils/debugLogger";

interface UseBookTrackingOptions {
  bookId: string;
  userId?: string;
}

/**
 * Hook to track book views and time spent on book pages
 * Should be used in book detail/view components
 *
 * @param bookId - The ID of the book being viewed
 * @param userId - Optional user ID (required for authenticated tracking)
 */
export const useBookTracking = ({ bookId, userId }: UseBookTrackingOptions) => {
  const pageStartTimeRef = useRef<number>(Date.now());

  // Track book view on component mount
  useEffect(() => {
    const trackBookView = async () => {
      try {
        await ActivityService.trackBookView(bookId, userId);
      } catch (error) {
        debugLogger.error("useBookTracking", "Error tracking book view:", error);
      }
    };

    trackBookView();
  }, [bookId, userId]);

  // Track time spent on unmount
  useEffect(() => {
    return () => {
      const timeSpentMs = Date.now() - pageStartTimeRef.current;
      
      if (timeSpentMs > 0) {
        const trackTimeSpent = async () => {
          try {
            await ActivityService.trackBookPageTimeSpent(
              bookId,
              userId,
              timeSpentMs
            );
          } catch (error) {
            debugLogger.error("useBookTracking", "Error tracking book page time spent:", error);
          }
        };

        trackTimeSpent();
      }
    };
  }, [bookId, userId]);

  /**
   * Method to manually track add to cart action
   */
  const trackAddToCart = async (quantity: number = 1, price?: number) => {
    try {
      await ActivityService.trackAddToCart(bookId, userId, quantity, price);
    } catch (error) {
      debugLogger.error("useBookTracking", "Error tracking add to cart:", error);
    }
  };

  /**
   * Method to manually track remove from cart action
   */
  const trackRemoveFromCart = async (quantity: number = 1) => {
    try {
      await ActivityService.trackRemoveFromCart(bookId, userId, quantity);
    } catch (error) {
      debugLogger.error("useBookTracking", "Error tracking remove from cart:", error);
    }
  };

  return {
    trackAddToCart,
    trackRemoveFromCart,
  };
};
