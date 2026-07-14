"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "./data/api";

export default function LoginPage() {
const router = useRouter();

const [username, setUsername] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

async function handleEntrar() {
try {
setLoading(true);
setError("");

const response = await api.login({
  username,
  password,
});

console.log("Login exitoso:", response);

if (response.token) {
  localStorage.setItem("token", response.token);
}

if (response.user) {
  localStorage.setItem("user", JSON.stringify(response.user));
}

// Usuario administrador
if (username.toLowerCase() === "admin") {
  router.push("/dashboard/admin/productos");
  return;
}

// Usuarios clientes
router.push("/dashboard/productos");


} catch (error) {
console.error(error);
setError("Usuario o contraseña incorrectos");
} finally {
setLoading(false);
}
}


return (
<div
style={{
minHeight: "100vh",
display: "flex",
alignItems: "center",
justifyContent: "center",
backgroundColor: "#f3f4f6",
}}
>
<div
style={{
width: "100%",
maxWidth: "360px",
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
Iniciar Sesión </h1>


    <div style={{ marginBottom: "16px" }}>
      <label
        style={{
          display: "block",
          fontSize: "13px",
          fontWeight: 600,
          color: "#374151",
          marginBottom: "4px",
        }}
      >
        Usuario
      </label>

      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Ingresa tu usuario"
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

    <div style={{ marginBottom: "16px" }}>
      <label
        style={{
          display: "block",
          fontSize: "13px",
          fontWeight: 600,
          color: "#374151",
          marginBottom: "4px",
        }}
      >
        Contraseña
      </label>

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="********"
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

    {error && (
      <p
        style={{
          color: "red",
          fontSize: "13px",
          marginBottom: "12px",
        }}
      >
        {error}
      </p>
    )}

    <button
      onClick={handleEntrar}
      disabled={loading}
      style={{
        width: "100%",
        backgroundColor: "#111",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        padding: "10px",
        fontSize: "14px",
        fontWeight: 600,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? "Ingresando..." : "Entrar"}
    </button>

    <p
      style={{
        textAlign: "center",
        fontSize: "13px",
        marginTop: "16px",
        color: "#6b7280",
      }}
    >
    </p>
  </div>
</div>


);
}
