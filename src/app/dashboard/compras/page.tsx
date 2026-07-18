"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Sidebar from "@/components/Sidebar";
import { api } from "../../data/api";

export default function ComprasPage() {
  const [compras, setCompras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarCompras = async () => {
    try {
      setLoading(true);
      const response = await api.getCompras();
      const data = response?.data || response || [];
      setCompras(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar compras:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCompras();
  }, []);

  const registrarCompra = async () => {
    // 1. Cargar catálogos primero para evitar errores tipográficos
    Swal.fire({ title: "Cargando datos...", didOpen: () => Swal.showLoading() });
    let proveedores = [];
    let productos = [];
    try {
      const [resProv, resProd] = await Promise.all([
        api.getProveedores(),
        api.getProductos()
      ]);
      proveedores = resProv?.data || resProv || [];
      productos = resProd?.data || resProd || [];
      Swal.close();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudieron cargar los catálogos" });
      return;
    }

    if (proveedores.length === 0 || productos.length === 0) {
      Swal.fire({ icon: "warning", title: "Faltan datos", text: "Asegúrate de tener al menos 1 proveedor y 1 producto registrado en el sistema." });
      return;
    }

    const provOptions = proveedores.map((p: any) => `<option value="${p.name}">${p.name}</option>`).join('');
    const prodOptions = productos.map((p: any) => `<option value="${p.name}">${p.name}</option>`).join('');

    const { value: formValues } = await Swal.fire({
      title: "Registrar Compra",
      html: `
        <select id="swal-proveedor" class="swal2-select" style="width: 85%; margin: 10px auto; display: block; padding: 10px; font-size: 14px;">
          <option value="" disabled selected>Selecciona un proveedor</option>
          ${provOptions}
        </select>
        <input id="swal-factura" class="swal2-input" placeholder="Folio de Factura (ej. FAC-123)" style="width: 85%;">
        <select id="swal-producto" class="swal2-select" style="width: 85%; margin: 10px auto; display: block; padding: 10px; font-size: 14px;">
          <option value="" disabled selected>Selecciona un producto</option>
          ${prodOptions}
        </select>
        <input id="swal-cantidad" class="swal2-input" type="number" min="1" placeholder="Cantidad comprada" style="width: 85%;">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const proveedor = (document.getElementById("swal-proveedor") as HTMLSelectElement).value;
        const factura = (document.getElementById("swal-factura") as HTMLInputElement).value.trim();
        const producto = (document.getElementById("swal-producto") as HTMLSelectElement).value;
        const cantidad = parseInt((document.getElementById("swal-cantidad") as HTMLInputElement).value);

        if (!proveedor || !factura || !producto || isNaN(cantidad) || cantidad <= 0) {
          Swal.showValidationMessage("Completa todos los campos con valores válidos");
          return false;
        }

        return {
          supplierName: proveedor,
          bill: factura,
          items: [{ productName: producto, quantity: cantidad }]
        };
      },
    });

    if (formValues) {
      try {
        await api.crearCompra(formValues);
        Swal.fire({ icon: "success", title: "Compra registrada", text: `Factura ${formValues.bill} guardada exitosamente.` });
        await cargarCompras();
      } catch (error: any) {
        Swal.fire({ icon: "error", title: "Error en validación", text: error.message || "No se pudo registrar la compra" });
      }
    }
  };

  const verDetalle = (compra: any) => {
    const listaProductos = compra.items.map((i: any) => `${i.quantity}x ${i.productName}`).join('<br>');
    Swal.fire({
      title: `Factura: ${compra.bill}`,
      html: `
        <p><strong>Proveedor:</strong> ${compra.supplierName}</p>
        <p><strong>Fecha:</strong> ${new Date(compra.createdAt).toLocaleString()}</p>
        <br>
        <p><strong>Productos adquiridos:</strong></p>
        <div style="background:#f9fafb; padding:12px; border-radius:6px; text-align:left; border: 1px solid #e5e7eb;">
          ${listaProductos}
        </div>
      `,
      icon: "info",
      confirmButtonText: "Cerrar",
    });
  };

  const eliminarCompra = async (id: string, bill: string) => {
    const confirmacion = await Swal.fire({
      icon: "warning",
      title: "¿Revertir compra?",
      text: `Se eliminará la factura ${bill} y se descontará del stock.`,
      showCancelButton: true,
      confirmButtonText: "Sí, revertir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
    });

    if (confirmacion.isConfirmed) {
      try {
        await api.eliminarCompra(id);
        Swal.fire({ icon: "success", title: "Compra revertida" });
        await cargarCompras();
      } catch (error: any) {
        Swal.fire({ icon: "error", title: "No se puede eliminar", text: error.message || "No se pudo revertir la compra" });
      }
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <Sidebar active="Compras" role="admin" />
      <main style={{ flex: 1, padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
          <button onClick={registrarCompra} style={{ backgroundColor: "#111", color: "#fff", border: "none", borderRadius: "6px", padding: "8px 18px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
            + Registrar Compra
          </button>
        </div>
        <div style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#111", marginBottom: "16px" }}>Historial de Compras</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                {["Factura", "Proveedor", "Productos", "Fecha", "Acciones"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "0 8px 10px 0", fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: "16px 0", color: "#6b7280" }}>Cargando compras...</td></tr>
              ) : compras.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: "16px 0", color: "#6b7280" }}>No hay compras registradas.</td></tr>
              ) : (
                compras.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px 8px 12px 0", color: "#2563eb", fontFamily: "monospace", fontSize: "13px", fontWeight: 600 }}>{c.bill}</td>
                    <td style={{ padding: "12px 8px 12px 0", color: "#111", fontWeight: 500 }}>{c.supplierName}</td>
                    <td style={{ padding: "12px 8px 12px 0", color: "#4b5563" }}>{c.items?.length || 0} artículos</td>
                    <td style={{ padding: "12px 8px 12px 0", color: "#6b7280" }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: "12px 8px 12px 0" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => verDetalle(c)} style={{ border: "1px solid #d1d5db", borderRadius: "6px", padding: "4px 14px", fontSize: "13px", cursor: "pointer", backgroundColor: "#fff", color: "#374151" }}>
                          Detalle
                        </button>
                        <button onClick={() => eliminarCompra(c.id, c.bill)} style={{ border: "none", borderRadius: "6px", padding: "4px 14px", fontSize: "13px", cursor: "pointer", backgroundColor: "#dc2626", color: "#fff" }}>
                          Revertir
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