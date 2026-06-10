"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Upload, X, ArrowLeft, Check,
  Plus, Trash2, Edit2, Package, AlertCircle,
  Download, Image as ImageIcon
} from "lucide-react";
import { adminService } from "@/services/admin.service";
import { formatPrice } from "@/lib/utils";
import { SetAdminHeader } from "@/lib/adminHeaderContext";

export default function ProductFormPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const isNew = id === "new";
  const isEdit = !isNew;

  const [step, setStep] = useState<1 | 2 | 3>(isNew ? 1 : 2);
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);

  const [product, setProduct] = useState<any | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [variants, setVariants] = useState<any[]>([]);
  const [submittingVariant, setSubmittingVariant] = useState(false);
  const [deletingVariantId, setDeletingVariantId] = useState<string | null>(null);

  const emptyVariant = {
    variantName: "", sku: "", price: "", compareAtPrice: "", stockQuantity: "",
    weight: "", barcode: "", description: "", tags: "",
    gstPercentage: "0", shippingCharge: "0", codCharge: "0",
    isCodEnabled: true, isPublished: true, isFeatured: false,
  };
  const [newVariant, setNewVariant] = useState({ ...emptyVariant });
  const [variantFiles, setVariantFiles] = useState<File[]>([]);

  const handleGenerateIdentifiers = async () => {
    try {
      const res = await adminService.generateIdentifiers();
      if (res.data?.data) {
        setNewVariant(prev => ({
          ...prev,
          sku: prev.sku || res.data.data.sku,
          barcode: prev.barcode || res.data.data.barcode
        }));
      }
    } catch (error) {
      console.error("Failed to generate identifiers");
    }
  };

  useEffect(() => {
    if (step === 2 && !newVariant.sku) {
      handleGenerateIdentifiers();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await adminService.getCategories();
        setCategories(catRes.data.data || []);
        if (isEdit) {
          const prodRes = await adminService.getProduct(id);
          const p = prodRes.data.data;
          setProduct(p);
          setVariants(p.variants || []);
        }
      } catch (err) {
        alert("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, isEdit]);

  const handleSaveCatalog = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    try {
      if (isEdit && product) {
        const patchData = new FormData();
        patchData.append("name", (form.elements.namedItem("name") as HTMLInputElement).value);
        patchData.append("categoryId", (form.elements.namedItem("categoryId") as HTMLSelectElement).value);
        await adminService.updateProduct(product.id, patchData, { headers: { "Content-Type": "multipart/form-data" } });
        setProduct((prev: any) => ({
          ...prev,
          name: (form.elements.namedItem("name") as HTMLInputElement).value,
          categoryId: (form.elements.namedItem("categoryId") as HTMLSelectElement).value,
          category: categories.find(c => c.id === (form.elements.namedItem("categoryId") as HTMLSelectElement).value) || prev.category,
        }));
        setStep(2);
      } else {
        // dummy price/stock just to pass schema
        formData.append("price", "0");
        formData.append("stockQuantity", "0");
        const res = await adminService.createProduct(formData, { headers: { "Content-Type": "multipart/form-data" } });
        const created = res.data.data;
        setProduct(created);
        setVariants([]);
        setCreatedProductId(created.id);
        setStep(2);
      }
    } catch (err) {
      alert("Failed to save basic details");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    const productId = product?.id || createdProductId;
    if (!productId) return;
    setSubmittingVariant(true);
    try {
      const formData = new FormData();
      formData.append("variantName", newVariant.variantName);
      if (newVariant.sku) formData.append("sku", newVariant.sku);
      formData.append("price", newVariant.price);
      if (newVariant.compareAtPrice) formData.append("compareAtPrice", newVariant.compareAtPrice);
      formData.append("stockQuantity", newVariant.stockQuantity);
      if (newVariant.weight) formData.append("weight", newVariant.weight);
      
      // Default advanced fields
      formData.append("gstPercentage", newVariant.gstPercentage);
      formData.append("shippingCharge", newVariant.shippingCharge);
      formData.append("isCodEnabled", String(newVariant.isCodEnabled));
      if (newVariant.isCodEnabled) formData.append("codCharge", newVariant.codCharge);
      
      formData.append("isPublished", String(newVariant.isPublished));
      formData.append("isFeatured", String(newVariant.isFeatured));
      
      if (variantFiles.length > 0) {
        variantFiles.forEach(file => {
          formData.append("images", file);
        });
      }

      const res = await adminService.addProductVariant(productId, formData, { headers: { "Content-Type": "multipart/form-data" } });
      const added = res.data.data;
      setVariants(prev => [...prev, added]);
      setNewVariant({ ...emptyVariant });
      setVariantFiles([]);
      handleGenerateSku();
    } catch (err) {
      alert("Failed to add variant");
    } finally {
      setSubmittingVariant(false);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm("Delete this variant?")) return;
    setDeletingVariantId(variantId);
    try {
      await adminService.deleteProductVariant(product?.id || createdProductId, variantId);
      setVariants(prev => prev.filter(v => v.id !== variantId));
    } catch (err) {
      alert("Failed to delete variant");
    } finally {
      setDeletingVariantId(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#9c001f] border-t-transparent" />
    </div>
  );

  return (
    <div className="mx-auto h-full flex flex-col animate-fade-in pb-10">
      
      <SetAdminHeader
        title={isNew ? "Add Product" : "Edit Product"}
        subtitle="Manage your product details and variants"
        action={
          <button onClick={() => router.push("/admin/products")} className="btn-secondary">
            <ArrowLeft size={15} /> Back to Products
          </button>
        }
      />


      {/* ── STEP 1: BASIC DETAILS ─────────────────────────────────────────── */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl shadow-sm">
          <form onSubmit={handleSaveCatalog} className="space-y-5">
            <div>
              <label className="label text-xs">Product Name <span className="text-red-500">*</span></label>
              <input name="name" className="input" placeholder="e.g. Linen Cotton Shirt" defaultValue={product?.name} required />
            </div>
            <div>
              <label className="label text-xs">Category <span className="text-red-500">*</span></label>
              <select name="categoryId" className="input" defaultValue={product?.categoryId} required>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="pt-2">
              <button type="submit" className="bg-[#9c001f] hover:bg-[#7a0018] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors" disabled={submitting}>
                {submitting ? "Saving..." : "Save & Continue"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── STEP 2: VARIANTS ─────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Add Variant Box */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-slate-900">Add Variant</h3>
                <button type="button" className="btn-secondary text-xs py-1.5 px-3">
                  <Download size={14} className="mr-1" /> Import Variants
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-6">Add product variants like size, color, material etc.</p>
              
              <form onSubmit={handleAddVariant} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                  <div>
                    <label className="label text-xs font-bold text-slate-800">Variant Name <span className="text-red-500">*</span></label>
                    <input className="input" required value={newVariant.variantName} onChange={e => setNewVariant({...newVariant, variantName: e.target.value})} placeholder="Linen Cotton Shirt - Blue - M" />
                    <p className="text-[10px] text-slate-400 mt-1">Unique name for this variant</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="label text-xs font-bold text-slate-800 mb-0">SKU <span className="text-red-500">*</span></label>
                      <button type="button" onClick={handleGenerateIdentifiers} className="text-[10px] text-brand-600 hover:underline font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-200">Auto Generate</button>
                    </div>
                    <input className="input bg-slate-100 cursor-not-allowed" readOnly required value={newVariant.sku} onChange={e => setNewVariant({...newVariant, sku: e.target.value})} placeholder="LCS-BLU-M" />
                    <p className="text-[10px] text-slate-400 mt-1">Stock Keeping Unit (unique)</p>
                  </div>
                  <div>
                    <label className="label text-xs font-bold text-slate-800">Price (₹) <span className="text-red-500">*</span></label>
                    <input className="input" required type="number" step="0.01" value={newVariant.price} onChange={e => setNewVariant({...newVariant, price: e.target.value})} placeholder="899.00" />
                    <p className="text-[10px] text-slate-400 mt-1">Selling price</p>
                  </div>
                  <div>
                    <label className="label text-xs font-bold text-slate-800">Compare Price (₹)</label>
                    <input className="input" type="number" step="0.01" value={newVariant.compareAtPrice} onChange={e => setNewVariant({...newVariant, compareAtPrice: e.target.value})} placeholder="1299.00" />
                    <p className="text-[10px] text-slate-400 mt-1">Original price (MRP)</p>
                  </div>
                  <div>
                    <label className="label text-xs font-bold text-slate-800">Stock Quantity <span className="text-red-500">*</span></label>
                    <input className="input" required type="number" value={newVariant.stockQuantity} onChange={e => setNewVariant({...newVariant, stockQuantity: e.target.value})} placeholder="50" />
                    <p className="text-[10px] text-slate-400 mt-1">Available stock</p>
                  </div>
                  <div>
                    <label className="label text-xs font-bold text-slate-800">Weight (g)</label>
                    <input className="input" type="number" value={newVariant.weight} onChange={e => setNewVariant({...newVariant, weight: e.target.value})} placeholder="250" />
                    <p className="text-[10px] text-slate-400 mt-1">Product weight in grams</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="label text-xs font-bold text-slate-800 mb-0">Barcode (Optional)</label>
                      <button type="button" onClick={handleGenerateIdentifiers} className="text-[10px] text-brand-600 hover:underline font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-200">Auto Generate</button>
                    </div>
                    <input className="input bg-slate-100 cursor-not-allowed" readOnly value={newVariant.barcode} onChange={e => setNewVariant({...newVariant, barcode: e.target.value})} placeholder="8906123456789" />
                    <p className="text-[10px] text-slate-400 mt-1">Scan barcode (optional)</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="label text-xs font-bold text-slate-800 mb-0">GST Percentage (%)</label>
                      {newVariant.price && newVariant.gstPercentage && (
                        <span className="text-[10px] font-bold text-emerald-600">
                          GST Amount: ₹{((Number(newVariant.price) * Number(newVariant.gstPercentage)) / 100).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <input className="input" type="number" min="0" max="100" value={newVariant.gstPercentage} onChange={e => setNewVariant({...newVariant, gstPercentage: e.target.value})} placeholder="18" />
                    <p className="text-[10px] text-slate-400 mt-1">Tax rate for this variant</p>
                  </div>
                  <div className="flex flex-col justify-center">
                    <label className="flex items-center gap-2 cursor-pointer mt-5">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#9c001f] focus:ring-[#9c001f]" checked={newVariant.isCodEnabled} onChange={e => setNewVariant({...newVariant, isCodEnabled: e.target.checked})} />
                      <span className="text-sm text-slate-700 font-bold">Enable Cash on Delivery (COD)</span>
                    </label>
                  </div>
                  {newVariant.isCodEnabled ? (
                    <div className="animate-fade-in">
                      <label className="label text-xs font-bold text-slate-800">COD Charge (₹)</label>
                      <input className="input" type="number" min="0" value={newVariant.codCharge} onChange={e => setNewVariant({...newVariant, codCharge: e.target.value})} placeholder="40" />
                      <p className="text-[10px] text-slate-400 mt-1">Extra fee for COD orders</p>
                    </div>
                  ) : (
                    <div></div>
                  )}
                  <div className="col-span-1 sm:col-span-2">
                    <label className="label text-xs font-bold text-slate-800">Variant Images (Optional)</label>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      {variantFiles.map((file, idx) => (
                        <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 group">
                          <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setVariantFiles(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-white/90 hover:bg-white text-slate-700 rounded p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                        <Upload size={16} className="text-slate-400 mb-1" />
                        <span className="text-[9px] font-medium text-slate-700">Upload</span>
                        <input type="file" multiple className="hidden" accept="image/*" onChange={e => {
                          if (e.target.files) setVariantFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                        }} />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button type="submit" className="bg-[#9c001f] hover:bg-[#7a0018] text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors" disabled={submittingVariant}>
                    <Plus size={16} strokeWidth={3} /> {submittingVariant ? "Adding..." : "Add Variant"}
                  </button>
                </div>
              </form>
            </div>

            {/* Added Variants List */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-1">Added Variants ({variants.length})</h3>
              <p className="text-xs text-slate-500 mb-4">You can add multiple variants for this product.</p>
              
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="px-5 py-3">Variant Name</th>
                      <th className="px-5 py-3">SKU</th>
                      <th className="px-5 py-3">Price (₹)</th>
                      <th className="px-5 py-3">Stock</th>
                      <th className="px-5 py-3">Weight (g)</th>
                      <th className="px-5 py-3">Image</th>
                      <th className="px-5 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {variants.map(v => (
                      <tr key={v.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3.5 font-bold text-slate-800">{v.variantName}</td>
                        <td className="px-5 py-3.5 text-slate-600 font-mono text-[11px]">{v.sku}</td>
                        <td className="px-5 py-3.5 text-slate-800">{formatPrice(v.price)}</td>
                        <td className="px-5 py-3.5 text-slate-600">{v.stockQuantity}</td>
                        <td className="px-5 py-3.5 text-slate-600">{v.weight || "-"}</td>
                        <td className="px-5 py-3.5">
                          {v.images?.[0] ? (
                            <img src={v.images[0].imageUrl} className="w-9 h-9 rounded object-cover border border-slate-200" />
                          ) : (
                            <div className="w-9 h-9 bg-slate-100 rounded border border-slate-200 flex items-center justify-center">
                              <ImageIcon size={14} className="text-slate-300"/>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-center flex justify-center items-center h-full gap-3 mt-1.5">
                          <button className="text-slate-400 hover:text-indigo-600 transition-colors"><Edit2 size={15}/></button>
                          <button className="text-slate-400 hover:text-red-600 transition-colors" onClick={() => handleDeleteVariant(v.id)} disabled={deletingVariantId === v.id}>
                            <Trash2 size={15}/>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {variants.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-5 py-8 text-center text-slate-400 text-xs">
                          No variants added yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 mt-2 bg-slate-50 p-3.5 rounded-lg border border-slate-100">
              <AlertCircle size={15} className="text-blue-500 shrink-0" />
              After adding all variants, click "Next: Review & Publish" to review your product before publishing.
            </div>
          </div>

          {/* Right Column: Review Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-6 flex flex-col gap-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">Review Summary</h3>
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-[13px] font-bold text-slate-900">
                    <Check size={14} className="text-white bg-emerald-500 rounded-full p-0.5" /> Basic Details
                  </div>
                  <button className="text-[11px] font-medium text-slate-600 border border-slate-200 rounded px-2.5 py-1 hover:bg-slate-50 transition-colors" onClick={() => setStep(1)}>Edit</button>
                </div>
                <div className="flex items-start gap-3 bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <div className="w-12 h-12 bg-white rounded border border-slate-200 flex items-center justify-center shrink-0">
                    <ImageIcon size={18} className="text-slate-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{product?.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      Category: <span className="text-indigo-600 font-medium">{product?.category?.name}</span>
                    </p>
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-[13px] font-bold text-slate-900">
                    <Check size={14} className="text-white bg-emerald-500 rounded-full p-0.5" /> Variants
                  </div>
                  <button className="text-[11px] font-medium text-slate-600 border border-slate-200 rounded px-2.5 py-1 hover:bg-slate-50 transition-colors">Edit</button>
                </div>
                
                {variants.length > 0 ? (
                  <>
                    <span className="inline-block bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2 py-1 rounded-md mb-3">
                      {variants.length} variant{variants.length !== 1 ? 's' : ''} added
                    </span>
                    <div className="border border-slate-200 bg-slate-50 rounded-lg p-3.5">
                      <p className="text-[13px] font-bold text-slate-900 mb-1">{variants[variants.length - 1].variantName}</p>
                      <p className="text-[11px] text-slate-500 font-mono mb-1.5">SKU: {variants[variants.length - 1].sku}</p>
                      <p className="text-xs text-slate-600">Price: <span className="font-bold text-slate-800">{formatPrice(variants[variants.length - 1].price)}</span> · Stock: <span className="font-bold">{variants[variants.length - 1].stockQuantity}</span></p>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-lg border border-slate-100 border-dashed text-center">No variants added yet.</p>
                )}
              </div>

              <button 
                className="w-full bg-[#9c001f] hover:bg-[#7a0018] text-white py-3.5 rounded-xl text-[13px] font-bold transition-colors mt-2" 
                onClick={() => setStep(3)}
                disabled={variants.length === 0}
              >
                Next: Review & Publish →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3: REVIEW & PUBLISH ──────────────────────────────────────── */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center max-w-2xl mx-auto mt-4 shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Check size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Ready to Publish!</h2>
          <p className="text-sm text-slate-500 mb-8 max-w-md mx-auto">
            Your product <span className="font-bold text-slate-700">"{product?.name}"</span> with {variants.length} variant(s) is ready to be published to your store.
          </p>
          <div className="flex justify-center gap-3">
            <button onClick={() => setStep(2)} className="btn-secondary px-6 py-2.5">Go Back</button>
            <button onClick={() => router.push("/admin/products")} className="bg-[#9c001f] hover:bg-[#7a0018] text-white px-6 py-2.5 rounded-lg font-bold transition-colors shadow-sm">
              Publish Product
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
}
