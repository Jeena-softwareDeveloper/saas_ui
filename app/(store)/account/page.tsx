"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  MapPin,
  CreditCard,
  User,
  LogOut,
  Settings,
  Loader2,
  Star,
  Edit3,
  ChevronRight,
  CheckCircle2,
  Headphones,
} from "lucide-react";
import { formatPrice, formatDateTime, getOrderStatusBadge } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { useAuthStore } from "@/lib/authStore";
import { storeService } from "@/services/store.service";
import AddressTab from "@/components/store/account/AddressTab";
import { cn } from "@/lib/utils";
import { useSiteConfig } from "@/lib/siteConfig";

const tabs = [
  { id: "profile",   label: "Profile",  icon: User,        fullLabel: "Profile Info"      },
  { id: "orders",    label: "Orders",   icon: Package,     fullLabel: "My Orders"         },
  { id: "addresses", label: "Address",  icon: MapPin,      fullLabel: "Addresses"         },
  { id: "payment",   label: "Payment",  icon: CreditCard,  fullLabel: "Payment Methods"   },
  { id: "support",   label: "Support",  icon: Headphones,  fullLabel: "Customer Support"  },
];

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { config: siteConfig } = useSiteConfig();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [reviewProduct, setReviewProduct] = useState<{ id: string; name: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [supportInfo, setSupportInfo] = useState<any>(null);
  const [loadingSupport, setLoadingSupport] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketPhone, setTicketPhone] = useState("");
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const handleSupportTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTicket(true);
    setTicketSuccess(false);
    try {
      await storeService.createSupportTicket({
        subject: ticketSubject,
        message: ticketMessage,
        phone: ticketPhone,
        name: user?.name,
        email: user?.email
      });
      setTicketSuccess(true);
      setTicketSubject("");
      setTicketMessage("");
      setTicketPhone("");
      setTimeout(() => setTicketSuccess(false), 5000);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmittingTicket(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) router.push("/login?redirect=/account");
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (activeTab === "orders" && isAuthenticated) {
      setLoadingOrders(true);
      storeService.getOrders()
        .then((res) => setOrders(res.data.data.data || []))
        .catch(() => {})
        .finally(() => setLoadingOrders(false));
    } else if (activeTab === "support" && isAuthenticated) {
      setLoadingSupport(true);
      storeService.getSupportInfo()
        .then((res) => setSupportInfo(res.data.data))
        .catch(() => {})
        .finally(() => setLoadingSupport(false));
    }
  }, [activeTab, isAuthenticated]);

  const handleLogout = () => { logout(); router.push("/"); };

  const submitReview = async () => {
    if (!reviewProduct) return;
    setSubmittingReview(true);
    try {
      await storeService.createReview({ productId: reviewProduct.id, rating, comment });
      setReviewProduct(null); setRating(5); setComment("");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };


  if (!isAuthenticated || !user) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-600/20 border-t-brand-600 rounded-full animate-spin" />
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  const activeTabObj = tabs.find((t) => t.id === activeTab)!;

  return (
    <div className="min-h-screen bg-white md:bg-gray-50">
      <div className="max-w-6xl mx-auto md:px-6 md:py-8">

        {/* Desktop: page heading */}
        <h1 className="hidden md:block text-2xl font-bold text-slate-900 mb-6 px-0">My Account</h1>

        {/* Mobile: Horizontal Tab Menu */}
        <div className="md:hidden bg-white border-b border-gray-100 overflow-x-auto no-scrollbar">
          <div className="flex px-4 py-3 gap-3 w-max">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all",
                    isActive ? "bg-brand-600 text-white shadow-md shadow-rose-100" : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                  )}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:gap-8 md:items-start">

          {/* ── Desktop Left Sidebar ── */}
          <aside className="hidden md:flex flex-col w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              {/* User card */}
              <div 
                className="p-5 text-white"
                style={{ backgroundColor: siteConfig.primaryColor }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-black overflow-hidden border-2 border-white/30">
                    {(user as any).profileImage ? (
                      <img src={(user as any).profileImage} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name[0].toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-[14px] truncate">{user.name}</p>
                    <p className="text-white/70 text-[11px] truncate">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Nav items */}
              <div className="p-2">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[12px] font-bold transition-all mb-0.5",
                        isActive
                          ? "bg-rose-50 text-brand-600"
                          : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      <tab.icon size={17} className={isActive ? "text-brand-600" : "text-gray-400"} />
                      {tab.fullLabel}
                      {isActive && <ChevronRight size={14} className="ml-auto text-brand-600" />}
                    </button>
                  );
                })}

                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[12px] font-bold text-brand-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut size={17} className="text-brand-600" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Content Area ── */}
          <div className="flex-1 min-w-0 md:px-0 md:py-0">

            {/* ── Profile Tab ── */}
            {activeTab === "profile" && (
              <div className="bg-white md:rounded-2xl md:shadow-sm md:border md:border-gray-100 p-4 md:p-6 animate-fade-in">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="hidden md:block text-[16px] font-black text-gray-900">Profile Information</h2>
                  {!isEditingProfile && (
                    <button onClick={() => setIsEditingProfile(true)} className="flex items-center gap-1.5 text-brand-600 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors ml-auto border border-brand-600/20">
                      <Edit3 size={14} /> Edit Profile
                    </button>
                  )}
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-brand-600/10 flex items-center justify-center text-brand-600 text-3xl font-black overflow-hidden border-2 border-brand-600/20">
                    {(user as any).profileImage ? (
                      <img src={(user as any).profileImage} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name[0].toUpperCase()
                    )}
                  </div>
                  {isEditingProfile && (
                    <div>
                      <button className="border border-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                        Change Avatar
                      </button>
                      <p className="text-[11px] text-gray-400 mt-1.5">JPG, GIF or PNG. Max size 2MB</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                    {isEditingProfile ? (
                      <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 transition-all" defaultValue={user.name} />
                    ) : (
                      <div className="px-4 py-3 text-[14px] text-gray-900 font-bold bg-gray-50 rounded-xl">{user.name}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                    {isEditingProfile ? (
                      <input className="w-full border border-gray-100 rounded-xl px-4 py-3 text-[14px] text-gray-500 font-medium bg-gray-50" defaultValue={user.email} readOnly />
                    ) : (
                      <div className="px-4 py-3 text-[14px] text-gray-900 font-bold bg-gray-50 rounded-xl">{user.email}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                    {isEditingProfile ? (
                      <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 transition-all" defaultValue={(user as any).phone || ""} placeholder="Add your phone number" />
                    ) : (
                      <div className="px-4 py-3 text-[14px] text-gray-900 font-bold bg-gray-50 rounded-xl">{(user as any).phone || "Not provided"}</div>
                    )}
                  </div>
                  
                  {isEditingProfile && (
                    <div className="sm:col-span-2 pt-2 flex flex-col sm:flex-row gap-3">
                      <button onClick={() => setIsEditingProfile(false)} className="w-full sm:w-auto bg-gray-100 text-gray-700 font-black text-[12px] uppercase tracking-widest px-8 py-3 rounded-xl hover:bg-gray-200 transition-colors">
                        Cancel
                      </button>
                      <button onClick={() => setIsEditingProfile(false)} className="w-full sm:w-auto bg-brand-600 text-white font-black text-[12px] uppercase tracking-widest px-8 py-3 rounded-xl shadow-md shadow-rose-100 hover:opacity-90 transition-opacity active:scale-[0.98]">
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile: Sign out button */}
                <div className="md:hidden mt-8 pt-6 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-brand-600 font-black text-[12px] uppercase tracking-wider"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}

            {/* ── Orders Tab ── */}
            {activeTab === "orders" && (
              <div className="space-y-4 animate-fade-in p-4 md:p-0">
                <h2 className="hidden md:block text-[16px] font-black text-gray-900 mb-4">Order History</h2>
                {loadingOrders ? (
                  <div className="flex justify-center py-16">
                    <div className="w-8 h-8 border-4 border-brand-600/20 border-t-brand-600 rounded-full animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-3xl bg-white mt-4">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-gray-50">
                      <Package size={48} className="text-gray-300" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h2>
                    <p className="text-gray-400 text-sm font-normal mb-8">Looks like you haven't placed any orders yet.</p>
                    <button 
                      onClick={() => router.push('/')}
                      className="bg-brand-600 text-white font-black px-8 py-3.5 rounded-xl shadow-lg shadow-rose-100 uppercase tracking-widest text-xs hover:bg-rose-600 transition-colors cursor-pointer"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  orders.map((order) => {
                    const badge = getOrderStatusBadge(order.status as any);
                    return (
                      <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-50 pb-4 mb-4">
                          <div>
                            <p className="font-mono text-[13px] font-black text-brand-600">{order.orderNumber}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">Placed on {formatDateTime(order.createdAt)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={badge.className}>{badge.label}</span>
                            <span className="font-black text-gray-900 text-[15px]">{formatPrice(Number(order.totalAmount))}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {order.items?.map((item: any) => {
                            const imgObj = item.product?.images?.[0];
                            const imgSrc = typeof imgObj === "string" ? imgObj : imgObj?.imageUrl || imgObj?.url || "";
                            return (
                              <div key={item.id} className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                                  {imgSrc ? <img src={imgSrc} className="w-full h-full object-cover" alt="" /> : <span className="text-xl">📦</span>}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] font-bold text-gray-900 truncate">{item.productName}</p>
                                  <p className="text-[11px] text-gray-400">Qty: {item.quantity}</p>
                                </div>
                                {order.status === "DELIVERED" && (
                                  <button
                                    onClick={() => setReviewProduct({ id: item.productId, name: item.productName })}
                                    className="text-[11px] font-black text-brand-600 flex items-center gap-1 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100 shrink-0"
                                  >
                                    <Edit3 size={11} /> Review
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                          <button className="flex-1 bg-brand-600 text-white text-[11px] font-black uppercase tracking-wider py-2.5 rounded-xl shadow-sm shadow-rose-100 hover:opacity-90 transition-opacity">Track Order</button>
                          <button className="flex-1 border border-gray-200 text-gray-700 text-[11px] font-black uppercase tracking-wider py-2.5 rounded-xl hover:bg-gray-50 transition-colors">View Invoice</button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ── Addresses Tab ── */}
            {activeTab === "addresses" && <AddressTab />}

            {/* ── Payment Tab ── */}
            {activeTab === "payment" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm animate-fade-in">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard size={28} className="text-gray-300" />
                </div>
                <h3 className="text-[15px] font-black text-gray-800 capitalize">{activeTabObj.fullLabel}</h3>
                <p className="text-[12px] text-gray-400 mt-1">This section is currently under development.</p>
              </div>
            )}

            {/* ── Support Tab ── */}
            {activeTab === "support" && (
              <div className="bg-white md:rounded-2xl md:shadow-sm md:border md:border-gray-100 p-4 md:p-6 animate-fade-in">
                <h3 className="hidden md:flex text-[16px] font-black text-gray-900 mb-6 items-center gap-2">
                  <Headphones className="text-brand-600" size={20} /> Contact Support
                </h3>
                
                <div className="mt-2">
                  <h4 className="text-[14px] font-bold text-gray-900 mb-4">Submit a Request</h4>
                  {ticketSuccess && (
                    <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm font-medium rounded-lg flex items-center gap-2">
                      <CheckCircle2 size={16} /> Support ticket submitted successfully! We will get back to you soon.
                    </div>
                  )}
                  <form onSubmit={handleSupportTicketSubmit} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Subject *</label>
                      <input 
                        type="text" 
                        required
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-800 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                        placeholder="What do you need help with?"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone Number (Optional)</label>
                      <input 
                        type="text" 
                        value={ticketPhone}
                        onChange={(e) => setTicketPhone(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-800 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                        placeholder="Your contact number"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Message *</label>
                      <textarea 
                        required
                        value={ticketMessage}
                        onChange={(e) => setTicketMessage(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-800 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors min-h-[100px]"
                        placeholder="Describe your issue in detail..."
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={submittingTicket}
                      className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submittingTicket ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : "Submit Request"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Review Modal ── */}
      <Modal isOpen={!!reviewProduct} onClose={() => setReviewProduct(null)} title="Write a Review" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 font-medium">How was the <span className="text-slate-900 font-bold">{reviewProduct?.name}</span>?</p>
          <div className="flex justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => setRating(star)}>
                <Star size={32} fill={rating >= star ? "#f59e0b" : "transparent"} className={rating >= star ? "text-amber-500" : "text-slate-300"} />
              </button>
            ))}
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Your Review</label>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 transition-all min-h-[100px]"
              placeholder="Tell us what you liked or disliked..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <button
            className="w-full bg-brand-600 text-white font-black text-[12px] uppercase tracking-widest py-3.5 rounded-xl shadow-md shadow-rose-100 hover:opacity-90 transition-opacity disabled:opacity-50"
            onClick={submitReview}
            disabled={submittingReview}
          >
            {submittingReview ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </Modal>

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.25s ease-out both; }
      `}</style>
    </div>
  );
}
