"use client";

import Link from "next/link";
import { Store, Mail, Phone, MapPin } from "lucide-react";
import { useSiteConfig } from "@/lib/siteConfig";
import { useEffect, useState } from "react";
import { storeService } from "@/services/store.service";

export default function StoreFooter() {
  const { config: siteConfig } = useSiteConfig();
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    storeService.getCategories().then(res => {
      if (res.data?.success) {
        setCategories(res.data.data);
      }
    }).catch(() => {});
  }, []);

  const storeName = mounted ? siteConfig.storeName : "";
  const storePhone = mounted ? siteConfig.storePhone : "";
  const storeEmail = mounted ? siteConfig.storeEmail : "";
  let storeAddress = "";
  if (mounted && siteConfig.storeAddress) {
    try {
      const parsed = JSON.parse(siteConfig.storeAddress);
      const parts = [
        parsed.street,
        parsed.city,
        parsed.district,
        parsed.state,
        parsed.pincode
      ].filter(Boolean);
      storeAddress = parts.join(", ");
    } catch(e) {
      storeAddress = siteConfig.storeAddress;
    }
  }
  const footerColor = mounted ? siteConfig.footerColor : "#374151";

  return (
    <footer
      className="text-slate-300 mt-16 transition-colors duration-300"
      style={{ backgroundColor: footerColor || "#374151" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <Store size={16} className="text-white" />
              </div>
              <span className="text-white font-bold text-lg">{storeName}</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Premium shopping experience with thousands of curated products delivered to your doorstep.
            </p>
            <div className="flex gap-3">
              {[
                { name: "Facebook", link: "#" },
                { name: "Twitter", link: "#" },
                { name: "Instagram", link: "#" },
                { name: "Youtube", link: "#" },
              ].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-brand-600 flex items-center justify-center transition-colors"
                >
                  <span className="text-xs font-bold">{Icon.name[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: "All Products", href: "/products" },
                { label: "My Orders", href: "/account/orders" },
                { label: "My Account", href: "/account" },
                { label: "Cart", href: "/cart" },
                { label: "Checkout", href: "/checkout" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-4">Categories</h4>
              <ul className="space-y-2">
                {categories.slice(0, 6).map(
                  (cat) => (
                    <li key={cat.id}>
                      <Link
                        href={`/products?category=${cat.slug}`}
                        className="text-sm hover:text-white transition-colors"
                      >
                        {cat.name}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              {storeAddress && (
                <li className="flex items-start gap-2 text-sm">
                  <MapPin size={15} className="mt-0.5 flex-shrink-0 text-brand-400" />
                  {storeAddress}
                </li>
              )}
              {storePhone && (
                <li className="flex items-center gap-2 text-sm">
                  <Phone size={15} className="flex-shrink-0 text-brand-400" />
                  {storePhone}
                </li>
              )}
              {storeEmail && (
                <li className="flex items-center gap-2 text-sm">
                  <Mail size={15} className="flex-shrink-0 text-brand-400" />
                  {storeEmail}
                </li>
              )}
            </ul>

            {/* Newsletter */}
            <div className="mt-4">
              <p className="text-sm text-white font-medium mb-2">Newsletter</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-l-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
                />
                <button className="px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm rounded-r-lg transition-colors">
                  Go
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
          <div className="flex gap-4">
            {["Privacy Policy", "Terms of Service", "Refund Policy"].map((l) => (
              <a key={l} href="#" className="text-xs text-slate-500 hover:text-white transition-colors">
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
