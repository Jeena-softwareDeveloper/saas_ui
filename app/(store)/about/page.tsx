"use client";

import React from "react";
import Link from "next/link";
import { Leaf, Award, Heart, Users, ChevronRight, ShieldCheck } from "lucide-react";
import { useSiteConfig } from "@/lib/siteConfig";

export default function AboutPage() {
  const { config: siteConfig } = useSiteConfig();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 select-none animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/40 via-white to-transparent py-16 md:py-24 border-b border-brand-100/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-200/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-200/15 blur-2xl rounded-full pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 border border-brand-100 text-brand-600 text-[10px] font-black uppercase tracking-wider rounded-full mb-6">
            <Leaf size={12} /> About Our Store
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Crafting a Healthier Tomorrow with <span className="text-brand-600 font-extrabold">{siteConfig.storeName || "Jeenora"}</span>
          </h1>
          <p className="text-slate-500 text-sm md:text-base font-medium mt-6 leading-relaxed max-w-2xl mx-auto">
            We believe that good health begins with clean, nutrient-dense nutrition. Our mission is to bridge the gap between traditional organic farms and your family dinner table.
          </p>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-extrabold text-slate-800">Our Core Principles</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">What we stand for</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <Leaf size={24} />,
              title: "100% Chemical Free",
              desc: "Every product is sourced from farms using zero synthetic pesticides, fertilizers, or growth hormones.",
              color: "bg-emerald-50 text-emerald-600 border-emerald-100",
            },
            {
              icon: <Award size={24} />,
              title: "Quality Certified",
              desc: "Partnered with USDA Organic, FSSAI, and Jaivik Bharat to guarantee genuine biological purity.",
              color: "bg-amber-50 text-amber-600 border-amber-100",
            },
            {
              icon: <Heart size={24} />,
              title: "Freshness Guaranteed",
              desc: "Harvested fresh and packaged immediately using state of the art techniques to retain high nutrients.",
              color: "bg-rose-50 text-rose-600 border-rose-100",
            },
            {
              icon: <Users size={24} />,
              title: "Support Local Farms",
              desc: "Supporting small-scale domestic farmers with sustainable margins, promoting fair trade values.",
              color: "bg-blue-50 text-blue-600 border-blue-100",
            },
          ].map((v, i) => (
            <div
              key={i}
              className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow duration-300 flex flex-col items-center text-center group"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border mb-5 transition-transform duration-300 group-hover:scale-110 ${v.color}`}>
                {v.icon}
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm mb-2">{v.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story & Vision Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="bg-white border border-slate-100 rounded-3xl p-8 md:p-12 shadow-[0_4px_20px_-6px_rgba(0,0,0,0.04)] grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Rooted in Nature, <br />
              Nurtured with Clean Values.
            </h2>
            <div className="w-16 h-1.5 bg-brand-600 rounded-full"></div>
            <p className="text-slate-600 text-xs md:text-sm font-medium leading-relaxed">
              Founded with a desire to promote conscious eating habits, {siteConfig.storeName || "Jeenora"} began as a simple collaboration between passionate environmentalists and organic farmers. We discovered that by eliminating commercial middlemen, we could supply fresher produce at fair prices.
            </p>
            <p className="text-slate-600 text-xs md:text-sm font-medium leading-relaxed">
              Today, we serve thousands of health-conscious families nationwide, working only with verified organic cooperatives that practice regenerative soil cultivation and support bio-diversity.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 py-3 px-4 rounded-xl">
                <ShieldCheck className="text-brand-600" size={20} />
                <div>
                  <h4 className="font-extrabold text-slate-800 text-[11px] md:text-xs uppercase tracking-wider">Lab Tested</h4>
                  <p className="text-[10px] text-slate-400 font-medium">100% certified pesticide free</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 py-3 px-4 rounded-xl">
                <Leaf className="text-emerald-600" size={20} />
                <div>
                  <h4 className="font-extrabold text-slate-800 text-[11px] md:text-xs uppercase tracking-wider">Regenerative</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Eco-friendly agricultural process</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/50 shadow-sm flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=800&auto=format&fit=crop"
              alt="Harvesting organic vegetables"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 mt-20 text-center">
        <div className="bg-gradient-to-br from-brand-600 to-brand-700 text-white rounded-3xl p-8 md:p-12 shadow-xl shadow-brand-600/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full pointer-events-none"></div>
          
          <h2 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">
            Ready to taste the purity of organic farming?
          </h2>
          <p className="text-brand-50 text-xs md:text-sm font-medium mt-4 max-w-xl mx-auto leading-relaxed">
            Browse our wide selection of certified organic spices, fresh leafy greens, chemical-free honey, cold-pressed oils, and skincare essentials.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-white text-brand-600 hover:bg-brand-50 px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              Shop Now <ChevronRight size={14} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
