import React from "react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Truck, Clock, ShieldCheck, Wallet, ArrowRight, Sparkles, CreditCard, PackageSearch } from "lucide-react";

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-3 py-1 text-xs font-medium text-gray-700 shadow-sm ring-1 ring-black/5">
    {children}
  </span>
);

const SectionTitle = ({ children, subtitle }: { children: React.ReactNode; subtitle?: React.ReactNode }) => (
  <div className="flex flex-col items-start gap-1">
    <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-gray-900">{children}</h2>
    {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
  </div>
);

const Shipping = () => {

  return (
    <Layout>
      <SEO
        title="Shipping & Payments – Reliable Delivery & Secure Payments"
        description="Courier Guy shipping with Pudo lockers and multiple payment options. We connect to trusted couriers and accept EFT, cards, and digital payments through our secure BobPay gateway."
        keywords="shipping, payments, courier guy, pudo, locker delivery, delivery tracking, bobpay, south africa, textbook delivery"
        url="https://www.rebookedsolutions.co.za/shipping"
      />

      <div className="relative min-h-screen bg-gradient-to-b from-book-100/60 via-white to-white">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 select-none [mask-image:radial-gradient(60%_50%_at_50%_0%,black,transparent)]">
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-book-300/40 to-transparent" />
          <div className="absolute -top-10 right-1/2 h-56 w-56 rounded-full bg-book-400/20 blur-3xl" />
          <div className="absolute -top-8 left-1/2 h-56 w-56 rounded-full bg-blue-300/20 blur-3xl" />
        </div>

        <div className="container mx-auto px-3 sm:px-6 py-8 sm:py-12 space-y-10">
          {/* Hero */}
          <div className="relative mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-gray-700 shadow ring-1 ring-black/5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              Nationwide delivery & secure payments
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-book-700">
              Shipping & Payments
            </h1>
            <p className="mt-3 text-gray-700 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Reliable delivery via The Courier Guy and Pudo lockers, with secure payments through our BobPay gateway.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Pill><Truck className="h-3.5 w-3.5 text-blue-600" /> Door‑to‑door delivery</Pill>
              <Pill><Wallet className="h-3.5 w-3.5 text-emerald-600" /> Multiple payment options</Pill>
              <Pill><ShieldCheck className="h-3.5 w-3.5 text-green-600" /> Bank-grade security</Pill>
            </div>
          </div>

          {/* Why The Courier Guy */}
          <Card className="border-0 shadow-sm ring-1 ring-black/5">
            <CardHeader>
              <SectionTitle subtitle="South Africa's leading courier service">Why we use The Courier Guy</SectionTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="group rounded-xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-4 shadow-sm transition hover:shadow-md">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Reliable nationwide delivery</p>
                    <p className="text-gray-600 text-sm">Fast and efficient door‑to‑door service with real-time tracking.</p>
                  </div>
                </div>
              </div>
              <div className="group rounded-xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-4 shadow-sm transition hover:shadow-md">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-gray-900">Flexible Options</p>
                    <p className="text-gray-600 text-sm">Choose between locker-to-locker, door-to-locker, or door-to-door.</p>
                  </div>
                </div>
              </div>
              <div className="group rounded-xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-4 shadow-sm transition hover:shadow-md">
                <div className="flex items-start gap-3">
                  <Wallet className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium text-gray-900">Competitive rates</p>
                    <p className="text-gray-600 text-sm">Affordable shipping starting from just R50 for locker delivery.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pudo Section */}
          <Card className="border-0 shadow-sm ring-1 ring-black/5 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader>
              <SectionTitle subtitle="Smart locker technology by The Courier Guy">Pickup with Pudo Lockers</SectionTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="group rounded-xl border border-purple-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">24/7 Availability</p>
                    <p className="text-gray-600 text-sm">Pick up your books whenever it suits you, even after hours.</p>
                  </div>
                </div>
              </div>
              <div className="group rounded-xl border border-purple-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                <div className="flex items-start gap-3">
                  <Wallet className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">Budget-Friendly</p>
                    <p className="text-gray-600 text-sm">Locker-to-locker delivery is our most affordable shipping method.</p>
                  </div>
                </div>
              </div>
              <div className="group rounded-xl border border-purple-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">Safe and Secure</p>
                    <p className="text-gray-600 text-sm">Your parcel is safe in a smart locker, accessible only with your unique PIN.</p>
                  </div>
                </div>
              </div>
              <div className="group rounded-xl border border-purple-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">1,100+ Locations</p>
                    <p className="text-gray-600 text-sm">Find a Pudo locker in malls, gas stations, and shopping centers nationwide.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Couriers */}
          <Card className="border-0 shadow-sm ring-1 ring-black/5">
            <CardHeader>
              <SectionTitle subtitle="Powered by South Africa's most trusted network">Our Primary Logistics Provider</SectionTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="text-sm py-2 px-3 flex items-center gap-2 border border-gray-200 bg-white">
                  <Truck className="h-4 w-4 text-blue-600" /> The Courier Guy
                </Badge>
                <Badge variant="secondary" className="text-sm py-2 px-3 flex items-center gap-2 border border-gray-200 bg-white">
                  <Truck className="h-4 w-4 text-purple-600" /> Pudo
                </Badge>
              </div>
              <p className="text-gray-500 text-xs mt-3">
                We primarily use The Courier Guy and Pudo for their industry-leading reliability and coverage.
              </p>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card className="border-0 shadow-sm ring-1 ring-black/5">
            <CardHeader>
              <SectionTitle>How this helps buyers and sellers</SectionTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">For Buyers</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <PackageSearch className="h-4 w-4 text-blue-600 mt-0.5" />
                    <p className="text-gray-700 text-sm">Live tracking and delivery notifications.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-green-600 mt-0.5" />
                    <p className="text-gray-700 text-sm">Trusted couriers with proven reliability.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Wallet className="h-4 w-4 text-amber-600 mt-0.5" />
                    <p className="text-gray-700 text-sm">Fair pricing chosen at checkout.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">For Sellers</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-emerald-600 mt-0.5" />
                    <p className="text-gray-700 text-sm">Faster courier bookings after an order is confirmed.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Truck className="h-4 w-4 text-blue-600 mt-0.5" />
                    <p className="text-gray-700 text-sm">Seamless pickups—just package and hand over.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-green-600 mt-0.5" />
                    <p className="text-gray-700 text-sm">Transparent progress from pickup to delivery.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods Section */}
          <Card className="border-0 shadow-sm ring-1 ring-black/5 bg-white overflow-hidden">
            <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                <h2 className="text-lg font-bold tracking-tight">Secure Payment Methods</h2>
              </div>
              <Badge className="bg-emerald-500 text-white border-none hover:bg-emerald-400">
                PCI-DSS Compliant
              </Badge>
            </div>

            <CardContent className="p-0">
              {/* Main Intro */}
              <div className="p-6 border-b border-gray-100 bg-emerald-50/10">
                <div className="max-w-2xl">
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-emerald-600" />
                    Powered by BobPay Gateway
                  </h3>
                  <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                    We've partnered with BobPay to provide a world-class checkout experience. Every transaction is encrypted using industry-leading protocols to ensure your financial data stays private and protected.
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-8">
                {/* Method Groups */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Cards & Digital */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                      <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Cards & Digital</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { src: "https://cdn.builder.io/api/v1/image/assets%2Fbe2ca462026542bf80e06aef7423f7d8%2F0dcafa29bfc243b6bd9f8ca37848a776", alt: "Mastercard" },
                        { src: "https://cdn.builder.io/api/v1/image/assets%2Fbe2ca462026542bf80e06aef7423f7d8%2Fb4a7128bece94bce91c7dbb723bae4aa", alt: "Visa" },
                        { src: "https://cdn.builder.io/api/v1/image/assets%2Fbe2ca462026542bf80e06aef7423f7d8%2F58416a87bee74a149a037161b4ccecb2", alt: "Amex" },
                        { src: "https://cdn.builder.io/api/v1/image/assets%2Fbe2ca462026542bf80e06aef7423f7d8%2Fdbd88b71b59d4aa29a7fb7d4e1db328e", alt: "Diners" },
                        { src: "https://cdn.builder.io/api/v1/image/assets%2Fbe2ca462026542bf80e06aef7423f7d8%2Fb66a58cbee0047d4981eb8e5c3c445d4", alt: "PayShap" },
                        { src: "https://cdn.builder.io/api/v1/image/assets%2Fbe2ca462026542bf80e06aef7423f7d8%2F18aac1c1e7ba4b7bb6ea87a8502d3494", alt: "Scan to Pay" },
                      ].map((item, i) => (
                        <div key={i} className="group relative flex items-center justify-center bg-gray-50 rounded-xl h-14 p-2 transition-all hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-emerald-100">
                          <img src={item.src} alt={item.alt} className="max-h-8 max-w-full object-contain grayscale transition group-hover:grayscale-0" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* EFT & Instant Pay */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                      <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">EFT & Instant Pay</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { src: "https://cdn.builder.io/api/v1/image/assets%2Fbe2ca462026542bf80e06aef7423f7d8%2F2b87ac3333ab4c1f93eee9ebbcb5ba96", alt: "Instant EFT" },
                        { src: "https://cdn.builder.io/api/v1/image/assets%2Fbe2ca462026542bf80e06aef7423f7d8%2Ff86c103bcebd46d09d376400d4b98994", alt: "Manual EFT" },
                        { src: "https://cdn.builder.io/api/v1/image/assets%2Fbe2ca462026542bf80e06aef7423f7d8%2F7b5f53b3422f4126a4e66bf2f2237d2b", alt: "Capitec Pay" },
                        { src: "https://cdn.builder.io/api/v1/image/assets%2Fbe2ca462026542bf80e06aef7423f7d8%2Fa6df1c109fcb48eb8f700f0ee1ba5838", alt: "Nedbank Pay" },
                        { src: "https://cdn.builder.io/api/v1/image/assets%2Fbe2ca462026542bf80e06aef7423f7d8%2F8c6f5798a2024ce3ae6175c3acdcda15", alt: "ABSA Pay" },
                      ].map((item, i) => (
                        <div key={i} className="group relative flex items-center justify-center bg-gray-50 rounded-xl h-14 p-2 transition-all hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-blue-100">
                          <img src={item.src} alt={item.alt} className="max-h-8 max-w-full object-contain grayscale transition group-hover:grayscale-0" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trust & Security */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                      <div className="w-1.5 h-4 bg-amber-500 rounded-full" />
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Bank-Grade Trust</h4>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-green-100 rounded-lg shrink-0">
                          <ShieldCheck className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 leading-none">Encrypted Checkout</p>
                          <p className="text-xs text-gray-600 mt-1">256-bit SSL secure payment environment.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-blue-100 rounded-lg shrink-0">
                          <ShieldCheck className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 leading-none">Privacy Guaranteed</p>
                          <p className="text-xs text-gray-600 mt-1">Your card info is never stored on our site.</p>
                        </div>
                      </div>
                      <Separator className="bg-gray-200" />
                      <div className="pt-1">
                        <p className="text-[10px] text-gray-400 leading-relaxed uppercase tracking-tight font-medium">
                          Partnering with verified financial institutions across South Africa.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Shipping;
