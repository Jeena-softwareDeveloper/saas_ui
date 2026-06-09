"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Minus, Plus, Trash2, ShoppingBag, Truck, Loader2, X } from "lucide-react";
import { useCartStore } from "@/lib/cartStore";
import { storeService } from "@/services/store.service";

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n);

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, coupon, setCoupon, removeCoupon } = useCartStore();
  const subtotal = total();
  
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await storeService.validateCoupon(couponCode, subtotal);
      if (res.data.success && res.data.data?.valid) {
        setCoupon({
          code: couponCode,
          discount_amount: res.data.data.discount_amount,
          coupon_id: res.data.data.coupon_id
        });
        setCouponCode("");
      } else {
        setCouponError("Invalid coupon");
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setCouponError("Please login to apply coupons");
      } else {
        setCouponError(err.response?.data?.error || err.response?.data?.message || "Invalid coupon");
      }
    } finally {
      setCouponLoading(false);
    }
  };
  
  let shipping = 0;
  let gst = 0;

  items.forEach(item => {
    const itemTotal = Number(item.product.price) * item.quantity;
    const itemGstPct = Number(item.product.gstPercentage) || 0;
    const itemShipping = Number(item.product.shippingCharge) || 0;

    gst += (itemTotal * itemGstPct) / 100;
    shipping += itemShipping * item.quantity;
  });

  gst = Math.round(gst);
  const discountAmount = coupon ? coupon.discount_amount : 0;
  const finalTotal = Math.max(0, subtotal + shipping + gst - discountAmount);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center animate-fade-in">
        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <ShoppingCart size={36} className="text-slate-300" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Your cart is empty</h1>
        <p className="text-slate-500 mt-2">Start shopping to add items to your cart.</p>
        <Link href="/products" className="btn-primary mt-6 inline-flex">
          <ShoppingBag size={16} /> Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="card p-4 flex gap-4 items-start">
              {/* Product Image */}
              <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden">
                {(() => {
                  const imgObj = (item.product.images as any)?.[0];
                  if (!imgObj) return "📦";
                  const src = typeof imgObj === "string" ? imgObj : imgObj.imageUrl || imgObj.url;
                  if (!src) return "📦";
                  return <img src={src} className="w-full h-full object-cover" alt={item.product.name} />;
                })()}
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.productId}`}
                  className="text-sm font-semibold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2"
                >
                  {item.product.name}
                </Link>
                <p className="text-base font-bold text-slate-900 mt-1">{formatINR(Number(item.product.price))}</p>

                <div className="flex items-center justify-between mt-3">
                  {/* Quantity */}
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-indigo-600">
                      {formatINR(Number(item.product.price) * item.quantity)}
                    </span>
                    <button 
                      onClick={() => removeItem(item.productId)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Coupon */}
          <div className="card p-4">
            <p className="text-sm font-medium text-slate-700 mb-2">Have a coupon?</p>
            {coupon ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-bold text-sm uppercase tracking-wider">{coupon.code}</span>
                  <span className="text-emerald-600 text-xs">applied!</span>
                </div>
                <button 
                  onClick={removeCoupon}
                  className="p-1 rounded-full text-emerald-600 hover:bg-emerald-100 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="input flex-1 h-9 text-sm uppercase"
                  />
                  <button 
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode}
                    className="btn-secondary px-4 h-9 text-sm disabled:opacity-50"
                  >
                    {couponLoading ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
                  </button>
                </div>
                {couponError && <p className="text-xs text-red-500 mt-1.5">{couponError}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="card p-5 sticky top-24">
            <h2 className="text-base font-bold text-slate-900 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                {shipping === 0 ? (
                  <span className="text-emerald-600 font-medium">FREE</span>
                ) : (
                  <span>{formatINR(shipping)}</span>
                )}
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST</span>
                <span>{formatINR(gst)}</span>
              </div>
              {coupon && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount ({coupon.code})</span>
                  <span>-{formatINR(coupon.discount_amount)}</span>
                </div>
              )}
              <div className="border-t border-slate-100 pt-3">
                <div className="flex justify-between font-bold text-slate-900 text-base">
                  <span>Total</span>
                  <span>{formatINR(finalTotal)}</span>
                </div>
              </div>
            </div>



            <Link href="/checkout" id="proceed-to-checkout-btn"
              className="btn-primary w-full justify-center mt-4 py-3">
              Proceed to Checkout →
            </Link>
            <Link href="/products" className="btn-secondary w-full justify-center mt-2 py-2.5 text-xs">
              Continue Shopping
            </Link>

            {/* Trust */}
            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400">🔒 Secure checkout powered by Stripe</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
