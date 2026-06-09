"use client";

import React from "react";
import Link from "next/link";
import { Leaf, Heart, ShieldAlert, Sparkles, ChevronRight, Activity, Globe, Smile } from "lucide-react";

export default function WhyOrganicPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 select-none animate-fade-in">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/40 via-white to-transparent py-16 md:py-24 border-b border-emerald-100/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-200/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-200/10 blur-2xl rounded-full pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-full mb-6">
            <Leaf size={12} className="text-emerald-600" /> Healthy Living Guides
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Why Choose <span className="text-emerald-700 font-extrabold">Organic</span> Living?
          </h1>
          <p className="text-slate-500 text-sm md:text-base font-medium mt-6 leading-relaxed max-w-2xl mx-auto">
            Choosing organic is not just about changing your food; it's a conscious choice to support ecological balance, biodiverse ecosystems, and chemical-free wellness.
          </p>
        </div>
      </section>

      {/* Main Core Benefits Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-extrabold text-slate-800">The Core Benefits</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">For your body, family, and earth</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Activity className="text-emerald-600" size={24} />,
              title: "Nutrient Rich Quality",
              desc: "Organic crops are grown in mineral-rich soil using compost instead of chemicals. This yields vegetables with higher vitamin levels and rich antioxidants.",
              color: "bg-emerald-50/50 border-emerald-100/50",
            },
            {
              icon: <Globe className="text-blue-600" size={24} />,
              title: "Regenerate the Earth",
              desc: "Organic farming avoids toxic pesticide runoff that damages aquifers. It builds soil humus, locks carbon, and protects honeybees and soil microbes.",
              color: "bg-blue-50/50 border-blue-100/50",
            },
            {
              icon: <Smile className="text-amber-600" size={24} />,
              title: "100% Pesticide Free",
              desc: "Conventional food contains invisible residues of organophosphates and chemical sprays. Organic certified foods guarantee zero toxic chemical load.",
              color: "bg-amber-50/50 border-amber-100/50",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`bg-white border rounded-3xl p-8 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow duration-300 flex flex-col items-start ${item.color}`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-6">
                {item.icon}
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm mb-3">{item.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Table Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-10 shadow-[0_4px_20px_-6px_rgba(0,0,0,0.04)]">
          <div className="text-center mb-8">
            <h3 className="text-lg md:text-xl font-extrabold text-slate-800">Organic vs. Conventional</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Let's check the differences</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Feature</th>
                  <th className="py-3 px-4 text-emerald-700 bg-emerald-50/50 rounded-t-lg">Organic Certified</th>
                  <th className="py-3 px-4 text-slate-600">Conventional Food</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-600">
                {[
                  {
                    feature: "Pesticides & Sprays",
                    organic: "Strictly prohibited (Uses biological neem sprays)",
                    conventional: "Synthetic organophosphates & chemical sprays allowed",
                  },
                  {
                    feature: "Fertilizer Sourcing",
                    organic: "Compost manure, green foliage, crop rotation",
                    conventional: "Synthetic NPK powders & urea chemical inputs",
                  },
                  {
                    feature: "Hormones & GMOs",
                    organic: "100% natural heritage strains, zero GMO seeds",
                    conventional: "Chemical growth stimulants & genetically modified seeds",
                  },
                  {
                    feature: "Nutrient Profiles",
                    organic: "Typically 20-30% higher active antioxidants",
                    conventional: "Water-diluted mass production with lower trace minerals",
                  },
                  {
                    feature: "Earth Ecosystems",
                    organic: "Saves earthworms, protects bees, rebuilds topsoil",
                    conventional: "Kills beneficial insects, leads to fertilizer runoff",
                  },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800">{row.feature}</td>
                    <td className="py-3.5 px-4 text-emerald-800 font-bold bg-emerald-50/30">{row.organic}</td>
                    <td className="py-3.5 px-4 text-slate-500">{row.conventional}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Trust & Guarantee banner */}
      <section className="max-w-4xl mx-auto px-4 mt-20 text-center">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-3xl p-8 md:p-12 shadow-xl shadow-emerald-600/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full pointer-events-none"></div>
          
          <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
            Certified Organic. Pesticide Free. Lab Tested.
          </h2>
          <p className="text-emerald-50 text-xs md:text-sm font-medium mt-4 max-w-xl mx-auto leading-relaxed">
            All our categories undergo stringent quality controls to ensure they are completely free from synthetic pesticides, adulteration, or genetic modification.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              Explore Products <ChevronRight size={14} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
