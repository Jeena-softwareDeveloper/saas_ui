"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const getSessionId = () => {
  let sid = localStorage.getItem("store_log_session_id");
  if (!sid) {
    sid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("store_log_session_id", sid);
  }
  return sid;
};

export default function StoreRouteTracker() {
  const pathname = usePathname();
  const currentPathRef = useRef<string>(pathname);
  const sessionId = typeof window !== "undefined" ? getSessionId() : "ssr";

  const trackActivity = async (action: string, path: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) return;

      let tenantSlug = "";
      const params = new URLSearchParams(window.location.search);
      const previewSlug = params.get("previewTenantSlug");

      if (previewSlug) {
        tenantSlug = previewSlug;
      } else {
        const host = window.location.host;
        if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
          const parts = host.split(":")[0].split(".");
          if (parts.length > 0) {
            tenantSlug = parts[0];
          }
        }
      }

      const headers: any = {
        "Content-Type": "application/json",
      };
      if (tenantSlug) {
        headers["x-tenant-slug"] = tenantSlug;
      }

      await fetch(`${apiUrl}/store/track`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          sessionId,
          action,
          entity: "Page",
          details: { path },
        }),
      });
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (currentPathRef.current !== pathname) {
      trackActivity("LEAVE", currentPathRef.current);
    }

    currentPathRef.current = pathname;
    trackActivity("ENTER", currentPathRef.current);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // PING interval removed as per request to stop the loop
    return () => {
      trackActivity("LEAVE", currentPathRef.current);
    };
  }, []);

  return null;
}
