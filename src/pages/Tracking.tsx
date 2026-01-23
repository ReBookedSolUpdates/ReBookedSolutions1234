import React from "react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";
import UnifiedTrackingComponent from "@/components/delivery/UnifiedTrackingComponent";
import { Sparkles } from "lucide-react";

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-3 py-1 text-xs font-medium text-gray-700 shadow-sm ring-1 ring-black/5">
    {children}
  </span>
);

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

      <div className="relative min-h-screen bg-gradient-to-b from-book-100/60 via-white to-white">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 select-none [mask-image:radial-gradient(60%_50%_at_50%_0%,black,transparent)]">
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-book-300/40 to-transparent" />
          <div className="absolute -top-10 right-1/2 h-56 w-56 rounded-full bg-book-400/20 blur-3xl" />
          <div className="absolute -top-8 left-1/2 h-56 w-56 rounded-full bg-blue-300/20 blur-3xl" />
        </div>

        <div className="container mx-auto px-3 sm:px-6 py-8 sm:py-12">
          {/* Hero */}
          <div className="relative mx-auto max-w-3xl text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-gray-700 shadow ring-1 ring-black/5">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              Real-time delivery updates
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-book-700">
              Track Your Order
            </h1>
            <p className="mt-3 text-gray-700 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Enter your tracking number below to see real-time delivery updates and package location.
            </p>
          </div>

          {/* Tracking Section */}
          <Card className="border-0 shadow-sm ring-1 ring-black/5 bg-gradient-to-br from-blue-50 to-white">
            <div className="p-6 sm:p-8">
              <UnifiedTrackingComponent initialTrackingNumber={initialTracking} provider="bobgo" />
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Tracking;
