import React from "react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { useSearchParams } from "react-router-dom";
import UnifiedTrackingComponent from "@/components/delivery/UnifiedTrackingComponent";

const Tracking = () => {
  const [searchParams] = useSearchParams();
  const initialTracking = searchParams.get("tracking") || "";

  return (
    <Layout>
      <SEO
        title="Track Your Order – ReBooked Solutions"
        description="Enter your tracking number to get real-time delivery updates for your book orders. Powered by BobGo delivery network."
        keywords="order tracking, delivery tracking, BobGo tracking, shipment tracking"
        url="https://www.rebookedsolutions.co.za/tracking"
      />

      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
          {/* Header */}
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Track Your Order
            </h1>
            <p className="text-lg text-gray-600">
              Enter your tracking number to see real-time updates on your delivery
            </p>
          </div>

          {/* Tracking Component Container */}
          <div className="mx-auto max-w-2xl">
            <div className="bg-white rounded-lg shadow-lg">
              <UnifiedTrackingComponent initialTrackingNumber={initialTracking} provider="bobgo" />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Tracking;
