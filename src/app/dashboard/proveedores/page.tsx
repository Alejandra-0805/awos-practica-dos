"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { api } from "../../data/api";
import Swal from "sweetalert2";


type Proveedor = {
  id: string;
  name: string;
  phone: string;
  zipCode: string;
};

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarProveedores = async () => {
    try {
      setLoading(true);
      const response = await api.getProveedores();

      console.log("Datos recibidos del backend en la vista:", response);

      if (response && Array.isArray(response.data)) {
        setProveedores(response.data);
      } else if (Array.isArray(response)) {
        setProveedores(response);
      } else {
        console.error("El formato JSON recibido no contiene un array válido en '.data'");
        setProveedores([]);
      }
    } catch (error) {
      console.error("Error cargando proveedores en el catch del componente:", error);

      Swal.fire({
        icon: "error",
        title: "Error de Conexión",
        text: "No se pudo comunicar con el servidor de proveedores.",
      });
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  (async () => {
    await cargarProveedores();
  })();
}, []);

  const nuevoProveedor = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Nuevo Proveedor",
      html: `<input id="swal-nombre" class="swal2-input" placeholder="Nombre">
       <input id="swal-telefono" class="swal2-input" placeholder="Teléfono">
       <input id="swal-cp" class="swal2-input" placeholder="Código Postal">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const name = (
          document.getElementById("swal-nombre") as HTMLInputElement
        ).value;

        const phone = (
          document.getElementById("swal-telefono") as HTMLInputElement
        ).value;

        const zipCode = (
          document.getElementById("swal-cp") as HTMLInputElement
        ).value;

        if (!name || !phone || !zipCode) {
          Swal.showValidationMessage("Completa todos los campos");
          return false;
        }

        return { name, phone, zipCode };
      },
    });

    if (formValues) {
      try {
        await api.crearProveedor(formValues);

        Swal.fire({
          icon: "success",
          title: "Proveedor registrado",
        });

        await cargarProveedores();
      } catch {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo registrar el proveedor",
        });
      }
    }
  };

  const editarProveedor = async (proveedor: Proveedor) => {
    const { value: formValues } = await Swal.fire({
      title: "Editar Proveedor",
      html: `<input id="swal-nombre" class="swal2-input" placeholder="Nombre" value="${proveedor.name}">
       <input id="swal-telefono" class="swal2-input" placeholder="Teléfono" value="${proveedor.phone}">
       <input id="swal-cp" class="swal2-input" placeholder="Código Postal" value="${proveedor.zipCode}">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Guardar cambios",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const name = (
          document.getElementById("swal-nombre") as HTMLInputElement
        ).value;

        const phone = (
          document.getElementById("swal-telefono") as HTMLInputElement
        ).value;

        const zipCode = (
          document.getElementById("swal-cp") as HTMLInputElement
        ).value;

        if (!name || !phone || !zipCode) {
          Swal.showValidationMessage("Completa todos los campos");
          return false;
        }

        return { name, phone, zipCode };
      },
    });

    if (formValues) {
      try {
        await api.actualizarProveedor(proveedor.id, formValues);

        Swal.fire({
          icon: "success",
          title: "Proveedor actualizado",
        });

        await cargarProveedores();
      } catch {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo actualizar el proveedor",
        });
      }
    }
  };

  const eliminarProveedor = async (proveedor: Proveedor) => {
    const confirmacion = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar proveedor?",
      text: `Se eliminará "${proveedor.name}". Esta acción no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
    });

    if (confirmacion.isConfirmed) {
      try {
        await api.eliminarProveedor(proveedor.id);

        Swal.fire({
          icon: "success",
          title: "Proveedor eliminado",
        });

        await cargarProveedores();
      } catch {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo eliminar el proveedor",
        });
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
      }}
    >
      <Sidebar active="Proveedores" role="admin" />

      <main style={{ flex: 1, padding: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "16px",
          }}
        >
          <button
            onClick={nuevoProveedor}
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
            + Nuevo Proveedor
          </button>
        </div>

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
            Proveedores
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
                {["Nombre", "Teléfono", "Código Postal", "Acciones"].map(
                  (h) => (
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
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ padding: "16px 0", color: "#6b7280" }}>
                    Cargando proveedores...
                  </td>
                </tr>
              ) : proveedores.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: "16px 0", color: "#9ca3af", textAlign: "center" }}>
                    No hay proveedores registrados.
                  </td>
                </tr>
              ) : (
                proveedores.map((p) => (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    <td
                      style={{
                        padding: "12px 8px 12px 0",
                        color: "#2563eb",
                        fontWeight: 500,
                      }}
                    >
                      {p.name}
                    </td>

                    <td
                      style={{
                        padding: "12px 8px 12px 0",
                        color: "#6b7280",
                      }}
                    >
                      {p.phone}
                    </td>

                    <td
                      style={{
                        padding: "12px 8px 12px 0",
                        color: "#374151",
                      }}
                    >
                      {p.zipCode}
                    </td>

                    <td style={{ padding: "12px 8px 12px 0" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => editarProveedor(p)}
                          style={{
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            padding: "4px 14px",
                            fontSize: "13px",
                            cursor: "pointer",
                            backgroundColor: "#fff",
                          }}
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => eliminarProveedor(p)}
                          style={{
                            border: "none",
                            borderRadius: "6px",
                            padding: "4px 14px",
                            fontSize: "13px",
                            cursor: "pointer",
                            backgroundColor: "#dc2626",
                            color: "#fff",
                          }}
                        >
                          Eliminar
                        </button>
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