"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Sidebar from "@/components/Sidebar";
import { api } from "../../../data/api";

export default function AdminCategoriasPage() {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(true);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      const response = await api.getCategorias();
      const data = response?.result?.data || response?.result || response?.data || response || [];
      setCategorias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar categorias:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      Swal.fire({ icon: "warning", title: "Campos incompletos", text: "Por favor completa todos los campos" });
      return;
    }
    try {
      await api.crearCategoria({ name: nombre.trim() });
      Swal.fire({ icon: "success", title: "Categoría creada" });
      setNombre("");
      setMostrarForm(false);
      await cargarCategorias();
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Error", text: error.message || "No se pudo crear" });
    }
  };

  const editarCategoria = async (id: string, nombreActual: string) => {
    const { value } = await Swal.fire({
      title: "Editar Categoría",
      html: `<input id="swal-nombre" class="swal2-input" placeholder="Nombre" value="${nombreActual}">`,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const inputNombre = (document.getElementById("swal-nombre") as HTMLInputElement).value;
        if (!inputNombre.trim()) {
          Swal.showValidationMessage("El nombre es obligatorio");
          return false;
        }
        return { name: inputNombre.trim() };
      },
    });

    if (value) {
      try {
        await api.actualizarCategoria(id, value);
        Swal.fire({ icon: "success", title: "Actualizada", text: "La categoría fue actualizada" });
        await cargarCategorias();
      } catch (error: any) {
        Swal.fire({ icon: "error", title: "Error", text: error.message || "No se pudo actualizar" });
      }
    }
  };

  const eliminarCategoria = async (id: string, nombreActual: string) => {
    const result = await Swal.fire({
      title: "¿Eliminar categoría?",
      text: nombreActual,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await api.eliminarCategoria(id);
        Swal.fire({ icon: "success", title: "Eliminada", text: "La categoría fue eliminada" });
        await cargarCategorias();
      } catch (error: any) {
        Swal.fire({ icon: "error", title: "Error", text: error.message || "No se pudo eliminar" });
      }
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <Sidebar active="Categorías" role="admin" />
      <main style={{ flex: 1, padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            style={{ backgroundColor: "#111", color: "#fff", border: "none", borderRadius: "6px", padding: "8px 18px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
          >
            {mostrarForm ? "Cerrar Formulario" : "+ Nueva Categoría"}
          </button>
        </div>

        {mostrarForm && (
          <form onSubmit={handleGuardar} style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "24px", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#111", marginBottom: "20px" }}>Crear Categoría</h2>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>Nombre</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Carnes Frías" style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: "6px", padding: "8px 12px", fontSize: "14px", color: "#111", backgroundColor: "#f9fafb", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" style={{ backgroundColor: "#111", color: "#fff", border: "none", borderRadius: "6px", padding: "8px 20px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Guardar</button>
              <button type="button" onClick={() => setMostrarForm(false)} style={{ backgroundColor: "#fff", color: "#374151", border: "1px solid #d1d5db", borderRadius: "6px", padding: "8px 20px", fontSize: "14px", cursor: "pointer" }}>Cancelar</button>
            </div>
          </form>
        )}

        <div style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#111", marginBottom: "16px" }}>Categorías</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                {["ID", "Nombre", "Acciones"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "0 8px 10px 0", fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} style={{ padding: "16px 0", color: "#6b7280" }}>Cargando...</td></tr>
              ) : (
                categorias.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px 8px 12px 0", color: "#9ca3af", fontFamily: "monospace" }}>{c.id.split('-')[0]}</td>
                    <td style={{ padding: "12px 8px 12px 0", color: "#111", fontWeight: 500 }}>{c.name}</td>
                    <td style={{ padding: "12px 8px 12px 0" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => editarCategoria(c.id, c.name)} style={{ border: "1px solid #d1d5db", borderRadius: "6px", padding: "4px 14px", fontSize: "13px", cursor: "pointer", backgroundColor: "#fff", color: "#374151" }}>Editar</button>
                        <button onClick={() => eliminarCategoria(c.id, c.name)} style={{ backgroundColor: "#dc2626", color: "#fff", border: "none", borderRadius: "6px", padding: "4px 14px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Eliminar</button>
                      </div>
                    </td>
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