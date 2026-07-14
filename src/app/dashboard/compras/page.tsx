"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import Sidebar from "@/components/Sidebar";

const comprasIniciales = [
  {
    factura: "FAC-001",
    proveedor: "Distribuidora Lala S.A.",
    items: "3 productos",
    fecha: "2026-06-10",
  },
  {
    factura: "FAC-002",
    proveedor: "Enlatados del Norte",
    items: "5 productos",
    fecha: "2026-06-12",
  },
];

export default function ComprasPage() {
  const [compras] = useState(comprasIniciales);

  const registrarCompra = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Registrar Compra",
      html: `
        <input id="swal-proveedor" class="swal2-input" placeholder="Proveedor">
        <input id="swal-factura" class="swal2-input" placeholder="Factura">
        <textarea id="swal-productos" class="swal2-textarea" placeholder="Productos comprados"></textarea>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const proveedor = (
          document.getElementById("swal-proveedor") as HTMLInputElement
        ).value;

        const factura = (
          document.getElementById("swal-factura") as HTMLInputElement
        ).value;

        const productos = (
          document.getElementById("swal-productos") as HTMLTextAreaElement
        ).value;

        if (!proveedor || !factura || !productos) {
          Swal.showValidationMessage(
            "Todos los campos son obligatorios"
          );
          return false;
        }

        return { proveedor, factura, productos };
      },
    });

    if (formValues) {
      Swal.fire({
        icon: "success",
        title: "Compra registrada",
        text: `Factura ${formValues.factura} guardada correctamente.`,
      });
    }
  };

  const verDetalle = (compra: (typeof comprasIniciales)[0]) => {
    Swal.fire({
      title: compra.factura,
      html: `
        <p><strong>Proveedor:</strong> ${compra.proveedor}</p>
        <p><strong>Productos:</strong> ${compra.items}</p>
        <p><strong>Fecha:</strong> ${compra.fecha}</p>
      `,
      icon: "info",
      confirmButtonText: "Cerrar",
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
      <Sidebar active="Compras" role="admin" />

      <main style={{ flex: 1, padding: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "16px",
          }}
        >
          <button
            onClick={registrarCompra}
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
            + Registrar Compra
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
            Historial de Compras
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
                  "Factura",
                  "Proveedor",
                  "Productos",
                  "Fecha",
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
              {compras.map((c, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  <td
                    style={{
                      padding: "12px 8px 12px 0",
                      color: "#2563eb",
                      fontFamily: "monospace",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    {c.factura}
                  </td>

                  <td
                    style={{
                      padding: "12px 8px 12px 0",
                      color: "#2563eb",
                      fontWeight: 500,
                    }}
                  >
                    {c.proveedor}
                  </td>

                  <td
                    style={{
                      padding: "12px 8px 12px 0",
                      color: "#4b5563",
                    }}
                  >
                    {c.items}
                  </td>

                  <td
                    style={{
                      padding: "12px 8px 12px 0",
                      color: "#6b7280",
                    }}
                  >
                    {c.fecha}
                  </td>

                  <td style={{ padding: "12px 8px 12px 0" }}>
                    <button
                      onClick={() => verDetalle(c)}
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
                      Ver detalle
                    </button>
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
