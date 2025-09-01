import React, { useState } from "react";

const ResetPasswordForm = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Obtiene el token de la URL
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

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
      } else {
        setError(data.message || "Ocurrió un error.");
      }
    } catch (err) {
      setError("Ocurrió un error en la petición.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-gray-900 p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-green-400">Restablecer contraseña</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="password"
          placeholder="Nueva contraseña"
          className="p-2 rounded bg-gray-800 border border-gray-700"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          className="p-2 rounded bg-gray-800 border border-gray-700"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded"
          disabled={loading}
        >
          {loading ? "Restableciendo..." : "Restablecer contraseña"}
        </button>
      </form>
      {message && <div className="text-green-400 mt-4">{message}</div>}
      {error && <div className="text-red-400 mt-4">{error}</div>}
    </div>
  );
};

export default ResetPasswordForm;