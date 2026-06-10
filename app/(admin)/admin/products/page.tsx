"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Package,
  Upload,
  X,
  Loader2,
  Tag as TagIcon
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, Pagination, Table, TableHeader, TableBody, Tr, Th, Td, FilterBar } from "@/components/ui";
import { formatPrice } from "@/lib/utils";

import { adminService } from "@/services/admin.service";
import { SetAdminHeader } from "@/lib/adminHeaderContext";

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await Promise.all([
        adminService.getProducts(),
        adminService.getCategories()
      ]);
      setProducts(res[0].data.data.data || []);
      setCategories(res[1].data.data || []);
    } catch (err) {

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEditClick = (productId: string) => {
    router.push(`/admin/products/${productId}`);
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const perPage = 10;
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in">
      <SetAdminHeader
        title="Products"
        subtitle={`${filtered.length} products total`}
        action={
          <button
            id="add-product-btn"
            onClick={() => router.push("/admin/products/new")}
            className="btn-primary"
          >
            <Plus size={15} /> Add Product
          </button>
        }
        filter={
          <FilterBar
            search={search}
            onSearchChange={(val) => { setSearch(val); setPage(1); }}
            searchPlaceholder="Search products, SKU…"
            filters={[
              {
                value: "",
                onChange: () => {}, // To be wired later
                placeholder: "All Categories",
                options: categories.map(c => ({ label: c.name, value: c.name }))
              },
              {
                value: "",
                onChange: () => {}, // To be wired later
                placeholder: "All Status",
                options: [
                  { label: "Active", value: "Active" },
                  { label: "Inactive", value: "Inactive" },
                  { label: "Featured", value: "Featured" },
                ]
              }
            ]}
          />
        }
      />

      {/* Table */}
      <div className="flex-1 min-h-0 flex flex-col gap-2">
        <Table>
            <TableHeader>
              <Tr>
                <Th>Product</Th>
                <Th>SKU</Th>
                <Th>Category</Th>
                <Th>Price</Th>
                <Th>Stock</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </TableHeader>
            <TableBody>
              {loading ? (
                <Tr><Td colSpan={7} className="text-center py-8 text-slate-500">Loading products...</Td></Tr>
              ) : paged.map((product) => (
                <Tr key={product.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Package size={16} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{product.name}</p>
                        {product.isFeatured && (
                          <span className="flex items-center gap-0.5 text-[10px] text-amber-600 font-medium">
                            <Star size={9} fill="currentColor" /> Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </Td>
                  <Td className="font-mono text-xs text-slate-500">{product.sku || "—"}</Td>
                  <Td>
                    <span className="badge-blue">{product.category?.name || "Uncategorized"}</span>
                  </Td>
                  <Td className="font-semibold text-slate-900">{formatPrice(product.price)}</Td>
                  <Td>
                    <span
                      className={
                        product.stockQuantity === 0
                          ? "badge-red"
                          : product.stockQuantity < 10
                          ? "badge-yellow"
                          : "badge-green"
                      }
                    >
                      {product.stockQuantity === 0 ? "Out of stock" : `${product.stockQuantity} units`}
                    </span>
                  </Td>
                  <Td>
                    <span className={product.isPublished ? "badge-green" : "badge-gray"}>
                      {product.isPublished ? "Active" : "Inactive"}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditClick(product.id)}
                        disabled={false}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await adminService.publishProduct(product.id);
                            fetchProducts();
                          } catch (err) {

                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        title={product.isPublished ? "Deactivate" : "Activate"}
                      >
                        {product.isPublished ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button
                        onClick={() => setDeleteId(product.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))}
              {paged.length === 0 && (
                <Tr>
                  <Td colSpan={7}>
                    <EmptyState
                      icon={<Package size={24} />}
                      title="No products found"
                      description="Try adjusting your search or add a new product."
                    />
                  </Td>
                </Tr>
              )}
            </TableBody>
          </Table>
        <div className="px-4 py-3 border-t border-slate-100">
          <Pagination
            page={page}
            totalPages={Math.ceil(filtered.length / perPage)}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Product" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete this product? This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setDeleteId(null)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={async () => {
              if (deleteId) {
                try {
                  await adminService.deleteProduct(deleteId);
                  setDeleteId(null);
                  fetchProducts();
                } catch (err) {

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
