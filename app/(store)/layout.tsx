import StoreNavbar from "@/components/store/StoreNavbar";
import ScrollToTop from "@/components/store/ScrollToTop";
import StoreLayoutWrapper from "@/components/store/StoreLayoutWrapper";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <StoreLayoutWrapper>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <StoreNavbar />
        <ScrollToTop />
        <main className="flex-1">{children}</main>
      </div>
    </StoreLayoutWrapper>
  );
}
