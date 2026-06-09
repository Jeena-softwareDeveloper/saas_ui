"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Store, AlertTriangle, Eye, EyeOff } from "lucide-react";

import { useAuthStore } from "@/lib/authStore";
import { useSiteConfig } from "@/lib/siteConfig";
import { authService } from "@/services/auth.service";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [error, setError] = useState(searchParams.get("error") || "");
  const { login, isAuthenticated, user } = useAuthStore();
  const { config, fetchConfig, error: apiError } = useSiteConfig();

  // Fetch tenant config on mount — MUST complete before login attempt
  useEffect(() => {
    fetchConfig().finally(() => setConfigLoading(false));
  }, []);

  // Redirect already-authenticated users away from login page
  useEffect(() => {
    if (!configLoading && isAuthenticated && user) {
      const userRole = user.role?.toUpperCase();
      if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
        router.replace("/admin");
      } else {
        const redirectTo = searchParams.get("redirect") || "/";
        router.replace(redirectTo);
      }
    }
  }, [configLoading, isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (configLoading) return; // Don't submit if config hasn't loaded yet
    setLoading(true);
    setError("");
    
    try {
      const res = await authService.loginCustomer(form);
      const { user, accessToken, refreshToken } = res.data.data;
      login(user, accessToken, refreshToken);
      
      if (user.role === "ADMIN") {
        router.push("/admin");
      } else {
        const redirectTo = searchParams.get("redirect") || "/";
        router.push(redirectTo);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  if (configLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
         <Loader2 className="animate-spin text-brand-600 mb-4" size={40} />
         <p className="text-slate-500 font-medium animate-pulse">Initializing Store...</p>
      </div>
    );
  }

  // Only show the error screen if the API returned an error
  if (apiError) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
         <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full text-center">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-3">Store Unavailable</h2>
            <p className="text-slate-500 mb-8 text-sm leading-relaxed font-medium">
              {apiError}
            </p>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4 font-sans">
      <div className="flex w-full max-w-[850px] bg-white shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden min-h-[520px]">
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
            <h1 className="text-3xl font-extrabold text-white mb-4 leading-tight">Welcome <br/>Back!</h1>
            <p className="text-sm text-white/80 leading-relaxed font-medium">
              Sign in to access your personalized shopping experience, exclusive offers, and order history.
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
        <div className="w-full md:w-[60%] p-10 px-10 flex flex-col justify-center">
          <div className="mb-8 md:hidden text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center" style={{ backgroundColor: config.primaryColor }}>
                <Store size={16} className="text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">{config.storeName}</span>
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Sign In</h2>
          <p className="text-sm text-slate-500 mb-8 font-medium">Please enter your details to continue</p>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 justify-center">
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-6">
              <div className="flex flex-col gap-1">
                <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  Email or Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={form.identifier}
                  onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                  className="w-full border-b-2 border-slate-200 py-2 text-sm font-medium text-slate-900 focus:outline-none focus:border-brand-600 transition-colors bg-transparent"
                  placeholder="Enter your email or phone"
                  style={{ borderBottomColor: form.identifier ? config.primaryColor : undefined }}
                />
              </div>

              <div className="flex flex-col gap-1 relative">
                <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full border-b-2 border-slate-200 py-2 pr-8 text-sm font-medium text-slate-900 focus:outline-none focus:border-brand-600 transition-colors bg-transparent"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <Link href="/forgot-password" className="absolute right-0 top-0 text-brand-600 text-xs font-bold hover:underline">
                  Forgot?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || configLoading}
              className="w-full text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md flex justify-center items-center gap-2 mt-10 active:scale-[0.98] disabled:opacity-70"
              style={{ backgroundColor: config.primaryColor }}
            >
              {configLoading
                ? <><Loader2 size={16} className="animate-spin" /> Loading...</>
                : loading
                ? <><Loader2 size={16} className="animate-spin" /> Signing In...</>
                : "Sign In"}
            </button>
            
            <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Demo Credentials</p>
              <div className="text-xs text-slate-500 font-medium space-y-1">
                <p>Admin: admin@shopnest.com / admin123</p>
                <p>Customer: user@shopnest.com / user123</p>
              </div>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 font-medium">
              New to {config.storeName}?{" "}
              <Link href="/register" className="font-bold hover:underline" style={{ color: config.primaryColor }}>
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center"><Loader2 className="animate-spin text-brand-600 mb-4" size={40} /><p className="text-slate-500 font-medium animate-pulse">Initializing Store...</p></div>}>
      <LoginContent />
    </Suspense>
  );
}
