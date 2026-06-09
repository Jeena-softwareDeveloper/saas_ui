"use client";

import { useState, useEffect } from "react";
import { Search, Package, AlertTriangle, Loader2, Save } from "lucide-react";
import { EmptyState, Pagination, Table, TableHeader, TableBody, Tr, Th, Td, FilterBar } from "@/components/ui";
import { adminService } from "@/services/admin.service";
import { SetAdminHeader } from "@/lib/adminHeaderContext";

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchInventory = async () => {
    try {
      const res = await adminService.getInventory();
      setInventory(res.data.data);
    } catch (err) {

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleUpdateStock = async (productId: string, newStock: number) => {
    setUpdating(productId);
    try {
      await adminService.updateInventory(productId, newStock);
      setInventory(inventory.map(p => p.product_id === productId ? { ...p, stock: newStock } : p));
    } catch (err) {
      alert("Failed to update stock");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = inventory.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "ALL" || (filter === "LOW" && p.stock < p.threshold) || (filter === "OUT" && p.stock === 0);
    return matchSearch && matchFilter;
  });

  const perPage = 15;
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-4 animate-fade-in">
      <SetAdminHeader 
        title="Inventory" 
        subtitle={`${filtered.length} products found`} 
        filter={
          <FilterBar
            search={search}
            onSearchChange={(val) => { setSearch(val); setPage(1); }}
            searchPlaceholder="Search products..."
            filters={[
              {
                value: filter,
                onChange: (val) => { setFilter(val as any); setPage(1); },
                options: [
                  { label: "All Stock", value: "ALL" },
                  { label: "Low Stock", value: "LOW" },
                  { label: "Out of Stock", value: "OUT" },
                ]
              }
            ]}
          />
        }
      />
      <div className="flex flex-col gap-2">
        <Table>
            <TableHeader>
              <Tr>
                <Th>Product</Th>
                <Th>Status</Th>
                <Th>Threshold</Th>
                <Th>Stock Level</Th>
                <Th>Actions</Th>
              </Tr>
            </TableHeader>
            <TableBody>
              {loading ? (
                <Tr><Td colSpan={5} className="text-center py-8"><Loader2 className="animate-spin mx-auto text-indigo-600" /></Td></Tr>
              ) : paged.map((item) => {
                const isOut = item.stock === 0;
                const isLow = item.stock < item.threshold && !isOut;
                
                return (
                  <Tr key={item.product_id}>
                    <Td>
                      <p className="font-medium text-slate-900 text-sm">{item.name}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{item.product_id.split('-')[0]}...</p>
                    </Td>
                    <Td>
                      {isOut ? (
                        <span className="badge-red flex items-center gap-1 w-fit"><AlertTriangle size={12}/> Out of stock</span>
                      ) : isLow ? (
                        <span className="badge-yellow flex items-center gap-1 w-fit"><AlertTriangle size={12}/> Low stock</span>
                      ) : (
                        <span className="badge-green">In stock</span>
                      )}
                    </Td>
                    <Td className="text-sm text-slate-500">{item.threshold}</Td>
                    <Td>
                      <form 
                        className="flex items-center gap-2 max-w-[150px]"
                        onSubmit={(e) => {
                          e.preventDefault();
                          const val = Number((e.currentTarget.elements.namedItem("stock") as HTMLInputElement).value);
                          if (val >= 0) handleUpdateStock(item.product_id, val);
                        }}
                      >
                        <input 
                          name="stock"
                          type="number" 
                          className="input h-8 text-sm" 
                          defaultValue={item.stock} 
                          min={0}
                        />
                        <button 
                          type="submit" 
                          disabled={updating === item.product_id}
                          className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded transition-colors disabled:opacity-50"
                        >
                          {updating === item.product_id ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        </button>
                      </form>
                    </Td>
                    <Td>
                      <button className="text-xs text-indigo-600 font-medium hover:underline">View Product</button>
                    </Td>
                  </Tr>
                );
              })}
              {!loading && paged.length === 0 && (
                <Tr>
                  <Td colSpan={5}>
                    <EmptyState
                      icon={<Package size={24} />}
                      title="No inventory found"
                      description="Try adjusting your filters."
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
    </div>
  );
}
