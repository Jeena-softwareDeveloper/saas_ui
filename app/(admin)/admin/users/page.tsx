"use client";

import { useState, useEffect } from "react";
import { Search, Users, Shield, User, ToggleLeft, ToggleRight, Eye, MapPin, Package, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, Pagination, Table, TableHeader, TableBody, Tr, Th, Td, FilterBar } from "@/components/ui";
import { formatDate, getRoleBadge, formatPrice, getOrderStatusBadge } from "@/lib/utils";
import type { Role } from "@/lib/types";
import { adminService } from "@/services/admin.service";
import { SetAdminHeader } from "@/lib/adminHeaderContext";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchUserDetails = async (userId: string) => {
    setLoadingDetails(true);
    try {
      const res = await adminService.getCustomer(userId);
      setSelectedUser(res.data.data);
    } catch (err) {

      alert("Failed to load user details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await adminService.getCustomers();
      setUsers(res.data.data.data);
    } catch (err) {

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const perPage = 10;
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-4 animate-fade-in">
      <SetAdminHeader 
        title="Users" 
        subtitle={`${filtered.length} users registered`} 
        filter={
          <FilterBar
            search={search}
            onSearchChange={(val) => { setSearch(val); setPage(1); }}
            searchPlaceholder="Search users…"
          />
        }
      />

      {/* Role Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "All Users", count: users.length, filter: "ALL", icon: <Users size={16} />, color: "text-slate-600" },
          { label: "Admins", count: users.filter((u) => u.role === "ADMIN").length, filter: "ADMIN", icon: <Shield size={16} />, color: "text-blue-600" },
          { label: "Customers", count: users.filter((u) => u.role === "CUSTOMER").length, filter: "CUSTOMER", icon: <User size={16} />, color: "text-emerald-600" },
        ].map((s) => (
          <button
            key={s.filter}
            onClick={() => { setRoleFilter(s.filter); setPage(1); }}
            className={`card p-3 flex items-center gap-3 text-left transition-all hover:shadow-md ${roleFilter === s.filter ? "ring-2 ring-indigo-500" : ""}`}
          >
            <span className={s.color}>{s.icon}</span>
            <div>
              <p className="text-xl font-bold text-slate-900">{s.count}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </button>
        ))}
      </div>



      {/* Table */}
      <div className="flex flex-col gap-2">
        <Table>
            <TableHeader>
              <Tr>
                <Th>User</Th>
                <Th>Role</Th>
                <Th>Orders</Th>
                <Th>Joined</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </TableHeader>
            <TableBody>
              {loading ? (
                <Tr><Td colSpan={6} className="text-center py-8 text-slate-500">Loading users...</Td></Tr>
              ) : paged.map((user) => {
                const roleBadge = getRoleBadge(user.role);
                return (
                  <Tr key={user.id}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-bold">
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td><span className={roleBadge.className}>{roleBadge.label}</span></Td>
                    <Td className="text-center font-medium">{user.order_count}</Td>
                    <Td className="text-xs text-slate-500">{formatDate(user.created_at)}</Td>
                    <Td>
                      <span className={user.is_active ? "badge-green" : "badge-red"}>
                        {user.is_active ? "Active" : "Suspended"}
                      </span>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => fetchUserDetails(user.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="View user details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await adminService.updateCustomerStatus(user.id, { isActive: !user.is_active });
                              fetchUsers();
                            } catch (err) {

                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title={user.is_active ? "Suspend user" : "Activate user"}
                        >
                          {user.is_active ? <ToggleRight size={16} className="text-emerald-500" /> : <ToggleLeft size={16} />}
                        </button>
                        <select
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          defaultValue={user.role}
                          onChange={async (e) => {
                            try {
                              await adminService.updateCustomerStatus(user.id, { role: e.target.value });
                              fetchUsers();
                            } catch (err) {

                            }
                          }}
                        >
                          <option value="CUSTOMER">Customer</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </div>
                    </Td>
                  </Tr>
                );
              })}
              {paged.length === 0 && (
                <Tr><Td colSpan={6}>
                  <EmptyState icon={<Users size={24} />} title="No users found" />
                </Td></Tr>
              )}
            </TableBody>
          </Table>
        <div className="px-4 py-3 border-t border-slate-100">
          <Pagination page={page} totalPages={Math.ceil(filtered.length / perPage)} onPageChange={setPage} />
        </div>
      </div>

      {/* Customer Detail Modal */}
      <Modal isOpen={!!selectedUser || loadingDetails} onClose={() => setSelectedUser(null)} title="User Details" size="lg">
        {loadingDetails ? (
          <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
        ) : selectedUser ? (
          <div className="space-y-6">
            {/* Profile Info */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-2xl font-bold">
                {selectedUser.name[0]}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedUser.name}</h3>
                <p className="text-sm text-slate-500">{selectedUser.email}</p>
                {selectedUser.phone && <p className="text-sm text-slate-500">{selectedUser.phone}</p>}
              </div>
              <div className="ml-auto flex flex-col items-end gap-2">
                <span className={getRoleBadge(selectedUser.role).className}>{getRoleBadge(selectedUser.role).label}</span>
                <span className={selectedUser.isActive ? "badge-green" : "badge-red"}>
                  {selectedUser.isActive ? "Active" : "Suspended"}
                </span>
              </div>
            </div>

            {/* Addresses */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2"><MapPin size={16} /> Saved Addresses</h4>
              {selectedUser.addresses?.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No addresses saved.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedUser.addresses?.map((addr: any) => (
                    <div key={addr.id} className="card p-3 text-sm relative">
                      {addr.isDefault && <span className="absolute top-2 right-2 badge-blue text-[10px] py-0.5 px-1.5">Default</span>}
                      <p className="font-semibold text-slate-900">{addr.fullName}</p>
                      <p className="text-slate-600">{addr.addressLine1}</p>
                      {addr.addressLine2 && <p className="text-slate-600">{addr.addressLine2}</p>}
                      <p className="text-slate-600">{addr.city}, {addr.state} {addr.pincode}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2"><Package size={16} /> Recent Orders</h4>
              {selectedUser.orders?.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No orders found.</p>
              ) : (
                <div className="space-y-3">
                  {selectedUser.orders?.map((order: any) => {
                    const badge = getOrderStatusBadge(order.status);
                    return (
                      <div key={order.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg">
                        <div>
                          <p className="font-mono text-xs font-bold text-indigo-600">{order.orderNumber}</p>
                          <p className="text-xs text-slate-500">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={badge.className}>{badge.label}</span>
                          <span className="font-bold text-sm text-slate-900">{formatPrice(Number(order.totalAmount))}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
