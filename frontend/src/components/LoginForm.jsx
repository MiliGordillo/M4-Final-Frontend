import React, { useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (email, password) => {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );
    return res;
  };

  const { darkMode } = useContext(ThemeContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await handleLogin(form.email, form.password);
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Error al iniciar sesión");
        setLoading(false);
        return;
      }
      const data = await res.json();
  login(data.token, data.user);
  navigate("/profiles");
    } catch (err) {
      setError("Error de red. Intenta de nuevo.");
      setLoading(false);
    }
    setLoading(false);
  };

  return (
    <div
      className={
        "max-w-md mx-auto mt-20 p-8 rounded-2xl shadow-lg border transition " +
        (darkMode
          ? "bg-[#181818] border-[#282828] text-white"
          : "bg-white border-[#e5e5e5] text-[#191414]")
      }
    >
      <h2
        className={
          "text-3xl font-extrabold mb-6 text-center " +
          (darkMode ? "text-[#1DB954]" : "text-[#191414]")
        }
      >
        Iniciar sesión
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          name="email"
          type="email"
          placeholder="Correo electrónico"
          className={
            "p-3 rounded-lg border focus:outline-none transition " +
            (darkMode
              ? "bg-[#282828] border-[#1DB954] text-white focus:ring-2 focus:ring-[#1DB954]"
              : "bg-[#f5f5f5] border-[#191414] text-[#191414] focus:ring-2 focus:ring-[#1DB954]")
          }
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Contraseña"
          className={
            "p-3 rounded-lg border focus:outline-none transition " +
            (darkMode
              ? "bg-[#282828] border-[#1DB954] text-white focus:ring-2 focus:ring-[#1DB954]"
              : "bg-[#f5f5f5] border-[#191414] text-[#191414] focus:ring-2 focus:ring-[#1DB954]")
          }
          value={form.password}
          onChange={handleChange}
          required
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button
          type="submit"
          className={
            "w-full font-bold py-3 rounded-lg shadow transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 " +
            (darkMode
              ? "bg-[#1DB954] text-[#191414] hover:bg-[#191414] hover:text-[#1DB954] focus:ring-[#1DB954]"
              : "bg-[#191414] text-[#1DB954] hover:bg-[#1DB954] hover:text-[#191414] focus:ring-[#1DB954]")
          }
          disabled={loading}
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <button
        type="button"
        className={
          "block w-full text-center underline text-sm mt-4 transition " +
          (darkMode
            ? "text-[#1DB954] hover:text-white"
            : "text-[#191414] hover:text-[#1DB954]")
        }
        onClick={() => navigate("/forgot-password")}
      >
        ¿Olvidaste tu contraseña?
      </button>

      <div className={
        "mt-6 text-sm text-center " +
        (darkMode ? "text-gray-300" : "text-gray-700")
      }>
        ¿No tienes cuenta?{" "}
        <button
          className={
            "font-semibold hover:underline transition " +
            (darkMode ? "text-[#1DB954]" : "text-[#191414] hover:text-[#1DB954]")
          }
          onClick={() => navigate("/register")}
        >
          Regístrate
        </button>
      </div>
      </div>
    );
};

export default Login;

