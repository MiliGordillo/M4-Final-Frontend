import React, { useState, useContext } from "react";
import { toast } from "react-toastify";
import { ThemeContext } from "../context/ThemeContext";

const ResetPasswordForm = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Obtiene el token de la URL
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  // Mostrar error inmediato si no hay token
  const noToken = !token;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
      setError("Token inválido o faltante.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("¡Contraseña restablecida correctamente! Ahora puedes iniciar sesión.");
        toast.success("¡Contraseña restablecida correctamente!", {
          className: darkMode ? "toast-dark" : "toast-light",
        });
      } else {
        setError(data.message || "Ocurrió un error.");
      }
    } catch (err) {
      setError("Ocurrió un error en la petición.");
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
        Restablecer contraseña
      </h2>
      {noToken ? (
        <div className="text-red-500 text-center font-semibold py-8">
          Enlace inválido o expirado. Solicita un nuevo restablecimiento de contraseña.
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="Nueva contraseña"
              className={
                "p-3 rounded-lg border focus:outline-none transition " +
                (darkMode
                  ? "bg-[#282828] border-[#1DB954] text-white focus:ring-2 focus:ring-[#1DB954]"
                  : "bg-[#f5f5f5] border-[#191414] text-[#191414] focus:ring-2 focus:ring-[#1DB954]")
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              className={
                "p-3 rounded-lg border focus:outline-none transition " +
                (darkMode
                  ? "bg-[#282828] border-[#1DB954] text-white focus:ring-2 focus:ring-[#1DB954]"
                  : "bg-[#f5f5f5] border-[#191414] text-[#191414] focus:ring-2 focus:ring-[#1DB954]")
              }
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
              {loading ? "Restableciendo..." : "Restablecer contraseña"}
            </button>
          </form>
          {message && <div className="text-[#1DB954] mt-4">{message}</div>}
          {error && <div className="text-red-400 mt-4">{error}</div>}
        </>
      )}
    </div>
  );
};

export default ResetPasswordForm;