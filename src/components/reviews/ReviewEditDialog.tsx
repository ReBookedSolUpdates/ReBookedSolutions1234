import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SellerReview, reviewService } from "@/services/reviewService";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import debugLogger from "@/utils/debugLogger";

interface ReviewEditDialogProps {
  review: SellerReview;
  isOpen: boolean;
  onClose: () => void;
  onReviewUpdated?: () => void;
}

const ReviewEditDialog: React.FC<ReviewEditDialogProps> = ({
  review,
  isOpen,
  onClose,
  onReviewUpdated,
}) => {
  const [rating, setRating] = useState(review.rating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(review.comment || "");
  const [isAnonymous, setIsAnonymous] = useState(review.is_anonymous);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      await reviewService.updateReview(review.id, {
        rating,
        comment: comment.trim() || undefined,
        isAnonymous,
      });
      toast.success("Review updated successfully");
      onReviewUpdated?.();
      onClose();
    } catch (error) {
      debugLogger.error("ReviewEditDialog", "Error updating review:", error);
      toast.error("Failed to update review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Your Review</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div>
            <Label className="block mb-3">Rating</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="edit-comment" className="block mb-2">
              Comment (Optional)
            </Label>
            <Textarea
              id="edit-comment"
              placeholder="Share your experience with this seller..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              className="resize-none"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Anonymity Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <Label
                htmlFor="edit-anonymous"
                className="font-medium cursor-pointer"
              >
                Post as Anonymous
              </Label>
              <p className="text-xs text-gray-600 mt-1">
                Your name and profile picture won't be visible
              </p>
            </div>
            <Switch
              id="edit-anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewEditDialog;
