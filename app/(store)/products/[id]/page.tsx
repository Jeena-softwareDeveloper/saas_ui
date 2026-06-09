"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ShoppingCart,
  Star,
  ArrowRight,
  Truck,
  Plus,
  Minus,
  Heart,
  Award,
  CheckCircle2,
  User,
  ThumbsUp,
  Copy,
  Check,
  Zap,
  Gift,
  MapPin,
  ChevronDown,
  ChevronUp,
  X,
  Share2,
  AlertCircle,
  RefreshCcw,
  Package,
  ZoomIn,
  ZoomOut,
  Navigation,
  Shield,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { storeService } from "@/services/store.service";
import { useCartStore } from "@/lib/cartStore";
import { useAuthStore } from "@/lib/authStore";
import { cn } from "@/lib/utils";

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(n);

// --- HELPERS ---
const resolveImageUrl = (url: any): string => {
  if (!url) return "";
  if (typeof url === "object" && url.imageUrl) return url.imageUrl;
  if (typeof url === "object" && url.url) return url.url;
  if (typeof url !== "string") return "";
  if (url.startsWith("http")) return url;
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").split("/api")[0];
  if (baseUrl) {
    const cleanPath = url.startsWith("/") ? url : `/${url}`;
    return `${baseUrl}${cleanPath}`;
  }
  return url;
};

// Trusted Badge - exact match to mobile
const TrustedBadge = () => (
  <div className="flex flex-row items-center bg-[#f5eefc] px-2 py-0.5 rounded">
    <div className="bg-[#5c2d91] rounded-sm px-1 flex items-center justify-center mr-1">
      <span className="text-white text-[8px] font-black">M</span>
    </div>
    <span className="text-[#5c2d91] font-black text-[10px]">Trusted</span>
  </div>
);

