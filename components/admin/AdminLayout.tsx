"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Store,
  Bell,
  Menu,
  ClipboardList,
  Star,
  Ticket,
  BarChart3,
  Image,
  UserCircle,
  ChevronDown,
  FileText,
  Award,
  Headphones,
  AlertTriangle,
  ScanLine,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/authStore";
import { useSiteConfig } from "@/lib/siteConfig";
import { AdminHeaderProvider, useAdminHeader } from "@/lib/adminHeaderContext";
import { BarcodeScannerModal } from "@/components/admin/BarcodeScannerModal";

const getNavItems = (user: any) => {
  const role = user?.role;
  const perms = user?.permissions || [];
  const items: Array<{
    href: string;
    icon: any;
    label: string;
    roles?: string[];
    permissionKey?: string;
  }> = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/products", icon: Package, label: "Products", permissionKey: "MODULE_PRODUCTS" },
    { href: "/admin/categories", icon: Tag, label: "Categories", permissionKey: "MODULE_CATEGORIES" },
    { href: "/admin/banners", icon: Image, label: "Banners", permissionKey: "MODULE_BANNERS" },
    { href: "/admin/blogs", icon: FileText, label: "Blogs", permissionKey: "MODULE_BLOGS" },
    { href: "/admin/certifications", icon: Award, label: "Certifications", permissionKey: "MODULE_CERTIFICATIONS" },
    { href: "/admin/orders", icon: ShoppingCart, label: "Orders", permissionKey: "MODULE_ORDERS" },
    { href: "/admin/users", icon: Users, label: "Users", permissionKey: "MODULE_USERS" },
    { href: "/admin/reviews", icon: Star, label: "Reviews", permissionKey: "MODULE_REVIEWS" },
    { href: "/admin/coupons", icon: Ticket, label: "Coupons", permissionKey: "MODULE_COUPONS" },
    { href: "/admin/support", icon: Headphones, label: "Support", permissionKey: "MODULE_SUPPORT" },
    { href: "/admin/settings", icon: Settings, label: "Settings", permissionKey: "MODULE_SETTINGS" },
  ];
  return items.filter((item) => {
    const r = role?.toUpperCase();
    if (r === "SUPER_ADMIN") return true; 
    if (item.href === "/admin") return true; // Everyone sees Dashboard
    return item.permissionKey ? perms.includes(item.permissionKey) : true;
  });
};

const NAV_GROUPS = [
  { label: "Overview", keys: ["/admin"] },
  { label: "Catalog", keys: ["/admin/products", "/admin/categories", "/admin/banners", "/admin/blogs", "/admin/certifications"] },
  { label: "Sales", keys: ["/admin/orders", "/admin/users", "/admin/reviews", "/admin/coupons", "/admin/support"] },
  { label: "System", keys: ["/admin/settings"] },
];

function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, isAdmin } = useAuthStore();
  const { config, applyTheme, fetchConfig, error, isLoading } = useSiteConfig();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userRole = user?.role?.toUpperCase();
  const isAdminUser = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

  useEffect(() => {
    setMounted(true);
    fetchConfig();
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.push("/login?redirect=/admin");
    } else if (!isAdminUser) {
      router.push("/");
    }
  }, [mounted, isAuthenticated, isAdminUser, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  if (!mounted || !isAuthenticated || !isAdminUser || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
         <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full text-center">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-3">Store Unavailable</h2>
            <p className="text-slate-500 mb-8 text-sm leading-relaxed font-medium">
              {error}
            </p>
         </div>
      </div>
    );
  }

  const allNavItems = getNavItems(user);

  const Sidebar = () => (
    <div className="flex flex-col h-full border-r border-slate-200" style={{ backgroundColor: "#f4f6f8" }}>

      {/* Logo */}
      <div className="h-14 px-4 flex items-center gap-2.5 shrink-0 border-b border-slate-200 bg-white">
        {config.logoUrl ? (
          <img src={config.logoUrl} alt={config.storeName} className="h-7 w-auto object-contain" />
        ) : (
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
            style={{ backgroundColor: config.primaryColor }}
          >
            <Store size={14} className="text-white" />
          </div>
        )}
        <div className="min-w-0">
          <span className="text-slate-900 font-bold text-sm truncate block">{user?.shopName || config.storeName}</span>
          <span className="text-slate-400 text-[10px] font-medium">Admin Panel</span>
        </div>
      </div>

      {/* Nav grouped */}
      <nav className="flex-1 overflow-y-auto no-scrollbar py-3 px-3 space-y-4">
        {NAV_GROUPS.map((group) => {
          const groupItems = allNavItems.filter((item) => group.keys.includes(item.href));
          if (groupItems.length === 0) return null;
          return (
            <div key={group.label}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-1.5">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {groupItems.map(({ href, icon: Icon, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150",
                      isActive(href)
                        ? "text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-sm"
                    )}
                    style={isActive(href) ? { backgroundColor: config.primaryColor } : undefined}
                  >
                    <Icon
                      size={15}
                      className={isActive(href) ? "text-white" : "text-slate-400"}
                    />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Bottom actions */}
      {/* Bottom actions */}
      <div className="border-t border-slate-200 px-3 py-2 space-y-0.5 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-sm transition-all"
        >
          <Store size={15} className="text-slate-400" />
          <span>View Store</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut size={15} className="text-slate-400" />
          <span>Logout</span>
        </button>
      </div>

      {/* User chip */}
      <div className="border-t border-slate-200 bg-white px-3 py-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
            style={{ backgroundColor: config.primaryColor }}
          >
            {user?.name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0">
            <p className="text-slate-800 text-xs font-semibold truncate">{user?.name ?? "Admin"}</p>
            <p className="text-slate-400 text-[10px] truncate capitalize">{user?.role?.replace("_", " ").toLowerCase()}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar — narrower w-48 */}
      <aside className="hidden lg:flex flex-col w-48 shrink-0 shadow-sm">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-48 h-full shadow-xl flex flex-col animate-slide-in">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <AdminTopbar
          allNavItems={allNavItems}
          isActive={isActive}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-5">
          {children}
        </main>
      </div>
    </div>
  );
}

