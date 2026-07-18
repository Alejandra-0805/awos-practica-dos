"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function PerfilPage() {
  const [user, setUser] = useState<any>({});

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const campos = [
    { label: "Nombre", value: user.fullName || "Cargando..." },
    { label: "Usuario", value: user.username || "Cargando..." },
    { label: "Correo", value: user.email || "Cargando..." },
    { label: "Rol", value: "Cliente" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <Sidebar active="Perfil" role="cliente" />
      <main style={{ flex: 1, padding: "24px" }}>
        <div style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "24px", maxWidth: "520px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#111", marginBottom: "20px" }}>Mi Perfil</h2>
          {campos.map(f => (
            <div key={f.label} style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>{f.label}</label>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: "6px", padding: "8px 12px", fontSize: "14px", color: "#111", backgroundColor: "#f9fafb" }}>{f.value}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}