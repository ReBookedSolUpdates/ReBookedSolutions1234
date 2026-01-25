import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { reviewService, SellerReview } from "@/services/reviewService";
import ReviewCard from "./ReviewCard";
import { ChevronDown } from "lucide-react";
import debugLogger from "@/utils/debugLogger";

interface ReviewListProps {
  sellerId: string;
  pageSize?: number;
}

const ReviewList: React.FC<ReviewListProps> = ({
  sellerId,
  pageSize = 5,
}) => {
  const [reviews, setReviews] = useState<SellerReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const { reviews: fetchedReviews, total: totalReviews } =
          await reviewService.getSellerReviewsPaginated(
            sellerId,
            currentPage,
            pageSize
          );
        setReviews(fetchedReviews);
        setTotal(totalReviews);
      } catch (error) {
        debugLogger.error("ReviewList", "Error loading reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [sellerId, currentPage, pageSize]);

  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = currentPage < totalPages;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">
            No reviews yet for this seller
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          onReviewUpdated={() => {
            // Refresh reviews after update
            setCurrentPage(1);
          }}
        />
      ))}

      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="gap-2"
          >
            Load More Reviews
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      {total > 0 && (
        <p className="text-center text-sm text-gray-500 pt-4">
          Showing {reviews.length} of {total} reviews
        </p>
      )}
    </div>
  );
};

export default ReviewList;
