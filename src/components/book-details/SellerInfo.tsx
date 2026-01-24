import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Calendar, Store, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SellerRating from "@/components/reviews/SellerRating";

interface SellerInfoProps {
  seller: {
    id: string;
    name: string;
    email: string;
    createdAt?: string;
  };
  onViewProfile: () => void;
}

const SellerInfo = ({ seller, onViewProfile }: SellerInfoProps) => {
  const navigate = useNavigate();

  const handleViewReviews = () => {
    navigate(`/seller/${seller.id}`, { state: { tab: "reviews" } });
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-3">About the Seller</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{seller?.name || "Loading..."}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Member since {seller?.createdAt ? new Date(seller.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              }) : "Unknown"}
            </span>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Star className="h-4 w-4 text-gray-500" />
            <SellerRating sellerId={seller.id} showLabel={true} />
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <Button
            onClick={onViewProfile}
            className="w-full bg-book-600 hover:bg-book-700"
          >
            <Store className="h-4 w-4 mr-2" />
            View {seller?.name}'s ReBooked Mini
          </Button>
          <Button
            onClick={handleViewReviews}
            variant="outline"
            className="w-full border-book-300 text-book-700 hover:bg-book-50"
          >
            <Star className="h-4 w-4 mr-2" />
            See Reviews
          </Button>
          <div className="p-3 bg-book-50 rounded-lg">
            <p className="text-sm text-book-800">
              🛍️ See all books from this seller in their mini storefront
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SellerInfo;
