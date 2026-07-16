"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { api } from "../../../data/api";
import Sidebar from "@/components/Sidebar";

type Usuario = {
  id: string;
  fullName: string;
  username: string;
  email: string;
};

function obtenerListaUsuarios(response: unknown): Usuario[] {
  if (Array.isArray(response)) {
    return response as Usuario[];
  }

  if (response && typeof response === "object") {
    const resultado = response as {
      data?: Usuario[] | { content?: Usuario[] };
      content?: Usuario[];
    };

    if (Array.isArray(resultado.content)) return resultado.content;
    if (Array.isArray(resultado.data)) return resultado.data;
    if (resultado.data && Array.isArray(resultado.data.content))
      return resultado.data.content;
  }

  return [];
}

export default function RegisterPage() {
  const [nombre, setNombre] = useState("");
  const [usuario, setUsuario] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [registrando, setRegistrando] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const cargarUsuarios = async () => {
    try {
      const response = await api.getUsuarios();
      setUsuarios(obtenerListaUsuarios(response));
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  useEffect(() => {
    let componenteActivo = true;

    api
      .getUsuarios()
      .then((response) => {
        if (componenteActivo) {
          setUsuarios(obtenerListaUsuarios(response));
        }
      })
      .catch((error) => {
        console.error("Error al cargar usuarios:", error);
      })
      .finally(() => {
        if (componenteActivo) {
          setLoading(false);
        }
      });

    return () => {
      componenteActivo = false;
    };
  }, []);

  const handleRegister = async () => {
    const nombreLimpio = nombre.trim();
    const usuarioLimpio = usuario.trim();
    const correoLimpio = correo.trim().toLowerCase();

    if (!nombreLimpio || !usuarioLimpio || !correoLimpio || !password) {
      await Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor completa todos los campos.",
      });
      return;
    }

    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio);
    if (!correoValido) {
      await Swal.fire({
        icon: "warning",
        title: "Correo no válido",
        text: "Escribe un correo electrónico válido.",
      });
      return;
    }

    if (password.length < 8) {
      await Swal.fire({
        icon: "warning",
        title: "Contraseña muy corta",
        text: "La contraseña debe tener al menos 8 caracteres.",
      });
      return;
    }

    const usuarioDuplicado = usuarios.some(
      (item) => item.username.toLowerCase() === usuarioLimpio.toLowerCase()
    );
    if (usuarioDuplicado) {
      await Swal.fire({
        icon: "warning",
        title: "Usuario existente",
        text: "Ese nombre de usuario ya está registrado.",
      });
      return;
    }

    const correoDuplicado = usuarios.some(
      (item) => item.email.toLowerCase() === correoLimpio
    );
    if (correoDuplicado) {
      await Swal.fire({
        icon: "warning",
        title: "Correo existente",
        text: "Ese correo electrónico ya está registrado.",
      });
      return;
    }

    try {
      setRegistrando(true);

      await api.register({
        fullName: nombreLimpio,
        username: usuarioLimpio,
        email: correoLimpio,
        password,
      });

      await Swal.fire({
        icon: "success",
        title: "Usuario creado",
        text: `${nombreLimpio} fue registrado correctamente.`,
      });

      setNombre("");
      setUsuario("");
      setCorreo("");
      setPassword("");

      await cargarUsuarios();
    } catch (error) {
      console.error("Error al registrar usuario:", error);

      const mensaje =
        error instanceof Error && error.message.includes("400")
          ? "Verifica que la contraseña tenga al menos 8 caracteres y que todos los datos sean válidos."
          : "No fue posible registrar el usuario.";

      await Swal.fire({
        icon: "error",
        title: "Error al registrar",
        text: mensaje,
      });
    } finally {
      setRegistrando(false);
    }
  };

  const usuariosFiltrados = usuarios.filter((item) => {
    const texto = busqueda.toLowerCase();
    return (
      item.fullName?.toLowerCase().includes(texto) ||
      item.username?.toLowerCase().includes(texto) ||
      item.email?.toLowerCase().includes(texto)
    );
  });


  const inputStyle = {
    width: "100%",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#d1d5db",
    borderRadius: "6px",
    padding: "8px 12px",
    fontSize: "14px",
    boxSizing: "border-box" as const,
    color: "#111827",
    backgroundColor: "#fff",
  };

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "4px",
  };


  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
      <Sidebar active="Usuarios" role="admin" />

      <main style={{ flex: 1, padding: "24px", overflowX: "auto" }}>
        <div style={{ width: "100%", maxWidth: "1100px", margin: "0 auto" }}>

          {/* ── Formulario de creación ── */}
          <div
            style={{
              maxWidth: "500px",
              margin: "0 auto 28px",
              backgroundColor: "#fff",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              padding: "32px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h1
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#111",
                borderBottom: "1px solid #e5e7eb",
                paddingBottom: "12px",
                marginBottom: "24px",
              }}
            >
              Crear Usuario
            </h1>

            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Nombre completo</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                style={inputStyle}
                placeholder="Ejemplo: Juan Pérez"
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Usuario</label>
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                style={inputStyle}
                placeholder="Ejemplo: juanperez"
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Correo electrónico</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                style={inputStyle}
                placeholder="Ejemplo: juan@correo.com"
              />
            </div>

            <div style={{ marginBottom: "4px" }}>
              <label style={labelStyle}>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  ...inputStyle,
                  borderColor:
                    password.length > 0 && password.length < 8
                      ? "#ef4444"
                      : "#d1d5db",
                }}
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            {/* Indicador de longitud */}
            <p
              style={{
                fontSize: "12px",
                marginBottom: "20px",
                marginTop: "4px",
                color:
                  password.length === 0
                    ? "#9ca3af"
                    : password.length < 8
                    ? "#ef4444"
                    : "#16a34a",
              }}
            >
              {password.length === 0
                ? "La contraseña debe tener al menos 8 caracteres."
                : password.length < 8
                ? `Faltan ${8 - password.length} caracteres.`
                : "✓ Contraseña válida."}
            </p>

            <button
              type="button"
              onClick={handleRegister}
              disabled={registrando}
              style={{
                width: "100%",
                backgroundColor: registrando ? "#6b7280" : "#111",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "10px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: registrando ? "not-allowed" : "pointer",
              }}
            >
              {registrando ? "Registrando..." : "Registrar Usuario"}
            </button>
          </div>

          {/* ── Tabla de usuarios ── */}
          <div
            style={{
              backgroundColor: "#fff",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "16px",
                marginBottom: "20px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "18px", color: "#111827" }}>
                  Usuarios registrados
                </h2>
                <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "13px" }}>
                  Total: {usuarios.length}
                </p>
              </div>

              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar usuario..."
                style={{ ...inputStyle, width: "280px", maxWidth: "100%" }}
              />
            </div>

            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                  minWidth: "650px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#f9fafb",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    {["Usuario", "Correo"].map((encabezado) => (
                      <th
                        key={encabezado}
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontSize: "12px",
                          textTransform: "uppercase",
                          color: "#6b7280",
                        }}
                      >
                        {encabezado}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={3}
                        style={{ padding: "24px", textAlign: "center", color: "#6b7280" }}
                      >
                        Cargando usuarios...
                      </td>
                    </tr>
                  ) : usuariosFiltrados.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        style={{ padding: "24px", textAlign: "center", color: "#6b7280" }}
                      >
                        No se encontraron usuarios.
                      </td>
                    </tr>
                  ) : (
                    usuariosFiltrados.map((item) => (
                      <tr
                        key={item.id || item.email}
                        style={{ borderBottom: "1px solid #f3f4f6" }}
                      >
                        <td style={{ padding: "12px", color: "#374151" }}>
                          {item.username}
                        </td>
                        <td style={{ padding: "12px", color: "#2563eb" }}>
                          {item.email}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}