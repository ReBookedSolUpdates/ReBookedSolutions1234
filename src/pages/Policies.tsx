import { useState } from "react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Scale, Mail } from "lucide-react";

const Policies = () => {
  const [activeTab, setActiveTab] = useState("marketplace");

  return (
    <Layout>
      <SEO
        title="Policies & Terms | ReBooked Solutions"
        description="Complete policy documentation for ReBooked Solutions - Privacy Policy, Terms and Conditions, and Marketplace Rules & Responsibilities."
        keywords="policies, terms, privacy, POPIA, consumer protection, ReBooked Solutions"
      />

      <div className="container mx-auto px-4 py-6 sm:py-12 max-w-7xl">
        <div className="mb-8 sm:mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Platform Policies
          </h1>
          <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
            Complete policy documentation for ReBooked Solutions
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6 mt-6 max-w-5xl mx-auto shadow-sm">
            <div className="text-blue-900 text-xs sm:text-sm leading-snug">
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
                <span className="whitespace-nowrap"><strong>Effective Date:</strong> 3 December 2025</span>
                <span className="hidden sm:inline">•</span>
                <span className="whitespace-nowrap"><strong>Platform:</strong> rebookedsolutions.co.za</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-1">
                <span className="whitespace-nowrap"><strong>Operator:</strong> ReBooked Solutions (Pty) Ltd</span>
                <span className="hidden sm:inline">•</span>
                <span className="whitespace-nowrap break-all"><strong>Support:</strong> legal@rebookedsolutions.co.za</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-1">
                <span className="whitespace-nowrap"><strong>Jurisdiction:</strong> Republic of South Africa</span>
              </div>
              <div className="mt-1 text-center">
                <span className="block sm:inline break-words max-w-[62ch] mx-auto">
                  <strong>Regulatory Compliance:</strong> Consumer Protection Act (Act 68 of 2008) • Electronic Communications and Transactions Act (Act 25 of 2002) • Protection of Personal Information Act (Act 4 of 2013)
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full">
          <div className="mb-8 sm:mb-12">
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-xl sm:text-2xl">All Policies & Terms</CardTitle>
                <p className="text-gray-600 text-sm">Select a policy to view details</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                  <Button
                    onClick={() => setActiveTab("privacy")}
                    variant={activeTab === "privacy" ? "default" : "outline"}
                    size="lg"
                    className="w-full justify-start font-medium px-3 py-2 whitespace-normal break-words text-sm leading-tight min-h-[44px]"
                  >
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 flex-shrink-0" />
                    <span className="text-left">Privacy Policy</span>
                  </Button>
                  <Button
                    onClick={() => setActiveTab("terms")}
                    variant={activeTab === "terms" ? "default" : "outline"}
                    size="lg"
                    className="w-full justify-start font-medium px-3 py-2 whitespace-normal break-words text-sm leading-tight min-h-[44px]"
                  >
                    <Scale className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 flex-shrink-0" />
                    <span className="text-left">Terms & Conditions</span>
                  </Button>
                  <Button
                    onClick={() => setActiveTab("marketplace")}
                    variant={activeTab === "marketplace" ? "default" : "outline"}
                    size="lg"
                    className="w-full justify-start font-medium px-3 py-2 whitespace-normal break-words text-sm leading-tight min-h-[44px]"
                  >
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 flex-shrink-0" />
                    <span className="text-left">Marketplace Rules</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Privacy Policy Tab */}
          {activeTab === "privacy" && (
            <div className="space-y-6 sm:space-y-8">
              <Card className="shadow-md border-gray-200">
                <CardHeader className="pb-6 sm:pb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                  <CardTitle className="text-2xl sm:text-3xl lg:text-4xl flex items-center gap-3 mb-3 sm:mb-4 text-gray-800">
                    <Shield className="h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 flex-shrink-0 text-blue-600" />
                    <span>Privacy Policy</span>
                  </CardTitle>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6 shadow-sm">
                    <div className="text-blue-800 text-xs sm:text-sm space-y-2">
                      <div className="text-center">
                        <span>
                          <strong>Last Updated:</strong> January 2026
                        </span>
                        <span className="mx-2">•</span>
                        <span>
                          <strong>Platform:</strong>{" "}
                          <span className="break-all">
                            rebookedsolutions.co.za
                          </span>
                        </span>
                      </div>
                      <div className="text-center">
                        <span>
                          <strong>Operator:</strong> ReBooked Solutions (Pty) Ltd
                        </span>
                      </div>
                      <div className="text-center">
                        <span>
                          <strong>Legal Contact:</strong>{" "}
                          <span className="break-all">
                            legal@rebookedsolutions.co.za
                          </span>
                        </span>
                      </div>
                      <div className="text-center">
                        <span>
                          <strong>Jurisdiction:</strong> Republic of South Africa
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <div className="prose max-w-none space-y-4 sm:space-y-6 text-gray-700 text-sm sm:text-base">
                    <section>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-4">
                        ReBooked Solutions (Pty) Ltd ("ReBooked Solutions", "we", "our", or "us") is a "Responsible Party" as defined by the Protection of Personal Information Act (POPIA). <strong>We are committed to absolute transparency regarding how your data is harvested, stored, and utilized to power our marketplace.</strong>
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                        Definitions
                      </h3>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm sm:text-base">
                        <li><strong>User:</strong> Person creating an account or using Platform services.</li>
                        <li><strong>Processing:</strong> Any operation on personal data including collection, storage, use, or transmission.</li>
                        <li><strong>Platform:</strong> Textbook buying/selling environment at rebookedsolutions.co.za and app.</li>
                        <li><strong>Services:</strong> Account management, transaction facilitation, Wallet, and related features per Terms.</li>
                        <li><strong>Terms:</strong> User Agreement accepted to join the Platform.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                        1. How Personal Data is Collected
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-3 sm:mb-4">
                        Personal data is collected via:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm sm:text-base">
                        <li><strong>Direct interactions:</strong> When registering, listing textbooks, buying/selling, using Wallet, contacting support at info@rebookedsolutions.co.za, or providing feedback.</li>
                        <li><strong>Automated technologies:</strong> Cookies, server logs, tracking for device info, IP address, browsing patterns, usage data.</li>
                        <li><strong>Third parties:</strong> Payment processors (e.g., BobPay), couriers, analytics providers, banks.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                        2. Lawful Basis for Processing
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                        Processing occurs for Platform administration, account creation, transaction mediation under POPIA bases: contract performance, pre-contract steps, legitimate interests (not overriding User rights), legal obligations, or consent where required.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                        3. Personal Data Collected and Purposes
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-3 sm:mb-4">
                        Data enables Platform use, services, transactions, payments, communications. Registration may use Google/Facebook/Apple ID (profile name visible to others); optional profile additions like location. Essential data is mandatory for contracts; some for legal compliance; behavioural data for security/fraud prevention.
                      </p>
                      <div className="overflow-x-auto mb-4">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-300 p-2 text-left font-semibold">Processing Operation</th>
                              <th className="border border-gray-300 p-2 text-left font-semibold">Data Category</th>
                              <th className="border border-gray-300 p-2 text-left font-semibold">Purpose</th>
                              <th className="border border-gray-300 p-2 text-left font-semibold">Legal Basis</th>
                            </tr>
                          </thead>
                          <tbody className="text-gray-700">
                            <tr>
                              <td className="border border-gray-300 p-2">Account creation/profile</td>
                              <td className="border border-gray-300 p-2">Name, email, phone, profile photo, location, Google/Facebook/Apple ID</td>
                              <td className="border border-gray-300 p-2">Register/manage account</td>
                              <td className="border border-gray-300 p-2">Contract performance</td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="border border-gray-300 p-2">Contact details</td>
                              <td className="border border-gray-300 p-2">Name, phone, email</td>
                              <td className="border border-gray-300 p-2">Service info, billing notifications</td>
                              <td className="border border-gray-300 p-2">Contract performance</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 p-2">Income data</td>
                              <td className="border border-gray-300 p-2">Name, birthdate, address, VAT number</td>
                              <td className="border border-gray-300 p-2">Tax reporting to SARS/accountants</td>
                              <td className="border border-gray-300 p-2">Legal obligation</td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="border border-gray-300 p-2">Bank details</td>
                              <td className="border border-gray-300 p-2">Account holder name, number</td>
                              <td className="border border-gray-300 p-2">Payouts for sales</td>
                              <td className="border border-gray-300 p-2">Contract performance</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 p-2">Delivery data</td>
                              <td className="border border-gray-300 p-2">Name, phone, address, tracking</td>
                              <td className="border border-gray-300 p-2">Shipping coordination</td>
                              <td className="border border-gray-300 p-2">Contract; Legitimate interests</td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="border border-gray-300 p-2">Service providers</td>
                              <td className="border border-gray-300 p-2">Courier/shipping/payment info</td>
                              <td className="border border-gray-300 p-2">Integration with providers</td>
                              <td className="border border-gray-300 p-2">Contract; Legitimate interests</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 p-2">Transaction notifications</td>
                              <td className="border border-gray-300 p-2">Email/push</td>
                              <td className="border border-gray-300 p-2">Order updates, Terms changes</td>
                              <td className="border border-gray-300 p-2">Contract performance</td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="border border-gray-300 p-2">User messaging</td>
                              <td className="border border-gray-300 p-2">Message content, sender name, device info, timestamps</td>
                              <td className="border border-gray-300 p-2">Order fulfilment communication</td>
                              <td className="border border-gray-300 p-2">Contract; Legitimate interests</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 p-2">Support</td>
                              <td className="border border-gray-300 p-2">Name, email, usage/transaction data, messages</td>
                              <td className="border border-gray-300 p-2">Handle requests</td>
                              <td className="border border-gray-300 p-2">Contract; Legitimate interests</td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="border border-gray-300 p-2">Disputes</td>
                              <td className="border border-gray-300 p-2">Transaction/User details</td>
                              <td className="border border-gray-300 p-2">Resolve complaints, ensure security</td>
                              <td className="border border-gray-300 p-2">Legitimate interests; Legal obligations</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 p-2">Platform activity</td>
                              <td className="border border-gray-300 p-2">Technical usage, feedback</td>
                              <td className="border border-gray-300 p-2">Improve Services</td>
                              <td className="border border-gray-300 p-2">Legitimate interests</td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="border border-gray-300 p-2">Cookies/technical</td>
                              <td className="border border-gray-300 p-2">Device/browser/IP, preferences</td>
                              <td className="border border-gray-300 p-2">Functionality, analytics</td>
                              <td className="border border-gray-300 p-2">Consent</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 p-2">Admin/maintenance</td>
                              <td className="border border-gray-300 p-2">Usage/contact data</td>
                              <td className="border border-gray-300 p-2">Protect Platform, reporting</td>
                              <td className="border border-gray-300 p-2">Legitimate interests; Legal obligation</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                        Aggregated/anonymised data for statistics falls outside POPIA. Users may object to legitimate interest processing. Data used only for original/compatible purposes; unrelated uses notified with basis.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                        4. Security Data Collection
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                        Technical tools detect fraud, prohibited items (e.g., counterfeits). Listing data (descriptions, photos) reviewed; shared anonymised with brands for authenticity. Basis: legitimate interest in Platform/User protection.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                        5. Marketing
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                        Opt-in for newsletters/marketing via email. Consent-based; withdraw anytime in account settings.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                        6. Legal Compliance
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                        Processing for accounting, authority requests, breach supervision. Basis: legal obligation.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                        7. Internal Access
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                        Needs-based for employees fulfilling roles; limited to partners (e.g., IT, accounting, couriers).
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                        8. Data Sharing
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-3 sm:mb-4">
                        Shared only as necessary:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm sm:text-base">
                        <li><strong>Internal:</strong> ReBooked entities as joint controllers/processors.</li>
                        <li><strong>External:</strong> Processors (hosting Vercel/Supabase, payments BobPay/Paystack, couriers); authorities (tax); advisors (lawyers/auditors); merger/acquisition parties.Third parties bound by confidentiality, instructed use only.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                        9. International Transfers
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                        Data may go outside South Africa (e.g., cloud providers). Safeguards: adequate countries or contracts ensuring POPIA-equivalent protection.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                        10. Data Security
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                        IT/organisational/physical measures: TLS encryption, access controls, monitoring. Platform links to third-party sites (e.g., social media) outside control—review their policies.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                        11. Retention Periods
                      </h3>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm sm:text-base">
                        <li><strong>Account/activity:</strong> Account lifetime + 7 years post-deletion for legal protection.</li>
                        <li><strong>Accounting:</strong> 5-10 years per law.</li>
                        <li><strong>Cookies:</strong> Up to 3 years.Details on request to legal@rebookedsolutions.co.za.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                        12. Data Protection Rights
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-3 sm:mb-4">
                        Under POPIA (updated regulations):
                      </p>
                      <div className="overflow-x-auto mb-4">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-300 p-2 text-left font-semibold">Right</th>
                              <th className="border border-gray-300 p-2 text-left font-semibold">Description</th>
                            </tr>
                          </thead>
                          <tbody className="text-gray-700">
                            <tr>
                              <td className="border border-gray-300 p-2">Access/Awareness</td>
                              <td className="border border-gray-300 p-2">Request confirmation/processing details/copy (Form 2-like, free via email/SMS/WhatsApp).</td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="border border-gray-300 p-2">Correction</td>
                              <td className="border border-gray-300 p-2">Fix incomplete/outdated data.</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 p-2">Erasure</td>
                              <td className="border border-gray-300 p-2">Delete if unnecessary/withdrawn consent/rights outweigh.</td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="border border-gray-300 p-2">Restriction</td>
                              <td className="border border-gray-300 p-2">Limit if accuracy contested/no basis but needed for claims.</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 p-2">Objection</td>
                              <td className="border border-gray-300 p-2">To legitimate interests/marketing/automated decisions (Form 1-like, multi-channel).</td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="border border-gray-300 p-2">Portability</td>
                              <td className="border border-gray-300 p-2">Structured format for consent/contract data.</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 p-2">Withdraw Consent</td>
                              <td className="border border-gray-300 p-2">Anytime, no retroactive effect.</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                        Requests assessed per law/other rights. Proof of identity may be required.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                        13. Complaints/Queries
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                        Contact legal@rebookedsolutions.co.za (response within 1-3 months). Complain to Information Regulator (inforegulator.org.za).
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                        14. Children's Privacy
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                        Not for under-16s without guardian consent; delete if discovered.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                        15. Policy Changes
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                        Updates posted on Platform/email; continued use = acceptance. Keep info current.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                        16. Contact
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                        ReBooked Solutions (Pty) Ltd, legal@rebookedsolutions.co.za, info@rebookedsolutions.co.za.
                      </p>
                    </section>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Terms & Conditions Tab */}
          {activeTab === "terms" && (
            <div className="space-y-4 sm:space-y-6">
              <Card className="shadow-md border-gray-200">
                <CardHeader className="pb-6 sm:pb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                  <CardTitle className="text-2xl sm:text-3xl lg:text-4xl flex items-center gap-3 mb-3 sm:mb-4 text-gray-800">
                    <Scale className="h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 flex-shrink-0 text-blue-600" />
                    <span>Terms and Conditions</span>
                  </CardTitle>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6 shadow-sm">
                    <div className="text-blue-800 text-xs sm:text-sm space-y-2">
                      <div className="text-center">
                        <span>
                          <strong>Last Updated:</strong> January 2026
                        </span>
                        <span className="mx-2">•</span>
                        <span>
                          <strong>Platform:</strong>{" "}
                          <span className="break-all">rebookedsolutions.co.za</span>
                        </span>
                      </div>
                      <div className="text-center">
                        <span>
                          <strong>Operator:</strong> ReBooked Solutions (Pty) Ltd
                        </span>
                        <span className="mx-2">•</span>
                        <span>
                          <strong>Registration:</strong> 2025 / 452062 / 07
                        </span>
                      </div>
                      <div className="text-center">
                        <span>
                          <strong>Legal Email:</strong>{" "}
                          <span className="break-all">legal@rebookedsolutions.co.za</span>
                        </span>
                      </div>
                      <div className="text-center">
                        <span>
                          <strong>Jurisdiction:</strong> Republic of South Africa
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 py-6">
                  <div className="prose max-w-none space-y-4 sm:space-y-6 text-gray-700 text-sm sm:text-base">
                    <section>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                        1. ABOUT THE COMPANY AND SERVICE
                      </h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>1.1 Company Details:</strong> ReBooked Solutions (Pty) Ltd ("ReBooked Solutions", "we", "our", or "us") is a private company incorporated in the Republic of South Africa with Registration Number: 2025 / 452062 / 07.</li>
                        <li><strong>1.2 The Platform:</strong> We operate a virtual peer-to-peer marketplace (the "Platform") located at rebookedsolutions.co.za and/or our mobile application.</li>
                        <li><strong>1.3 Limited Payment Agent Status:</strong> <strong>The Seller hereby appoints ReBooked Solutions to act as their limited payment agent. Once the Buyer pays the Platform, their obligation to the Seller is legally satisfied.</strong></li>
                        <li><strong>1.4 Nature of Facilitation:</strong> We are a technology provider, not a party to the sale. The contract for sale is strictly a private agreement between the Buyer and the Seller.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                        2. USER ELIGIBILITY AND ACCOUNT SECURITY
                      </h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>2.1 Legal Capacity:</strong> You must be 18 years of age or have express parental supervision.</li>
                        <li><strong>2.2 Single Account Policy:</strong> Users may maintain only one account. Using "bots," fake identities, or multiple profiles will result in a permanent ban.</li>
                        <li><strong>2.3 Security Responsibility:</strong> You are solely responsible for all activities under your account. Notify us immediately at info@rebookedsolutions.co.za if you suspect a breach.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                        3. LISTING STANDARDS AND AI ASSISTANCE
                      </h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>3.1 AI Tool Disclaimer:</strong> Our AI-powered tool suggests listing details for convenience. The Seller bears absolute legal responsibility for the accuracy of the final listing.</li>
                        <li><strong>3.2 Digital Access Codes (THE "USED" RULE):</strong> <strong>Unless explicitly stated otherwise in the listing title or description, all digital access codes, one-time-use licenses, or supplemental online materials are assumed to be USED or EXPIRED. Buyers purchase used textbooks at their own risk regarding digital components.</strong></li>
                        <li><strong>3.3 Image Requirements:</strong> Sellers must upload original photos of the actual book in their possession. The use of stock images or AI-generated images is strictly prohibited.</li>
                        <li><strong>3.4 Misidentification:</strong> If a Seller publishes a listing with incorrect data (e.g., wrong edition), the dispute will be resolved in favor of the Buyer, and the Seller will be liable for all shipping costs.</li>
                        <li><strong>3.5 Highlighting and Annotations (The "Highlighter" Rule):</strong> <strong>Sellers must explicitly disclose any highlighting, handwriting, or markings within the textbook. If a book contains significant highlighting (e.g., covering more than 10% of the pages) and this was not disclosed in the listing description, the Platform will rule the item "Not as Described," and the Buyer will be entitled to a full refund at the Seller's expense.</strong></li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                        4. THE TRANSACTION PROCESS AND ANTI-CIRCUMVENTION
                      </h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>4.1 NON-CIRCUMVENTION (NO OFF-PLATFORM DEALS):</strong> <strong>To protect the community, all communications, payments, and delivery tracking MUST occur within the Platform. Attempting to conclude a transaction "off-platform" (e.g., meeting for cash or sharing phone numbers to bypass fees) is a material breach and will result in immediate account termination.</strong></li>
                        <li><strong>4.2 The "Commitment" Window:</strong> Sellers have 48 hours to "Commit to Sale." Failure to do so results in an automatic refund to the Buyer.</li>
                        <li><strong>4.3 The Shipping Window:</strong> Following commitment, the Seller has 60 hours (3 business days) to dispatch the item and provide a tracking number.</li>
                        <li><strong>4.4 Confirmation of Receipt:</strong> Upon delivery, the Buyer has 48 hours to "Confirm Receipt" or lodge a dispute. After 48 hours, the Platform will auto-complete the order and release funds.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                        5. SHIPPING, BUNDLING, AND ABANDONED PARCELS
                      </h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>5.1 Risk of Loss:</strong> The risk remains with the Seller until the item is successfully delivered.</li>
                        <li><strong>5.2 Safe Packaging:</strong> Sellers must use waterproof inner layers and sturdy outer packaging. Damage due to poor packaging is the Seller's liability.</li>
                        <li><strong>5.3 NON-COLLECTION (ABANDONED PARCELS):</strong> <strong>If a Buyer fails to collect a parcel from a courier point (e.g., Paxi or PostNet) within the allowed timeframe:
                          <ol className="list-decimal pl-6 mt-2 space-y-1">
                            <li>The Buyer forfeits the shipping fee.</li>
                            <li>The Buyer is liable for the return-to-sender (RTS) costs charged by the courier.</li>
                            <li>The sale will be cancelled and the remaining balance (minus fees) refunded to the Buyer only once the Seller confirms the book has been returned safely.</li>
                          </ol>
                        </strong></li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                        6. FEES, WALLETS, AND TAXES
                      </h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>6.1 Service Fees:</strong>
                          <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li><strong>Seller Commission:</strong> A 10% fee is deducted from the final sale price.</li>
                            <li><strong>Buyer Platform Fee:</strong> A flat, non-refundable R20 fee is added at checkout.</li>
                          </ul>
                        </li>
                        <li><strong>6.2 TAX:</strong> All fees charged by ReBooked Solutions are inclusive of VAT where applicable. Sellers are responsible for their own personal income tax obligations.</li>
                        <li><strong>6.3 Dormancy and Maintenance Fees:</strong> Any Wallet balance inactive (no logins/transactions) for 12 consecutive months shall be subject to a one-time Administrative Maintenance Fee equal to the remaining balance, effectively closing the account.</li>
                        <li><strong>6.4 Chargebacks:</strong> Buyers who initiate a bank chargeback for a completed sale are liable for the full amount plus a R250 administrative penalty.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                        7. USER RATINGS AND REVIEWS (DEFAMATION SHIELD)
                      </h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>7.1 Content Control:</strong> We reserve the right, at our sole discretion, to remove or edit any review that contains profanity, hate speech, private information, or is deemed to be a "review bomb" (unfairly targeting a User to damage their reputation).</li>
                        <li><strong>7.2 Censorship Disclaimer:</strong> Removal of reviews under this clause is a safety measure and does not constitute illegal censorship.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                        8. DISPUTES AND EVIDENCE (THE "PACKING VIDEO" RULE)
                      </h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>8.1 Proof of Packing:</strong> <strong>To prevent fraud, Users are strongly encouraged to film a short video of the item being placed into the package and sealed (for Sellers) or being opened (for Buyers).</strong></li>
                        <li><strong>8.2 Resolution:</strong> In the event of a "not as described" or "empty box" dispute, ReBooked Solutions will prioritize evidence from Users who provide video proof.</li>
                        <li><strong>8.3 Finality:</strong> Our decision regarding the release or refund of held funds is final and binding for the purposes of the Platform.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                        9. LEGAL COMPLIANCE AND DATA PROTECTION
                      </h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>9.1 POPIA:</strong> Your personal information is processed in accordance with the Protection of Personal Information Act.</li>
                        <li><strong>9.2 Analytics and Tracking:</strong> <strong>For security and fraud prevention, ALL User activity on the Platform is tracked, recorded, and analyzed.</strong></li>
                        <li><strong>9.3 FICA/AML:</strong> We reserve the right to withhold payouts pending the submission of a valid ID and proof of residence if a transaction is flagged as suspicious.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                        10. LIMITATION OF LIABILITY AND SERVICE AVAILABILITY
                      </h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>10.1 "As-Is" Basis:</strong> The Platform and AI Tool are provided without any warranty.</li>
                        <li><strong>10.2 Service Availability:</strong> We do not guarantee 100% uptime. We are not liable for any losses (including lost profit) resulting from technical failures, maintenance, or server outages.</li>
                        <li><strong>10.3 Liability Cap:</strong> Our total liability shall not exceed the greater of R1,000 or the total fees paid by the User in the preceding 6 months.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                        11. INTELLECTUAL PROPERTY
                      </h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>11.1 Ownership:</strong> ReBooked Solutions owns all software, code, and the proprietary architecture of the AI Tool.</li>
                        <li><strong>11.2 Feedback:</strong> Any suggestions provided by Users are irrevocably assigned to ReBooked Solutions without compensation.</li>
                        <li><strong>11.3 User Content License (Promotion Rights):</strong> <strong>By uploading photos, videos, or descriptions to the Platform, you grant ReBooked Solutions a non-exclusive, royalty-free, perpetual, and worldwide license to use, reproduce, and display such content for the purposes of operating and promoting the Platform. This includes, but is not limited to, using your listing photos in social media marketing or advertisements.</strong></li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                        12. STATUTORY DISCLOSURES (ECTA SECTION 43)
                      </h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Full Name:</strong> ReBooked Solutions (Pty) Ltd</li>
                        <li><strong>Registration Number:</strong> 2025 / 452062 / 07</li>
                        <li><strong>Legal Contact:</strong> legal@rebookedsolutions.co.za</li>
                        <li><strong>Support Contact:</strong> info@rebookedsolutions.co.za</li>
                        <li><strong>Dispute Resolution:</strong> We subscribe to the jurisdiction of the Consumer Goods and Services Ombudsman.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                        13. ASSIGNMENT (THE EXIT CLAUSE)
                      </h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>13.1 Transfer of Rights:</strong> ReBooked Solutions reserves the right to assign or transfer its rights and obligations under these Terms to any third party (e.g., in a merger or sale of the business) without prior notice to the User.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                        14. MANDATORY INFORMAL DISPUTE RESOLUTION
                      </h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>14.1 30-Day Negotiation Period:</strong> <strong>Before filing any formal legal claim, summons, or complaint with any regulatory body, you agree to notify us at legal@rebookedsolutions.co.za with a detailed written description of your dispute. Both parties agree to attempt to resolve the matter through good-faith negotiation for a period of 30 (thirty) days before seeking any external legal or judicial recourse.</strong></li>
                      </ul>
                    </section>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Marketplace Rules & Responsibilities Tab */}
          {activeTab === "marketplace" && (
            <div className="space-y-4 sm:space-y-6">
              <Card className="shadow-md border-gray-200">
                <CardHeader className="pb-6 sm:pb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                  <CardTitle className="text-2xl sm:text-3xl lg:text-4xl flex items-center gap-3 mb-3 sm:mb-4 text-gray-800">
                    <Shield className="h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 flex-shrink-0 text-blue-600" />
                    <span>Marketplace Rules & Responsibilities</span>
                  </CardTitle>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6 shadow-sm">
                    <div className="text-blue-800 text-xs sm:text-sm space-y-2">
                      <div className="text-center">
                        <span>
                          <strong>Effective Date:</strong> 3 December 2025
                        </span>
                        <span className="mx-2">•</span>
                        <span>
                          <strong>Platform:</strong>{" "}
                          <span className="break-all">www.rebookedsolutions.co.za</span>
                        </span>
                      </div>
                      <div className="text-center">
                        <span>
                          <strong>Operator:</strong> ReBooked Solutions (Pty) Ltd
                        </span>
                      </div>
                      <div className="text-center">
                        <span>
                          <strong>Support:</strong>{" "}
                          <span className="break-all">info@rebookedsolutions.co.za</span>
                        </span>
                        <span className="mx-2">•</span>
                        <span>
                          <strong>Legal:</strong>{" "}
                          <span className="break-all">legal@rebookedsolutions.co.za</span>
                        </span>
                      </div>
                      <div className="text-center">
                        <span>
                          <strong>Jurisdiction:</strong> Republic of South Africa
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 py-6">
                  <div className="prose max-w-none space-y-4 sm:space-y-6">
                    <section>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                        By using the Platform (rebookedsolutions.co.za and mobile application), Users agree to these Marketplace Rules, which form part of the Terms and Conditions. ReBooked Solutions acts solely as a digital intermediary facilitating peer-to-peer textbook transactions between independent Sellers and Buyers. The Platform does not own, inspect, endorse, or guarantee inventory.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                        1. Account Registration &amp; Eligibility
                      </h3>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm sm:text-base">
                        <li><strong>1.1</strong> Users must register with accurate, truthful, current information; false details may result in suspension or termination.</li>
                        <li><strong>1.2</strong> One account per person; multiple accounts, false identities, or evasion prohibited.</li>
                        <li><strong>1.3</strong> Users bear full responsibility for account security and all activity; report misuse immediately to info@rebookedsolutions.co.za.</li>
                        <li><strong>1.4</strong> Users must have legal capacity under South African law; minors require parental/guardian consent and supervision.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                        2. Listing &amp; Pricing Rules (Sellers)
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">2.1 Listing Requirements</h4>
                          <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm sm:text-base">
                            <li>Accurate details: title, author, edition, ISBN, condition, defects, annotations, missing pages.</li>
                            <li>Original photos only; AI/stock images prohibited.</li>
                            <li>No misleading, incomplete, or deceptive listings.</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">2.2 Pricing &amp; Fees</h4>
                          <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm sm:text-base">
                            <li>Sellers set prices in ZAR.</li>
                            <li>10% commission deducted from sale price on completion.</li>
                            <li>Buyer pays R20 platform fee + shipping at checkout.</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">2.3 Order Process &amp; Payouts</h4>
                          <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm sm:text-base">
                            <li>Buyer pays via Platform; funds held by ReBooked as limited agent.</li>
                            <li>Seller commits within 48 hours or auto-cancel/refund.</li>
                            <li>Ship via approved methods (e.g., integrated couriers); Buyer confirms receipt.</li>
                            <li>Payouts to Wallet then bank (1-3 business days) post-confirmation.</li>
                          </ul>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                        2.4 Fine System (Misrepresentation/Non-Compliance)
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-4">
                        Tiered fines protect Buyers and integrity; deducted from Wallet/payouts:
                      </p>
                      <div className="overflow-x-auto mb-4">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-300 p-2 text-left font-semibold">Offense</th>
                              <th className="border border-gray-300 p-2 text-left font-semibold">Refund to Buyer</th>
                              <th className="border border-gray-300 p-2 text-left font-semibold">Seller Penalty</th>
                            </tr>
                          </thead>
                          <tbody className="text-gray-700">
                            <tr>
                              <td className="border border-gray-300 p-2">First</td>
                              <td className="border border-gray-300 p-2">Full (incl. fees/shipping)</td>
                              <td className="border border-gray-300 p-2">No payout + delivery fee</td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="border border-gray-300 p-2">Second</td>
                              <td className="border border-gray-300 p-2">Full (incl. fees/shipping)</td>
                              <td className="border border-gray-300 p-2">No payout + delivery fee + R100</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 p-2">Third</td>
                              <td className="border border-gray-300 p-2">Full (incl. fees/shipping)</td>
                              <td className="border border-gray-300 p-2">No payout + delivery fee + R250 + suspension review</td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="border border-gray-300 p-2">Zero-Tolerance</td>
                              <td className="border border-gray-300 p-2">Full (incl. fees/shipping)</td>
                              <td className="border border-gray-300 p-2">R250+ fee, permanent ban</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                        Zero-Tolerance: Fraud, counterfeits, scams, system bypass—full refund, R250+ fee, permanent ban.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                        3. Shipping, Delivery &amp; Risk
                      </h3>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm sm:text-base">
                        <li><strong>3.1</strong> Sellers: Commit within 48 hours; ship/present for collection within 60 hours/3 days; secure, appropriate packaging. Seller liable for pre-delivery loss/damage.</li>
                        <li><strong>3.2</strong> Integrated couriers (e.g., Bobgo/The Courier Guy): Auto-tracking; provide accurate numbers for others. Standard: 2-7 business days.</li>
                        <li><strong>3.3</strong> Risk passes on carrier-confirmed delivery. Buyers confirm within 48 hours or auto-complete.</li>
                        <li><strong>3.4</strong> Delays/Failures: Seller error → refund; Buyer issues (wrong address/unclaimed &gt;7 days) → no refund, Buyer pays redelivery.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                        4. Refunds, Cancellations &amp; Returns
                      </h3>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm sm:text-base">
                        <li><strong>4.1</strong> Grounds (within 48 hours delivery): Wrong item, undisclosed defects (missing pages, damage), counterfeits. Evidence required (photos, tracking).</li>
                        <li><strong>4.2</strong> Process: Complaint to legal@rebookedsolutions.co.za; approved returns shipped within 72 hours (Buyer pays unless Seller fault); funds held until resolution. Non-return → possible donation.</li>
                        <li><strong>4.3</strong> Exclusions: Remorse, wear/tear, courier delays.</li>
                        <li><strong>4.4</strong> Cancellations: Buyer pre-commitment; Seller justified only (notify via Platform/legal@rebookedsolutions.co.za). Frequent → penalties/suspension. Refunds: 1-3 business days to original method.</li>
                        <li><strong>4.5</strong> Processing: 7-10 business days post-approval.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                        5. Buyer Responsibilities
                      </h3>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm sm:text-base">
                        <li>Accurate delivery info.</li>
                        <li>No post-dispatch cancellations.</li>
                        <li>Prompt acceptance/collection; report issues within 48 hours.</li>
                        <li>Repeated non-compliance/fraud → suspension/ban.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                        6. Seller Obligations
                      </h3>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm sm:text-base">
                        <li>Warrant ownership, authenticity, accurate listings.</li>
                        <li>Respond within 48 hours to Buyers/Platform.</li>
                        <li>Comply with taxes, IP, consumer laws.</li>
                        <li>No off-Platform transactions for initiated orders.</li>
                        <li>Indemnify Platform for breaches.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                        7. Prohibited Items &amp; Conduct
                      </h3>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm sm:text-base">
                        <li><strong>7.1</strong> Textbooks/study materials only; prohibited: counterfeits, illegal, digital, adult, medical, weapons, drugs.</li>
                        <li><strong>7.2</strong> No harassment, abuse, fraud, scraping, off-Platform solicitation. Violations → removal, suspension, ban, authorities.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                        8. Dispute Resolution
                      </h3>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm sm:text-base">
                        <li><strong>8.1</strong> Direct via Platform messages first.</li>
                        <li><strong>8.2</strong> Platform mediates; non-response → decision favors responder. Final internally.</li>
                        <li><strong>8.3</strong> External: Consumer Commission/courts; CPA rights preserved.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                        9. Liability Limits &amp; Compliance
                      </h3>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm sm:text-base">
                        <li><strong>9.1</strong> Platform not liable for items, disputes, carriers; "as is" services. Liability capped at fees paid (6 months) or R1,000.</li>
                        <li><strong>9.2</strong> Users handle taxes/compliance; POPIA/ECTA/CPA rights intact.</li>
                      </ul>
                    </section>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Policies;
