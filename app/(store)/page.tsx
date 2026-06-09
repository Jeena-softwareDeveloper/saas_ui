"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Star,
  Shield,
  Truck,
  RefreshCw,
  Headphones,
  Zap,
  SlidersHorizontal,
  ChevronDown,
  Loader2,
  ShoppingCart,
  Store,
  ShieldCheck,
  ChevronRight,
  FileText,
} from "lucide-react";
import { useCartStore } from "@/lib/cartStore";
import { storeService } from "@/services/store.service";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import PromoBanners from "@/components/store/PromoBanners";
import StoreFooter from "@/components/store/StoreFooter";

const genders = ["All", "Men", "Women", "Unisex"];
const sorts = ["Newest", "Price: Low to High", "Price: High to Low", "Top Rated"];

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n);

export default function HomePage() {
  const router = useRouter();
  const { addItem } = useCartStore();
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [topSales, setTopSales] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  const [filterState, setFilterState] = useState({
    sort: "newest",
    category: "",
    gender: "",
    page: 1,
  });

  const [isFetching, setIsFetching] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isHomeLoading, setIsHomeLoading] = useState(true);

  // Initial fetch for homepage static components (Categories and Banners)
  useEffect(() => {
    async function fetchHomeData() {
      try {
        const res = await api.get("/store/homepage");
        if (res.data && res.data.success) {
          setCategories(res.data.data.categories || []);
          setBanners(res.data.data.banners || []);
          setTopSales(res.data.data.featured || []);
          setRecommended(res.data.data.new_arrivals || []);
          setReviews(res.data.data.reviews || []);
          setBlogs(res.data.data.blogs || []);
          setCertifications(res.data.data.certifications || []);
        }
      } catch (err) {
      } finally {
        setIsHomeLoading(false);
      }
    }
    fetchHomeData();
  }, []);

  // Fetch products reactively based on filters
  useEffect(() => {
    async function fetchFilteredProducts() {
      setLoadError(false);
      setIsFetching(true);
      if (filterState.page === 1) {
        setLoading(true);
      }
      try {
        const queryParams: any = {
          page: filterState.page,
          limit: 8,
        };

        if (filterState.category) {
          queryParams.category = filterState.category;
        }

        // Apply sort selection
        if (filterState.sort === "low-to-high") {
          queryParams.sort = "price";
          queryParams.order = "asc";
        } else if (filterState.sort === "high-to-low") {
          queryParams.sort = "price";
          queryParams.order = "desc";
        } else if (filterState.sort === "top-rated") {
          queryParams.sort = "rating";
          queryParams.order = "desc";
        } else {
          queryParams.sort = "createdAt";
          queryParams.order = "desc";
        }

        const res = await storeService.getProducts(queryParams);
        const fetchedProducts = res.data?.data?.products || [];
        const total = res.data?.data?.pagination?.total || 0;

        setTotalProducts(total);

        // Filter by gender client side if active
        let finalProducts = fetchedProducts;
        if (filterState.gender && filterState.gender !== "all") {
          finalProducts = fetchedProducts.filter((p: any) => {
            const desc = (p.description || "").toLowerCase();
            const name = (p.name || "").toLowerCase();
            const tagStr = (p.tags || []).join(" ").toLowerCase();
            const matchQuery = `${name} ${desc} ${tagStr}`;
            return matchQuery.includes(filterState.gender);
          });
        }

        if (filterState.page > 1) {
          setProducts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const uniqueNew = finalProducts.filter((p: any) => !existingIds.has(p.id));
            return [...prev, ...uniqueNew];
          });
        } else {
          setProducts(finalProducts);
        }
      } catch (err) {
        setLoadError(true);
        throw err;
      } finally {
        setIsFetching(false);
        setLoading(false);
      }
    }
    fetchFilteredProducts();
  }, [filterState]);

  useEffect(() => {
    const handleScroll = () => {
      if (products.length >= totalProducts && totalProducts > 0) return;

      if (window.innerHeight + document.documentElement.scrollTop + 150 >= document.documentElement.offsetHeight) {
        if (!isFetching && !loading && !loadError && products.length < totalProducts) {
          setFilterState((prev) => ({ ...prev, page: prev.page + 1 }));
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isFetching, loading, loadError, products.length, totalProducts]);

  const handleGenderCycle = () => {
    const cycleGenders = ["all", "men", "women", "unisex"];
    const currentIdx = cycleGenders.indexOf(filterState.gender || "all");
    const nextIdx = (currentIdx + 1) % cycleGenders.length;
    setFilterState((prev) => ({
      ...prev,
      gender: cycleGenders[nextIdx] === "all" ? "" : cycleGenders[nextIdx],
      page: 1,
    }));
  };

  const handleSortCycle = () => {
    const cycleSorts = ["newest", "low-to-high", "high-to-low", "top-rated"];
    const currentIdx = cycleSorts.indexOf(filterState.sort);
    const nextIdx = (currentIdx + 1) % cycleSorts.length;
    setFilterState((prev) => ({
      ...prev,
      sort: cycleSorts[nextIdx],
      page: 1,
    }));
  };

  const handleCategoryCycle = () => {
    if (categories.length === 0) return;
    const cycleCategories = ["", ...categories.map((c) => c.slug)];
    const currentIdx = cycleCategories.indexOf(filterState.category);
    const nextIdx = (currentIdx + 1) % cycleCategories.length;
    setFilterState((prev) => ({
      ...prev,
      category: cycleCategories[nextIdx],
      page: 1,
    }));
  };

  const renderHorizontalProductCard = (product: any) => {
    const primaryImage = product.images?.find((img: any) => img.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl;
    const price = Number(product.price);
    const comparePrice = Number(product.comparePrice || product.price);
    const discount = comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
    const name = product.name;
    const id = product.id;
    const weight = product.unit || "1kg";

    return (
      <div key={id} className="group relative flex-none w-[280px] md:w-[320px] bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow snap-start">
        <Link href={`/products/${product.id}`} className="flex flex-row p-3 items-center h-full">
          <div className="w-24 h-24 shrink-0 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center p-2 relative">
            {primaryImage ? (
              <img src={primaryImage} alt={name} loading="lazy" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="text-3xl">📦</div>
            )}
          </div>
          
          <div className="ml-4 flex flex-col flex-grow justify-center">
            <div className="h-[36px] overflow-hidden">
              <h3 className="text-[13px] font-bold text-gray-900 leading-[18px] line-clamp-2">{name}</h3>
            </div>
            <p className="text-[11px] text-gray-500 mt-1 font-medium">{weight}</p>
            
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-sm font-black text-gray-900">₹{Math.ceil(price)}</span>
              {comparePrice > price && (
                <span className="text-[10px] text-gray-400 line-through font-medium">₹{Math.ceil(comparePrice)}</span>
              )}
            </div>
            
            {discount > 0 && (
              <div className="mt-1">
                <span className="bg-brand-50 text-brand-600 text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase">{discount}% OFF</span>
              </div>
            )}
          </div>
        </Link>
        

      </div>
    );
  };

  const renderProductCard = (product: any, isRow: boolean = true) => {
    const price = Number(product.price);
    const comparePrice = Number(product.comparePrice || product.price);
    const discount = comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
    const primaryImage = product.images?.find((img: any) => img.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl;
    const name = product.name;
    const rating = product.avgRating || 0;
    const ratingCount = product.reviewCount || 0;

    return (
      <div key={product.id} className={cn("group bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100/60 flex flex-col h-full hover:-translate-y-1 snap-start relative", isRow ? "shrink-0 w-[calc(50%-6px)] md:w-[220px] lg:w-[240px]" : "w-full")}>
        <Link href={`/products/${product.id}`} className="block flex-1 flex flex-col h-full">
          {/* Image Container */}
          <div className="relative aspect-square bg-gradient-to-br from-gray-50 via-white to-gray-50/50 overflow-hidden">
            {primaryImage ? (
              <img
                src={primaryImage}
                alt={name}
                loading="lazy"
                className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-100">📦</div>
            )}
            
            {discount > 0 && (
              <div className="absolute top-0 left-0 bg-gradient-to-r from-brand-600 to-brand-500 text-white text-[10px] md:text-[11px] font-black px-3 py-1.5 rounded-br-xl z-10 shadow-md shadow-brand-500/30 tracking-wide">
                {discount}% OFF
              </div>
            )}
            {/* Subtle bottom fade */}
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          </div>

          {/* Details Container */}
          <div className="p-3 md:p-3.5 flex flex-col flex-grow bg-gray-50 relative">
            {/* Centered Divider */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gray-200" />

            {/* Product Title */}
            <div className="h-[32px] md:h-[36px] mb-2 overflow-hidden">
              <h3 className="font-bold text-gray-900 text-[11.5px] md:text-[13px] line-clamp-2 leading-[16px] md:leading-[18px] group-hover:text-brand-600 transition-colors duration-300">
                {name}
              </h3>
            </div>

            {/* Rating & Payment Badges */}
            <div className="flex items-center justify-between mt-auto mb-1.5">
              <div className="flex items-center gap-1.5">
                {rating > 0 ? (
                  <div className="flex items-center bg-brand-500 text-white text-[9px] md:text-[10px] px-2 py-1 rounded-lg shadow-sm shadow-brand-200/50">
                    <span className="font-extrabold">{rating.toFixed(1)}</span>
                    <Star size={9} className="fill-white ml-0.5" />
                  </div>
                ) : (
                  <div className="flex items-center bg-brand-50 text-brand-600 text-[9px] md:text-[10px] px-2 py-1 rounded-lg border border-brand-100">
                    <span className="font-bold">✦ New</span>
                  </div>
                )}
                <span className="text-gray-400 text-[9px] md:text-[10px] font-medium">({ratingCount})</span>
              </div>
              <div className="flex items-center gap-1.5 bg-brand-50 py-1 px-2.5 rounded-lg border border-brand-100">
                <span className="text-brand-700 text-[8px] md:text-[9px] font-bold">UPI</span>
                <div className="w-px h-2.5 bg-brand-200" />
                <span className="text-brand-700 text-[8px] md:text-[9px] font-bold">COD</span>
              </div>
            </div>

            {/* Price Section */}
            <div className="mt-1.5 flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-[15px] md:text-[17px] font-black text-gray-900">₹{Math.ceil(price)}</span>
                {comparePrice > price && (
                  <span className="text-[10px] md:text-[11px] text-gray-400 line-through font-medium">₹{Math.ceil(comparePrice)}</span>
                )}
                {discount > 0 && (
                  <span className="text-[9px] md:text-[10px] text-brand-600 font-bold">Save ₹{Math.ceil(comparePrice - price)}</span>
                )}
              </div>
            </div>
          </div>
        </Link>

      </div>
    );
  };

  return (
    <div className="animate-fade-in bg-slate-50 select-none">
      {/* Global Skeleton Loading for Homepage Sections */}
      {isHomeLoading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-12 pt-8">
          {/* Categories Skeleton */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 w-48 bg-slate-200 animate-pulse rounded"></div>
              <div className="h-4 w-24 bg-slate-200 animate-pulse rounded"></div>
            </div>
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="w-[100px] md:w-[150px] shrink-0 h-32 md:h-48 bg-slate-200 animate-pulse rounded-2xl"></div>
              ))}
            </div>
          </section>

          {/* Products Row Skeleton */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 w-56 bg-slate-200 animate-pulse rounded"></div>
              <div className="h-4 w-24 bg-slate-200 animate-pulse rounded"></div>
            </div>
            <div className="flex gap-5 overflow-hidden">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-[280px] md:w-[320px] shrink-0 h-32 bg-slate-200 animate-pulse rounded-2xl"></div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <>
          {banners.length > 0 && <PromoBanners banners={banners} />}
          {categories.length > 0 && (
        <section className="bg-white border-b border-slate-100 pt-0 pb-4 md:pb-6 relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-row items-stretch justify-start gap-2 md:gap-3 overflow-x-auto no-scrollbar pb-2">
              {categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="flex flex-col items-center justify-start group cursor-pointer w-[100px] md:w-[130px] shrink-0 bg-[#f4f7f4] hover:bg-[#e8ece8] rounded-xl md:rounded-2xl p-3 transition-colors duration-300"
                >
                  <div className="w-16 h-16 md:w-24 md:h-24 relative mb-3 flex items-center justify-center">
                    {(cat.imageUrl || cat.image_url) ? (
                      <img
                        src={cat.imageUrl || cat.image_url}
                        alt={cat.name}
                        className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <span className="text-3xl relative z-10">📦</span>
                    )}
                  </div>
                  <h3 className="text-[10px] md:text-[11px] font-bold text-slate-800 text-center line-clamp-2 leading-tight">
                    {cat.name}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top Sales Row */}
      {topSales.length > 0 && (
        <section className="bg-white border-b border-slate-100 pt-2 pb-4 md:pt-4 md:pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold text-slate-900">Best Selling Products</h2>
              <Link href="/products?sort=top-rated" className="text-xs md:text-sm text-brand-600 font-bold hover:underline flex items-center gap-1">
                View All Products <ArrowRight size={14} />
              </Link>
            </div>
            <div className="flex flex-row items-stretch justify-start gap-4 md:gap-5 overflow-x-auto no-scrollbar pb-2 md:pb-4 snap-x">
              {topSales.map((product) => renderHorizontalProductCard(product))}
            </div>
          </div>
        </section>
      )}

      {/* Recommended Products Row */}
      {recommended.length > 0 && (
        <section className="pt-4 pb-3 md:pt-6 md:pb-6 bg-gradient-to-br from-brand-100/70 via-brand-50/50 to-slate-100/40 border-y border-brand-200/50 mb-2 md:mb-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-400/40 blur-3xl rounded-full -mr-16 -mt-16 animate-pulse pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-200/30 blur-2xl rounded-full -ml-12 -mb-12 pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="px-4 flex items-center justify-between mb-5 relative z-10">
                <div className="flex items-center">
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-slate-900">Recommended For You</h2>
                        <p className="text-sm text-slate-500 mt-1">Picked just for you</p>
                        </div>
                </div>
                <Link href="/products?sort=newest">
                  <button className="bg-white/80 backdrop-blur-sm shadow-sm border border-gray-100 px-3 py-1.5 rounded-full text-[10px] font-black text-gray-700 hover:bg-white transition-all uppercase">
                      VIEW ALL
                  </button>
                </Link>
            </div>

            {/* Horizontal Scroll Area */}
            <div className="flex overflow-x-auto no-scrollbar px-3 space-x-3 md:space-x-5 pb-6 -mb-4 items-stretch snap-x snap-mandatory relative z-10">
              {recommended.map((product) => renderProductCard(product))}
            </div>
          </div>
        </section>
      )}

      {/* Suggested & Filtered Feed Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-10">
        
        {/* Cycle Filter Badges Row (Tuning filters in a single click) */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 relative z-10">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900">
              {filterState.category || filterState.gender ? "Filtered Selections" : "For You"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Explore All Products
            </p>
          </div>

        </div>

        {/* Products Grid */}
        {loading && filterState.page === 1 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 py-4 md:py-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-[3/4] bg-white animate-pulse rounded-2xl border border-slate-100 shadow-sm"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product: any) => renderProductCard(product, false))}
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center border border-slate-100 bg-white rounded-2xl mt-4">
            <Store className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">No products found matching filters</p>
            <button
              onClick={() => {
                setFilterState({ sort: "newest", category: "", gender: "", page: 1 });
              }}
              className="mt-4 text-xs text-brand-600 font-black uppercase hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Infinite Scroll Loader at bottom */}
        {isFetching && filterState.page > 1 && (
          <div className="py-8 flex justify-center items-center">
            <Loader2 className="animate-spin text-brand-600" size={24} />
          </div>
        )}

      </section>

      {/* Customer Reviews Section */}
      {reviews.length > 0 && (
        <section className="bg-white border-y border-slate-100 py-6 md:py-12 mt-2 md:mt-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg md:text-xl font-bold text-slate-900">What Our Customers Say</h2>
            </div>
            <div className="flex flex-row items-stretch justify-start gap-4 md:gap-5 overflow-x-auto no-scrollbar pb-4 snap-x">
              
              {/* Aggregate Rating Card */}
              <div className="flex-none w-[260px] md:w-[300px] bg-white rounded-2xl border border-brand-200 shadow-sm p-6 flex flex-col justify-center snap-start">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl md:text-5xl font-black text-gray-900">4.8</span>
                  <div className="flex text-brand-400">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={18} className="fill-brand-400" />)}
                  </div>
                </div>
                <p className="text-xs text-gray-500 font-bold mt-2">(1,248 Reviews)</p>
                <p className="text-[11px] text-gray-400 font-medium mt-4">Real reviews from real customers</p>
              </div>

              {/* Individual Review Cards */}
              {reviews.map((review) => (
                <div key={review.id} className="flex-none w-[260px] md:w-[300px] bg-brand-50 rounded-2xl p-6 flex flex-col snap-start">
                  <div className="flex text-brand-600 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "transparent"} className={i < review.rating ? "" : "text-brand-200"} />
                    ))}
                  </div>
                  <p className="text-[13px] text-slate-700 leading-relaxed font-medium mb-6">"{review.body}"</p>
                  <p className="text-xs font-bold text-brand-600 mt-auto">— {review.user?.name || "Customer"}</p>
                </div>
              ))}

              <div className="flex-none flex items-end pb-6 px-4">
                <Link href="/reviews" className="text-[11px] text-brand-600 font-extrabold hover:underline flex items-center gap-1 whitespace-nowrap">
                  View All Reviews <ArrowRight size={12} strokeWidth={3} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Certifications Section */}
      {certifications.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 relative z-10">
          <div className="bg-white border border-brand-100/50 rounded-2xl py-5 px-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] flex flex-col lg:flex-row items-center justify-between gap-6">
            
            {/* Title */}
            <div className="shrink-0 text-center lg:text-left">
              <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">Our Certifications</h3>
            </div>

            {/* Logos list */}
            <div className="flex-1 flex flex-wrap items-center justify-center gap-6 lg:gap-8 border-y lg:border-y-0 lg:border-x border-slate-100/80 py-4 lg:py-0 w-full lg:w-auto">
              {certifications.map((cert, index) => (
                <div key={cert.id} className="flex items-center gap-6 lg:gap-8">
                  {index > 0 && <div className="hidden sm:block w-px h-8 bg-slate-200/60" />}
                  {cert.link ? (
                    <a
                      href={cert.link}
                      target="_blank"
                      rel="noreferrer"
                      className="w-14 h-14 bg-white rounded-full flex items-center justify-center p-2 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)] border border-slate-100 hover:scale-105 transition-transform duration-300 shrink-0"
                      title={cert.name}
                    >
                      <img src={cert.imageUrl} alt={cert.name} className="max-w-full max-h-full object-contain" />
                    </a>
                  ) : (
                    <div
                      className="w-14 h-14 bg-white rounded-full flex items-center justify-center p-2 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)] border border-slate-100 hover:scale-105 transition-transform duration-300 shrink-0"
                      title={cert.name}
                    >
                      <img src={cert.imageUrl} alt={cert.name} className="max-w-full max-h-full object-contain" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Description / Learn More */}
            <div className="max-w-xs text-center lg:text-left flex flex-col gap-1.5 shrink-0">
              <p className="text-[10.5px] text-slate-500 font-medium leading-normal">
                We are certified by trusted organizations to ensure the highest standards of quality and purity.
              </p>
              <Link
                href="/certifications-info"
                className="text-brand-700 text-xs font-bold hover:underline flex items-center justify-center lg:justify-start gap-1"
              >
                Learn More <ArrowRight size={12} strokeWidth={2.5} />
              </Link>
            </div>

          </div>
        </section>
      )}

      {/* From Our Blog Section */}
      {blogs.length > 0 && (
        <section className="bg-white border-t border-slate-100 py-6 md:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">From Our Blog</h2>
                <p className="text-xs text-slate-500 mt-1 font-medium">Explore the latest news, guides, and tips</p>
          </div>
          <Link href="/blogs" className="text-xs md:text-sm text-brand-600 font-bold hover:underline flex items-center gap-1">
            View All Articles <ArrowRight size={14} />
          </Link>
        </div>
            
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {blogs.map((blog) => (
                <div key={blog.id} className="group flex flex-col bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 overflow-hidden">
                  <Link href={`/blogs/${blog.slug}`} className="flex flex-col h-full">
                    {/* Blog Image */}
                    <div className="aspect-[16/10] bg-slate-50 relative overflow-hidden shrink-0">
                      {blog.imageUrl ? (
                        <img 
                          src={blog.imageUrl} 
                          alt={blog.title} 
                          loading="lazy" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                          <FileText size={32} />
                    </div>
                      )}
                      {/* Badge */}
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-200/50 shadow-sm capitalize">
                        {blog.author || "Guest"}
                      </span>
                    </div>

                    {/* Blog Details */}
                    <div className="p-4 flex flex-col flex-grow">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">
                        {new Date(blog.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <h3 className="font-bold text-slate-900 text-sm md:text-base line-clamp-2 leading-snug group-hover:text-brand-600 transition-colors duration-300 mb-2">
                        {blog.title}
                      </h3>
                      <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed mb-4">
                        {blog.content}
                      </p>
                      
                      <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between text-brand-600 text-xs font-bold">
                        <span>Read Article</span>
                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      </>
      )}

      <StoreFooter />
    </div>
  );
}
                      