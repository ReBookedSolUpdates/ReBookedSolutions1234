import { supabase } from "@/integrations/supabase/client";
import debugLogger from "@/utils/debugLogger";

/**
 * Interface for a seller review
 */
export interface SellerReview {
  id: string;
  seller_id: string;
  reviewer_id: string;
  rating: number;
  comment: string | null;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  reviewer_name?: string | null;
  reviewer_avatar?: string | null;
}

/**
 * Interface for seller rating summary
 */
export interface SellerRatingSummary {
  average_rating: number | null;
  review_count: number;
}

/**
 * Interface for review creation/update
 */
export interface ReviewInput {
  rating: number;
  comment?: string;
  isAnonymous?: boolean;
}

export const reviewService = {
  /**
   * Get all reviews for a seller (paginated)
   * Only returns reviews visible to logged-in users
   */
  getSellerReviews: async (
    sellerId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<SellerReview[]> => {
    try {
      const { data, error } = await supabase
        .from("seller_reviews")
        .select("*")
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Error fetching seller reviews:", error);
        return [];
      }

      return (data || []) as SellerReview[];
    } catch (error) {
      console.error("Error fetching seller reviews:", error);
      return [];
    }
  },

  /**
   * Get reviews written by the current user
   */
  getUserReviews: async (): Promise<SellerReview[]> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        return [];
      }

      const { data, error } = await supabase
        .from("seller_reviews")
        .select("*")
        .eq("reviewer_id", user.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user reviews:", error);
        return [];
      }

      return (data || []) as SellerReview[];
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      return [];
    }
  },

  /**
   * Get user's review for a specific seller (if exists)
   */
  getUserReviewForSeller: async (
    sellerId: string
  ): Promise<SellerReview | null> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        return null;
      }

      const { data, error } = await supabase
        .from("seller_reviews")
        .select("*")
        .eq("seller_id", sellerId)
        .eq("reviewer_id", user.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // Single() throws error if no results
        return null;
      }

      return (data || null) as SellerReview | null;
    } catch (error) {
      console.error("Error fetching user review for seller:", error);
      return null;
    }
  },

  /**
   * Check if user can review a seller (has completed order from seller)
   */
  canUserReviewSeller: async (sellerId: string): Promise<boolean> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        return false;
      }

      // Call RLS check via helper function
      const { data, error } = await supabase.rpc(
        "has_completed_order_from_seller",
        {
          p_buyer_id: user.user.id,
          p_seller_id: sellerId,
        }
      );

      if (error) {
        console.error("Error checking purchase eligibility:", error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error("Error checking purchase eligibility:", error);
      return false;
    }
  },

  /**
   * Submit a new review for a seller
   */
  submitReview: async (
    sellerId: string,
    reviewInput: ReviewInput
  ): Promise<SellerReview | null> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        throw new Error("User must be authenticated to submit a review");
      }

      // Verify user has purchased from seller
      const canReview = await reviewService.canUserReviewSeller(sellerId);
      if (!canReview) {
        throw new Error(
          "You must have a completed purchase from this seller to leave a review"
        );
      }

      const { data, error } = await supabase
        .from("seller_reviews")
        .insert({
          seller_id: sellerId,
          reviewer_id: user.user.id,
          rating: reviewInput.rating,
          comment: reviewInput.comment || null,
          is_anonymous: reviewInput.isAnonymous || false,
        })
        .select()
        .single();

      if (error) {
        console.error("Error submitting review:", error);
        throw error;
      }

      return (data || null) as SellerReview | null;
    } catch (error) {
      console.error("Error submitting review:", error);
      throw error;
    }
  },

  /**
   * Update an existing review
   */
  updateReview: async (
    reviewId: string,
    reviewInput: ReviewInput
  ): Promise<SellerReview | null> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        throw new Error("User must be authenticated to update a review");
      }

      const { data, error } = await supabase
        .from("seller_reviews")
        .update({
          rating: reviewInput.rating,
          comment: reviewInput.comment || null,
          is_anonymous: reviewInput.isAnonymous || false,
        })
        .eq("id", reviewId)
        .eq("reviewer_id", user.user.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating review:", error);
        throw error;
      }

      return (data || null) as SellerReview | null;
    } catch (error) {
      console.error("Error updating review:", error);
      throw error;
    }
  },

  /**
   * Delete a review
   */
  deleteReview: async (reviewId: string): Promise<boolean> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        throw new Error("User must be authenticated to delete a review");
      }

      const { error } = await supabase
        .from("seller_reviews")
        .delete()
        .eq("id", reviewId)
        .eq("reviewer_id", user.user.id);

      if (error) {
        console.error("Error deleting review:", error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Error deleting review:", error);
      throw error;
    }
  },

  /**
   * Get seller's average rating and review count
   */
  getSellerAverageRating: async (
    sellerId: string
  ): Promise<SellerRatingSummary> => {
    try {
      const { data, error } = await supabase.rpc(
        "get_seller_average_rating",
        {
          p_seller_id: sellerId,
        }
      );

      if (error) {
        console.error("Error fetching seller average rating:", error);
        return {
          average_rating: null,
          review_count: 0,
        };
      }

      if (data && data.length > 0) {
        return {
          average_rating: data[0].average_rating,
          review_count: data[0].review_count,
        };
      }

      return {
        average_rating: null,
        review_count: 0,
      };
    } catch (error) {
      console.error("Error fetching seller average rating:", error);
      return {
        average_rating: null,
        review_count: 0,
      };
    }
  },

  /**
   * Get paginated reviews for a seller with optimized query
   */
  getSellerReviewsPaginated: async (
    sellerId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ reviews: SellerReview[]; total: number }> => {
    try {
      // Get total count
      const { count } = await supabase
        .from("seller_reviews")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", sellerId);

      const offset = (page - 1) * pageSize;

      const { data, error } = await supabase
        .from("seller_reviews")
        .select("*")
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) {
        console.error("Error fetching paginated reviews:", error);
        return { reviews: [], total: 0 };
      }

      return {
        reviews: (data || []) as SellerReview[],
        total: count || 0,
      };
    } catch (error) {
      console.error("Error fetching paginated reviews:", error);
      return { reviews: [], total: 0 };
    }
  },
};
