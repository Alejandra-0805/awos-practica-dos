"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { api } from "./data/api";

type LoginResponse = {
  token?: string;
  accessToken?: string;
  user?: {
    id?: string;
    fullName?: string;
    username?: string;
    email?: string;
    role?: string;
  };
  data?: {
    token?: string;
    accessToken?: string;
    user?: {
      id?: string;
      fullName?: string;
      username?: string;
      email?: string;
      role?: string;
    };
  };
};

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleEntrar(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    const usernameLimpio = username.trim();

    if (!usernameLimpio || !password.trim()) {
      setError("Completa el usuario y la contraseña.");

      await Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Escribe tu usuario y contraseña.",
      });

      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = (await api.login({
        username: usernameLimpio,
        password,
      })) as LoginResponse;

      console.log("Respuesta del login:", response);

      const token =
        response?.token ??
        response?.accessToken ??
        response?.data?.token ??
        response?.data?.accessToken;

      const user = response?.user ?? response?.data?.user;

      if (!token) {
        throw new Error("El backend no devolvió un token de acceso.");
      }

      localStorage.setItem("token", token);

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      const role = user?.role?.toUpperCase();
      const esAdmin =
        role === "ADMIN" || usernameLimpio.toLowerCase() === "admin";

      await Swal.fire({
        icon: "success",
        title: "Inicio de sesión correcto",
        text: `Bienvenido${user?.fullName ? `, ${user.fullName}` : ""}.`,
        timer: 1300,
        showConfirmButton: false,
      });

      router.replace(
        esAdmin
          ? "/dashboard/admin/productos"
          : "/dashboard/productos"
      );
    } catch (errorDesconocido) {
      console.error("Error al iniciar sesión:", errorDesconocido);

      const mensaje =
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "Usuario o contraseña incorrectos.";

      setError(mensaje);

      await Swal.fire({
        icon: "error",
        title: "No se pudo iniciar sesión",
        text: mensaje,
      });
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
        padding: "20px",
      }}
    >
      <form
        onSubmit={handleEntrar}
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
          Iniciar Sesión
        </h1>

        <div style={{ marginBottom: "16px" }}>
          <label
            htmlFor="username"
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
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Ingresa tu usuario"
            disabled={loading}
            style={{
              width: "100%",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              padding: "8px 12px",
              fontSize: "14px",
              color: "#111",
              backgroundColor: loading ? "#e5e7eb" : "#f9fafb",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label
            htmlFor="password"
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
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="********"
            disabled={loading}
            style={{
              width: "100%",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              padding: "8px 12px",
              fontSize: "14px",
              color: "#111",
              backgroundColor: loading ? "#e5e7eb" : "#f9fafb",
              boxSizing: "border-box",
            }}
          />
        </div>

        {error && (
          <p
            role="alert"
            style={{
              color: "#b91c1c",
              fontSize: "13px",
              marginBottom: "12px",
              backgroundColor: "#fee2e2",
              borderRadius: "6px",
              padding: "8px 10px",
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
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
      </form>
    </div>
  );
}