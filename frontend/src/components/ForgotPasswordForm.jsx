import React, { useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    console.log("Enviando email:", email); // <-- Verifica el valor

    try {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      console.log("Respuesta del backend:", data); // <-- Verifica la respuesta
      if (!res.ok) {
        alert(data.message || "Ocurrió un error");
      } else {
        alert("¡Correo enviado!");
      }
    } catch (err) {
      console.log("Error en fetch:", err);
      alert("Ocurrió un error en la petición");
    }
    setLoading(false);
  };

  const { darkMode } = useContext(ThemeContext);
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
          "text-2xl font-bold mb-6 text-center " +
          (darkMode ? "text-[#1DB954]" : "text-[#191414]")
        }
      >
        Recuperar contraseña
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Correo electrónico"
          className={
            "p-3 rounded-lg border focus:outline-none transition " +
            (darkMode
              ? "bg-[#282828] border-[#1DB954] text-white focus:ring-2 focus:ring-[#1DB954]"
              : "bg-[#f5f5f5] border-[#191414] text-[#191414] focus:ring-2 focus:ring-[#1DB954]")
          }
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          {loading ? "Enviando..." : "Enviar instrucciones"}
        </button>
      </form>
      {message && <div className="text-[#1DB954] mt-4">{message}</div>}
      {error && <div className="text-red-400 mt-4">{error}</div>}
    </div>
  );
};

export default ForgotPasswordForm;

// Backend logic removed from frontend React component.
// Please move the forgotPassword handler to your backend/server codebase (e.g., in an Express route file).