import api from "@/lib/api";

export const authService = {
  loginAdmin: async (data: any) => api.post("/auth/admin/login", data),
  loginCustomer: async (data: any) => api.post("/auth/login", data),
  registerCustomer: async (data: any) => api.post("/auth/register", data),
  logout: async () => api.post("/auth/logout"),
};
