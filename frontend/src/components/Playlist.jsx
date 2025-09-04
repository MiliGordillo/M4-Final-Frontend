import React, { useEffect, useState, useContext } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { ThemeContext } from "../context/ThemeContext";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { Search, Loader2, PlusCircle, XCircle } from "lucide-react";

export default function Playlist() {
  const { darkMode } = useContext(ThemeContext);
  const { token } = useAuth();
  const { profile } = useProfile();

  // Log de depuración seguro: muestra el valor de profile y role cada vez que cambia el perfil
  React.useEffect(() => {
    console.log("[Playlist.jsx][useEffect] profile:", profile);
    console.log("[Playlist.jsx][useEffect] profile.role:", profile?.role);
  }, [profile]);
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

  // Si el perfil es child, forzar la pestaña comunidad
  useEffect(() => {
    if (profile?.type === "child") {
      setActiveTab("comunidad");
    }
  }, [profile]);

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
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'x-profile-id': profile?._id,
            },
          }
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/playlists/${profile._id}`,
          { name: form.name },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'x-profile-id': profile?._id,
            },
          }
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
    const result = await Swal.fire({
      title: '¿Seguro que deseas eliminar esta playlist?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1DB954',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/playlists/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPlaylists();
      toast.success("Playlist eliminada correctamente", {
        icon: "🗑️",
        className: darkMode
          ? "bg-[#191414] !important text-[#1DB954] font-bold border-l-4 border-[#1DB954] !important shadow-lg !important"
          : "bg-[#1DB954] text-[#191414] font-bold border-l-4 border-[#191414]",
        progressClassName: darkMode ? "bg-[#1DB954]" : "bg-[#191414]"
      });
    } catch {
      toast.error("No se pudo eliminar la playlist", {
        icon: "❌",
        className: darkMode
          ? "bg-[#191414] !important text-red-400 font-bold border-l-4 border-red-500 !important shadow-lg !important"
          : "bg-red-200 text-[#191414] font-bold border-l-4 border-red-500",
        progressClassName: darkMode ? "bg-red-500" : "bg-red-500"
      });
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
    if (profile?.type === "child") {
      Swal.fire({
        icon: 'error',
        title: 'Sin permiso',
        text: 'No tienes permiso para importar playlists de Spotify.'
      });
      return;
    }
    try {
      // 1. Obtener los tracks de la playlist de Spotify desde tu backend
      const tracksRes = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/spotify/playlist/${pl.id}/tracks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-profile-id': profile?._id,
          },
        }
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
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-profile-id': profile?._id,
          },
        }
      );
      fetchPlaylists();
      toast.success("Playlist de Spotify agregada a tus playlists locales", {
        icon: "🎶",
        className: darkMode
          ? "bg-[#191414] !important text-[#1DB954] font-bold border-l-4 border-[#1DB954] !important shadow-lg !important"
          : "bg-[#191414] text-[#1DB954] font-bold border-l-4 border-[#1DB954]",
        progressClassName: darkMode ? "bg-[#1DB954]" : "bg-[#1DB954]"
      });
    } catch {
      toast.error("No se pudo agregar la playlist de Spotify", {
        icon: "❌",
        className: darkMode
          ? "bg-[#191414] !important text-red-400 font-bold border-l-4 border-red-500 !important shadow-lg !important"
          : "bg-red-200 text-[#191414] font-bold border-l-4 border-red-500",
        progressClassName: darkMode ? "bg-red-500" : "bg-red-500"
      });
    }
  };

  const handleRemoveSong = async (playlistId, songId) => {
    const result = await Swal.fire({
      title: '¿Seguro que deseas eliminar esta canción?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1DB954',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/playlists/${playlistId}/song/${songId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPlaylists();
      toast.success("Canción eliminada correctamente", {
        icon: "🗑️",
        className: darkMode
          ? "bg-[#191414] !important text-[#1DB954] font-bold border-l-4 border-[#1DB954] !important shadow-lg !important"
          : "bg-[#1DB954] text-[#191414] font-bold border-l-4 border-[#191414]",
        progressClassName: darkMode ? "bg-[#1DB954]" : "bg-[#191414]"
      });
    } catch {
      toast.error("No se pudo eliminar la canción", {
        icon: "❌",
        className: darkMode
          ? "bg-[#191414] !important text-red-400 font-bold border-l-4 border-red-500 !important shadow-lg !important"
          : "bg-red-200 text-[#191414] font-bold border-l-4 border-red-500",
        progressClassName: darkMode ? "bg-red-500" : "bg-red-500"
      });
    }
  };

  // --- Render ---
  if (loading)
    return (
      <div
        className={
          "flex flex-col items-center justify-center min-h-[40vh] animate-pulse " +
          (darkMode ? "text-[#1DB954]" : "text-[#191414]")
        }
      >
        <Loader2 className="w-6 h-6 animate-spin mb-2" />
        Cargando playlists...
        {error && (
          <div
            className={
              "mt-4 text-center text-sm " +
              (darkMode ? "text-red-400" : "text-red-600")
            }
          >
            {error}
          </div>
        )}
  {/* ToastContainer global en App.jsx */}
      </div>
    );

  return (
    <div
      className={
        "relative max-w-7xl mx-auto px-4 md:px-10 py-10 transition-colors duration-300 " +
        (darkMode ? "bg-transparent text-white" : "bg-transparent text-[#191414]")
      }
    >
  {/* ToastContainer global en App.jsx */}
      {/* Botón flotante para abrir sidebar */}
      <button
        onClick={() => setSidebarOpen(true)}
        className={
          "fixed z-40 bottom-8 right-8 rounded-full shadow-lg p-4 flex items-center gap-2 transition font-semibold " +
          (darkMode
            ? "bg-[#1DB954] text-[#191414] hover:bg-[#191414] hover:text-[#1DB954]"
            : "bg-[#191414] text-[#1DB954] hover:bg-[#1DB954] hover:text-[#191414]")
        }
        title="Buscar playlists en Spotify o Comunidad"
      >
        <Search size={22} />
        <span className="hidden md:inline">Buscar playlists</span>
      </button>

      {/* Sidebar */}
      <div
        className={
          `fixed top-0 right-0 h-full w-full max-w-md shadow-2xl z-50 transform transition-transform duration-300 ` +
          (sidebarOpen ? "translate-x-0 " : "translate-x-full ") +
          (darkMode ? "bg-[#191414]/95" : "bg-[#1DB954]/10 backdrop-blur")
        }
        style={{ backdropFilter: "blur(8px)" }}
      >
        <div className={
          "flex justify-between items-center p-6 border-b " +
          (darkMode ? "border-[#1DB954]/30" : "border-[#191414]/30")
        }>
          <h2 className={
            "text-2xl font-bold " +
            (darkMode ? "text-[#1DB954]" : "text-[#191414]")
          }>Buscar playlists</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className={
              "transition " +
              (darkMode ? "text-gray-300 hover:text-red-400" : "text-[#191414] hover:text-red-600")
            }
            title="Cerrar"
          >
            <XCircle size={28} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto h-[calc(100vh-80px)]">
          <div className="flex justify-center gap-2 mb-6">
            {/* Solo mostrar la pestaña Spotify si el perfil no es child */}
            {profile?.type !== "child" && (
              <button
                className={
                  `px-4 py-2 rounded-full font-semibold transition ` +
                  (activeTab === "spotify"
                    ? (darkMode ? "bg-[#1DB954] text-[#191414]" : "bg-[#191414] text-[#1DB954]")
                    : (darkMode ? "bg-[#282828] text-[#1DB954]" : "bg-[#1DB954]/10 text-[#191414]"))
                }
                onClick={() => setActiveTab("spotify")}
              >
                Spotify
              </button>
            )}
            <button
              className={
                `px-4 py-2 rounded-full font-semibold transition ` +
                (activeTab === "comunidad"
                  ? (darkMode ? "bg-[#1DB954] text-[#191414]" : "bg-[#191414] text-[#1DB954]")
                  : (darkMode ? "bg-[#282828] text-[#1DB954]" : "bg-[#1DB954]/10 text-[#191414]"))
              }
              onClick={() => setActiveTab("comunidad")}
            >
              Comunidad
            </button>
          </div>

          {/* Solo mostrar el bloque de Spotify si el perfil no es child */}
          {activeTab === "spotify" && profile?.role !== "child" ? (
            <>
              {/* Formulario y resultados de búsqueda de Spotify */}
              <form onSubmit={handleSpotifySearch} className="mb-6">
                <div className="relative">
                  <Search className={
                    "absolute left-4 top-1/2 -translate-y-1/2 " +
                    (darkMode ? "text-[#1DB954]" : "text-[#191414]")
                  } />
                  <input
                    type="text"
                    className={
                      "w-full pl-12 pr-4 py-3 rounded-full border outline-none transition " +
                      (darkMode
                        ? "bg-[#282828] text-white placeholder-gray-400 border-[#1DB954] focus:ring-2 focus:ring-[#1DB954]"
                        : "bg-white text-[#191414] placeholder-gray-500 border-[#191414] focus:ring-2 focus:ring-[#1DB954]")
                    }
                    placeholder="Buscar playlists en Spotify"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchLoading && (
                    <Loader2 className={
                      "absolute right-4 top-1/2 -translate-y-1/2 animate-spin " +
                      (darkMode ? "text-[#1DB954]" : "text-[#191414]")
                    } />
                  )}
                </div>
              </form>
              <div className="grid gap-4 mb-8">
                {!hasSearchedSpotify ? null : spotifyPlaylists.length === 0 ? (
                  <p className={
                    "text-center col-span-full " +
                    (darkMode ? "text-gray-400" : "text-gray-500")
                  }>
                    No se encontraron playlists de Spotify.
                  </p>
                ) : (
                  spotifyPlaylists
                    .filter((pl) => pl && pl.id)
                    .map((pl) => (
                      <div
                        key={pl.id}
                        className={
                          "rounded-xl shadow p-3 flex flex-col items-center transition " +
                          (darkMode
                            ? "bg-gradient-to-br from-[#1DB954]/10 to-[#191414]"
                            : "bg-gradient-to-br from-[#1DB954]/20 to-white")
                        }
                      >
                        <img
                          src={pl.images?.[0]?.url || "https://via.placeholder.com/120"}
                          alt={pl.name}
                          className="w-20 h-20 rounded-lg object-cover mb-2 shadow"
                        />
                        <p className={
                          "font-bold text-center " +
                          (darkMode ? "text-[#1DB954]" : "text-[#191414]")
                        }>{pl.name}</p>
                        <p className={
                          "text-xs text-center mb-2 " +
                          (darkMode ? "text-gray-400" : "text-gray-600")
                        }>
                          {pl.owner?.display_name || "Desconocido"}
                        </p>
                        <button
                          onClick={() => handleAddSpotifyPlaylist(pl)}
                          className={
                            "px-3 py-1 text-xs font-semibold rounded-full shadow transition " +
                            (darkMode
                              ? "bg-[#1DB954] text-[#191414] hover:bg-[#191414] hover:text-[#1DB954]"
                              : "bg-[#191414] text-[#1DB954] hover:bg-[#1DB954] hover:text-[#191414]")
                          }
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
                  <Search className={
                    "absolute left-4 top-1/2 -translate-y-1/2 " +
                    (darkMode ? "text-[#1DB954]" : "text-[#191414]")
                  } />
                  <input
                    type="text"
                    className={
                      "w-full pl-12 pr-4 py-3 rounded-full border outline-none transition " +
                      (darkMode
                        ? "bg-[#282828] text-white placeholder-gray-400 border-[#1DB954] focus:ring-2 focus:ring-[#1DB954]"
                        : "bg-white text-[#191414] placeholder-gray-500 border-[#191414] focus:ring-2 focus:ring-[#1DB954]")
                    }
                    placeholder="Buscar playlists de otros usuarios"
                    value={globalSearchTerm}
                    onChange={(e) => setGlobalSearchTerm(e.target.value)}
                  />
                  {globalLoading && (
                    <Loader2 className={
                      "absolute right-4 top-1/2 -translate-y-1/2 animate-spin " +
                      (darkMode ? "text-[#1DB954]" : "text-[#191414]")
                    } />
                  )}
                </div>
              </form>
              <div className="grid gap-4">
                {globalPlaylists.map((pl) => (
                  <div
                    key={pl._id}
                    className={
                      "rounded-xl shadow p-3 flex flex-col items-center transition " +
                      (darkMode
                        ? "bg-gradient-to-br from-[#1DB954]/10 to-[#191414]"
                        : "bg-gradient-to-br from-[#1DB954]/20 to-white")
                    }
                  >
                    <p className={
                      "font-bold " +
                      (darkMode ? "text-[#1DB954]" : "text-[#191414]")
                    }>{pl.name}</p>
                    <p className={
                      "text-xs mb-2 " +
                      (darkMode ? "text-gray-400" : "text-gray-600")
                    }>
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
                          {
                            headers: {
                              Authorization: `Bearer ${token}`,
                              'x-profile-id': profile?._id,
                            },
                          }
                        );
                        fetchPlaylists();
                        alert("Playlist agregada a tus playlists locales");
                      }}
                      className={
                        "px-3 py-1 text-xs font-semibold rounded-full shadow transition " +
                        (darkMode
                          ? "bg-[#1DB954] text-[#191414] hover:bg-[#191414] hover:text-[#1DB954]"
                          : "bg-[#191414] text-[#1DB954] hover:bg-[#1DB954] hover:text-[#191414]")
                      }
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
          className={
            "fixed inset-0 z-40 transition " +
            (darkMode ? "bg-[#191414]/60" : "bg-[#1DB954]/20")
          }
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenido principal */}
      <h2
        className={
          "text-4xl font-extrabold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r " +
          (darkMode ? "from-[#1DB954] to-white" : "from-[#191414] to-[#1DB954]")
        }
      >
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
            className={
              "w-full px-5 py-3 rounded-full border outline-none transition " +
              (darkMode
                ? "bg-[#282828] text-white placeholder-gray-400 border-[#1DB954] focus:ring-2 focus:ring-[#1DB954]"
                : "bg-white text-[#191414] placeholder-gray-500 border-[#191414] focus:ring-2 focus:ring-[#1DB954]")
            }
            placeholder="Nombre de la playlist"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <button
          type="submit"
          className={
            "flex items-center gap-2 px-6 py-3 font-semibold rounded-full shadow transition " +
            (darkMode
              ? "bg-[#1DB954] text-[#191414] hover:bg-[#191414] hover:text-[#1DB954]"
              : "bg-[#191414] text-[#1DB954] hover:bg-[#1DB954] hover:text-[#191414]")
          }
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
            className={
              "flex items-center gap-2 px-6 py-3 font-semibold rounded-full shadow transition " +
              (darkMode
                ? "bg-gray-600 hover:bg-gray-700 text-white"
                : "bg-gray-300 hover:bg-gray-400 text-[#191414]")
            }
          >
            <XCircle size={18} /> Cancelar
          </button>
        )}
      </form>

      {/* Mis playlists */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {playlists.length === 0 ? (
          <p className={
            "text-center col-span-full " +
            (darkMode ? "text-[#A7A7A7]" : "text-[#535353]")
          }>
            No tienes playlists creadas.
          </p>
        ) : (
          playlists.map((pl) => (
            <div
              key={pl._id}
              className={
                "group flex flex-col rounded-2xl shadow-lg p-0 transition-all duration-200 hover:scale-[1.025] hover:shadow-2xl border-2 my-8 " +
                (darkMode
                  ? "border-[#1DB954] bg-black/40"
                  : "border-[#1DB954] bg-white/80")
              }
              style={{ minHeight: 180, boxShadow: '0 2px 16px 0 #1db95422' }}
            >
              {/* Botones de editar y eliminar */}
              <div className="flex justify-end gap-2 pt-4 pr-4">
                <button
                  onClick={() => {
                    setForm({ name: pl.name });
                    setEditId(pl._id);
                  }}
                  className={
                    "px-3 py-1 text-xs font-semibold rounded-lg transition " +
                    (darkMode
                      ? "bg-yellow-400 text-[#191414] hover:bg-yellow-300"
                      : "bg-yellow-300 text-[#191414] hover:bg-yellow-400")
                  }
                  title="Editar nombre"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(pl._id)}
                  className={
                    "px-3 py-1 text-xs font-semibold rounded-lg transition " +
                    (darkMode
                      ? "bg-red-500 text-white hover:bg-red-400"
                      : "bg-red-400 text-[#191414] hover:bg-red-500")
                  }
                  title="Eliminar playlist"
                >
                  🗑
                </button>
              </div>
              <h3 className={
                "text-xl font-bold truncate px-6 pt-2 pb-1 " +
                (darkMode ? "text-[#1DB954]" : "text-[#191414]")
              }>
                {pl.name}
              </h3>
              <div
                className={
                  "space-y-2 px-4 pb-4 pt-2 overflow-y-auto hide-scrollbar rounded-2xl transition-all duration-200 " +
                  (darkMode ? "bg-[#181818]" : "bg-[#F5F5F5] border border-[#1DB954]/20")
                }
                style={{ maxHeight: 220, scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {(pl.songs || []).length === 0 && (
                  <p className={
                    "text-sm " +
                    (darkMode ? "text-[#A7A7A7]" : "text-[#535353]")
                  }>Sin canciones</p>
                )}
                {(pl.songs || []).map((song, idx) => (
                  <div
                    key={song._id || song.spotifyId || idx}
                    className={
                      "flex items-center gap-3 rounded-xl p-2 transition-all duration-150 " +
                      (darkMode
                        ? "bg-[#232323] group-hover:bg-[#1DB954]/10"
                        : "bg-white/90 group-hover:bg-[#1DB954]/10 border border-[#1DB954]/10")
                    }
                    style={{ boxShadow: darkMode ? '0 1px 4px 0 #0002' : '0 1px 4px 0 #1db95411' }}
                  >
                    <img
                      src={song.cover || "https://via.placeholder.com/60"}
                      alt={song.title}
                      className="w-10 h-10 rounded object-cover shadow"
                    />
                    <div className="flex-1">
                      <p className={
                        "text-sm font-semibold truncate " +
                        (darkMode ? "text-white" : "text-[#191414]")
                      }>
                        {song.title}
                      </p>
                      <p className={
                        "text-xs truncate " +
                        (darkMode ? "text-[#A7A7A7]" : "text-[#535353]")
                      }>
                        {song.artist}
                      </p>
                    </div>
                    <button
                      className={
                        "px-2 py-1 text-xs rounded-full transition " +
                        (darkMode
                          ? "bg-red-500 text-white hover:bg-red-400"
                          : "bg-red-400 text-[#191414] hover:bg-red-500")
                      }
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
