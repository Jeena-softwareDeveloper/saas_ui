"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { storeService } from "@/services/store.service";
import { formatPrice, formatDateTime, getOrderStatusBadge } from "@/lib/utils";

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/account/orders");
      return;
    }
    setLoading(true);
    storeService.getOrders()
      .then((res) => setOrders(res.data?.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-8 pb-20">
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6">
        <div className="pb-6 mb-8 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">My Orders</h2>
            <p className="text-sm text-gray-500 font-medium mt-1">Track, return, or repeat your past purchases</p>
          </div>
          {!loading && orders.length > 0 && (
            <div className="bg-brand-600/10 text-brand-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
              {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
            </div>
          )}
        </div>

        <div className="w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-600 mb-4"></div>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Fetching your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-3xl bg-white">
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
            <div className="space-y-4">
              {orders.map((order) => {
                const badge = getOrderStatusBadge(order.status as any);
                const totalQty = order.items?.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0) || 0;
                const firstItem = order.items?.[0];
                const firstProductName = firstItem?.productName || 'Product';
                const imgObj = firstItem?.product?.images?.[0];
                const imgSrc = typeof imgObj === "string" ? imgObj : imgObj?.imageUrl || imgObj?.url || "";

                return (
                  <div key={order.id} className="bg-white px-5 py-5 rounded-2xl cursor-pointer border border-gray-100 shadow-sm hover:border-brand-600/30 hover:shadow-md transition-all group">
                    <div className="flex gap-5 items-center">
                      <div className="w-16 h-20 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm">
                        {imgSrc ? (
                          <img src={imgSrc} alt="product" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Order #{order.orderNumber || order.id.slice(-8).toUpperCase()}</span>
                            <h4 className="text-sm font-black text-gray-900 tracking-tight truncate">
                              {firstProductName}
                              {order.items?.length > 1 && <span className="inline-block bg-gray-100 text-gray-600 font-bold text-[10px] px-2 py-0.5 rounded-md ml-2">+ {order.items.length - 1} more items</span>}
                            </h4>
                          </div>
                          <div className={badge.className}>
                            <span className="text-[10px] font-bold uppercase tracking-wider">{badge.label}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                          <div className="flex items-center gap-6">
                            <div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Total Quantity</span>
                              <span className="text-xs font-black text-gray-800">{totalQty} {totalQty === 1 ? 'Item' : 'Items'}</span>
                            </div>
                            <div className="w-px h-6 bg-gray-100" />
                            <div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Order Date</span>
                              <span className="text-xs font-black text-gray-800">{formatDateTime(order.createdAt)}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Total Price</span>
                            <span className="text-sm font-black text-brand-600">{formatPrice(Number(order.totalAmount))}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center ml-2">
                        <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-brand-600/10 flex items-center justify-center transition-colors">
                          <ChevronRight size={18} className="text-gray-400 group-hover:text-brand-600 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
