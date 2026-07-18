"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { api } from "../../data/api";

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<any[]>([]);

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const response = await api.getCategorias();
        const data = response?.result?.data || response?.result || response?.data || response || [];
        setCategorias(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al cargar categorias:", error);
      }
    };
    cargarCategorias();
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <Sidebar active="Categorías" role="cliente" />
      <main style={{ flex: 1, padding: "24px" }}>
        <div style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px", maxWidth: "560px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#111", marginBottom: "16px" }}>Categorías</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                {["ID", "Nombre", "Info"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "0 8px 10px 0", fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categorias.length === 0 ? (
                <tr><td colSpan={3} style={{ padding: "16px 0", color: "#6b7280" }}>Cargando...</td></tr>
              ) : (
                categorias.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px 8px 12px 0", color: "#9ca3af", fontFamily: "monospace" }}>{c.id.split('-')[0]}</td>
                    <td style={{ padding: "12px 8px 12px 0", color: "#2563eb", fontWeight: 500 }}>{c.name}</td>
                    <td style={{ padding: "12px 8px 12px 0", color: "#374151" }}>Disponible</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}