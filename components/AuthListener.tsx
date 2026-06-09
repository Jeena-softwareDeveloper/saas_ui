"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/authStore";
import { useRouter } from "next/navigation";

const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export function AuthListener() {
  const { refreshToken, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!refreshToken) return;

    const checkToken = () => {
      const decoded = parseJwt(refreshToken);
      if (decoded && decoded.exp) {
        // exp is in seconds, Date.now() is in ms
        const expirationTime = decoded.exp * 1000;
        const currentTime = Date.now();
        
        // If expired
        if (currentTime >= expirationTime) {
          logout();
          router.push("/login?error=Session+Expired");
        }
      }
    };

    // Check immediately on mount
    checkToken();

    // Check every 5 seconds
    const interval = setInterval(checkToken, 5000);

    return () => clearInterval(interval);
  }, [refreshToken, logout, router]);

  return null;
}
