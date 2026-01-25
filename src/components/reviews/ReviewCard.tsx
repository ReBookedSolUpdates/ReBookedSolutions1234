import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SellerReview, reviewService } from "@/services/reviewService";
import { useAuth } from "@/contexts/AuthContext";
import { Star, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ReviewEditDialog from "./ReviewEditDialog";
import { formatDistanceToNow } from "date-fns";
import debugLogger from "@/utils/debugLogger";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ReviewCardProps {
  review: SellerReview;
  onReviewUpdated?: () => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onReviewUpdated,
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const isOwnReview = user?.id === review.reviewer_id;

  const handleDelete = async () => {
    try {
      await reviewService.deleteReview(review.id);
      toast.success("Review deleted successfully");
      setIsDeleted(true);
      onReviewUpdated?.();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isDeleted) {
    return null;
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            {/* Reviewer Avatar */}
            {!review.is_anonymous && review.reviewer_name && (
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={review.reviewer_avatar || ""} />
                <AvatarFallback>
                  {review.reviewer_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            {review.is_anonymous && (
              <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium">?</span>
              </div>
            )}

            {/* Review Content */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    {!review.is_anonymous && review.reviewer_name && (
                      <p className="font-medium">{review.reviewer_name}</p>
                    )}
                    {review.is_anonymous && (
                      <p className="font-medium text-gray-500">Anonymous</p>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {review.rating} ★
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(review.created_at), {
                      addSuffix: true,
                    })}
                    {review.updated_at !== review.created_at && " (edited)"}
                  </p>
                </div>

                {isOwnReview && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsDeleting(true)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Star Rating Visual */}
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              {/* Review Comment */}
              {review.comment && (
                <p className="text-sm text-gray-700 leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {isEditing && (
        <ReviewEditDialog
          review={review}
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          onReviewUpdated={onReviewUpdated}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ReviewCard;
