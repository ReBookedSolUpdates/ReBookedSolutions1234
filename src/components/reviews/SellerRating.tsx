import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { reviewService, SellerRatingSummary } from "@/services/reviewService";
import { Star } from "lucide-react";

interface SellerRatingProps {
  sellerId: string;
  className?: string;
  showLabel?: boolean;
}

const SellerRating: React.FC<SellerRatingProps> = ({
  sellerId,
  className = "",
  showLabel = true,
}) => {
  const [rating, setRating] = useState<SellerRatingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const ratingData = await reviewService.getSellerAverageRating(sellerId);
        setRating(ratingData);
      } catch (error) {
        console.error("Error fetching seller rating:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRating();
  }, [sellerId]);

  if (isLoading) {
    return <div className={`h-6 w-20 bg-gray-200 rounded ${className}`} />;
  }

  if (!rating || rating.review_count === 0) {
    return (
      <Badge variant="outline" className={className}>
        No ratings yet
      </Badge>
    );
  }

  const displayRating =
    rating.average_rating !== null ? rating.average_rating.toFixed(1) : "N/A";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="font-semibold text-sm">{displayRating}</span>
      </div>
      {showLabel && (
        <span className="text-xs text-gray-600">
          ({rating.review_count} {rating.review_count === 1 ? "review" : "reviews"})
        </span>
      )}
    </div>
  );
};

export default SellerRating;
