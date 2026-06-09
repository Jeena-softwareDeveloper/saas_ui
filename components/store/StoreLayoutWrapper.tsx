"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSiteConfig } from "@/lib/siteConfig";
import MenuBar from "@/components/store/MenuBar";
import StoreRouteTracker from "./StoreRouteTracker";

export default function StoreLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [themeLoaded, setThemeLoaded] = useState(false);
  const [storeValid, setStoreValid] = useState(false);
  const [menus, setMenus] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        let tenantSlug = "";
        
        // Check for preview parameter first
        const params = new URLSearchParams(window.location.search);
        const previewSlug = params.get("previewTenantSlug");

        if (previewSlug) {
          tenantSlug = previewSlug;
        } else {
          const host = window.location.host;
          if (host !== "localhost:3000" && host !== "127.0.0.1:3000") {
            const parts = host.split(".");
            if (parts.length > 0) {
              tenantSlug = parts[0];
            }
          }
        }

        const headers: any = tenantSlug ? { "x-tenant-slug": tenantSlug } : {};
        if (process.env.NEXT_PUBLIC_STORE_KEY) {
          headers["x-store-key"] = process.env.NEXT_PUBLIC_STORE_KEY;
        }

        if (!tenantSlug && !process.env.NEXT_PUBLIC_STORE_KEY) {
          console.error("No Store API Key or Tenant Slug found.");
          setStoreValid(false);
          setThemeLoaded(true);
          return;
        }

        // Fetch theme AND menus in parallel
        const [themeRes, menusRes] = await Promise.allSettled([
          fetch(`${apiUrl}/store/theme`, { headers }),
          fetch(`${apiUrl}/store/menus`, { headers }),
        ]);

        // Process menus
        if (menusRes.status === "fulfilled" && menusRes.value.ok) {
          try {
            const menusText = await menusRes.value.text();
            let menusJson: any;
            try {
              const { decrypt } = require("../../lib/crypto");
              menusJson = JSON.parse(decrypt(menusText));
            } catch {
              menusJson = JSON.parse(menusText);
            }
            if (menusJson?.data) setMenus(menusJson.data);
          } catch {}
        }

        // Process theme
        let isValid = false;
        if (themeRes.status === "fulfilled" && themeRes.value.ok) {
          const text = await themeRes.value.text();
          let json;
          let isDecrypted = false;
          try {
            const { decrypt } = require("../../lib/crypto");
            json = JSON.parse(decrypt(text));
            isDecrypted = true;
          } catch (e) {
            console.error("Store config decryption failed.");
          }
          
          if (isDecrypted && json?.data) {
            isValid = true;
            const data = json.data;
            const primary = data.primaryColor;
            
            const root = document.documentElement;
            root.style.setProperty('--color-brand-50', `color-mix(in srgb, ${primary} 5%, transparent)`);
            root.style.setProperty('--color-brand-100', `color-mix(in srgb, ${primary} 10%, transparent)`);
            root.style.setProperty('--color-brand-200', `color-mix(in srgb, ${primary} 20%, transparent)`);
            root.style.setProperty('--color-brand-500', primary);
            root.style.setProperty('--color-brand-600', primary);
            root.style.setProperty('--color-brand-700', data.secondaryColor || primary);

            useSiteConfig.getState().setConfig({
              storeName: data.storeName,
              logoUrl: data.logoUrl,
              primaryColor: primary,
              footerColor: data.footerColor,
              storePhone: data.storePhone,
              storeEmail: data.storeEmail,
              storeAddress: data.storeAddress,
              usp1: data.usp1,
              usp2: data.usp2,
              usp3: data.usp3,
            });
          }
        }
        setStoreValid(isValid);
      } catch (err) {
        console.error("Failed to load store data", err);
      } finally {
        setThemeLoaded(true);
        useSiteConfig.setState({ isLoading: false });
      }
    }

    fetchData();
  }, []);

  if (!themeLoaded) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
        {/* Navbar Skeleton */}
        <div className="w-full h-16 md:h-20 border-b border-gray-100 bg-white flex items-center justify-between px-4 md:px-8">
          <div className="w-32 h-8 bg-gray-200 rounded animate-pulse" />
          <div className="hidden md:flex gap-6">
            <div className="w-16 h-4 bg-gray-100 rounded animate-pulse" />
            <div className="w-16 h-4 bg-gray-100 rounded animate-pulse" />
            <div className="w-16 h-4 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse" />
            <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse" />
          </div>
        </div>

        {/* MenuBar Skeleton */}
        <div className="w-full h-9 border-b border-gray-100 bg-white flex items-center gap-3 px-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-20 h-5 bg-gray-100 rounded-full animate-pulse" />
          ))}
        </div>
        
        {/* Main Content Skeleton */}
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-8">
          {/* Banner Skeleton */}
          <div className="w-full h-48 md:h-80 bg-gray-100 rounded-2xl animate-pulse" />
          
          {/* Categories Skeleton */}
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gray-100 animate-pulse shrink-0" />
            ))}
          </div>

          {/* Products Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="w-full aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!storeValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 flex-col gap-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Store Not Found</h1>
        <p className="text-slate-500">The store you are looking for does not exist or has an invalid configuration.</p>
      </div>
    );
  }

  return (
    <>
      {menus.length > 0 && (
        <Suspense fallback={null}>
          <MenuBar menus={menus} />
        </Suspense>
      )}
      <StoreRouteTracker />
      {children}
    </>
  );
}
