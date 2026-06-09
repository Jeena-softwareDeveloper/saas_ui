import axios from "axios";
import { useAuthStore } from "./authStore";

const getTenantKey = (): string | undefined => {
  return process.env.NEXT_PUBLIC_DECRYPTION_KEY || undefined;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (process.env.NEXT_PUBLIC_STORE_KEY) {
      config.headers["x-store-key"] = process.env.NEXT_PUBLIC_STORE_KEY;
    } else {
      const hostname = window.location.hostname;
      const localDomains = process.env.NEXT_PUBLIC_LOCAL_DOMAINS?.split(",") || ["localhost", "127.0.0.1"];
      if (!localDomains.includes(hostname)) {
        const parts = hostname.split(".");
        if (parts.length > 0) {
          config.headers["x-store-key"] = parts[0];
        }
      }
    }
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === "string") {
      try {
        const { decrypt } = require("./crypto");
        const decryptedString = decrypt(response.data, getTenantKey());
        
        if (decryptedString && (decryptedString.startsWith("{") || decryptedString.startsWith("["))) {
          response.data = JSON.parse(decryptedString);
        } else if (response.data.startsWith("U2FsdGVk")) {
          // Decryption failed
          useAuthStore.getState().logout();
          if (typeof window !== "undefined" && !window.location.pathname.includes('/login')) {
            window.location.href = "/login?error=Decryption+failed.+Please+update+your+Encryption+Key.";
          }
          return Promise.reject({ response: { data: { message: "Invalid Encryption Key" } } });
        }
      } catch (err) {
        useAuthStore.getState().logout();
        if (typeof window !== "undefined" && !window.location.pathname.includes('/login')) {
          window.location.href = "/login?error=Decryption+failed.+Please+update+your+Encryption+Key.";
        }
        return Promise.reject({ response: { data: { message: "Invalid Encryption Key" } } });
      }
    }
    return response;
  },
  
  async (error) => {
    if (error.response?.data?.message === 'Invalid Store API Key' || error.response?.data?.error === 'Invalid Store API Key') {
      useAuthStore.getState().logout();
      if (typeof window !== "undefined" && !window.location.pathname.includes('/login')) {
        localStorage.removeItem("site-config");
        window.location.href = "/login?error=Invalid+Store+API+Key";
      }
      return Promise.reject(error);
    }

    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken }
        );

        let decryptedData = data;
        if (decryptedData && typeof decryptedData === "string") {
          const { decrypt } = require("./crypto");
          const decryptedString = decrypt(decryptedData, getTenantKey());
          decryptedData = JSON.parse(decryptedString);
        }

        const user = useAuthStore.getState().user;
        if (user) {
          useAuthStore.getState().login(user, decryptedData.data.accessToken, decryptedData.data.refreshToken);
        } else {
          localStorage.setItem("accessToken", decryptedData.data.accessToken);
          localStorage.setItem("refreshToken", decryptedData.data.refreshToken);
        }
        original.headers.Authorization = `Bearer ${decryptedData.data.accessToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
