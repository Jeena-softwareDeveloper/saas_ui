"use client";

import React, { useRef } from "react";
import { useSiteConfig } from "@/lib/siteConfig";

export default function SiteConfigProvider({ 
  serverConfig, 
  children 
}: { 
  serverConfig: any; 
  children: React.ReactNode;
}) {
  const initialized = useRef(false);
  
  // Synchronously initialize the Zustand store during the very first render (Hydration)
  if (!initialized.current && serverConfig) {
    useSiteConfig.getState().setConfig({
      storeName: serverConfig.storeName,
      logoUrl: serverConfig.logoUrl,
      primaryColor: serverConfig.primaryColor,
      footerColor: serverConfig.footerColor,
      storePhone: serverConfig.storePhone,
      storeEmail: serverConfig.storeEmail,
      storeAddress: serverConfig.storeAddress,
      usp1: serverConfig.usp1,
      usp2: serverConfig.usp2,
      usp3: serverConfig.usp3,
    });
    // Let's also mark isLoading as false since we already have the data
    useSiteConfig.setState({ isLoading: false });
    initialized.current = true;
  }
  
  return <>{children}</>;
}
