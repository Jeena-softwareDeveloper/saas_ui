"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle, Loader2 } from "lucide-react";
import { useSiteConfig } from "@/lib/siteConfig";

export default function ContactPage() {
  const { config: siteConfig } = useSiteConfig();
  
  // State for contact form
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    
    // Simulate API request
    setTimeout(() => {
      setSending(false);
      setSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSuccess(false), 5000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 select-none animate-fade-in">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/40 via-white to-transparent py-16 border-b border-brand-100/20">
        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 border border-brand-100 text-brand-600 text-[10px] font-black uppercase tracking-wider rounded-full mb-6">
            <MessageSquare size={12} /> Get In Touch
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Contact <span className="text-brand-600 font-extrabold">Our Team</span>
          </h1>
          <p className="text-slate-500 text-sm md:text-base font-medium mt-6 leading-relaxed max-w-xl mx-auto">
            Have questions about our certification standards, orders, or wholesale collaborations? Send us a message and we'll reply within 24 hours.
          </p>
        </div>
      </section>

      {/* Info & Form Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact Info Cards (Left Column) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)] flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center shrink-0">
              <Phone size={18} />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-1">Call Us</h4>
              <p className="text-slate-500 text-sm font-semibold">{siteConfig.storePhone || "+91 98765 43210"}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Mon - Sat, 9am to 6pm</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)] flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Mail size={18} />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-1">Email Support</h4>
              <p className="text-slate-500 text-sm font-semibold">support@shopnest.com</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Always open for queries</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)] flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <MapPin size={18} />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-1">Our Office</h4>
              <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                123 Commerce Street, <br />
                Mumbai, Maharashtra 400001
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form Card (Right Columns) */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-8 shadow-[0_4px_20px_-6px_rgba(0,0,0,0.03)]">
          <h2 className="text-lg font-extrabold text-slate-800 mb-6">Send A Message</h2>
          
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 mb-6 flex items-center gap-3 animate-fade-in">
              <CheckCircle className="text-emerald-600 shrink-0" size={20} />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">Message Sent Successfully!</p>
                <p className="text-[10.5px] text-emerald-700/80 font-medium mt-0.5">Thank you for writing. Our support representative will contact you shortly.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label text-[10px] uppercase font-bold tracking-wider text-slate-400">Full Name</label>
                <input
                  type="text"
                  required
                  className="input mt-1"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="label text-[10px] uppercase font-bold tracking-wider text-slate-400">Email Address</label>
                <input
                  type="email"
                  required
                  className="input mt-1"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label className="label text-[10px] uppercase font-bold tracking-wider text-slate-400">Subject</label>
              <input
                type="text"
                required
                className="input mt-1"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Product Inquiry / Order Issue..."
              />
            </div>

            <div>
              <label className="label text-[10px] uppercase font-bold tracking-wider text-slate-400">Message</label>
              <textarea
                required
                className="input min-h-[140px] mt-1 resize-none"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe your query in detail..."
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={sending}
                className="btn-primary inline-flex items-center gap-2 bg-brand-600 text-white hover:bg-brand-700 px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send size={14} /> Send Message
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </section>
    </div>
  );
}
