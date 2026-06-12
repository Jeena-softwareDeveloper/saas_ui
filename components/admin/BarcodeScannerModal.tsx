"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, ScanLine, Package, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { adminService } from "@/services/admin.service";
import { formatPrice } from "@/lib/utils";

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BarcodeScannerModal({ isOpen, onClose }: BarcodeScannerModalProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<any>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  const startScanner = useCallback(async () => {
    if (typeof window === "undefined") return;
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode("barcode-scanner-reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 260, height: 120 },
          aspectRatio: 1.5,
        },
        async (decodedText: string) => {
          if (decodedText === lastScanned) return;
          setLastScanned(decodedText);
          setLoading(true);
          setError(null);

          try {
            const res = await adminService.scanProductByBarcode(decodedText);
            setResult(res.data.data);
          } catch {
            setError(`No product found for barcode: "${decodedText}"`);
            setResult(null);
          } finally {
            setLoading(false);
          }
        },
        () => {} // error callback - ignore frame errors
      );
      setScanning(true);
    } catch (err: any) {
      setError("Camera access denied or not available. Please allow camera permissions.");
    }
  }, [lastScanned]);

  const stopScanner = useCallback(async () => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      }
    } catch { /* ignore */ }
    setScanning(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setResult(null);
      setError(null);
      setLastScanned(null);
      setTimeout(() => startScanner(), 300);
    } else {
      stopScanner();
    }
    return () => { stopScanner(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleReset = async () => {
    setResult(null);
    setError(null);
    setLastScanned(null);
    if (!scanning) {
      await startScanner();
    }
  };

  if (!isOpen) return null;

  const product = result?.product;
  const matchedVariant = result?.type === "variant" ? result.variant : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-[420px] max-h-[90vh] overflow-y-auto flex flex-col relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#9c001f]/10 flex items-center justify-center">
              <ScanLine size={16} className="text-[#9c001f]" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Barcode Scanner</p>
              <p className="text-[11px] text-slate-500">Point camera at a product barcode</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Camera view */}
        <div className="p-4">
          <div
            id="barcode-scanner-reader"
            ref={videoRef}
            className="rounded-xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-900 min-h-[200px]"
          />
          {scanning && (
            <div className="flex items-center justify-center gap-1.5 mt-2 text-[11px] text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Scanner active — aim at barcode
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="mx-4 mb-4 p-3 bg-blue-50 rounded-xl flex items-center gap-2 text-sm text-blue-700">
            <RefreshCw size={14} className="animate-spin" /> Looking up product...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mx-4 mb-4 p-3 bg-red-50 rounded-xl flex items-start gap-2 text-xs text-red-700">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <div>
              <p>{error}</p>
              <button onClick={handleReset} className="mt-1.5 font-bold underline">Scan again</button>
            </div>
          </div>
        )}

        {/* Result */}
        {product && (
          <div className="mx-4 mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-2">
              <CheckCircle2 size={15} /> Product Found!
            </div>

            {/* Product image + name */}
            <div className="flex items-center gap-3">
              {product.images?.[0]?.imageUrl ? (
                <img src={product.images[0].imageUrl} className="w-14 h-14 rounded-lg object-cover border border-slate-200" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                  <Package size={20} className="text-slate-300" />
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-slate-900">{product.name}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{product.category?.name}</p>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">SKU: {product.sku || "—"}</p>
              </div>
            </div>

            {/* Highlighted variant if scanned variant SKU */}
            {matchedVariant && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2.5 text-xs">
                <p className="font-bold text-indigo-800 mb-1">Matched Variant: {matchedVariant.variantName}</p>
                <div className="grid grid-cols-3 gap-2 text-indigo-700">
                  <div><span className="text-[10px] text-indigo-500">Price</span><br/><span className="font-bold">{formatPrice(matchedVariant.price)}</span></div>
                  <div><span className="text-[10px] text-indigo-500">Stock</span><br/><span className="font-bold">{matchedVariant.stockQuantity}</span></div>
                  <div><span className="text-[10px] text-indigo-500">SKU</span><br/><span className="font-mono">{matchedVariant.sku || "—"}</span></div>
                </div>
              </div>
            )}

            {/* All variants */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                  All Variants ({product.variants.length})
                </p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {product.variants.map((v: any) => (
                    <div
                      key={v.id}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs ${
                        matchedVariant?.id === v.id
                          ? "bg-indigo-100 border border-indigo-300"
                          : "bg-white border border-slate-100"
                      }`}
                    >
                      <div>
                        <span className="font-bold text-slate-800">{v.variantName}</span>
                        {v.sku && <span className="text-slate-400 font-mono ml-1.5 text-[10px]">{v.sku}</span>}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{formatPrice(v.price)}</p>
                        <p className={`text-[10px] ${v.stockQuantity === 0 ? "text-red-500" : "text-slate-500"}`}>
                          {v.stockQuantity === 0 ? "Out of stock" : `${v.stockQuantity} units`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleReset}
              className="w-full mt-1 py-2 rounded-xl border border-emerald-300 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors"
            >
              Scan Another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
