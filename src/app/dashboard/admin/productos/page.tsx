"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Sidebar from "@/components/Sidebar";
import { api } from "../../../data/api";

function stockStyle(s: number) {
  if (s === 0)
    return {
      backgroundColor: "#fee2e2",
      color: "#b91c1c",
      padding: "2px 8px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: 600,
    };

  if (s <= 20)
    return {
      backgroundColor: "#ffedd5",
      color: "#c2410c",
      padding: "2px 8px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: 600,
    };

  return {
    backgroundColor: "#dcfce7",
    color: "#15803d",
    padding: "2px 8px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 600,
  };
}

function estadoStyle(e: string) {
  return e === "Activo"
    ? {
        backgroundColor: "#dcfce7",
        color: "#15803d",
        padding: "2px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 600,
      }
    : {
        backgroundColor: "#fee2e2",
        color: "#b91c1c",
        padding: "2px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 600,
      };
}

interface Producto {
  id: string;
  name: string;
  price: number;
  categoryName: string;
}

export default function AdminProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);

const cargarProductos = async () => {
  try {
    const response = await api.getProductos();
    setProductos(response.data);
  } catch (error) {
    console.error(error);
  }
};

useEffect(() => {
  cargarProductos();
}, []);

  const crearProducto = async () => {
    const { value } = await Swal.fire({
      title: "Nuevo Producto",
      html: `
        <input id="nombre" class="swal2-input" placeholder="Nombre">
        <input id="categoria" class="swal2-input" placeholder="Categoría">
        <input id="precio" class="swal2-input" type="number" placeholder="Precio">
      `,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const nombre = (
          document.getElementById("nombre") as HTMLInputElement
        ).value;

        const categoria = (
          document.getElementById("categoria") as HTMLInputElement
        ).value;

        const precio = Number(
          (document.getElementById("precio") as HTMLInputElement).value
        );

        if (!nombre || !categoria || !precio) {
          Swal.showValidationMessage("Completa todos los campos");
          return false;
        }

        return {
          nombre,
          categoria,
          precio,
        };
      },
    });

    if (value) {
      try {
        await api.crearProducto({
          name: value.nombre,
          price: value.precio,
          categoryName: value.categoria,
        });

        await cargarProductos();

        Swal.fire({
          icon: "success",
          title: "Producto creado",
        });
      } catch (error) {
        console.error(error);

        Swal.fire({
          icon: "error",
          title: "No se pudo crear el producto",
        });
      }
    }
  };

  const editarProducto = async (index: number) => {
    const producto = productos[index];

    const { value } = await Swal.fire({
      title: "Editar Producto",
      html: `
        <input id="nombre" class="swal2-input" value="${producto.name}">
        <input id="categoria" class="swal2-input" value="${producto.categoryName}">
        <input id="precio" class="swal2-input" type="number" value="${producto.price}">
      `,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const nombre = (
          document.getElementById("nombre") as HTMLInputElement
        ).value;

        const categoria = (
          document.getElementById("categoria") as HTMLInputElement
        ).value;

        const precio = Number(
          (document.getElementById("precio") as HTMLInputElement).value
        );

        if (!nombre || !categoria || !precio) {
          Swal.showValidationMessage("Completa todos los campos");
          return false;
        }

        return {
          nombre,
          categoria,
          precio,
        };
      },
    });

    if (value) {
      try {
        await api.actualizarProducto(producto.id, {
          name: value.nombre,
          price: value.precio,
          categoryName: value.categoria,
        });

        await cargarProductos();

        Swal.fire({
          icon: "success",
          title: "Producto actualizado",
        });
      } catch (error) {
        console.error(error);

        Swal.fire({
          icon: "error",
          title: "No se pudo actualizar",
        });
      }
    }
  };

  const eliminarProducto = async (index: number) => {
    const producto = productos[index];

    const result = await Swal.fire({
      title: "¿Eliminar producto?",
      text: producto.name,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await api.eliminarProducto(producto.id);

        await cargarProductos();

        Swal.fire({
          icon: "success",
          title: "Producto eliminado",
        });
      } catch (error) {
        console.error(error);

        Swal.fire({
          icon: "error",
          title: "No se pudo eliminar",
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
      <Sidebar active="Productos" role="admin" />

      <main style={{ flex: 1, padding: "24px" }}>
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "20px",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Buscar producto..."
            style={{
              flex: 1,
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              padding: "8px 14px",
              fontSize: "14px",
              color: "#111",
              backgroundColor: "#fff",
            }}
          />

          <button
            onClick={crearProducto}
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
            + Nuevo Producto
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
              marginBottom: "16px",
            }}
          >
            Catálogo de Productos
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
                {[
                  "Nombre",
                  "Categoría",
                  "Precio",
                  "Stock",
                  "Estado",
                  "Acciones",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "0 8px 10px 0",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#6b7280",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {productos.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "12px 8px 12px 0" }}>{p.name}</td>

                  <td style={{ padding: "12px 8px 12px 0" }}>
                    {p.categoryName}
                  </td>

                  <td style={{ padding: "12px 8px 12px 0" }}>
                    ${p.price}
                  </td>

                  <td style={{ padding: "12px 8px 12px 0" }}>
                    <span style={stockStyle(100)}>
                      100 pzs
                    </span>
                  </td>

                  <td style={{ padding: "12px 8px 12px 0" }}>
                    <span style={estadoStyle("Activo")}>
                      Activo
                    </span>
                  </td>

                  <td style={{ padding: "12px 8px 12px 0" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => editarProducto(i)}
                        style={{
                          border: "1px solid #d1d5db",
                          borderRadius: "6px",
                          padding: "4px 14px",
                          cursor: "pointer",
                          backgroundColor: "#fff",
                        }}
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => eliminarProducto(i)}
                        style={{
                          backgroundColor: "#dc2626",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          padding: "4px 14px",
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