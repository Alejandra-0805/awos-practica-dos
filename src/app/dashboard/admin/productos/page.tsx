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

function obtenerListaProductos(response: unknown): Producto[] {
  if (Array.isArray(response)) {
    return response as Producto[];
  }

  if (response && typeof response === "object") {
    const resultado = response as {
      data?: Producto[] | { content?: Producto[] };
      content?: Producto[];
    };

    if (Array.isArray(resultado.content)) {
      return resultado.content;
    }

    if (Array.isArray(resultado.data)) {
      return resultado.data;
    }

    if (resultado.data && Array.isArray(resultado.data.content)) {
      return resultado.data.content;
    }
  }

  return [];
}

export default function AdminProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);

  const cargarProductos = async () => {
    try {
      const response = await api.getProductos();
      setProductos(obtenerListaProductos(response));
    } catch (error) {
      console.error("Error al cargar productos:", error);

      await Swal.fire({
        icon: "error",
        title: "No se pudieron cargar los productos",
        text: "Verifica que el backend esté encendido y que la URL de la API sea correcta.",
      });
    }
  };

  useEffect(() => {
    let componenteActivo = true;

    api
      .getProductos()
      .then((response) => {
        if (componenteActivo) {
          setProductos(obtenerListaProductos(response));
        }
      })
      .catch((error) => {
        console.error("Error al cargar productos:", error);
      });

    return () => {
      componenteActivo = false;
    };
  }, []);

  const normalizarTexto = (texto: string) =>
    texto
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const crearProductoManual = async (nombreInicial = "") => {
    const { value } = await Swal.fire({
      title: "Agregar producto manualmente",
      html: `
        <input
          id="nombre"
          class="swal2-input"
          placeholder="Nombre"
          value="${nombreInicial.replace(/"/g, "&quot;")}"
        >
        <input
          id="categoria"
          class="swal2-input"
          placeholder="Categoría"
        >
        <input
          id="precio"
          class="swal2-input"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Precio"
        >
      `,
      showCancelButton: true,
      confirmButtonText: "Guardar producto",
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      preConfirm: () => {
        const nombre = (
          document.getElementById("nombre") as HTMLInputElement
        ).value.trim();

        const categoria = (
          document.getElementById("categoria") as HTMLInputElement
        ).value.trim();

        const precio = Number(
          (document.getElementById("precio") as HTMLInputElement).value
        );

        if (!nombre || !categoria || !precio || precio <= 0) {
          Swal.showValidationMessage(
            "Completa todos los campos y escribe un precio mayor a 0."
          );
          return false;
        }

        const yaExiste = productos.some(
          (producto) =>
            normalizarTexto(producto.name) === normalizarTexto(nombre)
        );

        if (yaExiste) {
          Swal.showValidationMessage(
            "Ya existe un producto registrado con ese nombre."
          );
          return false;
        }

        return {
          nombre,
          categoria,
          precio,
        };
      },
    });

    if (!value) return;

    try {
      await api.crearProducto({
        name: value.nombre,
        price: value.precio,
        categoryName: value.categoria,
      });

      await cargarProductos();

      await Swal.fire({
        icon: "success",
        title: "Producto creado",
        text: `${value.nombre} fue agregado correctamente.`,
      });
    } catch (error) {
      console.error("Error al crear producto:", error);

      await Swal.fire({
        icon: "error",
        title: "No se pudo crear el producto",
        text: "Verifica los datos y que el backend esté disponible.",
      });
    }
  };

  type ProductoExterno = {
    id: string;
    name: string;
    categoryName: string;
    price?: number;
  };

  const obtenerProductosExternos = (response: unknown): ProductoExterno[] => {
    let lista: unknown[] = [];

    if (Array.isArray(response)) {
      lista = response;
    } else if (response && typeof response === "object") {
      const resultado = response as {
        data?: unknown[] | { products?: unknown[]; content?: unknown[] };
        products?: unknown[];
        content?: unknown[];
        items?: unknown[];
      };

      if (Array.isArray(resultado.products)) {
        lista = resultado.products;
      } else if (Array.isArray(resultado.content)) {
        lista = resultado.content;
      } else if (Array.isArray(resultado.items)) {
        lista = resultado.items;
      } else if (Array.isArray(resultado.data)) {
        lista = resultado.data;
      } else if (
        resultado.data &&
        typeof resultado.data === "object" &&
        Array.isArray(resultado.data.products)
      ) {
        lista = resultado.data.products;
      } else if (
        resultado.data &&
        typeof resultado.data === "object" &&
        Array.isArray(resultado.data.content)
      ) {
        lista = resultado.data.content;
      }
    }

    return lista
      .map((item, index) => {
        const producto = item as Record<string, unknown>;

        const name = String(
          producto.name ??
            producto.title ??
            producto.product_name ??
            producto.productName ??
            ""
        ).trim();

        const categoryName = String(
          producto.categoryName ??
            producto.category ??
            producto.category_name ??
            "General"
        ).trim();

        const rawPrice =
          producto.price ??
          producto.current_price ??
          producto.salePrice ??
          producto.cost;

        const parsedPrice =
          typeof rawPrice === "number"
            ? rawPrice
            : Number.parseFloat(String(rawPrice ?? ""));

        return {
          id: String(
            producto.id ??
              producto.code ??
              producto.barcode ??
              producto._id ??
              index
          ),
          name,
          categoryName: categoryName || "General",
          price:
            Number.isFinite(parsedPrice) && parsedPrice > 0
              ? parsedPrice
              : undefined,
        };
      })
      .filter((producto) => producto.name);
  };

  const escaparHtml = (texto: string) =>
    texto
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const guardarProductoExterno = async (producto: ProductoExterno) => {
    const { value } = await Swal.fire({
      title: "Agregar producto encontrado",
      html: `
        <p style="font-size:13px;color:#6b7280;margin-bottom:12px;">
          Revisa los datos antes de guardarlos en tu catálogo.
        </p>

        <input
          id="nombre-externo"
          class="swal2-input"
          placeholder="Nombre"
          value="${escaparHtml(producto.name)}"
        >

        <input
          id="categoria-externa"
          class="swal2-input"
          placeholder="Categoría"
          value="${escaparHtml(producto.categoryName)}"
        >

        <input
          id="precio-externo"
          class="swal2-input"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Precio"
          value="${producto.price ?? ""}"
        >
      `,
      showCancelButton: true,
      confirmButtonText: "Guardar producto",
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      preConfirm: () => {
        const nombre = (
          document.getElementById("nombre-externo") as HTMLInputElement
        ).value.trim();

        const categoria = (
          document.getElementById("categoria-externa") as HTMLInputElement
        ).value.trim();

        const precio = Number(
          (
            document.getElementById(
              "precio-externo"
            ) as HTMLInputElement
          ).value
        );

        if (!nombre || !categoria || !precio || precio <= 0) {
          Swal.showValidationMessage(
            "Completa todos los campos y escribe un precio mayor a 0."
          );
          return false;
        }

        const yaExiste = productos.some(
          (item) =>
            normalizarTexto(item.name) === normalizarTexto(nombre)
        );

        if (yaExiste) {
          Swal.showValidationMessage(
            "Este producto ya existe en tu catálogo."
          );
          return false;
        }

        return { nombre, categoria, precio };
      },
    });

    if (!value) return;

    try {
      await api.crearProducto({
        name: value.nombre,
        price: value.precio,
        categoryName: value.categoria,
      });

      await cargarProductos();

      await Swal.fire({
        icon: "success",
        title: "Producto agregado",
        text: `${value.nombre} fue agregado a tu catálogo.`,
      });
    } catch (error) {
      console.error("Error al guardar producto externo:", error);

      await Swal.fire({
        icon: "error",
        title: "No se pudo guardar",
        text: "La búsqueda funcionó, pero no se pudo guardar el producto en tu catálogo.",
      });
    }
  };

  const crearProducto = async () => {
    const { value: textoBusqueda } = await Swal.fire({
      title: "Buscar producto en la API externa",
      html: `
        <p style="font-size:14px;color:#374151;margin:0 0 8px;">
          Busca el producto antes de agregarlo.
        </p>
        <p style="
          font-size:13px;
          color:#92400e;
          background:#fef3c7;
          border:1px solid #fde68a;
          border-radius:6px;
          padding:8px 10px;
          margin:0;
        ">
          Nota: escribe el nombre del producto en inglés.
          Ejemplos: milk, rice, tuna, detergent.
        </p>
      `,
      input: "text",
      inputPlaceholder: "Example: milk",
      showCancelButton: true,
      confirmButtonText: "Buscar",
      cancelButtonText: "Cancelar",
      inputValidator: (value) => {
        if (!value.trim()) {
          return "Escribe el nombre del producto en inglés.";
        }

        return undefined;
      },
    });

    if (!textoBusqueda) return;

    const busqueda = textoBusqueda.trim();

    Swal.fire({
      title: "Buscando...",
      text: `Consultando productos para "${busqueda}".`,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await api.buscarProductosExternos(busqueda);
      const externos = obtenerProductosExternos(response);

      Swal.close();

      if (externos.length === 0) {
        const resultado = await Swal.fire({
          icon: "question",
          title: "Producto no encontrado",
          html: `
            <p>No se encontraron resultados para
              <strong>${escaparHtml(busqueda)}</strong>.
            </p>
            <p style="font-size:13px;color:#6b7280;">
              Puedes intentarlo nuevamente en inglés o agregarlo manualmente.
            </p>
          `,
          showCancelButton: true,
          confirmButtonText: "Agregar manualmente",
          cancelButtonText: "Cancelar",
        });

        if (resultado.isConfirmed) {
          await crearProductoManual(busqueda);
        }

        return;
      }

      const opciones = externos.slice(0, 10).reduce<Record<string, string>>(
        (acc, producto, index) => {
          acc[String(index)] = `${producto.name} — ${producto.categoryName}`;
          return acc;
        },
        {}
      );

      const { value: indiceSeleccionado } = await Swal.fire({
        title: "Selecciona un producto",
        html: `
          <p style="font-size:13px;color:#6b7280;">
            Resultados de la API externa. Los nombres pueden aparecer en inglés.
          </p>
        `,
        input: "select",
        inputOptions: opciones,
        inputPlaceholder: "Selecciona un resultado",
        showCancelButton: true,
        confirmButtonText: "Usar producto",
        cancelButtonText: "Cancelar",
        inputValidator: (value) => {
          if (value === "") {
            return "Selecciona un producto.";
          }

          return undefined;
        },
      });

      if (indiceSeleccionado === undefined) return;

      const seleccionado = externos[Number(indiceSeleccionado)];

      if (!seleccionado) {
        await Swal.fire({
          icon: "error",
          title: "Selección no válida",
          text: "No se pudo leer el producto seleccionado.",
        });
        return;
      }

      await guardarProductoExterno(seleccionado);
    } catch (error) {
      Swal.close();
      console.error("Error al buscar productos externos:", error);

      const resultado = await Swal.fire({
        icon: "error",
        title: "No se pudo consultar la API externa",
        html: `
          <p>Revisa tu conexión, el token y el endpoint externo.</p>
          <p style="font-size:13px;color:#6b7280;">
            También puedes agregar el producto manualmente.
          </p>
        `,
        showCancelButton: true,
        confirmButtonText: "Agregar manualmente",
        cancelButtonText: "Cancelar",
      });

      if (resultado.isConfirmed) {
        await crearProductoManual(busqueda);
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