import React, { useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterForm({ onRegister }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, { name, email, password });
      // Login automático tras registro
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, { email, password });
      const { token } = res.data;
      login(token);
      onRegister && onRegister();
      navigate("/profiles");
    } catch (err) {
      setError("Error al registrar usuario");
    } finally {
      setLoading(false);
    }
  };

  const { darkMode } = useContext(ThemeContext);
  return (
    <div
      className={
        "max-w-sm mx-auto mt-8 p-6 rounded-2xl shadow-lg border transition " +
        (darkMode
          ? "bg-[#181818] border-[#282828] text-white"
          : "bg-white border-[#e5e5e5] text-[#191414]")
      }
    >
      <h2
        className={
          "text-xl font-bold mb-4 text-center " +
          (darkMode ? "text-[#1DB954]" : "text-[#191414]")
        }
      >
        Registrarse
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          className={
            "px-3 py-2 rounded border focus:outline-none transition " +
            (darkMode
              ? "bg-[#282828] border-[#1DB954] text-white focus:ring-2 focus:ring-[#1DB954]"
              : "bg-[#f5f5f5] border-[#191414] text-[#191414] focus:ring-2 focus:ring-[#1DB954]")
          }
          placeholder="Nombre"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          type="email"
          className={
            "px-3 py-2 rounded border focus:outline-none transition " +
            (darkMode
              ? "bg-[#282828] border-[#1DB954] text-white focus:ring-2 focus:ring-[#1DB954]"
              : "bg-[#f5f5f5] border-[#191414] text-[#191414] focus:ring-2 focus:ring-[#1DB954]")
          }
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className={
            "px-3 py-2 rounded border focus:outline-none transition " +
            (darkMode
              ? "bg-[#282828] border-[#1DB954] text-white focus:ring-2 focus:ring-[#1DB954]"
              : "bg-[#f5f5f5] border-[#191414] text-[#191414] focus:ring-2 focus:ring-[#1DB954]")
          }
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className={
            "font-bold py-2 rounded shadow transition-all duration-200 focus:outline-none focus:ring-2 " +
            (darkMode
              ? "bg-[#1DB954] text-[#191414] hover:bg-[#191414] hover:text-[#1DB954] focus:ring-[#1DB954]"
              : "bg-[#191414] text-[#1DB954] hover:bg-[#1DB954] hover:text-[#191414] focus:ring-[#1DB954]")
          }
          disabled={loading}
        >
          {loading ? "Registrando..." : "Registrarse"}
        </button>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </form>
    </div>
  );
}
