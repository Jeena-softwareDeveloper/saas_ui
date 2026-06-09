import api from "@/lib/api";

export const storeService = {
  getProducts: async (params?: any) => api.get("/store/products", { params }),
  getProductBySlug: async (slug: string) => api.get(`/store/products/${slug}`),
  getRelatedProducts: async (id: string) => api.get(`/store/products/${id}/related`),
  getSupportInfo: async () => api.get("/store/support"),
  createSupportTicket: async (data: any) => api.post("/store/support/tickets", data),

  getCategories: async () => api.get("/store/categories"),
  clearRemoteCart: async () => api.delete("/store/cart"),
  addToRemoteCart: async (data: { productId: string; quantity: number }) => api.post("/store/cart", data),

  getCoupons: async () => api.get("/store/coupons"),
  validateCoupon: async (code: string, cartTotal: number) => api.post("/store/checkout/validate-coupon", { code, cartTotal }),
  createAddress: async (data: any) => api.post("/store/addresses", data),
  getAddresses: async () => api.get("/store/addresses"),
  updateAddress: async (id: string, data: any) => api.put(`/store/addresses/${id}`, data),
  deleteAddress: async (id: string) => api.delete(`/store/addresses/${id}`),
  setDefaultAddress: async (id: string) => api.patch(`/store/addresses/${id}/default`),
  createPaymentIntent: async (amount: number) => api.post("/store/checkout/create-payment-intent", { amount }),
  placeOrder: async (data: any) => api.post("/store/checkout/place-order", data),
  getOrders: async () => api.get("/store/orders"),
  createReview: async (data: any) => api.post("/store/reviews", data),
};

