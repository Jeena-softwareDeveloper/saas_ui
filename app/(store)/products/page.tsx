"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  SlidersHorizontal,
  X,
  Star,
  ShoppingCart,
  Loader2,
  Package,
  ChevronRight,
} from "lucide-react";
import { storeService } from "@/services/store.service";
import { useCartStore } from "@/lib/cartStore";

// ─── helpers ─────────────────────────────────────────────────────────────────
const resolveImage = (images: any[]): string => {
  if (!images || images.length === 0) return "";
  const first = images[0];
  if (typeof first === "string") return first;
  return first?.imageUrl || first?.url || "";
};

// ─── ProductCard — matches reference exactly ──────────────────────────────────
function ProductCard({ product }: { product: any }) {
  const { addItem } = useCartStore();
  const price = Number(product.price) || 0;
  const comparePrice = Number(product.comparePrice) || 0;
  const discount = comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
  const savings = comparePrice > price ? comparePrice - price : 0;
  const avgRating = product.avgRating || 0;
  const reviewCount = product.reviewCount || 0;
  const imageUrl = resolveImage(product.images || []);
  const stock = product.stockQuantity ?? 999;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden border border-gray-100/60 flex flex-col h-full hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 via-white to-gray-50/50 overflow-hidden rounded-t-2xl">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
        )}
        {discount > 0 && (
          <div className="absolute top-0 left-0 bg-gradient-to-r from-brand-600 to-brand-500 text-white text-[10px] md:text-[11px] font-black px-3 py-1.5 rounded-br-xl z-10 shadow-md shadow-brand-200/30 tracking-wide">
            {discount}% OFF
          </div>
        )}
        {stock <= 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-red-50 border border-red-100 text-red-600 text-[10px] font-medium uppercase px-3 py-1 rounded-full">
              Sold Out
            </span>
          </div>
        )}
        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </div>

      {/* Details */}
      <div className="p-3 md:p-3.5 flex flex-col flex-grow bg-gray-50 relative">
        {/* Centered divider */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gray-200" />

        {/* Category */}
        {product.category?.name && (
          <span className="text-[9px] font-black text-brand-700 uppercase tracking-widest mb-1">
            {product.category.name}
          </span>
        )}

        {/* Title */}
        <div className="h-[32px] md:h-[36px] mb-2 overflow-hidden">
          <h3 className="font-bold text-gray-900 text-[11.5px] md:text-[13px] line-clamp-2 leading-[16px] md:leading-[18px] group-hover:text-brand-600 transition-colors duration-300">
            {product.name}
          </h3>
        </div>

        {/* Stock badge row */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Variants:
            </span>
            <span className="text-[10.5px] md:text-[11.5px] font-black text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200/50 shadow-sm">
              {product.variants?.length || 1}
            </span>
          </div>
          {stock > 0 && stock <= 10 && (
            <div className="bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100 flex items-center gap-1 animate-pulse shrink-0">
              <div className="w-1 h-1 bg-orange-500 rounded-full" />
              <span className="text-orange-700 text-[8px] md:text-[9px] font-black italic">{stock} Left</span>
            </div>
          )}
        </div>

        {/* Rating + Payment Badges */}
        <div className="flex items-center justify-between mt-auto mb-1.5">
          <div className="flex items-center gap-1.5">
            {avgRating > 0 ? (
              <div className="flex items-center bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[9px] md:text-[10px] px-2 py-1 rounded-lg shadow-sm shadow-emerald-200/50">
                <span className="font-extrabold">{avgRating.toFixed(1)}</span>
                <Star size={9} className="fill-white ml-0.5" />
              </div>
            ) : (
              <div className="flex items-center bg-amber-50 text-amber-600 text-[9px] md:text-[10px] px-2 py-1 rounded-lg border border-amber-100">
                <span className="font-bold">✦ New</span>
              </div>
            )}
            <span className="text-gray-400 text-[9px] md:text-[10px] font-medium">({reviewCount})</span>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-50 py-1 px-2.5 rounded-lg border border-emerald-100">
            <span className="text-emerald-700 text-[8px] md:text-[9px] font-bold">UPI</span>
            <div className="w-px h-2.5 bg-emerald-200" />
            <span className="text-emerald-700 text-[8px] md:text-[9px] font-bold">COD</span>
          </div>
        </div>

        {/* Price */}
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-[15px] md:text-[17px] font-black text-gray-900">₹{Math.ceil(price)}</span>
          {comparePrice > price && (
            <span className="text-[10px] md:text-[11px] text-gray-400 line-through font-medium">
              ₹{Math.ceil(comparePrice)}
            </span>
          )}
          {savings > 0 && (
            <span className="text-[9px] md:text-[10px] text-emerald-600 font-bold">Save ₹{Math.ceil(savings)}</span>
          )}
        </div>

        {/* Add to Cart button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (stock > 0) addItem(product, 1);
          }}
          disabled={stock <= 0}
          className="mt-2.5 w-full flex items-center justify-center gap-1.5 bg-white border-2 border-brand-600 text-brand-600 text-[11px] font-medium uppercase tracking-wider py-2 rounded-xl hover:bg-brand-600 hover:text-white transition-all duration-200 active:scale-[0.98] disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={14} />
          {stock <= 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </Link>
  );
}

// ─── Skeleton Card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100/60 shadow-sm">
      <div className="aspect-square bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
      </div>
      <div className="p-3 space-y-2.5 bg-gray-50">
        <div className="h-3 bg-gray-100 rounded-full w-4/5 animate-pulse" />
        <div className="h-3 bg-gray-100 rounded-full w-3/5 animate-pulse" />
        <div className="flex gap-1.5 pt-1">
          {[1, 2, 3].map((j) => <div key={j} className="w-3 h-3 rounded-full bg-gray-100 animate-pulse" />)}
        </div>
        <div className="h-4 bg-gray-100 rounded-full w-1/3 animate-pulse mt-1" />
        <div className="h-9 bg-gray-100 rounded-xl w-full animate-pulse mt-2" />
      </div>
    </div>
  );
}

// ─── Main Content ──────────────────────────────────────────────────────────────
function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const categoryParam = searchParams.get("category") || "";
  const searchParam = searchParams.get("search") || "";
  const featuredParam = searchParams.get("featured") || "";

  const [products, setProducts] = useState<any[]>([]);
  const [apiCategories, setApiCategories] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [localPriceRange, setLocalPriceRange] = useState({ min: "", max: "" });

  const observer = useRef<IntersectionObserver | null>(null);

  // Infinite scroll trigger
  const lastProductRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore]
  );

  // Fetch categories from backend
  useEffect(() => {
    storeService.getProducts({ limit: 0 }).then((res) => {
      // just use what we have
    }).catch(() => {});

    // Fetch categories via products API (distinct categories)
    storeService.getCategories()
      .then((res) => {
        const data = res.data;
        if (data?.data?.categories) setApiCategories(data.data.categories);
        else if (Array.isArray(data?.data)) setApiCategories(data.data);
      })
      .catch(() => {});
  }, []);

  // Reset when filters change
  const filterKey = `${searchParam}-${categoryParam}-${sortBy}-${priceRange.min}-${priceRange.max}-${featuredParam}`;
  const lastFilterKey = useRef(filterKey);

  useEffect(() => {
    if (lastFilterKey.current !== filterKey) {
      setPage(1);
      setProducts([]);
      setHasMore(true);
      lastFilterKey.current = filterKey;
    }
  }, [filterKey]);

  // Fetch products
  useEffect(() => {
    let cancelled = false;
    const isFirstPage = page === 1;

    if (isFirstPage) setLoading(true);
    else setLoadingMore(true);

    const params: any = { page, limit: 15 };
    if (searchParam) params.search = searchParam;
    if (categoryParam) params.category = categoryParam;
    if (featuredParam === "true") params.featured = "true";
    if (priceRange.min) params.minPrice = priceRange.min;
    if (priceRange.max) params.maxPrice = priceRange.max;

    if (sortBy === "price-asc") { params.sort = "price"; params.order = "asc"; }
    else if (sortBy === "price-desc") { params.sort = "price"; params.order = "desc"; }
    else { params.sort = "createdAt"; params.order = "desc"; }

    storeService.getProducts(params)
      .then((res) => {
        if (cancelled) return;
        const fetched = res.data.data.products || [];
        setTotal(res.data.data.pagination?.total || fetched.length);
        if (isFirstPage) setProducts(fetched);
        else setProducts((prev) => [...prev, ...fetched]);
        if (fetched.length < 15) setHasMore(false);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setLoadingMore(false);
        }
      });

    return () => { cancelled = true; };
  }, [page, searchParam, categoryParam, sortBy, priceRange, featuredParam]);

  const getCategoryName = (slug: string) => {
    const cat = apiCategories.find((c) => c.slug === slug || c.name === slug);
    if (cat) return cat.name;
    return slug.replace(/-\d+$/, "").replace(/-/g, " ");
  };

  const handleCategoryClick = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === "") params.delete("category");
    else params.set("category", slug);
    router.push(`/products?${params.toString()}`);
  };

  const sortOptions = [
    { value: "createdAt", label: "Relevance (Newest First)" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "rating", label: "Customer Rating" },
  ];

  const applyPriceFilter = () => {
    setPriceRange(localPriceRange);
    setIsFilterOpen(false);
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Sort By */}
      <div>
        <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Sort By</h3>
        <div className="space-y-1">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setSortBy(opt.value); setPage(1); }}
              className={`w-full text-left py-2 px-3 rounded-lg text-[13px] font-medium transition-all ${
                sortBy === opt.value ? "bg-brand-50 text-brand-600" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Price Range</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={localPriceRange.min}
              onChange={(e) => setLocalPriceRange((p) => ({ ...p, min: e.target.value }))}
              className="w-full text-[13px] font-medium border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              placeholder="Max"
              value={localPriceRange.max}
              onChange={(e) => setLocalPriceRange((p) => ({ ...p, max: e.target.value }))}
              className="w-full text-[13px] font-medium border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none"
            />
          </div>
          <button
            onClick={applyPriceFilter}
            className="w-full bg-brand-600 text-white text-[13px] font-medium py-2.5 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Apply Price Range
          </button>
          {(priceRange.min || priceRange.max) && (
            <button
              onClick={() => { setPriceRange({ min: "", max: "" }); setLocalPriceRange({ min: "", max: "" }); }}
              className="w-full text-[13px] text-gray-400 hover:text-gray-600 font-medium"
            >
              Clear Price Filter
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      {apiCategories.length > 0 && (
        <div>
          <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Categories</h3>
          <div className="space-y-1">
            <button
              onClick={() => handleCategoryClick("")}
              className={`w-full text-left py-2 px-3 rounded-lg text-[13px] font-medium transition-all ${
                !categoryParam ? "bg-brand-50 text-brand-600" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              All Products
            </button>
            {apiCategories.map((cat: any) => (
              <button
                key={cat.id || cat._id}
                onClick={() => handleCategoryClick(cat.slug || cat.name)}
                className={`w-full text-left py-2 px-3 rounded-lg text-[13px] font-medium transition-all ${
                  categoryParam === (cat.slug || cat.name)
                    ? "bg-brand-50 text-brand-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Category Horizontal Scroll Bar ── */}
      {apiCategories.length > 0 && (
        <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
          <div className="max-w-7xl mx-auto px-3 py-2">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => handleCategoryClick("")}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[11px] font-medium uppercase tracking-wider border transition-all ${
                  !categoryParam
                    ? "bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-100"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                }`}
              >
                All
              </button>
              {apiCategories.map((cat: any) => {
                const slug = cat.slug || cat.name;
                const isActive = categoryParam === slug;
                return (
                  <button
                    key={cat.id || cat._id}
                    onClick={() => handleCategoryClick(slug)}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[11px] font-medium uppercase tracking-wider border transition-all ${
                      isActive
                        ? "bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-100"
                        : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Main Layout ── */}
      <div className="flex flex-col md:flex-row max-w-7xl mx-auto px-2 py-4 gap-6">

        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-[52px]">
            <div className="flex items-center space-x-2 text-brand-600 mb-6 pb-4 border-b border-gray-100">
              <SlidersHorizontal size={18} strokeWidth={3} />
              <h2 className="font-medium uppercase text-xs tracking-widest">Filters</h2>
            </div>
            <FilterPanel />
          </div>
        </aside>

        {/* Products Area */}
        <main className="flex-1 min-h-[600px] flex flex-col">

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                {loading ? "Loading..." : `${total} Products`}
              </span>
              {categoryParam && (
                <span className="bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase border border-brand-100 flex items-center">
                  {getCategoryName(categoryParam)}
                  <button
                    onClick={() => handleCategoryClick("")}
                    className="ml-1.5 hover:text-red-700 text-[12px] leading-none flex items-center justify-center"
                  >
                    ×
                  </button>
                </span>
              )}
              {searchParam && (
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-black border border-blue-100">
                  "{searchParam}"
                </span>
              )}
            </div>
            <button
              className="md:hidden flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm"
              onClick={() => setIsFilterOpen(true)}
            >
              <SlidersHorizontal size={14} />
              Filters
            </button>
          </div>

          {/* Products Grid */}
          {loading && page === 1 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-4 w-full px-1">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-4 w-full pb-10 px-1">
              {products.map((product, index) => (
                <div
                  key={product.id || product._id}
                  ref={products.length === index + 1 ? lastProductRef : null}
                  className="animate-fade-in"
                  style={{ animationDelay: `${Math.min(index * 0.03, 0.25)}s` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 w-full">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-rose-100/30 rounded-full blur-2xl scale-150 animate-pulse" />
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-full border border-gray-200/50 shadow-inner">
                  <Package size={56} strokeWidth={1} className="text-gray-300" />
                </div>
              </div>
              <span className="text-gray-700 font-medium uppercase text-sm tracking-[0.2em] text-center">
                No products found
              </span>
              <span className="text-gray-400 text-xs font-medium mt-2 text-center">
                Try adjusting your filters or browse another category
              </span>
              <button
                onClick={() => {
                  handleCategoryClick("");
                  setPriceRange({ min: "", max: "" });
                }}
                className="mt-6 bg-brand-600 text-white font-black text-xs uppercase tracking-widest px-6 py-3 rounded-xl shadow-lg shadow-brand-100 hover:opacity-90 transition-opacity"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Infinite scroll loading spinner */}
          {loadingMore && (
            <div className="py-8 flex justify-center">
              <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-sm border border-gray-100">
                <div className="w-4 h-4 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Loading more</span>
              </div>
            </div>
          )}

          {/* All loaded indicator */}
          {!hasMore && products.length > 0 && !loading && (
            <div className="py-6 flex justify-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                — All {total} products shown —
              </span>
            </div>
          )}
        </main>
      </div>

      {/* ── Mobile Filter Bottom Sheet ── */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[100] flex items-end bg-black/60 backdrop-blur-sm md:hidden animate-fade-in">
          <div className="w-full bg-white rounded-t-3xl p-6 pb-10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
              <span className="text-lg font-black text-gray-900 uppercase tracking-widest">Filters</span>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="bg-gray-100 p-2 rounded-full"
              >
                <X size={20} className="text-gray-700" />
              </button>
            </div>
            <FilterPanel />
            <button
              className="w-full mt-6 bg-brand-600 text-white font-black py-4 rounded-xl shadow-lg shadow-brand-100 uppercase tracking-widest text-xs"
              onClick={() => { applyPriceFilter(); setIsFilterOpen(false); }}
            >
              Apply Everything
            </button>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.35s ease-out both; }
        @keyframes shimmer { 100% { transform: translateX(100%); } }
      `}</style>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-brand-600/20 border-t-brand-600 rounded-full animate-spin" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Products...</span>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
