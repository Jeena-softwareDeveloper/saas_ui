"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { X, Printer } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface BarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  barcode: string;       // The barcode value (SKU or barcode field)
  productName: string;
  sku?: string;
  price?: number | null;
}

export function BarcodeModal({ isOpen, onClose, barcode, productName, sku, price }: BarcodeModalProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (isOpen && svgRef.current && barcode) {
      try {
        JsBarcode(svgRef.current, barcode, {
          format: "CODE128",
          lineColor: "#1e293b",
          width: 2.5,
          height: 80,
          displayValue: true,
          fontSize: 13,
          margin: 10,
          background: "#ffffff",
        });
      } catch (e) {
        // fallback — barcode value might be invalid
        console.warn("Barcode render failed:", e);
      }
    }
  }, [isOpen, barcode]);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=400,height=300");
    if (!printWindow) return;
    const svgHtml = svgRef.current?.outerHTML || "";
    printWindow.document.write(`
      <html>
        <head>
          <title>Barcode - ${productName}</title>
          <style>
            body { margin: 0; padding: 20px; font-family: sans-serif; text-align: center; background: #fff; }
            .name { font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
            .sku  { font-size: 11px; color: #64748b; margin-bottom: 4px; }
            .price { font-size: 16px; font-weight: 800; color: #9c001f; }
            svg { max-width: 100%; }
          </style>
        </head>
        <body>
          <div class="name">${productName}</div>
          ${sku ? `<div class="sku">SKU: ${sku}</div>` : ""}
          ${price != null ? `<div class="price">₹${Number(price).toFixed(2)}</div>` : ""}
          ${svgHtml}
          <script>window.onload = () => { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 w-[360px] flex flex-col items-center gap-4 relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="text-center">
          <p className="text-sm font-bold text-slate-900 truncate max-w-[280px]">{productName}</p>
          {sku && <p className="text-xs text-slate-500 font-mono mt-0.5">SKU: {sku}</p>}
          {price != null && <p className="text-base font-extrabold text-[#9c001f] mt-1">{formatPrice(price)}</p>}
        </div>

        {/* Barcode SVG */}
        <div className="border border-slate-100 rounded-xl p-3 bg-white w-full flex justify-center">
          <svg ref={svgRef} />
        </div>

        <button
          onClick={handlePrint}
          className="w-full flex items-center justify-center gap-2 bg-[#9c001f] hover:bg-[#7a0018] text-white py-2.5 rounded-xl text-sm font-bold transition-colors"
        >
          <Printer size={15} /> Print Barcode
        </button>
      </div>
    </div>
  );
}
