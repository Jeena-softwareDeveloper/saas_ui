"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Store, ArrowLeft } from "lucide-react";

import { useAuthStore } from "@/lib/authStore";
import { useSiteConfig } from "@/lib/siteConfig";
import { authService } from "@/services/auth.service";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuthStore();
  const { config, fetchConfig } = useSiteConfig();

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (form.phone.length < 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const res = await authService.registerCustomer({
        name: form.name,
        phone: form.phone,
        password: form.password
      });

      const { user, accessToken, refreshToken } = res.data.data;
      login(user, accessToken, refreshToken);
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4 font-sans">
      <div className="flex w-full max-w-[850px] bg-white shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden min-h-[550px]">
        {/* Left Panel */}
        <div 
          className="hidden md:flex flex-col justify-between w-[40%] p-10 px-8 relative overflow-hidden"
          style={{ backgroundColor: config.primaryColor }}
        >
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 mb-12">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Store size={16} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">{config.storeName}</span>
            </Link>
            <h1 className="text-3xl font-extrabold text-white mb-4 leading-tight">Create <br/>Account</h1>
            <p className="text-sm text-white/80 leading-relaxed font-medium">
              Join us to get personalized recommendations, amazing discounts, and seamless checkout.
            </p>
          </div>
          <div className="relative z-10 mt-10">
            <Store size={140} className="text-white/10 -ml-4" strokeWidth={1} />
          </div>
          {/* Decorative shapes */}
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 rounded-full bg-black/20 blur-3xl pointer-events-none" />
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-[60%] p-10 px-10 flex flex-col justify-center relative">
          <div className="absolute top-6 left-6">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
              <ArrowLeft size={16} /> 
              <span className="hidden sm:inline">Back to Store</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>

          <div className="mb-6 md:hidden text-center mt-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center" style={{ backgroundColor: config.primaryColor }}>
                <Store size={16} className="text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">{config.storeName}</span>
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Sign Up</h2>
          <p className="text-sm text-slate-500 mb-6 font-medium">Please enter your details to register</p>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 justify-center">
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="peer w-full border-b-2 border-slate-200 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-brand-600 transition-colors bg-transparent placeholder-transparent"
                  placeholder="Full Name"
                />
                <label className="absolute left-0 top-2.5 text-slate-400 text-sm font-medium pointer-events-none transition-all duration-200 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-brand-600 peer-valid:-top-4 peer-valid:text-xs">
                  Full Name
                </label>
              </div>

              <div className="relative pt-2">
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                  maxLength={10}
                  className="peer w-full border-b-2 border-slate-200 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-brand-600 transition-colors bg-transparent placeholder-transparent"
                  placeholder="Phone Number"
                />
                <label className="absolute left-0 top-4 text-slate-400 text-sm font-medium pointer-events-none transition-all duration-200 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-brand-600 peer-valid:-top-2 peer-valid:text-xs">
                  Phone Number
                </label>
              </div>

              <div className="relative pt-2">
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="peer w-full border-b-2 border-slate-200 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-brand-600 transition-colors bg-transparent placeholder-transparent"
                  placeholder="Password"
                  minLength={6}
                />
                <label className="absolute left-0 top-4 text-slate-400 text-sm font-medium pointer-events-none transition-all duration-200 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-brand-600 peer-valid:-top-2 peer-valid:text-xs">
                  Password
                </label>
              </div>

              <div className="relative pt-2">
                <input
                  type="password"
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="peer w-full border-b-2 border-slate-200 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-brand-600 transition-colors bg-transparent placeholder-transparent"
                  placeholder="Confirm Password"
                />
                <label className="absolute left-0 top-4 text-slate-400 text-sm font-medium pointer-events-none transition-all duration-200 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-brand-600 peer-valid:-top-2 peer-valid:text-xs">
                  Confirm Password
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md flex justify-center items-center gap-2 mt-8 active:scale-[0.98]"
              style={{ backgroundColor: config.primaryColor }}
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Creating Account...</> : "Sign Up"}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-sm text-slate-500 font-medium">
              Existing User?{" "}
              <Link href="/login" className="font-bold hover:underline" style={{ color: config.primaryColor }}>
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
