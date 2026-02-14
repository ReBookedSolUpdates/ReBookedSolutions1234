import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, BookOpen, CheckCircle, Database, Eye, Globe, Lock, Shield } from "lucide-react";

const Transparency = () => {
  return (
    <Layout>
      <SEO
        title="Transparency & Privacy | ReBooked Solutions"
        description="Learn about our commitment to transparency, data privacy, and secure transactions. We protect your data with bank-grade security and POPIA compliance."
        keywords="transparency, privacy, data security, POPIA, South Africa, textbook marketplace"
      />
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-book-50 via-white to-blue-50" aria-hidden="true" />
        <div className="relative container mx-auto px-4 py-10 lg:py-14">
          <div className="mb-8 lg:mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-book-100 text-book-800 text-xs font-medium mb-3">Trusted and Transparent</div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900 flex items-center justify-center gap-2">
              <Eye className="h-7 w-7 text-book-600" /> Transparency & Privacy
            </h1>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">We protect your data with bank‑grade security and practice transparent communication for every order.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
            <Card className="border-book-200/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-green-600" /> Privacy First</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-2">
                <p>We only collect data needed to run the marketplace. No selling of your personal data. Ever.</p>
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">POPIA-aligned</Badge>
              </CardContent>
            </Card>
            <Card className="border-book-200/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-blue-600" /> Secure by design</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-2">
                <p>Addresses and sensitive data are encrypted end‑to‑end. Payments happen via PCI‑compliant providers.</p>
                <p>Bank account details and address information are encrypted in our backend to ensure user privacy and data security.</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">AES‑256</Badge>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">PCI</Badge>
                </div>
              </CardContent>
            </Card>
            <Card className="border-book-200/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5 text-amber-600" /> Limited Usage</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-2">
                <p>Your data is used strictly for orders, delivery, support, and platform improvements.</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="about" className="w-full">
            <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 h-auto bg-white border rounded-lg shadow-sm">
              <TabsTrigger value="about" className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> About</TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2"><Shield className="h-4 w-4" /> Privacy</TabsTrigger>
              <TabsTrigger value="encryption" className="flex items-center gap-2"><Lock className="h-4 w-4" /> Security</TabsTrigger>
              <TabsTrigger value="data" className="flex items-center gap-2"><Database className="h-4 w-4" /> Data</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-book-600" /> About ReBooked Solutions</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-700 space-y-4">
                  <p>ReBooked is a student‑focused marketplace connecting buyers and sellers of textbooks across South Africa. Our mission is to make education more affordable with a secure, transparent platform.</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2"><Globe className="h-4 w-4 text-book-600" /> Our Values</h4>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Transparency in operations</li>
                        <li>Student‑first design</li>
                        <li>Secure, trusted transactions</li>
                        <li>Community building</li>
                        <li>Accountability and clear communication</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> How it works</h4>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Seller commits within 48 hours</li>
                        <li>Courier pickup auto‑scheduled</li>
                        <li>End‑to‑end order tracking with SMS/email updates</li>
                        <li>Automatic refunds if seller doesn’t commit</li>
                      </ul>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-1">Your Rights</h4>
                      <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
                        <li>Access, correction and deletion of your data</li>
                        <li>Opt‑out of non‑essential communications</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-1">Data Retention</h4>
                      <p className="text-sm text-gray-700">Order and payout records are retained for legal and financial auditing, then securely archived.</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-1">Third‑Party Processors</h4>
                      <p className="text-sm text-gray-700">We use vetted providers for payments, delivery and analytics. No selling of personal data.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-green-600" /> Your Privacy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-700">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                      <h4 className="font-medium text-green-900 mb-1">Data Minimization</h4>
                      <p className="text-sm">We only collect what’s necessary to run the marketplace.</p>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-1">Purpose Limitation</h4>
                      <p className="text-sm">Your data is used only for core platform functions.</p>
                    </div>
                    <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                      <h4 className="font-medium text-purple-900 mb-1">No Selling Data</h4>
                      <p className="text-sm">We never sell your personal information to third parties.</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                      <h4 className="font-medium text-yellow-900 mb-1">User Controls</h4>
                      <ul className="list-disc list-inside text-sm space-y-1 text-yellow-900">
                        <li>Download your data on request</li>
                        <li>Delete account and personal data (subject to legal holds)</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg bg-rose-50 border border-rose-200">
                      <h4 className="font-medium text-rose-900 mb-1">Children’s Data</h4>
                      <p className="text-sm">ReBooked is for users 16+; we do not knowingly collect data from minors.</p>
                    </div>
                    <div className="p-4 rounded-lg bg-teal-50 border border-teal-200">
                      <h4 className="font-medium text-teal-900 mb-1">International Transfers</h4>
                      <p className="text-sm">Data is hosted with providers that meet international security standards.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="encryption" className="mt-6">
              <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-red-600" /> Address Encryption</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-gray-700">
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">AES‑256</Badge>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">End‑to‑End</Badge>
                    </div>
                    <p>Your delivery addresses are encrypted before storage and only decrypted for delivery operations.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-blue-600" /> Banking Security</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-gray-700">
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Bank‑grade</Badge>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">PCI</Badge>
                    </div>
                    <p>We use PCI‑compliant processors. Card info never touches our servers.</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="data" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5 text-amber-600" /> Data Usage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-700">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Core Platform</h4>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Authentication & account management</li>
                        <li>Listings, orders and delivery</li>
                        <li>Notifications and support</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Improvements</h4>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Anonymous analytics</li>
                        <li>Fraud prevention & security monitoring</li>
                        <li>Feature development</li>
                      </ul>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-1">Data Retention</h4>
                      <p className="text-sm text-gray-700">Order, payment and courier records are stored for legal, tax and security reasons, then archived.</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-1">Access Requests</h4>
                      <p className="text-sm text-gray-700">Email legal@rebookedsolutions.co.za to request a copy or deletion of your data.</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-1">Third‑Party Sharing</h4>
                      <p className="text-sm text-gray-700">Shared only with delivery and payment partners to complete your order.</p>
                    </div>
                  </div>

                  <Accordion type="single" collapsible className="w-full border rounded-lg">
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="px-4">Can I request my data to be deleted?</AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 text-sm text-gray-700">
                        Yes. Contact support and we’ll process your request according to policy.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger className="px-4">Who can see my address?</AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 text-sm text-gray-700">
                        Only secure system processes and the courier for delivery purposes.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">Questions? Reach out via the Contact page and we’ll help.</AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Transparency;
