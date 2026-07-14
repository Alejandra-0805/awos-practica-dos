const BASE_URL = "http://localhost:4000/api/v1";

export const apiRequest = async (
endpoint: string,
options: RequestInit = {}
) => {
const response = await fetch(`${BASE_URL}${endpoint}`, {
headers: {
"Content-Type": "application/json",
...(options.headers || {}),
},
...options,
});

if (!response.ok) {
throw new Error(`Error ${response.status}`);
}

return response.json();
};

export const api = {
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

getProveedor: (id: string) =>
apiRequest(`/suppliers/${id}`),

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

getProductos: () => apiRequest("/products"),

getProducto: (id: string) =>
  apiRequest(`/products/${id}`),

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

  
register: (data: unknown) =>
apiRequest("/auth/register", {
method: "POST",
body: JSON.stringify(data),
}),

login: (data: { username: string; password: string }) =>
apiRequest("/auth/login", {
method: "POST",
body: JSON.stringify(data),
}),

getUsuarios: () => apiRequest("/users"),
};
