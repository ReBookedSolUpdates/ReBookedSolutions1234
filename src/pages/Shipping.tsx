import React from "react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Truck, Clock, ShieldCheck, Wallet, ArrowRight, Sparkles, CreditCard } from "lucide-react";

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
        title="Shipping with BobGo – Reliable Delivery & Tracking"
        description="We use BobGo to connect to trusted couriers like The Courier Guy and Fastway. Faster pickups, better rates, and real-time tracking for buyers and sellers."
        keywords="bobgo, courier guy, fastway, delivery tracking, shipping south africa, textbook delivery"
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
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              Seamless nationwide delivery
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-book-700">
              Shipping Powered by BobGo
            </h1>
            <p className="mt-3 text-gray-700 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              BobGo connects us to leading couriers so you get reliable, trackable shipping at great rates.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Pill><Truck className="h-3.5 w-3.5 text-blue-600" /> Door‑to‑door</Pill>
              <Pill><Clock className="h-3.5 w-3.5 text-emerald-600" /> Fast pickups</Pill>
              <Pill><ShieldCheck className="h-3.5 w-3.5 text-green-600" /> Reliable tracking</Pill>
              <Pill><Wallet className="h-3.5 w-3.5 text-amber-600" /> Competitive rates</Pill>
            </div>
          </div>

          {/* Why BobGo */}
          <Card className="border-0 shadow-sm ring-1 ring-black/5">
            <CardHeader>
              <SectionTitle subtitle="Built for speed, savings, and reliability">Why we use BobGo</SectionTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="group rounded-xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-4 shadow-sm transition hover:shadow-md">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Reliable nationwide delivery</p>
                    <p className="text-gray-600 text-sm">Door‑to‑door service with tracking and delivery updates.</p>
                  </div>
                </div>
              </div>
              <div className="group rounded-xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-4 shadow-sm transition hover:shadow-md">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-gray-900">Faster pickups</p>
                    <p className="text-gray-600 text-sm">Automatic courier booking helps sellers ship sooner.</p>
                  </div>
                </div>
              </div>
              <div className="group rounded-xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-4 shadow-sm transition hover:shadow-md">
                <div className="flex items-start gap-3">
                  <Wallet className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium text-gray-900">Competitive rates</p>
                    <p className="text-gray-600 text-sm">Aggregated options keep delivery affordable for buyers.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* BobBox Section */}
          <Card className="border-0 shadow-sm ring-1 ring-black/5 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader>
              <SectionTitle subtitle="The smarter way to receive your books">Pickup with BobBox</SectionTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="group rounded-xl border border-purple-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">Faster deliveries</p>
                    <p className="text-gray-600 text-sm">Pick up within a convenient time window instead of waiting for home delivery.</p>
                  </div>
                </div>
              </div>
              <div className="group rounded-xl border border-purple-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                <div className="flex items-start gap-3">
                  <Wallet className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">Lower shipping costs</p>
                    <p className="text-gray-600 text-sm">BobBox pickup points are our most affordable delivery option.</p>
                  </div>
                </div>
              </div>
              <div className="group rounded-xl border border-purple-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">Safe and secure</p>
                    <p className="text-gray-600 text-sm">Your books are held safely at the pickup point with real-time notifications.</p>
                  </div>
                </div>
              </div>
              <div className="group rounded-xl border border-purple-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">Nationwide network</p>
                    <p className="text-gray-600 text-sm">Hundreds of convenient pickup locations across South Africa.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Couriers */}
          <Card className="border-0 shadow-sm ring-1 ring-black/5">
            <CardHeader>
              <SectionTitle subtitle="Integrated via BobGo’s network">Couriers we connect through BobGo</SectionTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="text-sm py-2 px-3 flex items-center gap-2 border border-gray-200 bg-white">
                  <Truck className="h-4 w-4 text-blue-600" /> The Courier Guy
                </Badge>
                <Badge variant="secondary" className="text-sm py-2 px-3 flex items-center gap-2 border border-gray-200 bg-white">
                  <Truck className="h-4 w-4 text-emerald-600" /> RAM
                </Badge>
                <Badge variant="secondary" className="text-sm py-2 px-3 flex items-center gap-2 border border-gray-200 bg-white">
                  <Truck className="h-4 w-4 text-violet-600" /> Internet Express
                </Badge>
                <Badge variant="secondary" className="text-sm py-2 px-3 flex items-center gap-2 border border-gray-200 bg-white">
                  <Truck className="h-4 w-4 text-indigo-600" /> Citi-Sprint
                </Badge>
                <Badge variant="secondary" className="text-sm py-2 px-3 flex items-center gap-2 border border-gray-200 bg-white">
                  <Truck className="h-4 w-4 text-cyan-600" /> SkyNet
                </Badge>
                <Badge variant="secondary" className="text-sm py-2 px-3 flex items-center gap-2 border border-gray-200 bg-white">
                  <Truck className="h-4 w-4 text-purple-600" /> Fastway
                </Badge>
                <Badge variant="secondary" className="text-sm py-2 px-3 flex items-center gap-2 border border-gray-200 bg-white">
                  <Truck className="h-4 w-4 text-rose-600" /> City Logistics
                </Badge>
                <Badge variant="secondary" className="text-sm py-2 px-3 flex items-center gap-2 border border-gray-200 bg-white">
                  <Truck className="h-4 w-4 text-amber-600" /> MTE Xpress
                </Badge>
              </div>
              <p className="text-gray-500 text-xs mt-3">
                More providers may be added as we expand coverage.
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
          <Card className="border-0 shadow-sm ring-1 ring-black/5 bg-gradient-to-br from-emerald-50 to-white">
            <CardHeader>
              <SectionTitle subtitle="Multiple payment options powered by BobPay">Secure Payment Methods</SectionTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* BobPay Introduction */}
              <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <CreditCard className="h-8 w-8 text-emerald-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg">Powered by BobPay</h3>
                    <p className="text-gray-700 text-sm mt-1">
                      We accept multiple payment methods through our secure BobPay gateway. All transactions are encrypted and protected.
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Methods Grid */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">EFT Payment Options</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    <div className="flex items-center justify-center bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:border-emerald-300 transition">
                      <img
                        src="https://cdn.builder.io/api/v1/image/assets%2Fbe2ca462026542bf80e06aef7423f7d8%2F2b87ac3333ab4c1f93eee9ebbcb5ba96?format=webp&width=800&height=1200"
                        alt="BobPay Instant EFT"
                        className="h-12 object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-center bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:border-emerald-300 transition">
                      <img
                        src="https://cdn.builder.io/api/v1/image/assets%2Fbe2ca462026542bf80e06aef7423f7d8%2Ff86c103bcebd46d09d376400d4b98994?format=webp&width=800&height=1200"
                        alt="BobPay Manual EFT"
                        className="h-12 object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-center bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:border-emerald-300 transition">
                      <img
                        src="https://cdn.builder.io/api/v1/image/assets%2Fbe2ca462026542bf80e06aef7423f7d8%2Fa6df1c109fcb48eb8f700f0ee1ba5838?format=webp&width=800&height=1200"
                        alt="Nedbank Direct EFT"
                        className="h-12 object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-center bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:border-emerald-300 transition">
                      <img
                        src="https://cdn.builder.io/api/v1/image/assets%2Fbe2ca462026542bf80e06aef7423f7d8%2F7b5f53b3422f4126a4e66bf2f2237d2b?format=webp&width=800&height=1200"
                        alt="Capitec Pay"
                        className="h-12 object-contain"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Card Payment Methods</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    <div className="flex items-center justify-center bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:border-emerald-300 transition">
                      <img
                        src="https://cdn.builder.io/api/v1/image/assets%2Fbe2ca462026542bf80e06aef7423f7d8%2F0dcafa29bfc243b6bd9f8ca37848a776?format=webp&width=800&height=1200"
                        alt="Mastercard"
                        className="h-12 object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-center bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:border-emerald-300 transition">
                      <img
                        src="https://cdn.builder.io/api/v1/image/assets%2Fbe2ca462026542bf80e06aef7423f7d8%2Fb4a7128bece94bce91c7dbb723bae4aa?format=webp&width=800&height=1200"
                        alt="Visa"
                        className="h-12 object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-center bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:border-emerald-300 transition">
                      <img
                        src="https://cdn.builder.io/api/v1/image/assets%2Fbe2ca462026542bf80e06aef7423f7d8%2F58416a87bee74a149a037161b4ccecb2?format=webp&width=800&height=1200"
                        alt="American Express"
                        className="h-12 object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-center bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:border-emerald-300 transition">
                      <img
                        src="https://cdn.builder.io/api/v1/image/assets%2Fbe2ca462026542bf80e06aef7423f7d8%2Fdbd88b71b59d4aa29a7fb7d4e1db328e?format=webp&width=800&height=1200"
                        alt="Diners Club"
                        className="h-12 object-contain"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Digital Payment Options</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    <div className="flex items-center justify-center bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:border-emerald-300 transition">
                      <img
                        src="https://cdn.builder.io/api/v1/image/assets%2Fbe2ca462026542bf80e06aef7423f7d8%2Fb66a58cbee0047d4981eb8e5c3c445d4?format=webp&width=800&height=1200"
                        alt="PayShap"
                        className="h-12 object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-center bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:border-emerald-300 transition">
                      <img
                        src="https://cdn.builder.io/api/v1/image/assets%2Fbe2ca462026542bf80e06aef7423f7d8%2F18aac1c1e7ba4b7bb6ea87a8502d3494?format=webp&width=800&height=1200"
                        alt="Scan to Pay"
                        className="h-12 object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-center bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:border-emerald-300 transition">
                      <img
                        src="https://cdn.builder.io/api/v1/image/assets%2Fbe2ca462026542bf80e06aef7423f7d8%2F8c6f5798a2024ce3ae6175c3acdcda15?format=webp&width=800&height=1200"
                        alt="ABSA Pay"
                        className="h-12 object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Note */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-medium text-blue-900 text-sm">Bank-grade security</p>
                  <p className="text-blue-700 text-xs mt-1">All payments are secured with industry-standard encryption. Your financial information is never stored on our servers.</p>
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
