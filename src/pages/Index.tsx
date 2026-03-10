import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, Laptop, Sigma, Dna, FlaskConical, Telescope, TrendingUp, CheckCircle, Leaf, ShieldCheck, Truck } from "lucide-react";
import FeaturedBooks from "@/components/home/FeaturedBooks";
import HowItWorks from "@/components/home/HowItWorks";
import ReadyToGetStarted from "@/components/home/ReadyToGetStarted";
import debugLogger from "@/utils/debugLogger";

const Index = () => {
  debugLogger.info("Index", "Index page mounted");

  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if this is actually a verification link that ended up on the homepage
  useEffect(() => {
    debugLogger.info("Index", "Checking search params for verification");
    const hasVerificationParams =
      searchParams.has("token") ||
      searchParams.has("token_hash") ||
      (searchParams.has("type") && searchParams.has("email"));

    if (hasVerificationParams) {
      debugLogger.info("Index", "Verification params detected, redirecting to verify page");
      // Preserve all search parameters and redirect to verify page
      navigate(`/verify?${searchParams.toString()}`, { replace: true });
      return;
    }
  }, [searchParams, navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      debugLogger.info("Index", "Search submitted", { query: searchQuery });
      navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const categories = [
    { name: "Computer Science", icon: <Laptop className="h-7 w-7 sm:h-10 sm:w-10 text-book-700" /> },
    { name: "Mathematics", icon: <Sigma className="h-7 w-7 sm:h-10 sm:w-10 text-book-700" /> },
    { name: "Biology", icon: <Dna className="h-7 w-7 sm:h-10 sm:w-10 text-book-700" /> },
    { name: "Chemistry", icon: <FlaskConical className="h-7 w-7 sm:h-10 sm:w-10 text-book-700" /> },
    { name: "Physics", icon: <Telescope className="h-7 w-7 sm:h-10 sm:w-10 text-book-700" /> },
    { name: "Economics", icon: <TrendingUp className="h-7 w-7 sm:h-10 sm:w-10 text-book-700" /> },
  ];

  return (
    <Layout>
      <SEO
        title="ReBooked Solutions - Buy and Sell Used Textbooks"
        description="South Africa's trusted platform for buying and selling used textbooks. Find affordable academic books, sell your old textbooks, and connect with students across the country."
        keywords="textbooks, used books, academic books, sell books, buy books, student books, South Africa"
        url="https://www.rebookedsolutions.co.za/"
      />

      {/* Hero Section - image right on desktop, below text on mobile/tablet */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-book-100 to-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-12">
            {/* Copy */}
            <div className="order-1">
              <div className="inline-block rounded-full bg-book-200 text-book-800 text-xs sm:text-sm px-3 py-1 mb-4">
                Pre-Loved Pages, New Adventures
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                Buy and Sell Textbooks with Ease
              </h1>
              <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8 max-w-xl">
                Buy affordable secondhand textbooks and give your old ones a new home—
                all handled securely through ReBooked Solutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button size="lg" className="bg-book-600 hover:bg-book-700" onClick={() => navigate("/books")}>
                  Browse Books
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-book-600 text-book-700 hover:bg-book-100"
                  onClick={() => navigate("/create-listing")}
                >
                  Sell Your Books
                </Button>
              </div>
            </div>

            {/* Image */}
            <div className="order-2">
              <img
                src="/lovable-uploads/bd1bff70-5398-480d-ab05-1a01e839c2d0.png"
                alt="Three students smiling with textbooks"
                className="w-full rounded-xl shadow-lg object-cover aspect-[4/3]"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile-Optimized Search Section */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-book-800">
            Find Your Textbooks
          </h2>
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <input
                type="text"
                placeholder="Search by title, author, ISBN, or subject..."
                className="w-full p-3 sm:p-4 sm:pr-16 rounded-lg sm:rounded-r-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-book-500 focus:border-transparent text-base sm:text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="bg-book-600 text-white p-3 sm:p-2 rounded-lg sm:rounded-l-none sm:absolute sm:right-2 sm:top-2 hover:bg-book-700 transition duration-200 flex items-center justify-center"
              >
                <Search className="h-5 w-5 sm:h-6 sm:w-6 sm:mr-2" />
                <span className="sm:hidden">Search</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Mobile-Optimized Categories Section */}
      <section className="py-8 sm:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-book-800">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/books?category=${encodeURIComponent(category.name)}`}
                className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center hover:shadow-lg transition-shadow duration-200"
              >
                <span className="mb-2 sm:mb-4 block flex items-center justify-center">
                  {category.icon}
                </span>
                <h3 className="font-semibold text-book-800 text-xs sm:text-base leading-tight">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* Why Choose ReBooked Section - Redesigned for better UI/UX */}
      <section className="py-16 sm:py-24 bg-white relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" aria-hidden="true">
          <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-book-400 blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-blue-400 blur-[100px]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Why <span className="text-book-600">ReBooked Solutions?</span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              We're building more than just a marketplace; we're creating a sustainable ecosystem for South African students to thrive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-3xl bg-gray-50 border border-gray-100 transition-all duration-300 hover:bg-white hover:shadow-xl hover:-translate-y-2">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Leaf className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sustainable Learning</h3>
              <p className="text-gray-600 leading-relaxed">
                Give your books a second life. We help reduce the environmental impact of education while making textbooks affordable for everyone.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-3xl bg-gray-50 border border-gray-100 transition-all duration-300 hover:bg-white hover:shadow-xl hover:-translate-y-2">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Guaranteed Security</h3>
              <p className="text-gray-600 leading-relaxed">
                Shop with confidence. Our BobPay integration ensures your funds are only released when the transaction is successfully completed.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-3xl bg-gray-50 border border-gray-100 transition-all duration-300 hover:bg-white hover:shadow-xl hover:-translate-y-2">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Truck className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Logistics</h3>
              <p className="text-gray-600 leading-relaxed">
                Nationwide door-to-door and locker shipping powered by The Courier Guy and Pudo. Reliable tracking and fast pickups for sellers across South Africa.
              </p>
            </div>
          </div>

          {/* Trust & Safety Section - Redesigned for a more professional look */}
          <div className="mt-16 bg-gradient-to-br from-book-50 to-blue-50 rounded-[2rem] p-8 sm:p-12 border border-book-100 shadow-sm relative overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
              <div className="lg:w-1/2 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-book-100 text-book-700 text-xs font-bold mb-4 uppercase tracking-wider">
                  Trust & Safety
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                  Your Security is Our Priority
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed max-w-xl">
                  We've built a multi-layered protection system to ensure every transaction on ReBooked is safe, transparent, and fair for both students and parents.
                </p>
              </div>

              <div className="lg:w-1/2 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Buyer Protection</h4>
                    <p className="text-gray-500 text-xs mt-1">Funds are held securely until you confirm receipt.</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Verified Listings</h4>
                    <p className="text-gray-500 text-xs mt-1">AI-assisted verification for book authenticity.</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Human Support</h4>
                    <p className="text-gray-500 text-xs mt-1">Dedicated support team for dispute resolution.</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Secure Payouts</h4>
                    <p className="text-gray-500 text-xs mt-1">PCI-compliant payment processing via BobPay.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Background Accent */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-book-200/20 rounded-full blur-3xl" aria-hidden="true"></div>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <FeaturedBooks />



      {/* How It Works Section */}
      <HowItWorks />

      {/* Ready to Get Started Section */}
      <ReadyToGetStarted />
    </Layout>
  );
};

export default Index;
