import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import axios from "axios";
import { getPlaylist } from "../services/spotifyApi";

export default function PlaylistDetail({ playlistId }) {
  const [playlist, setPlaylist] = useState(null);
  const [search, setSearch] = useState("");
  const { token } = useAuth();
  const { profile } = useProfile();

  useEffect(() => {
    if (playlistId) {
      getPlaylist(playlistId).then(setPlaylist);
    }
  }, [playlistId]);

  const handleFavorite = async () => {
    try {
      await axios.put(
        `/api/profiles/${profile._id}/favorite-artist`,
        { artistId: playlist.owner.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("¡Artista guardado como favorito!");
    } catch (err) {
      alert("No se pudo guardar el artista como favorito");
    }
  };

  if (!playlist) {
    return (
      <div className="flex justify-center items-center h-64 text-green-400 animate-pulse">
        Cargando playlist...
      </div>
    );
  }

  // calcular duración total
  const totalMs = playlist.tracks.items.reduce(
    (acc, item) => acc + (item.track.duration_ms || 0),
    0
  );
  const totalMin = Math.floor(totalMs / 60000);

  // Filtrado de canciones por búsqueda
  const filteredTracks = playlist.tracks.items
    .filter((item) => item.track)
    .filter((item) =>
      item.track.name.toLowerCase().includes(search.toLowerCase()) ||
      item.track.artists?.some((a) =>
        a.name.toLowerCase().includes(search.toLowerCase())
      )
    );

  return (
    <div className="max-w-5xl mx-auto bg-gradient-to-br from-green-900/70 via-black to-black rounded-3xl shadow-2xl p-0 mt-10 overflow-hidden">
      {/* Header playlist */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-8 bg-gradient-to-r from-green-700/80 via-green-900/80 to-black p-8 pb-6 shadow-lg">
        <img
          src={playlist.images[0]?.url}
          alt="Portada"
          className="w-52 h-52 rounded-xl shadow-2xl object-cover border-4 border-green-500"
        />
        <div className="flex-1 text-center md:text-left">
          <p className="uppercase text-xs tracking-wider text-green-200 font-bold mb-2">
            Playlist pública de Spotify
          </p>
          <h2 className="text-5xl font-extrabold text-white mb-2 drop-shadow-lg">
            {playlist.name}
          </h2>
          <p className="text-gray-200 text-lg mb-3">
            Creada por{" "}
            <span className="font-semibold text-green-400">{playlist.owner.display_name}</span>{" "}
            • {playlist.tracks.total} canciones • {totalMin} min
          </p>
          <button
            onClick={handleFavorite}
            className="mt-2 px-7 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full shadow-lg transition-all duration-200 text-lg"
          >
            Guardar artista como favorito
          </button>
        </div>
      </div>

      {/* Barra de búsqueda de canciones */}
      <div className="bg-black/80 px-8 py-4 flex items-center gap-4 border-b border-green-900">
        <input
          type="text"
          placeholder="Buscar canción o artista en esta playlist..."
          className="flex-1 px-4 py-2 rounded-full bg-gray-900 text-green-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="text-gray-400 text-sm">
          {filteredTracks.length} de {playlist.tracks.items.filter((item) => item.track).length} canciones
        </span>
      </div>

      {/* Lista de canciones */}
      <div
        className="bg-black/70 rounded-b-3xl overflow-hidden shadow-inner"
        style={{ maxHeight: "420px", overflowY: "auto" }}
      >
        <table className="w-full text-left text-base">
          <thead className="sticky top-0 bg-black/80 backdrop-blur z-10">
            <tr className="text-green-300 uppercase text-xs tracking-wide">
              <th className="px-6 py-3 w-12">#</th>
              <th className="px-6 py-3">Título</th>
              <th className="px-6 py-3 hidden md:table-cell">Álbum</th>
              <th className="px-6 py-3 w-20">Duración</th>
            </tr>
          </thead>
          <tbody>
            {filteredTracks.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-gray-400 py-10">
                  No se encontraron canciones.
                </td>
              </tr>
            ) : (
              filteredTracks.map((item, idx) => (
                <tr
                  key={item.track.id}
                  className="hover:bg-green-900/30 transition group"
                >
                  <td className="px-6 py-3 text-gray-400 font-bold">{idx + 1}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          item.track.album?.images?.[2]?.url ||
                          item.track.album?.images?.[0]?.url ||
                          "https://via.placeholder.com/48"
                        }
                        alt={item.track.name}
                        className="w-12 h-12 rounded object-cover shadow"
                      />
                      <div>
                        <p className="text-white font-semibold group-hover:text-green-400 transition">
                          {item.track.name}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {item.track.artists?.map((a) => a.name).join(", ")}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-gray-300 hidden md:table-cell">
                    {item.track.album?.name}
                  </td>
                  <td className="px-6 py-3 text-gray-400">
                    {Math.floor(item.track.duration_ms / 60000)}:
                    {(
                      Math.floor(item.track.duration_ms / 1000) % 60
                    )
                      .toString()
                      .padStart(2, "0")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
