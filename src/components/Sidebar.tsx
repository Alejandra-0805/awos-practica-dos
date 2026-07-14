"use client";

import Link from "next/link";

type SidebarProps = {
  active: string;
  role?: "cliente" | "admin";
};

const clienteLinks = [
  { label: "Perfil", href: "/dashboard/perfil" },
  { label: "Productos", href: "/dashboard/productos" },
  { label: "Categorías", href: "/dashboard/categorias" },
];

const adminLinks = [
  { label: "Perfil", href: "/dashboard/admin/perfil" },
  { label: "Productos", href: "/dashboard/admin/productos" },
  { label: "Categorías", href: "/dashboard/admin/categorias" },
  { label: "Proveedores", href: "/dashboard/proveedores" },
  { label: "Compras", href: "/dashboard/compras" },
  { label: "Usuarios", href: "/dashboard/admin/register" },
];

export default function Sidebar({
  active,
  role = "cliente",
}: SidebarProps) {
  const links = role === "admin" ? adminLinks : clienteLinks;
  const isAdmin = role === "admin";

  return (
    <aside
      style={{
        width: "210px",
        minHeight: "100vh",
        backgroundColor: "#1a1a1a",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #333",
        }}
      >
        <span style={{ fontWeight: 700, fontSize: "15px" }}>
          🛒 Abarrotes
        </span>
      </div>

      {/* Usuario */}
      <div
        style={{
          padding: "12px 20px",
          borderBottom: "1px solid #333",
        }}
      >
        <p
          style={{
            fontWeight: 600,
            fontSize: "14px",
            margin: 0,
          }}
        >
          Juan Pérez
        </p>

        <span
          style={{
            fontSize: "12px",
            color: isAdmin ? "#93c5fd" : "#9ca3af",
          }}
        >
          {isAdmin ? "Admin" : "Cliente"}
        </span>
      </div>

      {/* Navegación */}
      <nav style={{ flex: 1, padding: "8px" }}>
        {links.map((link) => {
          const isActive = active === link.label;

          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: "block",
                padding: "9px 14px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: isActive ? 600 : 400,
                marginBottom: "2px",
                textDecoration: "none",
                backgroundColor: isActive ? "#ffffff" : "transparent",
                color: isActive ? "#111" : "#d1d5db",
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Cerrar sesión */}
      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid #333",
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: "14px",
            color: "#f87171",
            textDecoration: "none",
          }}
        >
          Cerrar sesión
        </Link>
      </div>
    </aside>
  );
}
