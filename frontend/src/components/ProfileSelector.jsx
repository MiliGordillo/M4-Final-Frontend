import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { useNavigate } from "react-router-dom";
import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";

function ProfileSelector() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    type: "adult",
    avatar: "",
    language: "es",
    ageRestriction: 18,
  });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [avatarOptions, setAvatarOptions] = useState([]);
  const { token } = useAuth();
  const { setProfile } = useProfile();
  const navigate = useNavigate();

  // Generar galería de avatares DiceBear
useEffect(() => {
  if (!showForm) return;
  const base = form.name || "profile";
  const seeds = [base, base + "1", base + "2", base + "3", base + "4", base + "5"];
  const options = seeds.map((seed) => createAvatar(avataaars, { seed }).toString());
  setAvatarOptions(options);
}, [showForm, form.name]);

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === "ageRestriction") value = Number(value);
    setForm({ ...form, [e.target.name]: value });
  };

  // Cargar perfiles y forzar avatar válido
  const fetchProfiles = async () => {
    setLoading(true);
    try {
  const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/profiles`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedProfiles = await Promise.all(
        res.data.map(async (p) => {
          let avatar = p.avatar;
          if (!avatar || typeof avatar !== "string" || !avatar.trim().startsWith("<svg")) {
            avatar = createAvatar(avataaars, { seed: p.name || "profile" }).toString();
            try {
              await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/profiles/${p._id}`, { avatar }, {
                headers: { Authorization: `Bearer ${token}` },
              });
            } catch {
              // si falla la actualización, seguimos mostrando el avatar generado localmente
            }
          }
          return { ...p, avatar };
        })
      );

      setProfiles(updatedProfiles);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudieron cargar los perfiles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [token]);

  const handleSelect = (profile) => {
    setProfile(profile);
    navigate("/songs");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const avatar = form.avatar && form.avatar.trim().startsWith("<svg")
        ? form.avatar
        : createAvatar(avataaars, { seed: form.name || "profile" }).toString();

      if (editId) {
  await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/profiles/${editId}`, { ...form, avatar }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
  await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/profiles`, { ...form, avatar }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // Limpiar el formulario tras guardar
      setForm({
        name: "",
        type: "adult",
        avatar: "",
        language: "es",
        ageRestriction: 18,
      });
      setEditId(null);
      setShowForm(false);

      // Recargar perfiles después de guardar
      fetchProfiles();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo guardar el perfil");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este perfil?")) return;
    try {
  await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/profiles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProfiles();
    } catch {
      setError("No se pudo eliminar el perfil");
    }
  };

  const handleEdit = (profile) => {
    setForm({
      name: profile.name,
      type: profile.type,
      avatar: profile.avatar || "",
      language: profile.language || "es",
      ageRestriction: profile.ageRestriction || 18,
    });
    setEditId(profile._id);
    setShowForm(true);
  };

  if (loading) return <div className="text-center mt-10 text-green-400">Cargando perfiles...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full px-4">
      <h2 className="text-4xl font-extrabold mb-8 text-green-400 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
        Selecciona tu perfil musical
      </h2>

      <button
        className="mb-6 px-6 py-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 hover:scale-105 transition-transform font-bold"
        onClick={() => {
          setShowForm(true);
          setEditId(null);
          setForm({ name: "", type: "adult", avatar: "", language: "es", ageRestriction: 18 });
        }}
      >
        + Agregar perfil
      </button>

      <div className="flex gap-8 mb-10 flex-wrap justify-center">
        {profiles.map((profile) => (
          <div
            key={profile._id}
            className="flex flex-col items-center bg-gray-900 bg-opacity-70 rounded-2xl p-6 shadow-lg hover:scale-105 hover:shadow-2xl transition-transform cursor-pointer min-w-[180px]"
            onClick={() => handleSelect(profile)}
          >
            {profile.avatar && profile.avatar.startsWith("<svg") ? (
              <span
                className="w-28 h-28 rounded-full mb-4 border-4 border-green-400 bg-white flex items-center justify-center shadow-inner"
                dangerouslySetInnerHTML={{ __html: profile.avatar }}
              />
            ) : (
              <img
                src="https://avatars.dicebear.com/api/avataaars/default.svg"
                alt={profile.name}
                className="w-28 h-28 rounded-full mb-4 border-4 border-green-400 object-cover shadow-inner"
              />
            )}
            <span className="text-lg font-semibold text-white">{profile.name}</span>
            <span className="text-sm text-gray-400 mt-1">{profile.type}</span>
            <div className="flex gap-2 mt-3">
              <button
                className="px-3 py-1 bg-yellow-400 text-black rounded-lg text-xs hover:scale-105 transition-transform"
                onClick={(e) => { e.stopPropagation(); handleEdit(profile); }}
              >
                Editar
              </button>
              <button
                className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs hover:scale-105 transition-transform"
                onClick={(e) => { e.stopPropagation(); handleDelete(profile._id); }}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <form
          className="bg-gray-900 bg-opacity-80 rounded-2xl shadow-2xl p-6 flex flex-col gap-4 max-w-md w-full mb-8"
          onSubmit={handleSubmit}
        >
          <h3 className="text-xl font-bold text-green-300 mb-3">
            {editId ? "Editar perfil" : "Agregar nuevo perfil"}
          </h3>

          <input
            type="text"
            name="name"
            placeholder="Nombre"
            className="p-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
            value={form.name}
            onChange={handleChange}
            required
          />

          <select
            name="type"
            className="p-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
            value={form.type}
            onChange={handleChange}
          >
            <option value="adult">Adulto</option>
            <option value="child">Niño</option>
          </select>

          {/* Galería de avatares */}
          <div className="flex gap-3 overflow-x-auto py-2 mb-2">
            {avatarOptions.map((svg, idx) => (
              <span
                key={idx}
                className={`w-16 h-16 rounded-full border-4 cursor-pointer flex items-center justify-center ${form.avatar === svg ? 'border-green-500 shadow-lg' : 'border-gray-500'} hover:scale-110 transition-transform`}
                dangerouslySetInnerHTML={{ __html: svg }}
                onClick={() => setForm({ ...form, avatar: svg })}
              />
            ))}
          </div>

          <select
            name="language"
            className="p-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
            value={form.language}
            onChange={handleChange}
          >
            <option value="es">Español</option>
            <option value="en">Inglés</option>
            <option value="fr">Francés</option>
            <option value="de">Alemán</option>
            <option value="it">Italiano</option>
          </select>

          <select
            name="ageRestriction"
            className="p-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
            value={form.ageRestriction}
            onChange={handleChange}
          >
            <option value={18}>Sin restricción</option>
            <option value={13}>Adolescente (13+)</option>
            <option value={7}>Infantil (7+)</option>
          </select>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-bold"
            >
              {editId ? "Guardar cambios" : "Agregar perfil"}
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
              onClick={() => {
                setEditId(null);
                setForm({ name: "", type: "adult", avatar: "", language: "es", ageRestriction: 18 });
                setShowForm(false);
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default ProfileSelector;



