"use client";

import { useEffect, useState } from "react";
import swal from "sweetalert2";
import Sidebar from "@/components/Sidebar";
import { api } from "../../data/api";

type Producto = {
  id: string;
  name: string;
  categoria?: string;
  precio?: number | string;
  stock?: number;
  estado?: string;
};

function stockStyle(s: number) {
  const baseStyle = {
    padding: "2px 8px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 600,
  };

  if (s === 0) return { ...baseStyle, backgroundColor: "#fee2e2", color: "#b91c1c" };
  if (s <= 20) return { ...baseStyle, backgroundColor: "#ffedd5", color: "#c2410c" };
  return { ...baseStyle, backgroundColor: "#dcfce7", color: "#15803d" };
}

function estadoStyle(e: string) {
  const baseStyle = {
    padding: "2px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 600,
  };

  return e === "Activo"
    ? { ...baseStyle, backgroundColor: "#dcfce7", color: "#15803d" }
    : { ...baseStyle, backgroundColor: "#fee2e2", color: "#b91c1c" };
}

export default function ProductosPage() {
const [productos, setProductos] = useState<Producto[]>([]);
const [loading, setLoading] = useState(true);
const [busqueda, setBusqueda] = useState("");

const cargarProductos = async () => {
  try {
    const data = await api.getProductos();

    console.log("Productos:", data);

    setProductos(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Error cargando productos:", error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  const cargar = async () => {
    await cargarProductos();
  };

  cargar();
}, []);
  const productosFiltrados = productos.filter((producto) =>
    producto?.name?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <Sidebar active="Productos" role="cliente" />

      <main style={{ flex: 1, padding: "24px" }}>
        <input
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            width: "100%",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            padding: "8px 14px",
            fontSize: "14px",
            color: "#111",
            backgroundColor: "#fff",
            marginBottom: "20px",
            boxSizing: "border-box",
          }}
        />

        <div style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#111", marginBottom: "16px" }}>
            Catálogo de Productos
          </h2>

          {loading ? (
            <p>Cargando productos...</p>
          ) : (
            <>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                    {["Nombre", "Categoría", "Precio", "Stock", "Estado"].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "0 8px 10px 0",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#6b7280",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {productosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: "24px", textAlign: "center", color: "#6b7280" }}>
                        No se encontraron productos.
                      </td>
                    </tr>
                  ) : (
                    productosFiltrados.map((p) => (
                      <tr key={p.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "12px 8px 12px 0", color: "#111", fontWeight: 500 }}>
                          {p.name}
                        </td>
                        <td style={{ padding: "12px 8px 12px 0", color: "#2563eb", fontWeight: 500 }}>
                          {p.categoria || "Sin categoría"}
                        </td>
                        <td style={{ padding: "12px 8px 12px 0", color: "#374151" }}>
                          {p.precio !== undefined ? `$${p.precio}` : "-"}
                        </td>
                        <td style={{ padding: "12px 8px 12px 0" }}>
                          {/* 5. Renderizado dinámico usando los datos reales del producto */}
                          <span style={stockStyle(p.stock ?? 0)}>
                            {p.stock ?? 0} pzs
                          </span>
                        </td>
                        <td style={{ padding: "12px 8px 12px 0" }}>
                          <span style={estadoStyle(p.estado || "Inactivo")}>
                            {p.estado || "Inactivo"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "14px",
                  paddingTop: "12px",
                  borderTop: "1px solid #f3f4f6",
                }}
              >
                <span style={{ fontSize: "13px", color: "#6b7280" }}>
                  {productosFiltrados.length} resultados
                </span>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button style={{ border: "1px solid #d1d5db", borderRadius: "6px", padding: "4px 12px", fontSize: "13px", cursor: "pointer", backgroundColor: "#fff", color: "#374151" }}>
                    ← Ant
                  </button>
                  <button style={{ border: "1px solid #d1d5db", borderRadius: "6px", padding: "4px 12px", fontSize: "13px", cursor: "pointer", backgroundColor: "#fff", color: "#374151" }}>
                    Sig →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}