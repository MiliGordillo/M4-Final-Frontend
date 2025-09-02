import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";

export default function SongList({ songs, type, loading }) {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState("");
  const [modalSong, setModalSong] = useState(null);
  const [favoriteArtists, setFavoriteArtists] = useState([]);
  const [favoriteAlbums, setFavoriteAlbums] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const { token } = useAuth();
  const { profile } = useProfile();

  // Obtener playlists del perfil activo (para agregar canciones)
  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!profile) return;
      try {
  const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/playlists/${profile._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPlaylists(res.data);
      } catch {
        setPlaylists([]);
      }
    };
    fetchPlaylists();
  }, [profile, token]);

  // Obtener favoritos de artista y álbum desde el perfil
  const fetchFavorites = async () => {
    if (!profile) return;
    try {
  const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/profiles/${profile._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavoriteArtists(res.data.favoriteArtists || []);
      setFavoriteAlbums(res.data.favoriteAlbums || []);
    } catch {
      setFavoriteArtists([]);
      setFavoriteAlbums([]);
    }
  };

  useEffect(() => {
    fetchFavorites();
    // eslint-disable-next-line
  }, [profile, token]);

  // Chequear si una canción ya está en una playlist específica (solo para playlists del backend)
  const isSongInPlaylist = (songId, playlistId) => {
    const pl = playlists.find(p => p._id === playlistId);
    return pl && pl.songs?.some(s => s.spotifyId === songId);
  };

  // Chequear si artista o álbum ya está en favoritos
  const isArtistFavorite = (artistId) => favoriteArtists.some(a => a.id === artistId);
  const isAlbumFavorite = (albumId) => favoriteAlbums.some(a => a.id === albumId);

  // Manejar agregar canción a playlist (solo playlists del backend)
  const handleAddSong = async () => {
    if (!modalSong || !selectedPlaylist) return;
    const pl = playlists.find(p => p._id === selectedPlaylist);
    if (!pl) return;

    const songData = {
      spotifyId: modalSong.id,
      title: modalSong.name,
      artist: modalSong.artists?.map(a => a.name).join(", "),
      cover: modalSong.album?.images?.[0]?.url,
    };

    if (!pl.songs.some(s => s.spotifyId === modalSong.id)) {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/playlists/edit/${selectedPlaylist}`,
        { name: pl.name, songs: [...(pl.songs || []), songData] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refrescar playlists del backend
  const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/playlists/${profile._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlaylists(res.data);
    }

    setModalSong(null);
    setSelectedPlaylist("");
  };

  // Manejar agregar artista a favoritos
  const handleAddArtistFavorite = async (artist) => {
    if (isArtistFavorite(artist.id)) return;
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/profiles/${profile._id}/favorite-artist`,
        { artist },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchFavorites();
    } catch (err) {
      console.error("Error al agregar artista favorito:", err);
    }
  };

  // Manejar agregar álbum a favoritos
  const handleAddAlbumFavorite = async (album) => {
    if (isAlbumFavorite(album.id)) return;
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/profiles/${profile._id}/favorite-album`,
        { album },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchFavorites();
    } catch (err) {
      console.error("Error al agregar álbum favorito:", err);
    }
  };

  // Función para crear playlist desde el modal
  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    try {
      await axios.post(
  `${import.meta.env.VITE_BACKEND_URL}/api/playlists/${profile._id}`,
        { name: newPlaylistName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refrescar playlists
  const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/playlists/${profile._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlaylists(res.data);
      setShowCreate(false);
      setNewPlaylistName("");
    } catch {
      alert("No se pudo crear la playlist");
    }
  };

  // Renderizado condicional para loading general
  if (loading) {
    return <div>Cargando...</div>;
  }

  // Renderizado condicional para no resultados
  if (!songs || songs.length === 0) {
    return <div>No se encontraron resultados.</div>;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 text-green-400">Catálogo</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
        {/* Canciones */}
        {type === "track" && songs.map(song => (
          <div key={song.id} className="flex flex-col items-center group">
            <img
              src={song.album?.images?.[0]?.url || "https://via.placeholder.com/150"}
              alt={song.name}
              className="w-36 h-36 rounded-xl object-cover mb-3 transition-transform group-hover:scale-105"
            />
            <h3 className="text-base font-semibold text-white text-center truncate w-36">{song.name}</h3>
            <p className="text-xs text-gray-300 text-center truncate w-36">{song.artists?.map(a => a.name).join(", ")}</p>
            <button
              className="mt-2 px-4 py-1 bg-green-500 hover:bg-green-400 text-white font-bold rounded-full text-xs transition"
              onClick={() => setModalSong(song)}
            >Agregar a Playlist</button>
          </div>
        ))}
        {/* Artistas */}
        {type === "artist" && songs.map(artist => (
          <div key={artist.id} className="flex flex-col items-center group">
            <img
              src={artist.images?.[0]?.url || "https://via.placeholder.com/150"}
              alt={artist.name}
              className="w-36 h-36 rounded-full object-cover mb-3 transition-transform group-hover:scale-105"
            />
            <h3 className="text-base font-semibold text-white text-center truncate w-36">{artist.name}</h3>
            <p className="text-xs text-gray-300 text-center truncate w-36">{artist.genres?.[0]}</p>
            <button
              className={`mt-2 px-4 py-1 rounded-full font-bold text-xs transition ${isArtistFavorite(artist.id) ? "bg-gray-500 text-white" : "bg-green-500 hover:bg-green-400 text-white"}`}
              onClick={() => handleAddArtistFavorite(artist)}
              disabled={isArtistFavorite(artist.id)}
            >
              {isArtistFavorite(artist.id) ? "En Favoritos" : "Favorito"}
            </button>
          </div>
        ))}
        {/* Álbumes */}
        {type === "album" && songs.map(album => (
          <div key={album.id} className="flex flex-col items-center group">
            <img
              src={album.images?.[0]?.url || "https://via.placeholder.com/150"}
              alt={album.name}
              className="w-36 h-36 rounded-xl object-cover mb-3 transition-transform group-hover:scale-105"
            />
            <h3 className="text-base font-semibold text-white text-center truncate w-36">{album.name}</h3>
            <p className="text-xs text-gray-300 text-center truncate w-36">{album.artists?.map(a => a.name).join(", ")}</p>
            <button
              className={`mt-2 px-4 py-1 rounded-full font-bold text-xs transition ${isAlbumFavorite(album.id) ? "bg-gray-500 text-white" : "bg-green-500 hover:bg-green-400 text-white"}`}
              onClick={() => handleAddAlbumFavorite(album)}
              disabled={isAlbumFavorite(album.id)}
            >
              {isAlbumFavorite(album.id) ? "En Favoritos" : "Favorito"}
            </button>
          </div>
        ))}
      </div>

      {/* Modal para agregar a playlist (solo para canciones) */}
      {modalSong && (
        <div className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn" style={{
          background: 'linear-gradient(120deg, rgba(34,193,195,0.25) 0%, rgba(45,0,90,0.7) 100%)',
          backdropFilter: 'blur(6px)'
        }}>
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 bg-opacity-95 p-8 rounded-3xl shadow-2xl w-[380px] border-2 border-green-400" style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}>
            <h3 className="text-2xl font-bold text-green-300 mb-4">Agregar canción</h3>
            <p className="text-green-200 mb-4 font-semibold">{modalSong.name} <span className="text-white">-</span> <span className="text-green-400">{modalSong.artists?.map(a => a.name).join(", ")}</span></p>

            <select
              className="px-3 py-2 rounded-lg bg-gray-900 text-white w-full focus:outline-none focus:ring-2 focus:ring-green-500 mb-2 border border-green-400"
              value={selectedPlaylist}
              onChange={e => setSelectedPlaylist(e.target.value)}
            >
              <option value="">-- Elegir playlist --</option>
              {playlists
                .filter(pl => pl._id)
                .map(pl => (
                  <option key={pl._id} value={pl._id} disabled={isSongInPlaylist(modalSong.id, pl._id)}>
                    {pl.name} {isSongInPlaylist(modalSong.id, pl._id) ? "(Ya agregada)" : ""}
                  </option>
                ))}
            </select>

            {/* Botón para mostrar input de crear playlist */}
            {!showCreate ? (
              <button
                className="mb-4 text-xs text-green-400 underline hover:text-green-300 transition"
                type="button"
                onClick={() => setShowCreate(true)}
              >
                + Crear nueva playlist
              </button>
            ) : (
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  className="px-2 py-1 rounded bg-gray-800 text-white border border-green-400 focus:outline-none"
                  placeholder="Nombre de la playlist"
                  value={newPlaylistName}
                  onChange={e => setNewPlaylistName(e.target.value)}
                  autoFocus
                />
                <button
                  className="px-3 py-1 bg-green-500 hover:bg-green-400 text-white rounded transition text-xs"
                  type="button"
                  onClick={handleCreatePlaylist}
                >
                  Crear
                </button>
                <button
                  className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded transition text-xs"
                  type="button"
                  onClick={() => { setShowCreate(false); setNewPlaylistName(""); }}
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex gap-3 justify-end mt-2">
              <button
                className="px-5 py-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg transition text-lg shadow"
                onClick={handleAddSong}
                disabled={!selectedPlaylist || isSongInPlaylist(modalSong.id, selectedPlaylist)}
              >
                Agregar
              </button>
              <button
                className="px-5 py-2 bg-red-500 hover:bg-red-400 text-white rounded-lg transition text-lg shadow"
                onClick={() => setModalSong(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animaciones */}
      <style>
        {`
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-in-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
}


