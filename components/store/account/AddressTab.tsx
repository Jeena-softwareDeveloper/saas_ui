"use client";

import { useState, useEffect } from "react";
import { MapPin, CheckCircle2 } from "lucide-react";
import { storeService } from "@/services/store.service";
import { Modal } from "@/components/ui/Modal";

export default function AddressTab() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [submittingAddress, setSubmittingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [deleteAddressId, setDeleteAddressId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState({ fullName: "", addressLine1: "", city: "", state: "", pincode: "", phone: "", label: "Home" });

  const fetchAddresses = () => {
    setLoadingAddresses(true);
    storeService.getAddresses()
      .then((res) => setAddresses(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoadingAddresses(false));
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddAddress = async () => {
    try {
      setSubmittingAddress(true);
      if (editingAddressId) {
        await storeService.updateAddress(editingAddressId, newAddress);
      } else {
        await storeService.createAddress(newAddress);
      }
      setIsAddingAddress(false);
      setEditingAddressId(null);
      setNewAddress({ fullName: "", addressLine1: "", city: "", state: "", pincode: "", phone: "", label: "Home" });
      fetchAddresses();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to save address");
    } finally {
      setSubmittingAddress(false);
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await storeService.setDefaultAddress(id);
      fetchAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAddress = async () => {
    if (!deleteAddressId) return;
    try {
      await storeService.deleteAddress(deleteAddressId);
      fetchAddresses();
      setDeleteAddressId(null);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete address");
    }
  };

  return (
    <>
      <div className="space-y-4 animate-fade-in p-4 md:p-0">
        <div className="flex items-center justify-between md:mb-4">
          <h2 className="hidden md:block text-[16px] font-black text-gray-900">Saved Addresses</h2>
          {addresses.length === 0 && (
            <button onClick={() => {
              setEditingAddressId(null);
              setNewAddress({ fullName: "", addressLine1: "", city: "", state: "", pincode: "", phone: "", label: "Home" });
              setIsAddingAddress(true);
            }} className="bg-brand-600 text-white text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-xl shadow-sm shadow-rose-100 ml-auto md:ml-0">
              + Add New
            </button>
          )}
        </div>
        {loadingAddresses ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-brand-600/20 border-t-brand-600 rounded-full animate-spin" />
          </div>
        ) : addresses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No saved addresses</p>
            <p className="text-gray-400 text-xs mt-1">Add an address to get started</p>
          </div>
        ) : (
          addresses.map((addr) => (
            <div key={addr.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm relative">
              {addr.isDefault && (
                <div className="absolute top-4 right-4 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={11} className="text-green-600" />
                  <span className="text-[10px] font-black text-green-700">Default</span>
                </div>
              )}
              <h3 className="font-black text-gray-900 text-[14px]">{addr.fullName} <span className="text-gray-400 font-medium ml-2 text-[13px]">{addr.phone}</span></h3>
              <p className="text-[13px] text-gray-600 mt-1.5">{addr.addressLine1}</p>
              {addr.addressLine2 && <p className="text-[13px] text-gray-600">{addr.addressLine2}</p>}
              <p className="text-[13px] text-gray-600">{addr.city}, {addr.state} – {addr.postalCode || addr.pincode}</p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => {
                  setEditingAddressId(addr.id);
                  setNewAddress({
                    fullName: addr.fullName || "",
                    addressLine1: addr.addressLine1 || "",
                    city: addr.city || "",
                    state: addr.state || "",
                    pincode: addr.pincode || addr.postalCode || "",
                    phone: addr.phone || "",
                    label: addr.label || "Home",
                  });
                  setIsAddingAddress(true);
                }} className="text-[11px] font-black text-brand-600 border border-rose-100 bg-rose-50 px-3 py-1.5 rounded-lg hover:bg-rose-100 transition-colors">Edit</button>
                
                <button onClick={() => setDeleteAddressId(addr.id)} className="text-[11px] font-bold text-gray-500 border border-gray-100 bg-gray-50 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">Delete</button>

                {!addr.isDefault && <button onClick={() => handleSetDefaultAddress(addr.id)} className="text-[11px] font-bold text-gray-500 border border-gray-100 bg-gray-50 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors ml-auto">Set Default</button>}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Add/Edit Address Modal ── */}
      <Modal isOpen={isAddingAddress} onClose={() => setIsAddingAddress(false)} title={editingAddressId ? "Edit Address" : "Add New Address"} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
              <input value={newAddress.fullName} onChange={e => setNewAddress({...newAddress, fullName: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600" placeholder="John Doe" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Street Address</label>
              <input value={newAddress.addressLine1} onChange={e => setNewAddress({...newAddress, addressLine1: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600" placeholder="123 Main St, Apt 4B" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">City</label>
              <input value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600" placeholder="City" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">State</label>
              <input value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600" placeholder="State" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Pincode</label>
              <input value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600" placeholder="Pincode" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone</label>
              <input value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600" placeholder="Phone Number" />
            </div>
          </div>
          <button
            className="w-full mt-2 bg-brand-600 text-white font-black text-[12px] uppercase tracking-widest py-3.5 rounded-xl shadow-md shadow-rose-100 hover:opacity-90 transition-opacity disabled:opacity-50"
            onClick={handleAddAddress}
            disabled={submittingAddress}
          >
            {submittingAddress ? "Saving..." : "Save Address"}
          </button>
        </div>
      </Modal>

      {/* ── Delete Address Modal ── */}
      <Modal isOpen={!!deleteAddressId} onClose={() => setDeleteAddressId(null)} title="Delete Address" size="sm">
        <div className="space-y-4">
          <p className="text-[13px] text-gray-600 font-medium">Are you sure you want to delete this address? This action cannot be undone.</p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setDeleteAddressId(null)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-[12px] font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAddress}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-[12px] font-black uppercase tracking-wider hover:opacity-90 transition-opacity shadow-md shadow-red-100"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
