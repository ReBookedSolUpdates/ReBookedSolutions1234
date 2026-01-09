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
    <div className="max-w-3xl mx-auto space-y-6 px-3 sm:px-0">
      <div className="text-center mb-6 sm:mb-10">
        <div className="inline-block px-3 py-1 bg-blue-100 rounded-full mb-3">
          <span className="text-sm font-medium text-blue-700">Step 1 of 4</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">Order Summary</h1>
        <p className="text-sm sm:text-base text-gray-600">
          {isCartCheckout
            ? `Review your ${cartData.items.length} books from ${cartData.sellerName}`
            : "Review your book purchase details"
          }
        </p>
      </div>

      {/* Book Details Card */}
      <Card className="border-l-4 border-l-blue-500 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Package className="w-5 h-5 text-blue-600" />
            {isCartCheckout ? `Books in Your Order (${cartData.items.length})` : 'Book Details'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isCartCheckout && cartData ? (
            <div className="space-y-4">
              {cartData.items.map((item: any, index: number) => (
                <div key={item.id || index} className={`flex flex-col sm:flex-row gap-3 sm:gap-4 ${index > 0 ? 'pt-4 border-t' : ''}`}>
                  <div className="w-16 h-20 sm:w-20 sm:h-26 flex-shrink-0 mx-auto sm:mx-0">
                    <img
                      src={item.imageUrl || item.image_url || "/placeholder.svg"}
                      alt={item.title || "Book cover"}
                      className="w-full h-full object-cover rounded-lg border"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-sm sm:text-base font-semibold mb-1">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">by {item.author}</p>
                    <div className="text-lg sm:text-xl font-bold text-green-600">
                      R{item.price.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Amount:</span>
                  <span className="text-xl sm:text-2xl font-bold text-green-600">
                    R{cartData.totalPrice.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {cartData.items.length} books from {cartData.sellerName}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="w-20 h-24 sm:w-24 sm:h-32 flex-shrink-0 mx-auto sm:mx-0">
                <img
                  src={book.image_url || book.imageUrl || "/placeholder.svg"}
                  alt={book.title || "Book cover"}
                  className="w-full h-full object-cover rounded-lg border bg-gray-100"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-base sm:text-lg font-semibold mb-2">{book.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-2">by {book.author}</p>
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-3 flex-wrap">
                  <Badge variant="outline" className="text-xs sm:text-sm">{book.condition}</Badge>
                  {book.isbn && (
                    <span className="text-xs sm:text-sm text-gray-500">
                      ISBN: {book.isbn}
                    </span>
                  )}
                </div>
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  R{book.price.toFixed(2)}
                </div>
              </div>
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