// Mock delivery estimator (no backend dependency)
function DeliveryEstimatorWidget({ productId }: { productId: string }) {
  const [pincode, setPincode] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [eddData, setEddData] = useState<{ date: Date; city: string } | null>(null);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("user_pincode") : null;
    if (saved) {
      setPincode(saved);
      simulateEDD(saved);
    }
  }, []);

  const simulateEDD = (pc: string) => {
    if (!pc || pc.length < 6) return;
    setIsLoading(true);
    setTimeout(() => {
      const first2 = parseInt(pc.substring(0, 2), 10);
      const days = first2 >= 60 ? 4 : 6; // South India ~ 4 days, North ~ 6
      const city = first2 >= 60 ? "Chennai" : "Delhi";
      const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      setEddData({ date, city });
      if (typeof window !== "undefined") localStorage.setItem("user_pincode", pc);
      setIsLoading(false);
    }, 800);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude } = pos.coords;
        const mockPincode = latitude > 18 ? "110001" : "600001";
        setPincode(mockPincode);
        simulateEDD(mockPincode);
        setIsDetecting(false);
      },
      () => setIsDetecting(false)
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setPincode(val);
    if (val.length === 6) simulateEDD(val);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-2">
      <div className="px-3 py-2 bg-gray-50/50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Truck size={14} className="text-brand-600" />
            <span className="text-[11px] font-bold text-gray-800 uppercase tracking-tight">
              Delivery Details
            </span>
          </div>
          <button
            onClick={detectLocation}
            disabled={isDetecting}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
          >
            {isDetecting ? (
              <span className="w-3 h-3 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Navigation size={10} className="text-brand-600" />
            )}
            <span className="text-[9px] font-bold text-gray-600 uppercase">Detect</span>
          </button>
        </div>
      </div>

      <div className="p-2.5 space-y-2">
        <div className="relative">
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
            <MapPin size={14} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Enter Pincode"
            value={pincode}
            onChange={handleChange}
            className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-[12px] font-bold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-600 transition-all"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <span className="w-3.5 h-3.5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin block" />
            </div>
          )}
        </div>

        {eddData ? (
          <div className="bg-green-50/50 border border-green-100 p-2.5 rounded-xl">
            <div className="flex items-start gap-2.5">
              <div className="bg-green-100 p-1.5 rounded-full mt-0.5">
                <CheckCircle2 size={14} className="text-green-600" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-600 uppercase tracking-tight">Expected Delivery</p>
                <p className="text-[13px] font-semibold text-green-700 mt-0.5">
                  {eddData.date.toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-white border border-green-200 rounded text-[9px] font-bold text-green-600 uppercase">
                    FREE SHIPPING
                  </span>
                  <span className="text-[10px] font-medium text-gray-400 italic">
                    Shipping from {eddData.city}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : pincode.length === 6 && !isLoading ? (
          <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-2xl flex items-center gap-3">
            <AlertCircle size={16} className="text-orange-500" />
            <p className="text-[11px] font-bold text-orange-700">
              Serviceability check in progress or unavailable for this pincode.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
              <Truck size={14} className="text-gray-300" />
            </div>
            <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
              Enter your pincode to see estimated delivery dates and shipping options.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Dynamic offers are fetched from API

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [activeOffers, setActiveOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  // Image carousel
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const imageScrollRef = useRef<HTMLDivElement>(null);

  // UI states
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");

  // Modals
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [trustModalContent, setTrustModalContent] = useState<string | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImageToView, setSelectedImageToView] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState(1);

  // Reset zoom when viewer opens
  useEffect(() => {
    if (showImageViewer) setZoomScale(1);
  }, [showImageViewer]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [prodRes, relRes, couponsRes] = await Promise.all([
          storeService.getProductBySlug(id),
          storeService.getRelatedProducts(id),
          storeService.getCoupons().catch(() => ({ data: { data: [] } })),
        ]);
        const pData = prodRes.data.data;
        setProduct(pData);
        if (pData?.variants?.length > 0) setSelectedVariant(pData.variants[0]);
        setRelated(relRes.data.data || []);
        setActiveOffers(couponsRes.data.data || []);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  // Image scroll handler
  const handleImageScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    if (index !== activeImageIndex) setActiveImageIndex(index);
  };

  const scrollToImage = (index: number) => {
    if (imageScrollRef.current) {
      imageScrollRef.current.scrollTo({
        left: index * imageScrollRef.current.clientWidth,
        behavior: "smooth",
      });
    }
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((q) => Math.max(1, Math.min(q + delta, product?.stockQuantity || 1)));
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAddingToCart(true);
    try {
      const cartProduct = {
        ...product,
        id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
        name: selectedVariant ? `${product.name} - ${selectedVariant.variantName}` : product.name,
        price: selectedVariant?.price || product.price,
        stock: selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity,
      };
      addItem(cartProduct, quantity);
      setTimeout(() => {
        setIsAddingToCart(false);
        router.push("/checkout");
      }, 500);
    } catch {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    setIsBuyingNow(true);
    handleAddToCart();
  };

  const copyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-3 pt-20">
          <div className="w-10 h-10 border-4 border-brand-600/20 border-t-brand-600 rounded-full animate-spin" />
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Loading Product...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 py-32">
        <h1 className="text-2xl font-bold text-slate-900">Product Not Found</h1>
        <Link href="/products" className="text-brand-600 hover:underline font-bold">
          ← Return to products
        </Link>
      </div>
    );
  }

  // Resolve images to string array
  const images: string[] = (
    product.images?.length > 0 ? product.images : []
  )
    .map(resolveImageUrl)
    .filter(Boolean);

  if (images.length === 0) images.push(""); // placeholder

  // Calculations
  const price = selectedVariant?.price || product.price || 0;
  const mrp = product.comparePrice || price * 1.25;
  const savings = mrp > price ? mrp - price : 0;
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const stock = selectedVariant ? selectedVariant.stockQuantity : (product.stockQuantity || 0);

  // Reviews
  const reviews = product.reviews || [];
  const avgRating = typeof product.avgRating === "number" ? product.avgRating : 0;
  const totalReviews = reviews.length;

  const ratingDist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r: any) => {
    const star = Math.round(r.rating);
    if (star >= 1 && star <= 5) ratingDist[star]++;
  });

  const variants = product.variants || [];

  return (
    <div className="min-h-screen bg-white md:bg-gray-50 pb-[72px] md:pb-0">

      {/* ===== MAIN CONTENT AREA ===== */}
      <div className="md:max-w-7xl md:mx-auto md:px-6 md:pt-6">

        {/* Breadcrumb - desktop only */}
        <nav className="hidden md:flex items-center gap-2 text-xs text-slate-500 mb-6 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-brand-600 transition-colors">Products</Link>
          <span>/</span>
          {product.category?.name && (
            <>
              <Link href={`/products?category=${product.category.slug || product.category.name}`} className="hover:text-brand-600 transition-colors">
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-slate-900 font-semibold truncate max-w-48">{product.name}</span>
        </nav>

        {/* ===== DESKTOP 2-COL GRID ===== */}
        <div className="md:grid md:grid-cols-[400px_1fr] md:gap-10 md:items-start">

          {/* ===== LEFT: IMAGE GALLERY ===== */}
          <div className="md:sticky md:top-[70px]">
            <div className="bg-white relative md:rounded-2xl md:overflow-hidden md:border md:border-gray-100 md:shadow-sm">
              <div className="relative w-full">
                <div
                  ref={imageScrollRef}
                  onScroll={handleImageScroll}
                  className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
                  style={{ scrollBehavior: "smooth" }}
                >
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="flex-none w-full snap-center flex items-center justify-center bg-white cursor-zoom-in relative group overflow-hidden"
                      onClick={() => {
                        if (img) {
                          setSelectedImageToView(img);
                          setShowImageViewer(true);
                        }
                      }}
                    >
                      {img ? (
                        <img
                          src={img}
                          alt={product.name}
                          className="w-full h-[450px] md:h-full md:aspect-square object-contain p-4 md:p-6 transition-transform duration-500 md:group-hover:scale-150 origin-center"
                        />
                      ) : (
                        <div className="w-full h-[450px] md:aspect-square flex items-center justify-center text-8xl bg-gray-50">📦</div>
                      )}
                      {/* Zoom hint desktop */}
                      <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/5 transition-colors pointer-events-none hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg">
                          <ZoomIn size={20} className="text-brand-600" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Floating product code */}
                <div className="absolute bottom-12 left-4 bg-black/20 px-2 py-0.5 rounded">
                  <span className="text-white/60 text-[10px] font-medium uppercase tracking-tighter">
                    s-{product.id?.substring(0, 10)}
                  </span>
                </div>
              </div>

              {/* Pagination dots */}
              <div className="flex justify-center gap-1 py-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToImage(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeImageIndex === i ? "w-6 bg-brand-600" : "w-4 bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Desktop thumbnail strip */}
            {images.length > 1 && (
              <div className="hidden md:flex gap-2 mt-3 overflow-x-auto no-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImageIndex === i ? "border-brand-600" : "border-gray-100"
                    }`}
                  >
                    {img ? (
                      <img src={img} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full bg-gray-50 flex items-center justify-center text-xl">📦</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ===== RIGHT COLUMN: PRODUCT INFO ===== */}
          <div className="flex flex-col gap-0 md:gap-6">
            {/* Basic Info */}
            <div className="md:bg-white md:rounded-2xl md:border md:border-gray-100 md:shadow-sm md:p-6">

            {/* Available Styles removed as per user request */}

            {/* Price & Title */}
            <div className="bg-white px-4 pt-2 pb-3 md:px-0 md:pt-0">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 pr-4">
                  <h1 className="text-[14px] font-bold text-gray-800 leading-tight tracking-tight">
                    {product.name}
                  </h1>

                  {/* Price Section */}
                  <div className="flex flex-col mt-2.5">
                    <div className="flex items-baseline gap-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                          Special Price
                        </span>
                        <div className="flex items-center">
                          <span className="text-[28px] font-bold text-gray-900 tracking-tight">
                            ₹{Math.ceil(price)}
                          </span>
                          <CheckCircle2 size={16} className="text-[#23BB75] ml-1.5 fill-[#23BB75] text-white" />
                        </div>
                      </div>
                      {mrp > price && (
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                            MRP
                          </span>
                          <span className="text-[18px] text-gray-400 line-through font-normal">
                            ₹{Math.ceil(mrp)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Share button */}
                <div className="flex flex-col items-center pt-1">
                  <button
                    onClick={() =>
                      typeof navigator.share !== "undefined"
                        ? navigator.share({ title: product.name, url: window.location.href }).catch(() => copyLink())
                        : copyLink()
                    }
                    className="p-2.5 rounded-full bg-gray-50 border border-gray-100"
                  >
                    <Share2 size={20} className="text-gray-600" />
                  </button>
                  <span className="text-[10px] mt-1 font-bold text-gray-500 uppercase tracking-tighter">
                    {isCopied ? "Copied!" : "Share"}
                  </span>
                </div>
              </div>

              {/* Savings micro-ribbon */}
              {discount > 0 && (
                <div className="mb-3 -mx-4 md:-mx-0 bg-[#038d63] py-0.5 flex items-center justify-center border-y border-[#02704f]">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-black text-[10px] uppercase tracking-wider bg-white/10 px-1.5 rounded">
                      {discount}% OFF
                    </span>
                    <span className="text-white font-bold text-[10px] uppercase tracking-wide">
                      SAVE ₹{Math.ceil(savings)} INSTANTLY
                    </span>
                  </div>
                </div>
              )}

              {/* Trust badges row */}
              <div className="flex items-center gap-3 mb-3 overflow-x-auto no-scrollbar pb-1">
                <div className="bg-green-50 px-3 py-1 rounded-full flex items-center border border-green-100 gap-1.5 shrink-0">
                  <CheckCircle2 size={14} className="text-green-600" />
                  <span className="text-[10px] md:text-[11px] font-bold text-green-700 whitespace-nowrap">In Stock</span>
                </div>
                <div className="bg-indigo-50 px-3 py-1 rounded-full flex items-center border border-indigo-100 gap-1.5 shrink-0">
                  <Shield size={14} className="text-indigo-600" />
                  <span className="text-[10px] md:text-[11px] font-bold text-indigo-700">Safe Payments</span>
                </div>
                <div className="bg-teal-50 px-3 py-1 rounded-full flex items-center border border-teal-100 gap-1.5 shrink-0">
                  <RefreshCcw size={14} className="text-teal-600" />
                  <span className="text-[10px] md:text-[11px] font-bold text-teal-700 whitespace-nowrap">Easy 30-Day Return</span>
                </div>
              </div>

              {/* Available Offers */}
              {activeOffers.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center mb-3 gap-2">
                    <Zap size={18} className="text-brand-600" />
                    <span className="text-[13px] font-bold text-gray-800">Available Offers</span>
                  </div>
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                    {activeOffers.map((offer, oIdx) => {
                      const isPercentage = offer.discountType === 'PERCENTAGE';
                      const title = isPercentage ? `Get ${offer.discountValue}% Off on Checkout` : `Flat ₹${offer.discountValue} Off`;
                      const subtitle = `Use coupon ${offer.code} at checkout.` + (offer.minOrderAmount ? ` Min purchase: ₹${offer.minOrderAmount}.` : '');
                      
                      return (
                        <div
                          key={`offer-${offer.id || oIdx}`}
                          className={`flex-shrink-0 w-[240px] p-3 rounded-2xl border bg-pink-50 border-pink-100`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <Gift size={24} className="text-pink-700" />
                            <div className="bg-white/60 px-2 py-0.5 rounded border border-pink-200">
                              <span className="text-[10px] font-bold text-pink-800 uppercase">
                                {offer.code}
                              </span>
                            </div>
                          </div>
                          <p className="text-[13px] font-black text-gray-800 tracking-tight">{title}</p>
                          <p className="text-[11px] text-gray-600 mt-0.5 leading-4 font-medium line-clamp-2">
                            {subtitle}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stock and Rating/Trust Badge Row */}
              <div className="flex flex-wrap items-center gap-3 mt-2 mb-3">
                {/* Stock Alert */}
                {stock <= 0 ? (
                  <div className="bg-red-50 px-3 py-1 rounded-lg flex items-center border border-red-100 gap-1.5 shrink-0">
                    <AlertCircle size={14} className="text-red-500" />
                    <span className="text-[10px] md:text-[11px] font-bold text-red-600 uppercase">Out of Stock</span>
                  </div>
                ) : stock <= 10 ? (
                  <div className="bg-amber-50 px-3 py-1 rounded-lg flex items-center border border-amber-100 gap-1.5 shrink-0">
                    <AlertCircle size={14} className="text-amber-500" />
                    <span className="text-[10px] md:text-[11px] font-bold text-amber-600 uppercase">
                      Only {stock} Left
                    </span>
                  </div>
                ) : (
                  <div className="bg-emerald-50 px-3 py-1 rounded-lg flex items-center border border-emerald-100 gap-1.5 shrink-0">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-[10px] md:text-[11px] font-bold text-emerald-600 uppercase">In Stock (Ready to Ship)</span>
                  </div>
                )}

                {/* Rating + Trusted badge */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="bg-teal-600 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <span className="text-white text-[10px] font-bold">
                      {avgRating > 0 ? avgRating.toFixed(1) : "New"}
                    </span>
                    <Star size={8} className="fill-white text-white" />
                  </div>
                  <span className="text-gray-500 text-[10px]">({totalReviews} ratings)</span>
                  <div className="w-1 h-1 rounded-full bg-gray-300 hidden sm:block" />
                  <div className="scale-90 origin-left">
                    <TrustedBadge />
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop action buttons */}
            <div className="hidden md:flex gap-3 mt-4 mb-2 px-4 md:px-0">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || stock <= 0}
                className={`flex-1 h-12 border-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  stock <= 0
                    ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                    : "border-brand-600 hover:bg-red-50"
                }`}
              >
                <ShoppingCart size={16} className={stock <= 0 ? "text-gray-400" : "text-brand-600"} />
                <span className={`font-bold text-[11px] uppercase tracking-wider ${stock <= 0 ? "text-gray-400" : "text-brand-600"}`}>
                  {stock <= 0 ? "Sold Out" : isAddingToCart ? "Adding..." : `Add ${quantity} to Cart`}
                </span>
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isBuyingNow || stock <= 0}
                className="flex-[1.2] h-12 bg-brand-600 rounded-lg flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:bg-gray-400 disabled:shadow-none"
              >
                {isBuyingNow ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap size={18} className="text-white" />
                    <span className="text-white font-bold text-[11px] uppercase tracking-widest">
                      {stock <= 0 ? "Out of Stock" : `Buy ${quantity} Now`}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Variants */}
            {variants.length > 0 && (
              <>
                <div className="h-[6px] bg-gray-100/80 md:hidden" />
                <div className="bg-white px-4 pt-3 pb-1 md:px-0">
                  <p className="text-[14px] font-bold text-gray-800 mb-3">Select Variant</p>
                  <div className="flex flex-wrap gap-3">
                    {variants.map((v: any) => {
                      const varPrice = v.price || price;
                      return (
                        <button
                          key={v.id}
                          onClick={() => { setSelectedVariant(v); setQuantity(1); }}
                          disabled={v.stockQuantity <= 0}
                          className={cn(
                            "min-w-[62px] h-11 px-3 border-2 rounded-lg flex flex-col items-center justify-center transition-all shrink-0",
                            selectedVariant?.id === v.id
                              ? "border-brand-600 bg-brand-50"
                              : v.stockQuantity > 0
                              ? "border-gray-100 bg-white"
                              : "border-gray-50 opacity-30 bg-gray-50"
                          )}
                        >
                          <span className={`font-black text-[12px] uppercase tracking-tighter ${selectedVariant?.id === v.id ? "text-brand-600" : "text-gray-800"}`}>
                            {v.variantName}
                          </span>
                          <span className={`text-[8px] font-medium uppercase mt-0.5 ${selectedVariant?.id === v.id ? "text-brand-600" : "text-gray-400"}`}>
                            ₹{varPrice}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Quantity selector */}
            {stock > 0 && (
              <div className="bg-white px-4 pt-3 pb-2 md:px-0">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Quantity</p>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden w-fit shadow-sm bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}



            {/* Trust Micro-Banners */}
            <div className="bg-white px-4 pb-4 pt-4 md:px-0 border-t border-gray-200">
              <div className="flex items-center justify-between bg-gray-50/50 p-2 rounded-xl border border-gray-100">
                <button onClick={() => setTrustModalContent("quality")} className="flex-1 flex flex-col items-center">
                  <div className="bg-green-100 p-1.5 rounded-full mb-1">
                    <CheckCircle2 size={16} className="text-[#059669]" />
                  </div>
                  <span className="text-[9px] font-black text-gray-600 uppercase">Premium Quality</span>
                </button>
                <div className="w-px h-8 bg-gray-200" />
                <button onClick={() => setTrustModalContent("delivery")} className="flex-1 flex flex-col items-center">
                  <div className="bg-blue-100 p-1.5 rounded-full mb-1">
                    <Truck size={16} className="text-[#2563EB]" />
                  </div>
                  <span className="text-[9px] font-black text-gray-600 uppercase">Fast Delivery</span>
                </button>
                <div className="w-px h-8 bg-gray-200" />
                <button onClick={() => setTrustModalContent("price")} className="flex-1 flex flex-col items-center">
                  <div className="bg-orange-100 p-1.5 rounded-full mb-1">
                    <Award size={16} className="text-[#D97706]" />
                  </div>
                  <span className="text-[9px] font-black text-gray-600 uppercase">Lowest Price</span>
                </button>
              </div>
            </div>

            </div>{/* end basic info */}

            {/* Product Highlights */}
            <div className="h-[6px] bg-gray-100/80 md:hidden" />
            <div className="bg-white p-4 md:rounded-2xl md:border md:border-gray-100 md:shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[14px] font-bold text-gray-800 uppercase">Product Highlights</span>
            <button onClick={copyLink} className="flex items-center gap-1">
              {isCopied ? <Check size={14} className="text-brand-600" /> : <Copy size={14} className="text-brand-600" />}
              <span className="text-brand-600 font-bold text-[11px] uppercase">{isCopied ? "Copied!" : "Copy"}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-5 mb-5">
            {[
              { label: "Category", val: product.category?.name },
              { label: "Weight / Pack", val: product.weight ? `${product.weight}g` : (selectedVariant?.variantName || "Standard Pack") },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-[11px] font-medium text-gray-400 uppercase mb-1">{item.label}</p>
                <p className="text-[14px] font-medium text-gray-800 capitalize leading-5">{item.val || "N/A"}</p>
              </div>
            ))}
          </div>

          {/* Additional Details List */}
          <div className="pb-2">
            {[
              { label: "Net Quantity (N)", val: "1 Unit" },
              { label: "Country of Origin", val: "India" },
            ].map((d, idx) => (
              <div key={idx} className="flex mb-3 items-center">
                <span className="w-[140px] text-[13px] text-gray-500 font-medium capitalize">{d.label}</span>
                <span className="flex-1 text-[13px] text-gray-800 font-medium">{d.val}</span>
              </div>
            ))}
            
            {product.description && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-[13px] font-bold text-gray-800 uppercase mb-3 tracking-wider">Full Description</p>
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 relative">
                  <div className={cn("overflow-hidden transition-all duration-300 relative", showDetails ? "" : "max-h-[140px]")}>
                    <p className="text-gray-600 leading-6 text-[13px] font-medium whitespace-pre-line">
                      {product.description}
                    </p>
                    {!showDetails && (
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
                    )}
                  </div>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="w-full mt-2 text-center text-brand-600 text-[11px] font-bold uppercase tracking-widest pt-2 border-t border-gray-200/50 hover:text-brand-700 flex items-center justify-center gap-1"
                  >
                    {showDetails ? (
                      <>Show Less <ChevronUp size={14} /></>
                    ) : (
                      <>Read Full Description <ChevronDown size={14} /></>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delivery Estimator */}
        <div className="h-[6px] bg-gray-100/80 md:hidden" />
        <div className="px-4 md:px-0 py-4 md:py-0 bg-white md:bg-transparent">
          <DeliveryEstimatorWidget productId={product.id} />
        </div>

        {/* Customer Ratings & Reviews */}
        <div className="h-[6px] bg-gray-100/80 md:hidden" />
        <div className="bg-white p-4 md:rounded-2xl md:border md:border-gray-100 md:shadow-sm">
          <p className="text-[14px] font-bold text-gray-800 uppercase mb-4">Customer Ratings & Reviews</p>

          {/* Rating Summary Block */}
          <div className="flex mb-4">
            <div className="flex flex-col items-center justify-center mr-6 border border-gray-100 rounded-xl p-3 w-[100px]">
              <div className="flex items-center justify-center mb-1">
                <span className="text-[#038d63] text-[28px] font-bold mr-1">{avgRating > 0 ? avgRating.toFixed(1) : "0"}</span>
                <Star size={24} className="text-[#038d63] fill-[#038d63]" />
              </div>
              <p className="text-[10px] text-gray-400 font-medium text-center leading-3">
                {totalReviews || "0"} ratings<br />
                {totalReviews ? Math.round(totalReviews * 0.6) : "0"} reviews
              </p>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-1.5">
              {[
                { label: "Very Good", star: 5, color: "#22c55e" },
                { label: "Good", star: 4, color: "#22c55e" },
                { label: "Ok-Ok", star: 3, color: "#eab308" },
                { label: "Bad", star: 2, color: "#f97316" },
                { label: "Very Bad", star: 1, color: "#ef4444" },
              ].map((item) => {
                const count = ratingDist[item.star] || 0;
                const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={item.star} className="flex items-center gap-2">
                    <span className="w-[56px] text-[11px] text-gray-500 font-medium">{item.label}</span>
                    <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                    </div>
                    <span className="w-7 text-[11px] text-gray-400 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews list */}
          <div>
            {reviews.length > 0 ? (
              reviews.slice(0, 2).map((review: any, idx: number) => (
                <div key={idx} className="mb-5">
                  <div className="flex items-center mb-1 gap-2">
                    <div className="bg-[#038d63] px-1.5 py-0.5 rounded flex items-center">
                      <span className="text-white text-[11px] font-bold">{review.rating} ★</span>
                    </div>
                    <span className="text-[13px] font-black text-gray-900">
                      {review.rating >= 4 ? "Very Good" : review.rating === 3 ? "Good" : "Average"}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      • {new Date(review.createdAt || Date.now()).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center mb-1 gap-2">
                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                      <User size={12} className="text-gray-400" />
                    </div>
                    <span className="text-[12px] text-gray-800 font-bold">{review.user?.name || "Anonymous"}</span>
                    <div className="ml-1 bg-green-50 px-1 py-0.5 rounded border border-green-100">
                      <span className="text-[8px] text-green-700 font-medium uppercase">Verified Buyer</span>
                    </div>
                  </div>
                  {(review.comment || review.reviewText) && (
                    <p className="text-[13px] text-gray-800 leading-5 mb-2">
                      {review.comment || review.reviewText}
                    </p>
                  )}
                  <button className="flex items-center gap-1 mt-1">
                    <ThumbsUp size={16} className="text-gray-500" />
                    <span className="text-[12px] text-gray-600 font-medium">Helpful</span>
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center italic py-4 text-[12px]">No reviews yet.</p>
            )}
          </div>

          {/* View All Reviews */}
          <button
            onClick={() => setShowAllReviews(true)}
            className="flex items-center gap-1 mt-2 bg-red-50/50 px-4 py-2 rounded-full"
          >
            <span className="text-brand-600 font-black text-[11px] uppercase tracking-wide">
              View All {totalReviews} Reviews
            </span>
            <ArrowRight size={12} className="text-brand-600" />
          </button>
        </div>

        {/* Trusted supplier footer strip */}
        <div className="bg-white py-3 px-4 flex items-center justify-center gap-3 md:rounded-2xl md:border md:border-gray-100 md:shadow-sm">
          <TrustedBadge />
          <span className="text-[11px] text-gray-400 font-medium">Best quality products from trusted suppliers.</span>
        </div>

          </div>{/* end right col */}
        </div>{/* end md:grid */}
      </div>{/* end desktop wrapper */}

      {/* ===== BELOW FOLD: Full-width sections ===== */}
      <div className="md:max-w-7xl md:mx-auto md:px-6">

        {/* Related Products */}
        {related.length > 0 && (
          <>
            <div className="h-2 bg-gray-100 md:hidden" />
            <div className="bg-white p-4 pb-6 md:rounded-2xl md:border md:border-gray-100 md:shadow-sm md:mt-4 md:mb-8">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[16px] font-black text-gray-800 uppercase tracking-tighter">
                  People also looked for
                </p>
                <Link
                  href={`/products?category=${product.category?.slug || ""}`}
                  className="text-brand-600 text-[11px] font-medium uppercase tracking-widest flex items-center"
                >
                  View All <ArrowRight size={14} className="ml-1" />
                </Link>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {related.map((p, i) => {
                  const rPrice = Number(p.price);
                  const rCompare = Number(p.comparePrice);
                  const rDisc = rCompare > rPrice ? Math.round(((rCompare - rPrice) / rCompare) * 100) : 0;
                  const primaryImage =
                    p.images?.find((img: any) => img.isPrimary)?.imageUrl ||
                    p.images?.[0]?.imageUrl ||
                    resolveImageUrl(p.images?.[0]) ||
                    "";
                  return (
                    <Link
                      key={p.id || i}
                      href={`/products/${p.id}`}
                      className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="h-44 bg-gray-50 overflow-hidden">
                        {primaryImage ? (
                          <img src={primaryImage} className="w-full h-full object-cover" alt={p.name} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-[12px] font-medium text-gray-700 truncate mb-1">{p.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-bold text-gray-900">₹{rPrice}</span>
                          {rCompare > rPrice && (
                            <span className="text-[10px] text-gray-400 line-through">₹{rCompare}</span>
                          )}
                          {rDisc > 0 && (
                            <span className="text-[10px] text-green-700 font-bold">{rDisc}% off</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ===== STICKY BOTTOM BAR (mobile only) ===== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-2xl">
        <div className="p-2 pb-[calc(8px+env(safe-area-inset-bottom))]">
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || stock <= 0}
              className={cn(
                "flex-1 h-11 border-2 rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]",
                stock <= 0
                  ? "border-gray-200 bg-gray-50 opacity-60"
                  : "border-brand-600"
              )}
            >
              <ShoppingCart size={16} className={stock <= 0 ? "text-gray-400" : "text-brand-600"} />
              <span className={`font-black text-[11px] uppercase tracking-wider ${stock <= 0 ? "text-gray-400" : "text-brand-600"}`}>
                {stock <= 0 ? "SOLD" : isAddingToCart ? "..." : `Add ${quantity} to Cart`}
              </span>
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isBuyingNow || stock <= 0}
              className="flex-[1.2] h-11 bg-brand-600 rounded-lg flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:bg-gray-400 disabled:shadow-none"
            >
              {isBuyingNow ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Zap size={18} className="text-white" />
                  <span className="text-white font-black text-[11px] uppercase tracking-widest">
                    {stock <= 0 ? "Out of Stock" : `Buy ${quantity} Now`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ===== VERIFY MODAL ===== */}
      {showVerifyModal && (
        <div
          className="fixed inset-0 z-[1000] bg-black/40 flex items-end md:items-center justify-center md:px-6 animate-fade-in"
          onClick={() => setShowVerifyModal(false)}
        >
          <div
            className="bg-white w-full md:max-w-sm rounded-t-3xl md:rounded-2xl p-6 pb-10 md:pb-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center mb-6">
              <div className="bg-green-100 p-3 rounded-full mb-3">
                <CheckCircle2 size={36} className="text-[#059669]" />
              </div>
              <h3 className="text-[18px] font-black text-gray-900 uppercase tracking-tight">Verified Supplier</h3>
              <p className="text-[12px] text-gray-500 font-medium mt-1">100% Authentic & Secure</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-5 space-y-4 mb-2 border border-gray-100">
              {[
                { title: "Identity & Location", desc: "Physical address, PAN, and business licenses are verified by our team." },
                { title: "Quality Assurance", desc: "Strict FSSAI and USDA Organic guidelines are inspected for every batch." },
                { title: "Secure Payments", desc: "Bank details and PAN are authenticated by our team." },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 bg-green-100 p-1 rounded-full shrink-0">
                    <Check size={12} className="text-green-700 font-bold" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-gray-900 uppercase tracking-tight">{item.title}</p>
                    <p className="text-[11.5px] text-gray-500 font-medium leading-snug mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowVerifyModal(false)}
              className="w-full mt-4 py-3 bg-brand-600 text-white rounded-2xl font-medium uppercase tracking-widest text-[12px]"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* ===== TRUST MODAL (Quality, Delivery, Price) ===== */}
      {trustModalContent && (
        <div
          className="fixed inset-0 z-[1000] bg-black/40 flex items-end md:items-center justify-center md:px-6 animate-fade-in"
          onClick={() => setTrustModalContent(null)}
        >
          <div
            className="bg-white w-full md:max-w-sm rounded-t-3xl md:rounded-2xl p-6 pb-10 md:pb-6 shadow-2xl mt-auto md:mt-0 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 md:hidden" />

            {trustModalContent === "quality" && (
              <>
                <div className="flex flex-col items-center mb-6">
                  <div className="bg-green-100 p-4 rounded-full mb-4">
                    <CheckCircle2 size={40} className="text-[#059669]" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Premium Quality</h3>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-4">
                  <p className="text-gray-700 text-[14px] font-medium leading-relaxed">
                    We are deeply committed to providing the highest quality organic products. Every batch is rigorously tested for chemicals, artificial preservatives, and heavy metals.
                    <br /><br />
                    We guarantee USDA and India Organic standards, ensuring you receive healthy and completely natural nutrition.
                  </p>
                </div>
              </>
            )}

            {trustModalContent === "delivery" && (
              <>
                <div className="flex flex-col items-center mb-6">
                  <div className="bg-blue-100 p-4 rounded-full mb-4">
                    <Truck size={40} className="text-[#2563EB]" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Fast Delivery</h3>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-4">
                  <p className="text-gray-700 text-[14px] font-medium leading-relaxed">
                    Most orders are processed and dispatched within 24 hours. We partner with India's leading express logistics providers.
                    <br /><br />
                    Free shipping is automatically applied to orders above ₹499.
                  </p>
                </div>
              </>
            )}

            {trustModalContent === "price" && (
              <>
                <div className="flex flex-col items-center mb-6">
                  <div className="bg-orange-100 p-4 rounded-full mb-4">
                    <Award size={40} className="text-[#D97706]" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Lowest Price</h3>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-4">
                  <p className="text-gray-700 text-[14px] font-medium leading-relaxed">
                    We source directly from farmer co-operatives and agricultural clusters, completely eliminating middlemen markups.
                    <br /><br />
                    This direct supply model allows us to guarantee the best fair prices for consumers while ensuring farmers are paid sustainably.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ===== ALL REVIEWS BOTTOM SHEET ===== */}
      {showAllReviews && (
        <div className="fixed inset-0 z-[1000] flex items-end animate-fade-in">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAllReviews(false)} />
          <div className="relative bg-white w-full rounded-t-3xl max-h-[88vh] flex flex-col overflow-hidden z-10">
            <button
              onClick={() => setShowAllReviews(false)}
              className="flex justify-between items-center px-5 py-4 border-b border-gray-100 w-full"
            >
              <span className="text-[15px] font-black text-gray-800 uppercase tracking-tight">
                View All {totalReviews} Reviews
              </span>
              <ChevronDown size={22} className="text-gray-500" />
            </button>
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {reviews.length > 0 ? (
                reviews.map((review: any, idx: number) => (
                  <div key={idx} className="border-b border-gray-50 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="bg-[#038d63] px-1.5 py-0.5 rounded">
                        <span className="text-white text-[11px] font-bold">{review.rating} ★</span>
                      </div>
                      <span className="text-[13px] font-black text-gray-900">
                        {review.rating >= 4 ? "Very Good" : review.rating === 3 ? "Good" : "Average"}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        • {new Date(review.createdAt || Date.now()).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                        <User size={12} className="text-gray-400" />
                      </div>
                      <span className="text-[12px] font-bold text-gray-800">{review.user?.name || "Anonymous"}</span>
                      <div className="bg-green-50 px-1 py-0.5 rounded border border-green-100">
                        <span className="text-[8px] text-green-700 font-medium uppercase">Verified Buyer</span>
                      </div>
                    </div>
                    {(review.comment || review.reviewText) && (
                      <p className="text-[13px] text-gray-700 leading-5 mb-2">
                        {review.comment || review.reviewText}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center italic py-10 text-[12px]">No reviews yet.</p>
              )}
              <div className="h-10" />
            </div>
          </div>
        </div>
      )}

      {/* ===== FULL SCREEN IMAGE VIEWER WITH ZOOM ===== */}
      {showImageViewer && selectedImageToView && (
        <div
          className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-3xl flex items-center justify-center overflow-hidden animate-fade-in"
        >
          {/* Close button */}
          <button
            onClick={() => setShowImageViewer(false)}
            className="absolute top-10 right-6 z-[2005] bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full p-3 transition-all border border-white/10"
          >
            <X size={28} className="text-white" />
          </button>

          {/* Zoom controls */}
          <div className="absolute top-10 left-6 z-[2005] flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); setZoomScale((prev) => Math.max(1, prev - 0.5)); }}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full p-3 transition-all border border-white/10"
            >
              <ZoomOut size={24} className="text-white" />
            </button>
            <div className="bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
              <span className="text-white font-bold text-[13px]">{Math.round(zoomScale * 100)}%</span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setZoomScale((prev) => Math.min(4, prev + 0.5)); }}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full p-3 transition-all border border-white/10"
            >
              <ZoomIn size={24} className="text-white" />
            </button>
          </div>

          {/* Image */}
          <div
            className="w-full h-full flex items-center justify-center overflow-hidden"
            onClick={() => setShowImageViewer(false)}
          >
            <img
              src={selectedImageToView}
              className={`max-w-[95vw] max-h-[85vh] object-contain transition-transform duration-300 ${
                zoomScale > 1 ? "cursor-move" : "cursor-zoom-in"
              }`}
              style={{ transform: `scale(${zoomScale})` }}
              alt="Zoomed Product"
              draggable={false}
              onClick={(e) => {
                e.stopPropagation();
                setZoomScale((prev) => (prev > 1 ? 1 : 2.5));
              }}
            />
          </div>

          {/* Instructions */}
          <div className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none">
            <div className="bg-white/5 backdrop-blur-sm px-6 py-2.5 rounded-full border border-white/10">
              <p className="text-white/40 text-[11px] font-medium uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" />
                Double Tap to Zoom · Press X to Close
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
    </div>
  );
}
