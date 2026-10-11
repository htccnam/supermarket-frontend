const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { credentials: "include", headers: { "Content-Type": "application/json" }, ...options });
  if (!response.ok) throw new Error((await response.json()).error ?? "Request failed");
  return response.status === 204 ? (undefined as T) : response.json();
}
export type User = { id: string; email: string; name: string; role: "STAFF" | "ADMIN" };
export type Product = { id: string; sku: string; name: string; salePrice: string; stock: number; unit: string; isActive: boolean };
export type Dashboard = { products: number; invoices: number; revenue: string; lowStock: number; bestSelling: { product: string; quantity: number }[] };
export type Invoice = { id: string; code: string; status: "COMPLETED" | "CANCELLED"; total: string; paymentMethod: "CASH" | "CARD"; createdAt: string; cancelReason?: string };
export type StaffUser = { id: string; name: string; email: string; role: "STAFF" | "ADMIN"; isActive: boolean };
export type AuditLog = { id: string; action: string; entity: string; createdAt: string; actor: { name: string; email: string } };
export const api = {
  login: (email: string, password: string) => request<{ user: User }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  products: (search = "") => request<Product[]>(`/products?search=${encodeURIComponent(search)}`),
  myInvoices: (search = "") => request<Invoice[]>(`/invoices?search=${encodeURIComponent(search)}`),
  invoice: (items: { productId: string; quantity: number }[], paymentMethod: "CASH" | "CARD") => request("/invoices", { method: "POST", body: JSON.stringify({ items, paymentMethod }) }),
  dashboard: () => request<Dashboard>("/admin/dashboard"),
  invoices: () => request<Invoice[]>("/admin/invoices"),
  cancelInvoice: (id: string, reason: string) => request(`/admin/invoices/${id}/cancel`, { method: "PATCH", body: JSON.stringify({ reason }) }),
  users: () => request<StaffUser[]>("/admin/users"),
  createUser: (data: { name: string; email: string; role: "STAFF" | "ADMIN" }) => request<StaffUser>("/admin/users", { method: "POST", body: JSON.stringify(data) }),
  toggleUser: (id: string) => request<StaffUser>(`/admin/users/${id}/toggle`, { method: "PATCH" }),
  auditLogs: () => request<AuditLog[]>("/admin/audit-logs"),
  createProduct: (data: { sku: string; name: string; salePrice: number; costPrice: number; unit: string; stock: number }) => request<Product>("/admin/products", { method: "POST", body: JSON.stringify(data) }),
  adjustStock: (id: string, quantity: number, reason: string) => request<Product>(`/admin/products/${id}/stock`, { method: "PATCH", body: JSON.stringify({ quantity, reason }) })
  ,toggleProduct: (id: string, isActive: boolean) => request<Product>(`/admin/products/${id}/toggle`, { method: "PATCH", body: JSON.stringify({ isActive }) })
};