/** Inner topbar component — reads header context */
function AdminTopbar({
  allNavItems,
  isActive,
  setSidebarOpen,
}: {
  allNavItems: ReturnType<typeof getNavItems>;
  isActive: (href: string) => boolean;
  setSidebarOpen: (v: boolean) => void;
}) {
  const { header } = useAdminHeader();
  const pageLabel = allNavItems.find((n) => isActive(n.href))?.label ?? "Dashboard";
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center px-4 lg:px-5 gap-3 shrink-0">
      {/* Mobile menu */}
      <button
        className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={18} />
      </button>

      {/* Title area — shows page-injected title OR fallback */}
      <div className="flex-none min-w-0 flex items-center gap-2 pr-4">
        {header ? (
          <>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-slate-900 leading-tight truncate">{header.title}</h1>
              {header.subtitle && (
                <p className="text-xs text-slate-400 leading-tight">{header.subtitle}</p>
              )}
            </div>
          </>
        ) : (
          <>
            <span className="text-slate-400 text-xs hidden sm:inline">Admin</span>
            <span className="text-slate-300 text-xs hidden sm:inline">/</span>
            <span className="text-slate-800 text-sm font-bold truncate">{pageLabel}</span>
          </>
        )}
      </div>

      {/* Center Filter Area */}
      <div className="flex-1 min-w-0 flex items-center">
        {header?.filter && (
          <div className="w-full max-w-3xl">
            {header.filter}
          </div>
        )}
      </div>

      {/* Page action button (injected by page) */}
      {header?.action && (
        <div className="shrink-0">{header.action}</div>
      )}

      {/* Scan Button */}
      <button 
        onClick={() => setScannerOpen(true)}
        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        title="Scan Barcode"
      >
        <ScanLine size={16} />
      </button>

      {/* Bell */}
      <button className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 relative transition-colors">
        <Bell size={16} />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full" />
      </button>

      {/* User Dropdown */}
      <div className="relative border-l border-slate-200 pl-3 ml-1">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center overflow-hidden">
            <UserCircle size={18} />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-700 leading-tight">
              {user?.name ? user.name : "Admin"}
            </p>
            <p className="text-[10px] text-slate-400 leading-tight">Administrator</p>
          </div>
          <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg shadow-slate-200/50 py-1 z-50 animate-in fade-in slide-in-from-top-2">
            <Link
              href="/admin/settings"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <Settings size={15} />
              Settings
            </Link>
            <div className="h-px bg-slate-100 my-1" />
            <button
              onClick={() => {
                setDropdownOpen(false);
                logout();
                router.push("/login");
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        )}
      </div>

      <BarcodeScannerModal 
        isOpen={scannerOpen} 
        onClose={() => setScannerOpen(false)} 
      />
    </header>
  );
}

/** Wrap everything in AdminHeaderProvider */
export default function AdminLayoutRoot({ children }: { children: React.ReactNode }) {
  return (
    <AdminHeaderProvider>
      <AdminLayout>{children}</AdminLayout>
    </AdminHeaderProvider>
  );
}

