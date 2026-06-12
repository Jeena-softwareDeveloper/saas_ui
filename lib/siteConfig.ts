import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./authStore";

interface SiteConfig {
  storeName: string;
  logoUrl: string | null;
  primaryColor: string;
  footerColor: string;
  storePhone: string;
  storeEmail: string;
  storeAddress: string;
  fontFamily: string;
  usp1: string;
  usp2: string;
  usp3: string;
}

interface SiteConfigStore {
  config: SiteConfig;
  isLoading: boolean;
  error: string | null;
  setConfig: (c: Partial<SiteConfig>) => void;
  applyTheme: () => void;
  fetchConfig: () => Promise<void>;
}

const DEFAULT: SiteConfig = {
  storeName: "",
  logoUrl: null,
  primaryColor: "#e11955",
  footerColor: "#0f172a",
  storePhone: "",
  storeEmail: "",
  storeAddress: "",
  fontFamily: "Inter",
  usp1: "Free Delivery on orders above ₹499",
  usp2: "100% Natural & Chemical Free",
  usp3: "Secure Payment | 14 Days Easy Returns",
};

export const useSiteConfig = create<SiteConfigStore>()(
  persist(
    (set, get) => ({
      config: DEFAULT,
      isLoading: true,
      error: null,
      setConfig: (c) => {
        set((s) => ({ config: { ...s.config, ...c } }));
        get().applyTheme();
      },
      applyTheme: () => {
        const { primaryColor, footerColor, fontFamily } = get().config;
        if (typeof document !== "undefined") {
          document.documentElement.style.setProperty("--color-brand-600", primaryColor);
          document.documentElement.style.setProperty("--color-brand-500", primaryColor);
          document.documentElement.style.setProperty("--color-brand-700", shadeColor(primaryColor, -20));
          document.documentElement.style.setProperty("--color-footer-bg", footerColor || "#0f172a");

          if (fontFamily) {
            let fontLink = document.getElementById("dynamic-store-font") as HTMLLinkElement;
            const fontUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, "+")}:wght@400;500;600;700&display=swap`;
            if (!fontLink) {
              fontLink = document.createElement("link");
              fontLink.id = "dynamic-store-font";
              fontLink.rel = "stylesheet";
              document.head.appendChild(fontLink);
            }
            fontLink.href = fontUrl;
            document.documentElement.style.setProperty("--font-sans", `"${fontFamily}", sans-serif`);
            document.body.style.fontFamily = `"${fontFamily}", sans-serif`;
          }
        }
      },
      fetchConfig: async () => {
        set({ isLoading: true });
        try {
          let headers: any = {};
          const authUser = useAuthStore.getState().user;
          if (authUser?.tenantSlug) {
            headers["x-tenant-slug"] = authUser.tenantSlug;
          } else if (typeof window !== "undefined") {
            const hostname = window.location.hostname;
            if (hostname && !hostname.includes("localhost") && !hostname.includes("127.0.0.1")) {
              const parts = hostname.split(".");
              if (parts.length > 0) headers["x-tenant-slug"] = parts[0];
            }
          }
          // Always include the store key so the backend resolves the right tenant
          if (process.env.NEXT_PUBLIC_STORE_KEY) {
            headers["x-store-key"] = process.env.NEXT_PUBLIC_STORE_KEY;
          }
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          const res = await fetch(`${apiUrl}/store/theme`, {
            method: "GET",
            cache: "no-store",
            headers,
          });
          if (res.ok) {
            const text = await res.text();
            let json;
            try {
              json = JSON.parse(text);
            } catch (e) {
              try {
                const { decrypt } = require("./crypto");
                const decryptedText = decrypt(text);
                
                // If it is still encrypted (i.e. wrong key), it will fail to parse
                if (decryptedText.startsWith("U2FsdGVk")) {
                  set({ config: DEFAULT, error: "Invalid Encryption Key. Please check your .env settings." });
                  get().applyTheme();
                  set({ isLoading: false });
                  return;
                }
                json = JSON.parse(decryptedText);
              } catch (decryptionError) {
                set({ config: DEFAULT, error: "Invalid Encryption Key. Please check your .env settings." });
                get().applyTheme();
                set({ isLoading: false });
                return;
              }
            }
            const data = json.data;
            if (data) {
              set((s) => ({
                config: {
                  ...s.config,
                  storeName: data.storeName || s.config.storeName,
                  logoUrl: data.logoUrl !== undefined ? data.logoUrl : s.config.logoUrl,
                  primaryColor: data.primaryColor || s.config.primaryColor,
                  footerColor: data.footerColor || s.config.footerColor,
                  fontFamily: data.fontFamily || s.config.fontFamily,
                  storePhone: data.storePhone !== undefined ? data.storePhone : s.config.storePhone,
                  storeEmail: data.storeEmail !== undefined ? data.storeEmail : s.config.storeEmail,
                  storeAddress: data.storeAddress !== undefined ? data.storeAddress : s.config.storeAddress,
                  usp1: data.usp1 || s.config.usp1,
                  usp2: data.usp2 || s.config.usp2,
                  usp3: data.usp3 || s.config.usp3,
                },
                error: null, // Clear any previous errors on success
              }));
              get().applyTheme();
            }
          } else {
            // Try to extract the error message from the backend response
            let errorMsg = "Store Unavailable";
            try {
              const text = await res.text();
              const json = JSON.parse(text);
              if (json.message) errorMsg = json.message;
            } catch (e) {}

            // If the backend rejects the request (e.g. 401 Invalid Store Key or 404 Not Found),
            // reset the theme to the default common screen and set the exact error message.
            set({ config: DEFAULT, error: errorMsg });
            get().applyTheme();
          }
        } catch (e) {
          // Reset to default on network errors as well
          set({ config: DEFAULT, error: "Network Error or Store Unavailable" });
          get().applyTheme();
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    { name: "site-config" }
  )
);

/** Lighten or darken a hex color by percent */
function shadeColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent * 2));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent * 2));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent * 2));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}
