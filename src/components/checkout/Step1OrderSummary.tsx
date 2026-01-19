import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, User, MapPin, ArrowRight, X, CheckCircle } from "lucide-react";
import { CheckoutBook, CheckoutAddress } from "@/types/checkout";
import { supabase } from "@/integrations/supabase/client";

interface Step1OrderSummaryProps {
  book: CheckoutBook;
  sellerAddress: CheckoutAddress | null;
  onNext: () => void;
  onCancel?: () => void;
  loading?: boolean;
}

const Step1OrderSummary: React.FC<Step1OrderSummaryProps> = ({
  book,
  sellerAddress,
  onNext,
  onCancel,
  loading = false,
}) => {
  // Use useState to make cart data reactive
  const [cartData, setCartData] = useState(null);
  const [sellerFullName, setSellerFullName] = useState<string | null>(null);
  const [sellerCartFullNames, setSellerCartFullNames] = useState<{ [key: string]: string }>({});

  // Function to load cart data from localStorage
  const loadCartData = () => {
    try {
      const cartDataStr = localStorage.getItem('checkoutCart');
      if (cartDataStr) {
        const parsedData = JSON.parse(cartDataStr);
        // Validate cart data is recent (within 1 hour)
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        if (parsedData.timestamp && parsedData.timestamp > oneHourAgo) {
          setCartData(parsedData);
          return;
        }
      }
    } catch (error) {
    }
    setCartData(null);
  };

  // Load cart data on component mount and when localStorage changes
  useEffect(() => {
    loadCartData();

    // Listen for storage events to detect cart changes (cross-tab or same-tab updates)
    const handleStorageChange = (e) => {
      if (e.key === 'checkoutCart' || !e.key) {
        // Reload cart data when checkoutCart specifically changes or on any storage change
        loadCartData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Fetch seller full name from profiles table
  useEffect(() => {
    const fetchSellerFullName = async () => {
      try {
        if (book.seller_id) {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', book.seller_id)
            .single();

          if (error) {
          } else if (data?.full_name) {
            setSellerFullName(data.full_name);
          }
        }
      } catch (error) {
      }
    };

    fetchSellerFullName();
  }, [book.seller_id]);

  // Fetch cart seller full name if cart has a seller ID
  useEffect(() => {
    const fetchCartSellerFullName = async () => {
      if (cartData && cartData.sellerId) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', cartData.sellerId)
            .single();

          if (error) {
          } else if (data?.full_name) {
            setSellerCartFullNames((prev) => ({
              ...prev,
              [cartData.sellerId]: data.full_name,
            }));
          }
        } catch (error) {
        }
      }
    };

    fetchCartSellerFullName();
  }, [cartData?.sellerId]);

  // For debugging: show cart checkout if cart data exists (even for single item)
  const isCartCheckout = cartData && cartData.items && cartData.items.length >= 1;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Order Summary</h1>
        <p className="text-sm sm:text-base text-gray-600">
          {isCartCheckout
            ? `Review your ${cartData.items.length} books from ${cartData.sellerName}`
            : "Review your book purchase details"
          }
        </p>
      </div>

      {/* Book Details Card */}
      <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-4 border-b border-gray-100">
          <CardTitle className="flex items-center gap-3 text-lg sm:text-xl text-gray-900">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            {isCartCheckout ? `Books in Your Order (${cartData.items.length})` : 'Book Details'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-5">
          {isCartCheckout && cartData ? (
            <div className="space-y-4">
              {cartData.items.map((item: any, index: number) => (
                <div key={item.id || index} className="flex gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors">
                  <div className="w-16 h-24 flex-shrink-0">
                    <img
                      src={item.imageUrl || item.image_url || "/placeholder.svg"}
                      alt={item.title || "Book cover"}
                      className="w-full h-full object-cover rounded-md border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">by {item.author}</p>
                    </div>
                    <p className="text-base sm:text-lg font-bold text-green-600 mt-2">
                      R{item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">Total ({cartData.items.length} items):</span>
                  <span className="text-xl sm:text-2xl font-bold text-green-600">
                    R{cartData.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                <div className="w-20 h-28 flex-shrink-0">
                  <img
                    src={book.image_url || book.imageUrl || "/placeholder.svg"}
                    alt={book.title || "Book cover"}
                    className="w-full h-full object-cover rounded-md border border-gray-200 bg-gray-100"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1">{book.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">by {book.author}</p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">{book.condition}</Badge>
                      {book.category && (
                        <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200">{book.category}</Badge>
                      )}
                      {book.isbn && (
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                          ISBN: {book.isbn}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-green-600 mt-2">
                    R{book.price.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Book Description */}
              {book.description && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-2">About This Book</h4>
                  <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                    {book.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seller Information Card */}
      <Card className="border-l-4 border-l-green-500 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <User className="w-5 h-5 text-green-600" />
            Seller Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-semibold text-gray-900 text-lg">
                {isCartCheckout
                  ? (sellerCartFullNames[cartData.sellerId] || cartData.sellerName)
                  : (sellerFullName || book.seller_name)
                }
              </p>
              <p className="text-sm text-gray-600 mt-1">
                ID: <span className="font-mono text-gray-700">{isCartCheckout ? cartData.sellerId : book.seller_id}</span>
              </p>
              {isCartCheckout && (
                <div className="flex items-center gap-1 text-sm text-green-700 font-medium mt-2">
                  <CheckCircle className="w-4 h-4" />
                  All {cartData.items.length} books from this seller
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-8 border-t">
        <Button
          onClick={onCancel}
          variant="outline"
          disabled={loading}
          className="flex-1 px-6 py-3 text-base"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>

        <Button
          onClick={onNext}
          disabled={loading}
          className="flex-1 px-8 py-3 text-base font-semibold bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          {loading ? (
            "Loading..."
          ) : (
            <>
              Proceed
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Step1OrderSummary;
