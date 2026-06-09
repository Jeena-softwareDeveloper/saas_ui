"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import api from "@/lib/api";

const getSessionId = () => {
  if (typeof window === "undefined") return "";
  let sid = localStorage.getItem('log_session_id');
  if (!sid) {
    sid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('log_session_id', sid);
  }
  return sid;
};

export function RouteTracker() {
  const pathname = usePathname();
  const currentPathRef = useRef<string>(pathname || "");

  useEffect(() => {
    const sessionId = getSessionId();
    if (!sessionId || !pathname) return;

    if (currentPathRef.current !== pathname) {
      api.post("/store/track", {
        sessionId, action: "LEAVE", entity: "Page", details: { path: currentPathRef.current }
      }).catch(() => {});
    }

    currentPathRef.current = pathname;

    api.post("/store/track", {
      sessionId, action: "ENTER", entity: "Page", details: { path: currentPathRef.current }
    }).catch(() => {});
  }, [pathname]);

  useEffect(() => {
    const sessionId = getSessionId();
    if (!sessionId) return;
    
    const interval = setInterval(() => {
      api.post("/store/track", {
        sessionId, action: "PING", entity: "Page", details: { path: currentPathRef.current }
      }).catch(() => {});
    }, 5000);

    return () => {
      clearInterval(interval);
      api.post("/store/track", {
        sessionId, action: "LEAVE", entity: "Page", details: { path: currentPathRef.current }
      }).catch(() => {});
    };
  }, []);

  return null;
}
