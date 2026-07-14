"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import Sidebar from "@/components/Sidebar";

const categoriasIniciales = [
  { id: 1, nombre: "Lácteos" },
  { id: 2, nombre: "Granos" },
  { id: 3, nombre: "Enlatados" },
  { id: 4, nombre: "Aceites" },
  { id: 5, nombre: "Bebidas" },
];

export default function AdminCategoriasPage() {
  const [categorias, setCategorias] = useState(categoriasIniciales);
  const [mostrarForm, setMostrarForm] = useState(false);

  const [nombre, setNombre] = useState("");

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor completa todos los campos",
      });
      return;
    }

    const nuevaCategoria = {
      id:
        categorias.length > 0
          ? Math.max(...categorias.map((c) => c.id)) + 1
          : 1,
      nombre: nombre.trim(),
    };

    setCategorias([...categorias, nuevaCategoria]);

    setNombre("");
    setMostrarForm(false);

    Swal.fire({
      icon: "success",
      title: "Categoría creada",
      text: `${nuevaCategoria.nombre} fue agregada correctamente`,
    });
  };

  const editarCategoria = async (id: number) => {
    const categoria = categorias.find((c) => c.id === id);

    if (!categoria) return;

    const { value } = await Swal.fire({
      title: "Editar Categoría",
      html: `
        <input
          id="swal-nombre"
          class="swal2-input"
          placeholder="Nombre"
          value="${categoria.nombre}"
        >
      `,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const nombre = (
          document.getElementById("swal-nombre") as HTMLInputElement
        ).value;

        if (!nombre.trim()) {
          Swal.showValidationMessage("El nombre es obligatorio");
          return false;
        }

        return { nombre: nombre.trim() };
      },
    });

    if (!value) return;

    setCategorias(
      categorias.map((c) =>
        c.id === id
          ? {
              ...c,
              nombre: value.nombre,
            }
          : c
      )
    );

    Swal.fire({
      icon: "success",
      title: "Actualizada",
      text: "La categoría fue actualizada correctamente",
    });
  };

  const eliminarCategoria = async (id: number) => {
    const categoria = categorias.find((c) => c.id === id);

    if (!categoria) return;

    const result = await Swal.fire({
      title: "¿Eliminar categoría?",
      text: categoria.nombre,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    setCategorias(categorias.filter((c) => c.id !== id));

    Swal.fire({
      icon: "success",
      title: "Eliminada",
      text: "La categoría fue eliminada correctamente",
    });
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
      }}
    >
      <Sidebar active="Categorías" role="admin" />

      <main style={{ flex: 1, padding: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "16px",
          }}
        >
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            style={{
              backgroundColor: "#111",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "8px 18px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {mostrarForm ? "Cerrar Formulario" : "+ Nueva Categoría"}
          </button>
        </div>

        {mostrarForm && (
          <form
            onSubmit={handleGuardar}
            style={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "24px",
              marginBottom: "20px",
            }}
          >
            <h2
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#111",
                marginBottom: "20px",
              }}
            >
              Crear Categoría
            </h2>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: "4px",
                }}
              >
                Nombre
              </label>

              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Carnes Frías"
                style={{
                  width: "100%",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  fontSize: "14px",
                  color: "#111",
                  backgroundColor: "#f9fafb",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="submit"
                style={{
                  backgroundColor: "#111",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 20px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Guardar
              </button>

              <button
                type="button"
                onClick={() => setMostrarForm(false)}
                style={{
                  backgroundColor: "#fff",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  padding: "8px 20px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "20px",
          }}
        >
          <h2
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#111",
              marginBottom: "16px",
            }}
          >
            Categorías
          </h2>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                {["ID", "Nombre", "Acciones"].map((h) => (
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
              {categorias.map((c) => (
                <tr
                  key={c.id}
                  style={{
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  <td
                    style={{
                      padding: "12px 8px 12px 0",
                      color: "#9ca3af",
                      fontFamily: "monospace",
                    }}
                  >
                    {c.id}
                  </td>

                  <td
                    style={{
                      padding: "12px 8px 12px 0",
                      color: "#111",
                      fontWeight: 500,
                    }}
                  >
                    {c.nombre}
                  </td>

                  <td style={{ padding: "12px 8px 12px 0" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                      }}
                    >
                      <button
                        onClick={() => editarCategoria(c.id)}
                        style={{
                          border: "1px solid #d1d5db",
                          borderRadius: "6px",
                          padding: "4px 14px",
                          fontSize: "13px",
                          cursor: "pointer",
                          backgroundColor: "#fff",
                          color: "#374151",
                        }}
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => eliminarCategoria(c.id)}
                        style={{
                          backgroundColor: "#dc2626",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          padding: "4px 14px",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}