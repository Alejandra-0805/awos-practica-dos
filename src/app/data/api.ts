const BASE_URL = "https://awos-two-production.up.railway.app/api/v1";

// ─── Token helpers ────────────────────────────────────────────────────────────

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

// ─── Core request ─────────────────────────────────────────────────────────────

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

  // Token expirado o inválido → limpiar sesión y redirigir al login
  if (response.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Sesión expirada. Inicia sesión de nuevo.");
  }

  if (!response.ok) {
    // El backend responde { code, message, details }. `details` trae los
    // errores por campo (ej: { name: "El nombre es obligatorio." }).
    // Antes esto se perdía y solo veías "Error 400" sin saber por qué.
    let mensaje = `Error ${response.status}`;
    try {
      const body = await response.json();
      if (body?.details && typeof body.details === "object") {
        mensaje = Object.values(body.details).join(" ");
      } else if (body?.message) {
        mensaje = body.message;
      }
    } catch {
      // sin cuerpo JSON, nos quedamos con el mensaje genérico
    }
    throw new Error(mensaje);
  }

  // DELETE suele responder 204 sin body
  if (response.status === 204) return null;

  return response.json();
};

// ─── API ──────────────────────────────────────────────────────────────────────

export const api = {
  // Auth
  login: async (data: { username: string; password: string }) => {
    const res = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res?.token) {
      saveToken(res.token);
      if (res.user) {
        localStorage.setItem("user", JSON.stringify(res.user));
      }
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
    // Si el backend devuelve token al registrar, lo guardamos también
    if (res?.token) {
      saveToken(res.token);
    }
    return res;
  },

  logout: () => {
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },

  isAuthenticated: () => !!getToken(),

  // Categorías (requieren token)
  getCategorias: () => apiRequest("/categories"),

  crearCategoria: (data: unknown) =>
    apiRequest("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  actualizarCategoria: (id: string, data: unknown) =>
    apiRequest(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  eliminarCategoria: (id: string) =>
    apiRequest(`/categories/${id}`, {
      method: "DELETE",
    }),

  // Proveedores
  getProveedores: () => apiRequest("/suppliers"),

  getProveedor: (id: string) => apiRequest(`/suppliers/${id}`),

  crearProveedor: (data: unknown) =>
    apiRequest("/suppliers", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  actualizarProveedor: (id: string, data: unknown) =>
    apiRequest(`/suppliers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  eliminarProveedor: (id: string) =>
    apiRequest(`/suppliers/${id}`, {
      method: "DELETE",
    }),

  // Productos
  getProductos: () => apiRequest("/products"),

  getProducto: (id: string) => apiRequest(`/products/${id}`),

  buscarProductosExternos: (search: string) =>
    apiRequest(`/products/external?search=${encodeURIComponent(search)}`),

  crearProducto: (data: unknown) =>
    apiRequest("/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  actualizarProducto: (id: string, data: unknown) =>
    apiRequest(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  eliminarProducto: (id: string) =>
    apiRequest(`/products/${id}`, {
      method: "DELETE",
    }),

  // Usuarios (requieren token)
  getUsuarios: () => apiRequest("/users"),

  getUsuario: (id: string) => apiRequest(`/users/${id}`),

  actualizarUsuario: (id: string, data: unknown) =>
    apiRequest(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  eliminarUsuario: (id: string) =>
    apiRequest(`/users/${id}`, {
      method: "DELETE",
    }),

  // Compras
  getCompras: () => apiRequest("/purchase"),

  getCompra: (id: string) => apiRequest(`/purchase/${id}`),

  crearCompra: (data: unknown) =>
    apiRequest("/purchase", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  eliminarCompra: (id: string) =>
    apiRequest(`/purchase/${id}`, {
      method: "DELETE",
    }),
};