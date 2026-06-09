"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ShoppingCart,
  Search,
  User,
  Menu,
  X,
  Store,
  ChevronDown,
  Package,
  LogOut,
  LayoutDashboard,
  Heart,
  MapPin,
  Smartphone,
  Star,
  Truck,
  Leaf,
  ShieldCheck,
  Headphones,
  Home,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useCartStore } from "@/lib/cartStore";
import { useAuthStore } from "@/lib/authStore";
import { cn } from "@/lib/utils";
import { useSiteConfig } from "@/lib/siteConfig";
import { storeService } from "@/services/store.service";

const categories = [
  { label: "T-Shirts", slug: "t-shirts" },
  { label: "Shirts", slug: "shirts" },
  { label: "Jeans", slug: "jeans" },
  { label: "Trousers", slug: "trousers" },
  { label: "Shorts", slug: "shorts" },
  { label: "Activewear", slug: "activewear" },
  { label: "Footwear", slug: "footwear" },
  { label: "Accessories", slug: "accessories" },
];

export default function StoreNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dynamicCategories, setDynamicCategories] = useState<any[]>([]);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { itemCount } = useCartStore();
  const { user, isAuthenticated, logout, isAdmin } = useAuthStore();
  const { config: siteConfig } = useSiteConfig();
  const cartCount = itemCount();

  // Fetch configs and apply saved theme color on mount
  useEffect(() => {
    storeService.getCategories().then(res => setDynamicCategories(res.data.data || [])).catch(() => {});
    setMounted(true);
  }, []);

  // High-performance dynamic search parameter extraction running on every render
  // Safe from infinite loops and guarantees perfect sync during client-side Next.js route transitions
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get("category");
      if (cat !== activeCategory) {
        setActiveCategory(cat);
      }
    }
  });

  // Sticky header transition on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      if (currentScrollY > lastScrollY && currentScrollY > 120) {
        setShowHeader(false); // collapse sub-bars
      } else {
        setShowHeader(true); // reveal sub-bars
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Click outside listener for profile menu
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push("/");
  };

  // Safe robust comparison helper to match slugs/category strings in any format (spaces, ampersands, case-insensitive)
  const isCategoryMatch = (paramVal: string | null, slugVal: string) => {
    if (!paramVal) return false;
    const normParam = paramVal.toLowerCase().replace(/[^a-z0-9]/g, "");
    const normSlug = slugVal.toLowerCase().replace(/[^a-z0-9]/g, "");
    return normParam === normSlug;
  };

  // State calculations for active paths
  const isAllProductsActive = pathname.startsWith("/products") && !activeCategory;
  const isProductsActive = pathname.startsWith("/products") || pathname.startsWith("/category");
  const isCartActive = pathname === "/cart";
  const isAccountActive = pathname === "/account" || pathname.startsWith("/orders") || pathname === "/login" || pathname === "/register";
  const isAdminActive = pathname.startsWith("/admin");

  return (
    <>
      {/* Header Placeholder to prevent content jumps */}
      <div className={cn(
        "w-full bg-slate-50 transition-all duration-300",
        (pathname !== "/" || isScrolled) ? "h-14 md:h-[112px]" : "h-[96px] md:h-[112px]"
      )}></div>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-slate-100 select-none flex flex-col w-full">
        
        {/* Top Header Bar */}
        <div className="bg-brand-50 w-full text-[11px] md:text-[10px] lg:text-[11px] text-brand-900 font-medium overflow-hidden hidden md:block h-10 opacity-100 border-b border-brand-100/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5"><Truck size={14} className="text-brand-600"/> {siteConfig.usp1}</div>
              <div className="flex items-center gap-1.5"><Leaf size={14} className="text-brand-600"/> {siteConfig.usp2}</div>
              <div className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-brand-600"/> {siteConfig.usp3}</div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Headphones size={14} className="text-brand-600"/>
              <span>Need Help? {siteConfig.storePhone}</span>
            </div>
          </div>
        </div>

        {/* Main Brand & Controls Row */}
        <div className="h-14 md:h-[72px] flex items-center bg-white px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4 md:gap-8">
            
            {/* Left Section: Mobile Menu Trigger + Logo */}
            <div className="flex items-center space-x-3 md:space-x-4 flex-shrink-0">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="md:hidden text-slate-700 hover:bg-slate-50 p-1.5 rounded-lg border border-slate-100 active:scale-95 transition-all"
              >
                <Menu size={20} />
              </button>

              <Link href="/" className={cn("items-center transition-all duration-300 flex", pathname !== "/" ? "hidden md:flex" : "flex")}>
                {siteConfig.logoUrl ? (
                  <img src={siteConfig.logoUrl} alt={siteConfig.storeName} className="h-8 md:h-10 w-auto object-contain mr-2" />
                ) : (
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mr-1.5 md:mr-2 shadow-sm flex-shrink-0"
                    style={{ backgroundColor: siteConfig.primaryColor }}
                  >
                    <Store size={16} className="text-white" />
                  </div>
                )}
                <span className="text-slate-900 font-bold text-base md:text-xl tracking-tight">{siteConfig.storeName}</span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-6 ml-4 mr-auto">
              <Link href="/" className={cn("text-[13px] font-semibold transition-colors", pathname === "/" ? "text-brand-600 border-b-2 border-brand-600 pb-1" : "text-slate-700 hover:text-brand-600 pb-1 border-b-2 border-transparent")}>Home</Link>
              
              {/* Shop Now Menu Dropdown */}
              <div className="group relative pb-1">
                <Link href="/products" className="text-[13px] font-semibold text-slate-700 hover:text-brand-600 transition-colors flex items-center gap-1 border-b-2 border-transparent">Shop Now <ChevronDown size={14}/></Link>
                <div className="absolute top-full left-0 w-48 bg-white shadow-xl rounded-xl border border-slate-100 py-2 hidden group-hover:block z-50 max-h-96 overflow-y-auto">
                   <Link href="/products" className="block px-4 py-2 text-[13px] font-bold text-brand-600 hover:bg-brand-50 border-b border-gray-50 mb-1">Shop All</Link>
                   {dynamicCategories.map(cat => (
                     <Link key={cat.id} href={`/products?category=${cat.slug}`} className="block px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-50 hover:text-brand-600">{cat.name}</Link>
                   ))}
                </div>
              </div>

              <Link href="/blogs" className={cn("text-[13px] font-semibold transition-colors", pathname === "/blogs" ? "text-brand-600 border-b-2 border-brand-600 pb-1" : "text-slate-700 hover:text-brand-600 pb-1 border-b-2 border-transparent")}>Blog</Link>
            </div>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className={cn(
                "relative items-center bg-slate-50 border border-slate-200/80 hover:border-slate-300 focus-within:border-brand-500 rounded-full px-2 py-1 shadow-sm transition-all duration-300 ease-in-out flex-1 max-w-sm xl:max-w-md",
                "flex",
                (pathname !== "/" || isScrolled)
                  ? "absolute md:relative top-2.5 left-14 right-16 h-9 md:h-auto md:top-auto md:left-auto md:right-auto" 
                  : "absolute md:relative top-[58px] left-4 right-4 h-9 md:h-auto md:top-auto md:left-auto md:right-auto"
              )}
            >
              <div className="flex-1 relative h-6 overflow-hidden flex items-center ml-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="absolute inset-0 w-full h-full bg-transparent focus:outline-none text-xs md:text-sm text-slate-800 font-normal placeholder:text-slate-400 placeholder:font-normal z-10"
                />
              </div>
              <button type="submit" className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center flex-shrink-0 transition-colors ml-2">
                <Search size={14} />
              </button>
            </form>

            {/* Right Section: Cart + Account dropdown */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 ml-auto lg:ml-0 relative z-20">

              <Link href="/cart" id="navbar-cart-btn" className="flex items-center gap-1.5 text-slate-600 hover:text-brand-600 transition-colors relative">
                <div className="relative">
                  <ShoppingCart size={20} />
                  {mounted && cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-brand-600 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">
                      {cartCount > 99 ? "99" : cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden xl:inline text-xs font-medium">Cart</span>
              </Link>

              <div className="relative hidden md:block" ref={userMenuRef}>
                <button
                  id="navbar-user-btn"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-brand-600 transition-colors"
                >
                  {mounted && isAuthenticated && user ? (
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-brand-600/15 flex items-center justify-center text-brand-700 text-xs font-bold shadow-inner border border-brand-600/20">
                      {user.name[0].toUpperCase()}
                    </div>
                  ) : (
                    <User size={20} />
                  )}
                  <span className="hidden xl:inline text-xs font-medium">My Account</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-slate-100 shadow-xl py-2 animate-fade-in z-50">
                    {isAuthenticated && user ? (
                      <>
                        <div className="px-4 py-2 border-b border-slate-50 mb-1">
                          <p className="text-xs font-medium text-slate-800 truncate">{user.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                        </div>
                        <Link href="/account" onClick={() => setUserMenuOpen(false)} className={cn("flex items-center gap-2 px-4 py-2 text-xs hover:bg-slate-50 transition-colors font-normal", pathname === "/account" ? "text-brand-600" : "text-slate-700")}>
                          <User size={14} className="text-slate-400" /> My Profile
                        </Link>
                        <Link href="/account/orders" onClick={() => setUserMenuOpen(false)} className={cn("flex items-center gap-2 px-4 py-2 text-xs hover:bg-slate-50 transition-colors font-normal", pathname === "/account/orders" ? "text-brand-600" : "text-slate-700")}>
                          <Package size={14} className="text-slate-400" /> My Orders
                        </Link>
                        {(isAdmin() || user?.role?.toUpperCase() === "SUPER_ADMIN" || user?.role?.toUpperCase() === "ADMIN") && (
                          <>
                            <Link href="/admin" onClick={() => setUserMenuOpen(false)} className={cn("flex items-center gap-2 px-4 py-2 text-xs hover:bg-slate-50 transition-colors font-normal", isAdminActive ? "text-brand-600 font-medium" : "text-brand-600")}>
                              <LayoutDashboard size={14} /> Store Admin
                            </Link>
                            {user?.role?.toUpperCase() === "SUPER_ADMIN" && (
                              <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-xs text-purple-600 hover:bg-purple-50 transition-colors font-medium border-t border-slate-50">
                                <ShieldCheck size={14} /> SaaS Admin Hub
                              </a>
                            )}
                          </>
                        )}
                        <div className="border-t border-slate-100 mt-1.5 pt-1">
                          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 w-full text-left transition-colors font-normal">
                            <LogOut size={14} /> Logout
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Link href="/login" onClick={() => setUserMenuOpen(false)} className={cn("flex items-center gap-2 px-4 py-2 text-xs hover:bg-slate-50 transition-colors font-normal", pathname === "/login" ? "text-brand-600" : "text-slate-700")}>
                          <User size={14} className="text-slate-400" /> Login
                        </Link>
                        <Link href="/register" onClick={() => setUserMenuOpen(false)} className={cn("flex items-center gap-2 px-4 py-2 text-xs hover:bg-slate-50 transition-colors font-normal", pathname === "/register" ? "text-brand-600" : "text-slate-700")}>
                          <Package size={14} className="text-slate-400" /> Register
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "block md:hidden bg-white overflow-hidden transition-all duration-300 ease-in-out",
            (pathname !== "/" || isScrolled) ? "h-0 opacity-0" : "h-10 opacity-100"
          )}
        />

        <div
          className={cn(
            "fixed inset-0 z-[60] md:hidden transition-all duration-300 pointer-events-none",
            isMenuOpen ? "opacity-100" : "opacity-0"
          )}
        >
          <div
            className={cn(
              "absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto",
              isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Left-side Sliding drawer panel */}
          <div
            className={cn(
              "absolute inset-y-0 left-0 w-4/5 max-w-xs bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out pointer-events-auto",
              isMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            {/* Drawer Header */}
            <div className="bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between text-slate-900">
              <Link href="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
                {siteConfig.logoUrl ? (
                  <img src={siteConfig.logoUrl} alt={siteConfig.storeName} className="h-6 w-auto object-contain mr-2" />
                ) : (
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center mr-1.5 shadow-sm flex-shrink-0"
                    style={{ backgroundColor: siteConfig.primaryColor }}
                  >
                    <Store size={12} className="text-white" />
                  </div>
                )}
                <span className="font-bold text-lg tracking-tight text-slate-900">{siteConfig.storeName}</span>
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="bg-slate-50 hover:bg-slate-100 p-1.5 rounded-full text-slate-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Links */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              <SidebarSection title="Store">
                <SidebarLink
                  href="/"
                  label="Home"
                  icon={<Home size={16} />}
                  isActive={pathname === "/"}
                  onClick={() => setIsMenuOpen(false)}
                />
              </SidebarSection>

              {/* Account section */}
              <SidebarSection title="Account">
                <SidebarLink
                  href={mounted && isAuthenticated ? "/account" : "/login"}
                  label={mounted && isAuthenticated && user ? `Profile (${user.name})` : "Login / Signup"}
                  icon={<User size={16} />}
                  isActive={isAccountActive}
                  onClick={() => setIsMenuOpen(false)}
                />
                <SidebarLink
                  href="/cart"
                  label={mounted ? `My Cart (${cartCount})` : "My Cart (0)"}
                  icon={<ShoppingCart size={16} />}
                  isActive={isCartActive}
                  onClick={() => setIsMenuOpen(false)}
                />
                {mounted && isAuthenticated && isAdmin() && (
                  <SidebarLink
                    href="/admin"
                    label="Admin Dashboard"
                    icon={<LayoutDashboard size={16} />}
                    isActive={isAdminActive}
                    onClick={() => setIsMenuOpen(false)}
                  />
                )}
              </SidebarSection>

              {/* Categories/Experience Section */}
              <SidebarSection title="Shop by Category">
                <SidebarLink
                  href="/products"
                  label="All Products"
                  icon={<Smartphone size={16} />}
                  isActive={isAllProductsActive}
                  onClick={() => setIsMenuOpen(false)}
                />
                {dynamicCategories.map(cat => (
                  <SidebarLink
                    key={cat.id}
                    href={`/products?category=${cat.slug}`}
                    label={cat.name}
                    icon={<Star size={16} />}
                    isActive={pathname.startsWith("/products") && typeof window !== "undefined" && window?.location?.search?.includes(`category=${cat.slug}`)}
                    onClick={() => setIsMenuOpen(false)}
                  />
                ))}
              </SidebarSection>
            </div>

            {/* Drawer Footer */}
            <div className="p-5 border-t border-slate-100 flex justify-between items-center text-[9px] font-normal text-slate-400 tracking-widest bg-slate-50">
              <span>VERSION 1.0.0</span>
              <span className="italic text-brand-600 font-normal uppercase">{siteConfig.storeName}</span>
            </div>
          </div>
        </div>

      </nav>
    </>
  );
}

/* Helper Components */
interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

function SidebarSection({ title, children }: SidebarSectionProps) {
  return (
    <div className="space-y-2.5">
      <h4 className="text-[9px] font-normal text-slate-400 uppercase tracking-[3px] px-2">{title}</h4>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

interface SidebarLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

function SidebarLink({ href, label, icon, isActive, onClick }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center space-x-3 px-3 py-2.5 text-xs font-normal rounded-xl transition-all border border-transparent",
        isActive
          ? "bg-brand-50 text-brand-600 border-brand-100"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-100"
      )}
    >
      <div className={cn(isActive ? "text-brand-600 flex-shrink-0" : "text-slate-400 flex-shrink-0")}>{icon}</div>
      <span>{label}</span>
    </Link>
  );
}
