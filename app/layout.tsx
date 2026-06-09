import type { Metadata } from "next";
import "./globals.css";

import { headers } from "next/headers";
import { AuthListener } from "@/components/AuthListener";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost";
  
  let storeName = "";
  let tenantSlug = "";

  if (host !== "localhost" && host !== "127.0.0.1") {
    tenantSlug = host.split(".")[0];
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const headers: any = tenantSlug ? { "x-tenant-slug": tenantSlug } : {};
    if (process.env.NEXT_PUBLIC_STORE_KEY) {
      headers["x-store-key"] = process.env.NEXT_PUBLIC_STORE_KEY;
    }

    const res = await fetch(`${apiUrl}/store/theme`, {
      headers,
      next: { revalidate: 60 } // Cache for 60s
    });
    if (res.ok) {
      const text = await res.text();
      let json;
      try {
        // Theme endpoint returns plain JSON (no encryption)
        json = JSON.parse(text);
      } catch (e) {
        try {
          const { decrypt } = require("../lib/crypto");
          json = JSON.parse(decrypt(text));
        } catch {}
      }
      const data = json?.data;
      if (data?.storeName) storeName = data.storeName;
    }
  } catch (e) {}

  return {
    title: {
      template: storeName ? `%s | ${storeName}` : "%s",
      default: storeName ? `${storeName} — Premium E-Commerce Platform` : "Premium E-Commerce Platform",
    },
    description: storeName 
      ? `${storeName} is a modern e-commerce platform for discovering and purchasing premium products.`
      : "A modern e-commerce platform for discovering and purchasing premium products.",
    keywords: ["ecommerce", "shopping", "online store", "products"],
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: `https://${host}`,
      siteName: storeName || "E-Commerce",
    },
  };
}

import { RouteTracker } from "@/components/RouteTracker";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <AuthListener />
        <RouteTracker />
        {children}
      </body>
    </html>
  );
}
