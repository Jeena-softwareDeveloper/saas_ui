"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface BannerItem {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  description: string;
  link: string;
}

export default function PromoBanners({ banners = [] }: { banners?: any[] }) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  if (!banners || banners.length === 0) return null;
  const displayBanners = banners;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrollPosition = target.scrollLeft;
    const item = target.firstElementChild as HTMLElement;
    if (!item) return;
    const width = item.offsetWidth;
    const gap = 16;
    const index = Math.round(scrollPosition / (width + gap));
    if (index !== activeIndex && index >= 0 && index < displayBanners.length) {
      setActiveIndex(index);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDown(true);
    if (!scrollRef.current) return;
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const scrollLeftBy = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth;
    scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-6 relative group">

      {/* Pure Scroll-X Swipeable Container */}
      <div
        ref={scrollRef}
        className={cn(
          "flex overflow-x-auto no-scrollbar gap-4 scroll-smooth cursor-grab active:cursor-grabbing w-full pb-2 overscroll-x-contain",
          isDown ? "select-none" : ""
        )}
        style={{ scrollSnapType: "x mandatory" }}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {displayBanners.map((banner) => (
          <button
            key={banner.id}
            onClick={() => !isDown && router.push(banner.link || '#')}
            style={{ scrollSnapAlign: "center" }}
            className="w-full shrink-0 aspect-[16/9] md:aspect-[3/1] lg:aspect-[3.5/1] relative overflow-hidden rounded-2xl bg-slate-50 transition-all duration-300"
          >
            <img
              src={banner.imageUrl}
              alt={banner.title}
              className="w-full h-full object-cover pointer-events-none"
            />
            <span className="sr-only">{banner.title}</span>
          </button>
        ))}
      </div>

      {/* Navigation Arrows */}
      {displayBanners.length > 1 && (
        <>
          <button 
            onClick={(e) => { e.preventDefault(); scrollLeftBy('left'); }}
            className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/90 shadow-md rounded-full flex items-center justify-center text-slate-700 hover:bg-white hover:scale-110 transition-all z-10 opacity-0 group-hover:opacity-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); scrollLeftBy('right'); }}
            className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/90 shadow-md rounded-full flex items-center justify-center text-slate-700 hover:bg-white hover:scale-110 transition-all z-10 opacity-0 group-hover:opacity-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </>
      )}

      {/* Pagination dots */}
      <div className="flex justify-center items-center gap-1.5 mt-3">
        {displayBanners.map((_, index) => (
          <div
            key={index}
            className={cn(
              "transition-all duration-300 rounded-full h-1.5",
              activeIndex === index ? "w-6 bg-brand-700" : "w-1.5 bg-slate-200"
            )}
          />
        ))}
      </div>
    </section>
  );
}
