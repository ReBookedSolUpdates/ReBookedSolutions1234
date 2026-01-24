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
            <div className="text-blue-900 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4">
                <div>
                  <div className="font-semibold text-blue-700 mb-1">Effective Date</div>
                  <div className="text-blue-900">3 December 2025</div>
                </div>
                <div>
                  <div className="font-semibold text-blue-700 mb-1">Platform</div>
                  <div className="text-blue-900 break-all">rebookedsolutions.co.za</div>
                </div>
                <div>
                  <div className="font-semibold text-blue-700 mb-1">Operator</div>
                  <div className="text-blue-900">ReBooked Solutions (Pty) Ltd</div>
                </div>
                <div>
                  <div className="font-semibold text-blue-700 mb-1">Support</div>
                  <div className="text-blue-900 break-all">legal@rebookedsolutions.co.za</div>
                </div>
              </div>
              <div className="border-t border-blue-200 pt-4">
                <div>
                  <div className="font-semibold text-blue-700 mb-1">Jurisdiction</div>
                  <div className="text-blue-900 mb-3">Republic of South Africa</div>
                </div>
                <div>
                  <div className="font-semibold text-blue-700 mb-1">Regulatory Compliance</div>
                  <div className="text-blue-900 space-y-1">
                    <div>• Consumer Protection Act (Act 68 of 2008)</div>
                    <div>• Electronic Communications and Transactions Act (Act 25 of 2002)</div>
                    <div>• Protection of Personal Information Act (Act 4 of 2013)</div>
                  </div>
                </div>
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
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                        1. CRITICAL DATA COLLECTION (WHAT WE HARVEST)
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-3">
                        To maintain a secure and automated marketplace, we collect the following:
                      </p>
                      <ul className="list-disc pl-6 space-y-3 text-gray-700 text-sm sm:text-base">
                        <li><strong>Identity &amp; FICA Data:</strong> Your full legal name, email, and phone number. To prevent money laundering and fraud, we reserve the right to collect and store copies of your South African Identity Document (ID) and Proof of Residence.</li>
                        <li><strong>AI Analysis Data:</strong> When you use our AI Tool, you upload photos of textbooks. We process and analyze these images to extract metadata (ISBN, Author, Edition). By using the tool, you consent to this machine-learning analysis.</li>
                        <li><strong>FULL-ACTIVITY TRACKING:</strong> <strong>As a core security measure, REBOOKED SOLUTIONS TRACKS AND RECORDS EVERY INTERACTION ON THE PLATFORM. This includes your IP address, device type, clickstream patterns, and time spent on specific pages. This is used to detect "bot" activity and fraudulent behavior.</strong></li>
                        <li><strong>Financial Data:</strong> We collect verified South African banking details to facilitate payouts. We do not store full credit card numbers; these are handled by PCI-compliant partners.</li>
                        <li><strong>User Content License:</strong> Any photo of a textbook you upload is stored by us. Per our Terms, you grant us a license to use these photos for marketing and social media advertisements.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                        2. PURPOSES OF PROCESSING (WHY WE NEED IT)
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-3">
                        We process your data for these mandatory business functions:
                      </p>
                      <ul className="list-disc pl-6 space-y-3 text-gray-700 text-sm sm:text-base">
                        <li><strong>TRANSACTION MEDIATION:</strong> We use your contact and location data to facilitate the 48/60/48 hour timeline (Commitment, Shipping, and Confirmation).</li>
                        <li><strong>FRAUD PREVENTION:</strong> We analyze your behavioral data and FICA documents to ensure you are a real person and not a "review bomber" or scammer.</li>
                        <li><strong>WALLET MAINTENANCE:</strong> We track your transaction history to manage your virtual Wallet and to apply Dormancy/Maintenance Fees after 12 months of inactivity.</li>
                        <li><strong>COURIER INTEGRATION:</strong> We share your name, phone number, and address with third-party courier services to ensure textbooks are delivered correctly.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                        3. DATA SHARING AND INTERNATIONAL TRANSFERS
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-3">
                        Your data is shared ONLY with the following parties under strict confidentiality:
                      </p>
                      <ul className="list-disc pl-6 space-y-3 text-gray-700 text-sm sm:text-base">
                        <li><strong>Technical Infrastructure:</strong> We use global cloud providers (such as AWS, Supabase, or Vercel). Your data may be stored on servers located outside of South Africa, provided they offer POPIA-equivalent protection.</li>
                        <li><strong>Payment Processors:</strong> Your payment data is handled by secure gateways (e.g., Paystack, BobPay).</li>
                        <li><strong>Legal &amp; Exit Strategy:</strong> <strong>In the event of a merger, sale, or acquisition of ReBooked Solutions, your personal data will be transferred to the new owner as a business asset.</strong></li>
                        <li><strong>Authorities:</strong> We will disclose your data to SARS or the South African Police Service (SAPS) if legally compelled to do so.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                        4. DATA SECURITY: THE "LEGAL ARMOR"
                      </h3>
                      <ul className="list-disc pl-6 space-y-3 text-gray-700 text-sm sm:text-base">
                        <li><strong>ENCRYPTION:</strong> All data is encrypted in transit (TLS) and at rest on our servers.</li>
                        <li><strong>ACCESS CONTROL:</strong> Only authorized ReBooked Solutions employees with specific security clearance can view your FICA documents (ID/Proof of Residence).</li>
                        <li><strong>BREACH NOTIFICATION:</strong> In the unlikely event of a data breach, we will notify both the Information Regulator and affected Users as required by Section 22 of POPIA.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                        5. RETENTION AND DELETION (THE 7-YEAR RULE)
                      </h3>
                      <ul className="list-disc pl-6 space-y-3 text-gray-700 text-sm sm:text-base">
                        <li><strong>ACTIVE USERS:</strong> We retain your data for as long as your account is active.</li>
                        <li><strong>DORMANT ACCOUNTS:</strong> If an account is inactive for 12 months, it is flagged for closure.</li>
                        <li><strong>STATUTORY OBLIGATION:</strong> <strong>Even if you delete your account, we are legally required by South African Tax and AML law to retain your transaction records and identity data for a period of 7 (SEVEN) YEARS.</strong></li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                        6. YOUR LEGAL RIGHTS (POPIA SECTION 23 &amp; 24)
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-3">
                        You have the following enforceable rights:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm sm:text-base">
                        <li><strong>RIGHT TO ACCESS:</strong> You may request a record of the personal data we hold.</li>
                        <li><strong>RIGHT TO OBJECTION:</strong> You may object to your data being used for direct marketing.</li>
                        <li><strong>RIGHT TO CORRECTION:</strong> You may demand that we fix inaccurate or outdated info.</li>
                        <li><strong>RIGHT TO COMPLAIN:</strong> You may lodge a complaint with the South African Information Regulator at inforegulator.org.za.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                        7. CONTACT INFORMATION
                      </h3>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm sm:text-base">
                        <li><strong>Legal Department:</strong> legal@rebookedsolutions.co.za</li>
                        <li><strong>Support Contact:</strong> info@rebookedsolutions.co.za</li>
                      </ul>
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
                  <div className="prose max-w-none space-y-4 sm:space-y-6 text-gray-700 text-sm sm:text-base">
                    <section>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-4">
                        By using the Platform, Users agree to these Rules. ReBooked Solutions acts solely as a digital intermediary. We do not own, inspect, or guarantee any inventory. The contract of sale is strictly between the Buyer and the Seller.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                        1. ACCOUNT INTEGRITY &amp; ELIGIBILITY
                      </h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>1.1 Truthful Data:</strong> You must provide accurate, current information. False details will result in immediate account termination.</li>
                        <li><strong>1.2 Single Account Rule:</strong> You may only maintain ONE account. Evasion of this rule via fake identities is a material breach.</li>
                        <li><strong>1.3 Legal Capacity:</strong> Minors require express parental/guardian supervision to use the Platform.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                        2. LISTING &amp; PRICING RULES (THE SELLER'S DUTY)
                      </h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>2.1 Original Photos Only:</strong> <strong>You MUST upload original photos of the actual book you own. The use of AI-generated or stock images is strictly prohibited.</strong></li>
                        <li><strong>2.2 THE HIGHLIGHTING RULE:</strong> <strong>You must disclose the extent of all markings. If more than 10% of the book contains highlighting or handwriting and this was not disclosed, the Buyer is entitled to a full refund.</strong></li>
                        <li><strong>2.3 Digital Access Codes:</strong> Unless your listing explicitly states otherwise, all digital access codes/online keys are assumed to be USED or EXPIRED.</li>
                        <li><strong>2.4 Pricing:</strong> Sellers set prices in ZAR. A 10% commission is deducted by the Platform upon a successful sale.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                        3. THE 48/60/48 TRANSACTION CYCLE
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-3">
                        To maintain marketplace speed, these timelines are MANDATORY:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>48 HOURS TO COMMIT:</strong> Once a Buyer pays, the Seller has 48 hours to "Commit to Sale." Failure to do so results in an automatic cancellation and refund.</li>
                        <li><strong>60 HOURS TO SHIP:</strong> After committing, the Seller has 60 hours (3 business days) to dispatch the book.</li>
                        <li><strong>48 HOURS TO CONFIRM:</strong> Once delivered, the Buyer has 48 hours to "Confirm Receipt." After this, funds are automatically released to the Seller's Wallet.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                        4. ANTI-CIRCUMVENTION (NO OFF-PLATFORM DEALS)
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                        <strong>STRICT PROHIBITION: Attempting to bypass the Platform's 10% fee by arranging in-person cash meetings or sharing contact details for "private" sales is strictly prohibited. Any User found attempting to "go off-platform" for an initiated order will be permanently banned and fined R250.</strong>
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                        5. SHIPPING &amp; THE "ABANDONED PARCEL" RULE
                      </h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>5.1 Safe Packaging:</strong> Sellers must use a waterproof inner layer. Damage from poor packaging is the Seller's liability.</li>
                        <li><strong>5.2 Non-Collection:</strong> If a Buyer fails to collect a parcel (e.g., from Paxi or PostNet) within 7 days, the Buyer forfeits their shipping fee and must pay the Return-to-Sender (RTS) costs charged by the courier.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                        6. THE PENALTY &amp; FINE SYSTEM
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-3">
                        Fines are deducted directly from your Wallet or Payouts:
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
                              <td className="border border-gray-300 p-2">1st Misrepresentation</td>
                              <td className="border border-gray-300 p-2">Full Refund</td>
                              <td className="border border-gray-300 p-2">No Payout + Delivery Fee Deduction</td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="border border-gray-300 p-2">2nd Misrepresentation</td>
                              <td className="border border-gray-300 p-2">Full Refund</td>
                              <td className="border border-gray-300 p-2">No Payout + Delivery Fee + R100 Fine</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 p-2">3rd Misrepresentation</td>
                              <td className="border border-gray-300 p-2">Full Refund</td>
                              <td className="border border-gray-300 p-2">No Payout + Delivery Fee + R250 Fine + Suspension</td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="border border-gray-300 p-2">Fraud / Counterfeits</td>
                              <td className="border border-gray-300 p-2">Full Refund</td>
                              <td className="border border-gray-300 p-2">R250 Fine + PERMANENT BAN</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                        7. PROHIBITED ITEMS
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-3">
                        We only allow textbooks and study materials. The following are BANNED:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Counterfeit/photocopied books.</li>
                        <li>Purely digital products (E-books/PDFs).</li>
                        <li>Any item violating third-party Intellectual Property.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                        8. DISPUTE RESOLUTION &amp; EVIDENCE
                      </h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>8.1 THE VIDEO RULE:</strong> <strong>We strongly recommend that Sellers film themselves packing and sealing the book, and Buyers film themselves unboxing it. In a dispute, ReBooked Solutions will prioritize video evidence.</strong></li>
                        <li><strong>8.2 Mandatory Negotiation:</strong> Before taking legal action, Users agree to a 30-day good-faith negotiation period with our legal team.</li>
                        <li><strong>8.3 Finality:</strong> ReBooked Solutions' decision on dispute mediation is final and binding within the Platform.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                        9. WALLET &amp; MAINTENANCE FEES
                      </h3>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>9.1 Payouts:</strong> Transfers to bank accounts take 1–3 business days.</li>
                        <li><strong>9.2 Dormancy:</strong> Any Wallet balance left inactive for 12 consecutive months will be forfeited to ReBooked Solutions as an Administrative Maintenance Fee.</li>
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
