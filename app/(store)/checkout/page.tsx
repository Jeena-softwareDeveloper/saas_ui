"use client";

import { useState, useEffect } from "react";
import { Check, MapPin, CreditCard, Package, ChevronRight, Loader2, Tag } from "lucide-react";
import { useCartStore } from "@/lib/cartStore";
import { useAuthStore } from "@/lib/authStore";
import { useRouter } from "next/navigation";
import { storeService } from "@/services/store.service";

const steps = [
  { id: 1, label: "Address", icon: MapPin },
  { id: 2, label: "Payment", icon: CreditCard },
  { id: 3, label: "Confirm", icon: Package },
];

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n);

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total: cartTotal, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({
    name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", country: "India",
  });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [ordered, setOrdered] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCouponId, setAppliedCouponId] = useState<string | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const subtotal = cartTotal();
  
  let shipping = 0;
  let gstBeforeDiscount = 0;

  items.forEach(item => {
    const itemTotal = Number(item.product.price) * item.quantity;
    const itemGstPct = Number(item.product.gstPercentage) || 0;
    const itemShipping = Number(item.product.shippingCharge) || 0;

    gstBeforeDiscount += (itemTotal * itemGstPct) / 100;
    shipping += itemShipping * item.quantity;
  });

  const discountRatio = subtotal > 0 ? Math.max(0, (subtotal - discountAmount) / subtotal) : 1;
  const gst = Math.round(gstBeforeDiscount * discountRatio);
  const finalTotal = Math.max(0, subtotal - discountAmount) + shipping + gst;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout");
    } else if (items.length === 0 && !ordered) {
      router.push("/cart");
    }
  }, [isAuthenticated, items, ordered, router]);

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      setError("");
      
      await storeService.clearRemoteCart(); // clear remote cart
      for (const item of items) {
        await storeService.addToRemoteCart({ productId: item.productId, quantity: item.quantity });
      }

      const addrRes = await storeService.createAddress({
        fullName: address.name,
        phone: address.phone,
        addressLine1: address.line1,
        addressLine2: address.line2,
        city: address.city,
        state: address.state,
        postalCode: address.pincode,
        country: address.country
      });
      const addressId = addrRes.data.data.id;

      const piRes = await storeService.createPaymentIntent(finalTotal);
      const paymentIntentId = piRes.data.data.payment_intent_id;

      const orderRes = await storeService.placeOrder({ items: items, addressId: addressId, paymentIntentId, total: finalTotal, couponCode });
      
      setOrderNumber(orderRes.data.data.order_number);
      clearCart();
      setOrdered(true);
    } catch (err: any) {

      setError(err.response?.data?.error || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError("");
    try {
      const res = await storeService.validateCoupon(couponCode, subtotal);
      setDiscountAmount(res.data.data.discount_amount);
      setAppliedCouponId(res.data.data.coupon_id);
    } catch (err: any) {
      setCouponError(err.response?.data?.error || "Invalid coupon code");
      setDiscountAmount(0);
      setAppliedCouponId(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setDiscountAmount(0);
    setAppliedCouponId(null);
    setCouponError("");
  };

  if (ordered) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
          <Check size={36} className="text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Order Placed! 🎉</h1>
        <p className="text-slate-600 mb-2">Your order has been confirmed.</p>
        <p className="text-sm text-slate-500 mb-8">
          Order ID: <span className="font-mono font-semibold text-indigo-600">{orderNumber}</span>
        </p>
        <div className="card p-4 mb-6 text-left">
          <p className="text-sm font-medium text-slate-700 mb-2">What happens next?</p>
          <div className="space-y-2">
            {[
              { emoji: "📧", text: "Order confirmation email sent" },
              { emoji: "📦", text: "We'll prepare your package" },
              { emoji: "🚚", text: "Delivery in 3–5 business days" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                <span>{s.emoji}</span> {s.text}
              </div>
            ))}
          </div>
        </div>
        <a href="/account/orders" className="btn-primary inline-flex justify-center">
          View My Orders
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 animate-fade-in">
      {/* Progress */}
      <div className="flex items-center mb-4 sticky top-[56px] md:top-[112px] z-40 bg-slate-50 py-2 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-transparent shadow-none transition-shadow">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div className={`flex items-center gap-1.5 sm:gap-2 ${step >= s.id ? "text-indigo-600" : "text-slate-400"}`}>
              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-sm font-bold border-2 transition-all
                ${step > s.id ? "bg-indigo-600 border-indigo-600 text-white" :
                  step === s.id ? "border-indigo-600 text-indigo-600 bg-indigo-50" :
                  "border-slate-200 text-slate-400 bg-white"}`}>
                {step > s.id ? <Check size={12} className="sm:w-[14px] sm:h-[14px]" /> : s.id}
              </div>
              <span className="text-[11px] sm:text-sm font-medium hidden sm:inline">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 sm:mx-3 transition-colors ${step > s.id ? "bg-indigo-600" : "bg-slate-200"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          {/* Step 1: Address */}
          {step === 1 && (
            <div className="card p-4 md:p-5 space-y-3 animate-fade-in">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin size={18} className="text-indigo-600" /> Delivery Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label mb-1">Full Name *</label>
                  <input className="input" placeholder="John Doe" value={address.name}
                    onChange={(e) => setAddress({ ...address, name: e.target.value })} required />
                </div>
                <div>
                  <label className="label mb-1">Phone Number *</label>
                  <input className="input" placeholder="+91 98765 43210" value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })} required />
                </div>
                <div className="sm:col-span-2">
                  <label className="label mb-1">Address Line 1 *</label>
                  <input className="input" placeholder="House/Flat No., Street Name" value={address.line1}
                    onChange={(e) => setAddress({ ...address, line1: e.target.value })} required />
                </div>
                <div className="sm:col-span-2">
                  <label className="label mb-1">Address Line 2</label>
                  <input className="input" placeholder="Landmark, Area (optional)" value={address.line2}
                    onChange={(e) => setAddress({ ...address, line2: e.target.value })} />
                </div>
                <div>
                  <label className="label mb-1">City *</label>
                  <input className="input" placeholder="Mumbai" value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })} required />
                </div>
                <div>
                  <label className="label mb-1">State *</label>
                  <select className="input" value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}>
                    <option value="">Select State</option>
                    {["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Gujarat", "Rajasthan", "Uttar Pradesh"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label mb-1">PIN Code *</label>
                  <input className="input" placeholder="400001" maxLength={6} value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })} required />
                </div>
                <div>
                  <label className="label mb-1">Country</label>
                  <input className="input bg-slate-50" value="India" readOnly />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={() => setStep(2)} className="btn-primary">
                  Continue to Payment <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="card p-4 md:p-5 space-y-4 animate-fade-in">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard size={18} className="text-indigo-600" /> Payment Method
              </h2>

              <div className="space-y-2.5">
                {[
                  { id: "card", label: "Credit / Debit Card", emoji: "💳", desc: "Visa, Mastercard, RuPay" },
                  { id: "upi", label: "UPI", emoji: "📱", desc: "GPay, PhonePe, BHIM" },
                  { id: "netbanking", label: "Net Banking", emoji: "🏦", desc: "All major banks" },
                  { id: "cod", label: "Cash on Delivery", emoji: "💵", desc: "Pay when delivered" },
                ].map((method) => (
                  <label key={method.id} className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all
                    ${paymentMethod === method.id ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300"}`}>
                    <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)} className="accent-indigo-600" />
                    <span className="text-lg">{method.emoji}</span>
                    <div>
                      <p className="text-[13px] font-semibold text-slate-900">{method.label}</p>
                      <p className="text-[11px] text-slate-400">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {paymentMethod === "card" && (
                <div className="space-y-2.5 p-3.5 bg-slate-50 rounded-xl animate-fade-in">
                  <div>
                    <label className="label mb-1">Card Number</label>
                    <input className="input font-mono" placeholder="1234 5678 9012 3456" maxLength={19} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label mb-1">Expiry Date</label>
                      <input className="input" placeholder="MM/YY" maxLength={5} />
                    </div>
                    <div>
                      <label className="label mb-1">CVV</label>
                      <input className="input font-mono" placeholder="•••" maxLength={4} type="password" />
                    </div>
                  </div>
                  <div>
                    <label className="label mb-1">Cardholder Name</label>
                    <input className="input" placeholder="Name as on card" />
                  </div>
                </div>
              )}

              {paymentMethod === "upi" && (
                <div className="p-3.5 bg-slate-50 rounded-xl animate-fade-in">
                  <label className="label mb-1">UPI ID</label>
                  <input className="input" placeholder="yourname@paytm" />
                </div>
              )}

              <div className="flex gap-3 justify-between pt-1">
                <button onClick={() => setStep(1)} className="btn-secondary">← Back</button>
                <button onClick={() => setStep(3)} className="btn-primary">
                  Review Order <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="card p-4 md:p-5 space-y-3 animate-fade-in">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Package size={18} className="text-indigo-600" /> Review Your Order
              </h2>

              <div className="space-y-3">
                {items.map((item, i) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center text-xl shadow-sm">
                      {(item.product.images as any[])?.[0] ? <img src={typeof (item.product.images as any[])[0] === 'string' ? (item.product.images as any[])[0] : (item.product.images as any[])[0]?.url || (item.product.images as any[])[0]?.imageUrl} className="w-full h-full object-cover rounded-md" alt="" /> : "📦"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{item.product.name}</p>
                      <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-slate-900" suppressHydrationWarning>{formatINR(Number(item.product.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs font-semibold text-slate-500 mb-1">DELIVERY ADDRESS</p>
                <p className="text-sm text-slate-700">{address.name || "—"}, {address.line1 || "—"}, {address.city || "—"}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs font-semibold text-slate-500 mb-1">PAYMENT METHOD</p>
                <p className="text-sm text-slate-700 capitalize">{paymentMethod === "card" ? "Credit / Debit Card" : paymentMethod.toUpperCase()}</p>
              </div>

              {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
              <div className="flex gap-3 justify-between pt-2">
                <button onClick={() => setStep(2)} className="btn-secondary" disabled={loading}>← Back</button>
                <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 min-w-40 justify-center">
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <><Check size={16} /> Place Order — <span suppressHydrationWarning>{formatINR(finalTotal)}</span></>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="card p-5 h-fit sticky top-24">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm mb-4">
            {items.map((item, i) => (
              <div key={item.id} className="flex items-center gap-2">
                <span className="flex-1 text-slate-600 truncate">{item.product.name} ×{item.quantity}</span>
                <span className="font-medium" suppressHydrationWarning>{formatINR(Number(item.product.price) * item.quantity)}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t border-slate-100 pt-3 pb-3 mb-1">
            <p className="text-xs font-semibold text-slate-900 mb-2 flex items-center gap-1"><Tag size={12}/> Apply Coupon</p>
            {appliedCouponId ? (
              <div className="flex items-center justify-between p-2 bg-emerald-50 rounded border border-emerald-100">
                <div>
                  <p className="text-xs font-bold text-emerald-700 uppercase">{couponCode}</p>
                  <p className="text-[10px] text-emerald-600">Coupon applied successfully</p>
                </div>
                <button onClick={handleRemoveCoupon} className="text-xs text-slate-500 hover:text-slate-700 underline">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="input text-xs h-8 uppercase" 
                  placeholder="Enter code" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                />
                <button 
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon || !couponCode}
                  className="btn-secondary py-1 px-3 text-xs h-8 disabled:opacity-50"
                >
                  {applyingCoupon ? "..." : "Apply"}
                </button>
              </div>
            )}
            {couponError && <p className="text-[10px] text-red-500 mt-1">{couponError}</p>}
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span><span suppressHydrationWarning>{formatINR(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount</span><span>-{formatINR(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              {shipping === 0 ? <span className="text-emerald-600" suppressHydrationWarning>FREE</span> : <span suppressHydrationWarning>{formatINR(shipping)}</span>}
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST</span><span suppressHydrationWarning>{formatINR(gst)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-100">
              <span>Total</span><span suppressHydrationWarning>{formatINR(finalTotal)}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4 text-center">🔒 Secured by Stripe</p>
        </div>
      </div>
    </div>
  );
}
