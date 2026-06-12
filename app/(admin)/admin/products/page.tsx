"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Search, Edit2, Trash2, Eye, EyeOff, Star,
  Package, ChevronRight, BarChart2, Tag, Layers,
  ArrowLeft, Image as ImageIcon, Barcode
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, Pagination, Table, TableHeader, TableBody, Tr, Th, Td } from "@/components/ui";
import { formatPrice } from "@/lib/utils";
import { adminService } from "@/services/admin.service";
import { SetAdminHeader } from "@/lib/adminHeaderContext";
import { BarcodeModal } from "@/components/admin/BarcodeModal";

type View = "products" | "variants";

export default function AdminProductsPage() {
  const router = useRouter();

  // View state
  const [view, setView] = useState<View>("products");
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Data
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<any[]>([]);
  const [productDetail, setProductDetail] = useState<any>(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [productLoading, setProductLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteVariantId, setDeleteVariantId] = useState<string | null>(null);

  // Barcode modal
  const [barcodeModal, setBarcodeModal] = useState<{
    open: boolean; barcode: string; name: string; sku?: string; price?: number | null;
  }>({ open: false, barcode: "", name: "" });

  // Initial load
  useEffect(() => {
    const init = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          adminService.getCategories(),
          adminService.getProducts(),
        ]);
        const cats = catRes.data.data || [];
        const prods = prodRes.data.data.data || [];
        setCategories(cats);
        setProducts(prods);
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── Navigate: Product row clicked ───────────────────────────────────────
  const handleProductClick = async (product: any) => {
    setSelectedProduct(product);
    setView("variants");
    setProductLoading(true);
    try {
      const res = await adminService.getProduct(product.id);
      setProductDetail(res.data.data);
    } catch { setProductDetail(null); } finally {
      setProductLoading(false);
    }
  };

  const handleTogglePublish = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await adminService.publishProduct(id);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, isPublished: !p.isPublished } : p));
      if (productDetail && productDetail.id === id) {
        setProductDetail({ ...productDetail, isPublished: !productDetail.isPublished });
      }
    } catch (err) {
      alert("Failed to change status");
    }
  };

  const handleToggleVariantPublish = async (e: React.MouseEvent, variantId: string, currentStatus: boolean) => {
    e.stopPropagation();
    if (!productDetail) return;
    try {
      await adminService.updateProductVariant(productDetail.id, variantId, { isPublished: !currentStatus });
      setProductDetail({
        ...productDetail,
        variants: productDetail.variants.map((v: any) => v.id === variantId ? { ...v, isPublished: !currentStatus } : v)
      });
    } catch (err) {
      alert("Failed to change variant status");
    }
  };

  // ── Barcode button clicked ───────────────────────────────────────────────
  const handleBarcodeClick = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    const barcodeVal = product.sku || product.barcode || product.id;
    setBarcodeModal({ open: true, barcode: barcodeVal, name: product.name, sku: product.sku, price: product.price });
  };

  // ── Filtered lists ───────────────────────────────────────────────────────
  const perPage = 10;

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
    (p.category?.name && p.category.name.toLowerCase().includes(search.toLowerCase()))
  );
  const pagedProducts = filteredProducts.slice((page - 1) * perPage, page * perPage);

  // ── Render: Breadcrumb ───────────────────────────────────────────────────
  const Breadcrumb = () => (
    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
      <button
        onClick={() => { setView("products"); setSearch(""); setPage(1); }}
        className={`font-medium transition-colors ${view === "products" ? "text-slate-900" : "hover:text-[#9c001f]"}`}
      >Products</button>
      {view === "variants" && (
        <>
          <ChevronRight size={12} />
          <span className="text-slate-900 font-medium">{selectedProduct?.name}</span>
        </>
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in">
      <SetAdminHeader
        title={
          view === "products" ? "Products" :
          selectedProduct?.name || "Variants"
        }
        subtitle={
          view === "products" ? `${filteredProducts.length} products total` :
          `${productDetail?.variants?.length || 0} variants`
        }
        action={
          <button
            onClick={() => router.push("/admin/products/new")}
            className="btn-primary"
          >
            <Plus size={15} /> Add Product
          </button>
        }
        filter={
          view !== "variants" ? (
            <div className="relative w-full max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search products, SKU, category…"
                className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#9c001f]/20 bg-white"
              />
            </div>
          ) : undefined
        }
      />

      {/* ── Breadcrumb ───────────────────────────────────── */}
      <div className="px-1">
        <Breadcrumb />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          LEVEL 1 — CATALOG (Products list)
      ══════════════════════════════════════════════════════════════ */}
      {view === "products" && (
        <div className="flex-1 min-h-0 flex flex-col gap-2">
          {productLoading ? (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">Loading catalogs...</div>
          ) : (
            <Table>
              <TableHeader>
                <Tr>
                  <Th>Catalog Name</Th>
                  <Th>Category</Th>
                  <Th>Total Variants</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Actions</Th>
                </Tr>
              </TableHeader>
              <TableBody>
                {pagedProducts.length === 0 ? (
                  <Tr><Td colSpan={5}>
                    <EmptyState icon={<Package size={24} />} title="No catalogs found" description="Add a new catalog first." />
                  </Td></Tr>
                ) : pagedProducts.map(product => (
                  <Tr
                    key={product.id}
                    className="cursor-pointer hover:bg-indigo-50/40 group"
                    onClick={() => handleProductClick(product)}
                  >
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-100">
                          {(() => {
                            const primaryImage = product.images?.find((img: any) => img.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl;
                            return primaryImage ? (
                              <img src={primaryImage} className="w-full h-full object-cover" />
                            ) : (
                              <Package size={16} className="text-slate-400" />
                            );
                          })()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm group-hover:text-indigo-700 transition-colors">{product.name}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <span className="badge-blue">{product.category?.name || "Uncategorized"}</span>
                    </Td>
                    <Td>
                      <span className="text-sm font-bold text-slate-700">
                        {product.variants?.length || 0}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">variants</span>
                    </Td>
                    <Td onClick={e => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleTogglePublish(e, product.id)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          product.isPublished ? 'bg-green-500' : 'bg-slate-300'
                        }`}
                        title={product.isPublished ? "Deactivate catalog" : "Activate catalog"}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            product.isPublished ? 'translate-x-4' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </Td>
                    <Td onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => router.push(`/admin/products/${product.id}`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(product.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="px-4 py-3 border-t border-slate-100">
            <Pagination page={page} totalPages={Math.ceil(filteredProducts.length / perPage)} onPageChange={setPage} />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          LEVEL 2 — VARIANTS of selected product
      ══════════════════════════════════════════════════════════════ */}
      {view === "variants" && (
        <div className="flex-1 min-h-0 flex flex-col gap-4">
          {productLoading ? (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">Loading variants...</div>
          ) : (
            <>
              {/* Variants table using common Table component */}
              <div className=" border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                {(!productDetail?.variants || productDetail.variants.length === 0) ? (
                  <div className="py-12 text-center text-slate-400 text-sm">
                    <Package size={28} className="mx-auto mb-2 text-slate-200" />
                    No variants added yet.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <Tr>
                        <Th>Variant</Th>
                        <Th>SKU</Th>
                        <Th>Price</Th>
                        <Th>Compare</Th>
                        <Th>Stock</Th>
                        <Th>Weight</Th>
                        <Th>Image</Th>
                        <Th className="text-center">Barcode</Th>
                        <Th className="text-right">Actions</Th>
                      </Tr>
                    </TableHeader>
                    <TableBody>
                      {productDetail.variants.map((v: any) => (
                        <Tr key={v.id} className="hover:bg-slate-50/60">
                          <Td className="font-semibold text-slate-900">{v.variantName}</Td>
                          <Td className="font-mono text-xs text-slate-500">{v.sku || "—"}</Td>
                          <Td className="font-bold text-slate-900">{formatPrice(v.price)}</Td>
                          <Td className="text-slate-400 text-xs line-through">{v.compareAtPrice ? formatPrice(v.compareAtPrice) : "—"}</Td>
                          <Td>
                            <span className={v.stockQuantity === 0 ? "badge-red" : v.stockQuantity < 5 ? "badge-yellow" : "badge-green"}>
                              {v.stockQuantity === 0 ? "Out" : v.stockQuantity}
                            </span>
                          </Td>
                          <Td className="text-slate-500 text-xs">{v.weight ? `${v.weight}g` : "—"}</Td>
                          <Td>
                            {(() => {
                              const variantImg = v.images?.find((img: any) => img.isPrimary)?.imageUrl || v.images?.[0]?.imageUrl || v.imageUrl;
                              return variantImg ? (
                                <img src={variantImg} className="w-9 h-9 rounded object-cover border border-slate-200" />
                              ) : (
                                <div className="w-9 h-9 bg-slate-100 rounded border border-slate-200 flex items-center justify-center">
                                  <ImageIcon size={13} className="text-slate-300" />
                                </div>
                              );
                            })()}
                          </Td>
                          <Td className="text-center">
                            <button
                              onClick={() => setBarcodeModal({
                                open: true,
                                barcode: v.sku || productDetail.sku || v.id,
                                name: `${productDetail.name} - ${v.variantName}`,
                                sku: v.sku,
                                price: v.price,
                              })}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#9c001f] hover:bg-red-50 transition-colors mx-auto flex"
                              title="Print Barcode"
                            >
                              <Barcode size={15} />
                            </button>
                          </Td>
                          <Td onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={(e) => handleToggleVariantPublish(e, v.id, v.isPublished ?? true)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                  (v.isPublished ?? true) ? 'bg-green-500' : 'bg-slate-300'
                                }`}
                                title={(v.isPublished ?? true) ? "Deactivate variant" : "Activate variant"}
                              >
                                <span
                                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                    (v.isPublished ?? true) ? 'translate-x-4' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                              <button
                                onClick={() => router.push(`/admin/products/${productDetail.id}`)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                title="Edit"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteVariantId(v.id);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </Td>
                        </Tr>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Barcode Modal ──────────────────────────────────────────────── */}
      <BarcodeModal
        isOpen={barcodeModal.open}
        onClose={() => setBarcodeModal(prev => ({ ...prev, open: false }))}
        barcode={barcodeModal.barcode}
        productName={barcodeModal.name}
        sku={barcodeModal.sku}
        price={barcodeModal.price}
      />

      {/* ── Delete Confirm Modal ───────────────────────────────────────── */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Product" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Are you sure you want to delete this product? This action cannot be undone.</p>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setDeleteId(null)} className="btn-secondary">Cancel</button>
            <button onClick={async () => {
              if (deleteId) {
                try {
                  await adminService.deleteProduct(deleteId);
                  setDeleteId(null);
                  const res = await adminService.getProducts();
                  setProducts(res.data.data.data || []);
                } catch { }
              }
            }} className="btn-danger">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteVariantId} onClose={() => setDeleteVariantId(null)} title="Delete Variant" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Are you sure you want to delete this variant? This action cannot be undone.</p>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setDeleteVariantId(null)} className="btn-secondary">Cancel</button>
            <button onClick={async () => {
              if (deleteVariantId && productDetail) {
                try {
                  await adminService.deleteProductVariant(productDetail.id, deleteVariantId);
                  setProductDetail({
                    ...productDetail,
                    variants: productDetail.variants.filter((v: any) => v.id !== deleteVariantId)
                  });
                  setDeleteVariantId(null);
                } catch { 
                  alert("Failed to delete variant");
                }
              }
            }} className="btn-danger">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
