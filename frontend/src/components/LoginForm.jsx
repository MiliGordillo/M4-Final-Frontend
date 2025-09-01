import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (email, password) => {
const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
    if (res.ok) {
      const data = await res.json();
      login(data.token);
    } else {
      setError("Credenciales incorrectas");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await handleLogin(form.email, form.password);
      navigate("/profiles");
    } catch (err) {
      setError("Credenciales incorrectas");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-gray-900 p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-green-400">Iniciar sesión</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          name="email"
          type="email"
          placeholder="Correo electrónico"
          className="p-2 rounded bg-gray-800 border border-gray-700"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Contraseña"
          className="p-2 rounded bg-gray-800 border border-gray-700"
          value={form.password}
          onChange={handleChange}
          required
        />
        {error && <div className="text-red-400">{error}</div>}
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded"
          disabled={loading}
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
      <button
        type="button"
        className="text-green-300 underline text-sm mt-2"
        onClick={() => navigate("/forgot-password")}
      >
        ¿Olvidaste tu contraseña?
      </button>
      <div className="mt-4 text-sm">
        ¿No tienes cuenta?{" "}
        <button className="text-green-300 underline" onClick={() => navigate("/register")}>
          Regístrate
        </button>
      </div>
    </div>
  );
};

export default Login;
