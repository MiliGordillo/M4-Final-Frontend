import React, { useState } from "react";

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
      const res = await fetch("/api/auth/forgot-password", {
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

  return (
    <div className="max-w-md mx-auto mt-20 bg-gray-900 p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-green-400">Recuperar contraseña</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Correo electrónico"
          className="p-2 rounded bg-gray-800 border border-gray-700"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded"
          disabled={loading}
        >
          {loading ? "Enviando..." : "Enviar instrucciones"}
        </button>
      </form>
      {message && <div className="text-green-400 mt-4">{message}</div>}
      {error && <div className="text-red-400 mt-4">{error}</div>}
    </div>
  );
};

export default ForgotPasswordForm;

// Backend logic removed from frontend React component.
// Please move the forgotPassword handler to your backend/server codebase (e.g., in an Express route file).