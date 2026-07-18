const BASE_URL = "https://awos-two-production.up.railway.app/api/v1";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function saveToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
}

function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/"; 
    }
    throw new Error("Sesión expirada. Inicia sesión de nuevo.");
  }

  if (!response.ok) {|
    let mensaje = `Error ${response.status}`;
    try {
      const body = await response.json();
      if (body?.details && typeof body.details === "object") {
        mensaje = Object.values(body.details).join(" ");
      } else if (body?.message) {
        mensaje = body.message;
      }
    } catch {
    }
    throw new Error(mensaje);
  }

  if (response.status === 204) return null;
  return response.json();
};

export const api = {
  // Auth
  login: async (data: { username: string; password: string }) => {
    const res = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (res?.token) {
      saveToken(res.token);
      const userData = {
        id: res.id,
        fullName: res.name,
        username: res.username,
        email: res.email,
        role: res.role,
      };
      localStorage.setItem("user", JSON.stringify(userData));
      res.user = userData; 
    }
    return res;
  },
  register: async (data: {
    name: string;
    username: string;
    email: string;
    password: string;
  }) => {
    const res = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res?.token) {
      saveToken(res.token);
    }
    return res;
  },
  logout: () => {
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  },
  isAuthenticated: () => !!getToken(),

  // Categorías
  getCategorias: () => apiRequest("/categories"),
  crearCategoria: (data: unknown) =>
    apiRequest("/categories", { method: "POST", body: JSON.stringify(data) }),
  actualizarCategoria: (id: string, data: unknown) =>
    apiRequest(`/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  eliminarCategoria: (id: string) =>
    apiRequest(`/categories/${id}`, { method: "DELETE" }),

  // Proveedores
  getProveedores: () => apiRequest("/suppliers"),
  getProveedor: (id: string) => apiRequest(`/suppliers/${id}`),
  crearProveedor: (data: unknown) =>
    apiRequest("/suppliers", { method: "POST", body: JSON.stringify(data) }),
  actualizarProveedor: (id: string, data: unknown) =>
    apiRequest(`/suppliers/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  eliminarProveedor: (id: string) =>
    apiRequest(`/suppliers/${id}`, { method: "DELETE" }),

  // Productos
  getProductos: () => apiRequest("/products"),
  getProducto: (id: string) => apiRequest(`/products/${id}`),
  buscarProductosExternos: (search: string) =>
    apiRequest(`/products/external?search=${encodeURIComponent(search)}`),
  crearProducto: (data: unknown) =>
    apiRequest("/products", { method: "POST", body: JSON.stringify(data) }),
  actualizarProducto: (id: string, data: unknown) =>
    apiRequest(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  eliminarProducto: (id: string) =>
    apiRequest(`/products/${id}`, { method: "DELETE" }),

  // Usuarios
  getUsuarios: () => apiRequest("/users"),
  getUsuario: (id: string) => apiRequest(`/users/${id}`),
  actualizarUsuario: (id: string, data: unknown) =>
    apiRequest(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  eliminarUsuario: (id: string) =>
    apiRequest(`/users/${id}`, { method: "DELETE" }),

  // Compras
  getCompras: () => apiRequest("/purchase"),
  getCompra: (id: string) => apiRequest(`/purchase/${id}`),
  crearCompra: (data: unknown) =>
    apiRequest("/purchase", { method: "POST", body: JSON.stringify(data) }),
  eliminarCompra: (id: string) =>
    apiRequest(`/purchase/${id}`, { method: "DELETE" }),
};