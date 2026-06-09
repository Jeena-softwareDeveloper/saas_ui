"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  id: string;
  label: string;
  link: string;
  categoryId: string | null;
}

export default function MenuBar({ menus }: { menus: MenuItem[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  if (!menus || menus.length === 0) return null;

  const currentCategory = searchParams.get("category");

  const isActive = (item: MenuItem) => {
    if (item.categoryId) {
      return pathname === "/products" && currentCategory && item.link.includes(currentCategory);
    }
    return pathname === item.link || pathname.startsWith(item.link.split("?")[0] + "/");
  };

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeft(scrollLeft > 10);
    setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Left fade + arrow */}
        {showLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-start z-10 bg-gradient-to-r from-white to-transparent pointer-events-none">
            <button
              onClick={() => scroll("left")}
              className="pointer-events-auto ml-1 w-6 h-6 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
          </div>
        )}

        {/* Scrollable menu */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2"
        >
          {menus.map((item) => (
            <Link
              key={item.id}
              href={item.link}
              className={cn(
                "flex-none px-4 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all duration-200",
                isActive(item)
                  ? "bg-brand-700 text-white shadow-sm"
                  : "text-slate-600 hover:text-brand-700 hover:bg-brand-50"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right fade + arrow */}
        {showRight && menus.length > 6 && (
          <div className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-end z-10 bg-gradient-to-l from-white to-transparent pointer-events-none">
            <button
              onClick={() => scroll("right")}
              className="pointer-events-auto mr-1 w-6 h-6 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
