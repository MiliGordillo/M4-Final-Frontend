import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { Search, Loader2, PlusCircle, XCircle } from "lucide-react";

export default function Playlist() {
  const { token } = useAuth();
  const { profile } = useProfile();

  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "" });
  const [editId, setEditId] = useState(null);

  // Sidebar states
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Spotify search
  const [spotifyPlaylists, setSpotifyPlaylists] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasSearchedSpotify, setHasSearchedSpotify] = useState(false);

  // Comunidad search
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [globalPlaylists, setGlobalPlaylists] = useState([]);
  const [globalLoading, setGlobalLoading] = useState(false);

  // Active tab state
  const [activeTab, setActiveTab] = useState("spotify"); // "spotify" o "comunidad"

  // --- Fetch mis playlists ---
  const fetchPlaylists = async () => {
    if (!profile) return;
    setLoading(true);
    try {
  const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/playlists/${profile._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlaylists(res.data);
    } catch {
      setError("No se pudieron cargar las playlists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!profile) {
      setLoading(false);
      setError(
        "No hay perfil activo. Selecciona o crea un perfil antes de gestionar playlists."
      );
      return;
    }
    fetchPlaylists();
  }, [profile]);

  // --- CRUD playlists ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/playlists/edit/${editId}`,
          { name: form.name },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/playlists/${profile._id}`,
          { name: form.name },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setForm({ name: "" });
      setEditId(null);
      fetchPlaylists();
    } catch {
      setError("No se pudo guardar la playlist");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta playlist?")) return;
    try {
  await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/playlists/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPlaylists();
    } catch {
      setError("No se pudo eliminar la playlist");
    }
  };

  // --- Spotify Search ---
  const handleSpotifySearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setSearchLoading(true);
    setHasSearchedSpotify(true);
    try {
  const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/spotify/search`, {
        params: { q: searchTerm, type: "playlist", limit: 12 },
      });
      setSpotifyPlaylists(res.data.playlists?.items || []);
    } catch {
      setSpotifyPlaylists([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // --- Comunidad ---
  const handleGlobalSearch = async (e) => {
    e.preventDefault();
    setGlobalLoading(true);
    try {
  const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/playlists`, {
        params: { search: globalSearchTerm },
        headers: { Authorization: `Bearer ${token}` },
      });
      setGlobalPlaylists(res.data);
    } catch {
      setGlobalPlaylists([]);
    } finally {
      setGlobalLoading(false);
    }
  };

  // --- Add Spotify Playlist ---
  const handleAddSpotifyPlaylist = async (pl) => {
    try {
      // 1. Obtener los tracks de la playlist de Spotify desde tu backend
      const tracksRes = await axios.get(
  `${import.meta.env.VITE_BACKEND_URL}/api/spotify/playlist/${pl.id}/tracks`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2. Formatear los tracks
      const tracks = (tracksRes.data.items || []).map((item) => ({
        spotifyId: item.track.id,
        title: item.track.name,
        artist: item.track.artists.map((a) => a.name).join(", "),
        cover: item.track.album?.images?.[0]?.url,
      }));

      // 3. Guardar la playlist con las canciones
      await axios.post(
  `${import.meta.env.VITE_BACKEND_URL}/api/playlists/${profile._id}`,
        {
          name: pl.name,
          songs: tracks,
          cover: pl.images?.[0]?.url || "",
          fromSpotify: true,
          spotifyId: pl.id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPlaylists();
      alert("Playlist de Spotify agregada a tus playlists locales");
    } catch (error) {
      alert("No se pudo agregar la playlist de Spotify");
    }
  };

  const handleRemoveSong = async (playlistId, songId) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta canción?")) return;
    try {
  await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/playlists/${playlistId}/song/${songId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPlaylists();
    } catch {
      alert("No se pudo eliminar la canción");
    }
  };

  // --- Render ---
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-green-400 animate-pulse">
        <Loader2 className="w-6 h-6 animate-spin mb-2" />
        Cargando playlists...
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-red-500 font-semibold">
        {error}
      </div>
    );

  return (
    <div className="relative max-w-7xl mx-auto px-4 md:px-10 py-10">
      {/* Botón flotante para abrir sidebar */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed z-40 bottom-8 right-8 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg p-4 flex items-center gap-2 transition"
        title="Buscar playlists en Spotify o Comunidad"
      >
        <Search size={22} />
        <span className="hidden md:inline font-semibold">Buscar playlists</span>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-black/95 shadow-2xl z-50 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ backdropFilter: "blur(8px)" }}
      >
        <div className="flex justify-between items-center p-6 border-b border-green-900">
          <h2 className="text-2xl font-bold text-green-400">Buscar playlists</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-300 hover:text-red-400 transition"
            title="Cerrar"
          >
            <XCircle size={28} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto h-[calc(100vh-80px)]">
          <div className="flex justify-center gap-2 mb-6">
            <button
              className={`px-4 py-2 rounded-full font-semibold transition ${
                activeTab === "spotify"
                  ? "bg-green-500 text-white"
                  : "bg-gray-800 text-green-300"
              }`}
              onClick={() => setActiveTab("spotify")}
            >
              Spotify
            </button>
            <button
              className={`px-4 py-2 rounded-full font-semibold transition ${
                activeTab === "comunidad"
                  ? "bg-green-500 text-white"
                  : "bg-gray-800 text-green-300"
              }`}
              onClick={() => setActiveTab("comunidad")}
            >
              Comunidad
            </button>
          </div>

          {activeTab === "spotify" ? (
            <>
              {/* Formulario y resultados de búsqueda de Spotify */}
              <form onSubmit={handleSpotifySearch} className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3 rounded-full bg-gray-900 text-white placeholder-gray-400 border border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-400 outline-none"
                    placeholder="Buscar playlists en Spotify"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchLoading && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-green-400" />
                  )}
                </div>
              </form>
              <div className="grid gap-4 mb-8">
                {!hasSearchedSpotify ? null : spotifyPlaylists.length === 0 ? (
                  <p className="text-gray-400 text-center col-span-full">
                    No se encontraron playlists de Spotify.
                  </p>
                ) : (
                  spotifyPlaylists
                    .filter((pl) => pl && pl.id)
                    .map((pl) => (
                      <div
                        key={pl.id}
                        className="bg-gradient-to-br from-green-900/40 to-black rounded-xl shadow p-3 flex flex-col items-center"
                      >
                        <img
                          src={pl.images?.[0]?.url || "https://via.placeholder.com/120"}
                          alt={pl.name}
                          className="w-20 h-20 rounded-lg object-cover mb-2 shadow"
                        />
                        <p className="font-bold text-green-400 text-center">{pl.name}</p>
                        <p className="text-xs text-gray-400 text-center mb-2">
                          {pl.owner?.display_name || "Desconocido"}
                        </p>
                        <button
                          onClick={() => handleAddSpotifyPlaylist(pl)}
                          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-full shadow transition"
                        >
                          ➕ Agregar
                        </button>
                      </div>
                    ))
                )}
              </div>
            </>
          ) : (
            <>
              {/* Formulario y resultados de búsqueda de Comunidad */}
              <form onSubmit={handleGlobalSearch} className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3 rounded-full bg-gray-900 text-white placeholder-gray-400 border border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-400 outline-none"
                    placeholder="Buscar playlists de otros usuarios"
                    value={globalSearchTerm}
                    onChange={(e) => setGlobalSearchTerm(e.target.value)}
                  />
                  {globalLoading && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-green-400" />
                  )}
                </div>
              </form>
              <div className="grid gap-4">
                {globalPlaylists.map((pl) => (
                  <div
                    key={pl._id}
                    className="bg-gradient-to-br from-green-900/40 to-black rounded-xl shadow p-3 flex flex-col items-center"
                  >
                    <p className="font-bold text-green-400">{pl.name}</p>
                    <p className="text-xs text-gray-400 mb-2">
                      Creada por: {pl.profile?.name || "Anónimo"}
                    </p>
                    <button
                      onClick={async () => {
                        await axios.post(
                          `${import.meta.env.VITE_BACKEND_URL}/api/playlists/${profile._id}`,
                          {
                            name:
                              pl.name +
                              " (de " +
                              (pl.profile?.name || "Anónimo") +
                              ")",
                            songs: pl.songs,
                            cover: pl.cover,
                            fromCommunity: true,
                            originalPlaylist: pl._id,
                          },
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                        fetchPlaylists();
                        alert("Playlist agregada a tus playlists locales");
                      }}
                      className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-full shadow transition"
                    >
                      ➕ Agregar
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Fondo oscuro cuando sidebar está abierto */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenido principal */}
      <h2 className="text-4xl font-extrabold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">
        🎵 Mis Playlists
      </h2>

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row gap-4 mb-12 items-center justify-center"
      >
        <div className="relative w-full md:w-1/2">
          <input
            type="text"
            className="w-full px-5 py-3 rounded-full bg-gray-900 text-white placeholder-gray-400 border border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-400 outline-none"
            placeholder="Nombre de la playlist"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full shadow transition"
        >
          <PlusCircle size={18} />
          {editId ? "Guardar cambios" : "Crear"}
        </button>
        {editId && (
          <button
            type="button"
            onClick={() => {
              setEditId(null);
              setForm({ name: "" });
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-full shadow transition"
          >
            <XCircle size={18} /> Cancelar
          </button>
        )}
      </form>

      {/* Mis playlists */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {playlists.length === 0 ? (
          <p className="text-gray-400 text-center col-span-full">
            No tienes playlists creadas.
          </p>
        ) : (
          playlists.map((pl) => (
            <div
              key={pl._id}
              className="bg-gradient-to-br from-green-900/40 to-black rounded-2xl shadow-xl p-6 flex flex-col hover:scale-[1.02] hover:shadow-2xl transition"
            >
              {/* Botones de editar y eliminar */}
              <div className="flex justify-end gap-2 mb-2">
                <button
                  onClick={() => {
                    setForm({ name: pl.name });
                    setEditId(pl._id);
                  }}
                  className="px-3 py-1 bg-yellow-400 text-black text-xs font-semibold rounded-lg hover:bg-yellow-300 transition"
                  title="Editar nombre"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(pl._id)}
                  className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-400 transition"
                  title="Eliminar playlist"
                >
                  🗑
                </button>
              </div>
              <h3 className="text-xl font-bold text-green-400 truncate mb-3">
                {pl.name}
              </h3>
              <div
                className="space-y-2 bg-black/40 rounded-xl p-3 overflow-y-auto"
                style={{ maxHeight: 220 }}
              >
                {(pl.songs || []).length === 0 && (
                  <p className="text-gray-400 text-sm">Sin canciones</p>
                )}
                {(pl.songs || []).map((song, idx) => (
                  <div
                    key={song._id || song.spotifyId || idx}
                    className="flex items-center gap-3 bg-gray-800/60 rounded-lg p-2"
                  >
                    <img
                      src={song.cover || "https://via.placeholder.com/60"}
                      alt={song.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-white text-sm font-semibold truncate">
                        {song.title}
                      </p>
                      <p className="text-gray-400 text-xs truncate">
                        {song.artist}
                      </p>
                    </div>
                    <button
                      className="px-2 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-400"
                      onClick={() =>
                        handleRemoveSong(
                          pl._id,
                          song._id || song.spotifyId || idx
                        )
                      }
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
