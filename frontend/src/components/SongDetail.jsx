import React, { useEffect, useState } from "react";
import { getTrack } from "../services/spotifyApi";

export default function SongDetail({ trackId }) {
  const [track, setTrack] = useState(null);

  useEffect(() => {
    if (trackId) {
      getTrack(trackId).then(setTrack);
    }
  }, [trackId]);

  if (!track) return <div>Cargando...</div>;

  return (
    <div className="flex flex-col md:flex-row items-center bg-black bg-opacity-70 rounded-2xl shadow-2xl p-8 max-w-3xl mx-auto">
      <img src={track.album.images[0]?.url} alt={track.name} className="w-48 h-48 rounded-xl shadow-lg mb-6 md:mb-0 md:mr-8 object-cover" />
      <div className="flex-1">
        <h2 className="text-4xl font-bold text-green-400 mb-2">{track.name}</h2>
        <p className="text-xl text-white mb-1">{track.artists.map(a => a.name).join(", ")}</p>
        <p className="text-md text-gray-300 mb-2">Álbum: {track.album.name} ({new Date(track.album.release_date).getFullYear()})</p>
        <p className="text-sm text-gray-400 mb-4">Duración: {Math.round(track.duration_ms / 60000)}:{((track.duration_ms % 60000)/1000).toFixed(0).padStart(2, '0')}</p>
        <p className="text-sm text-gray-400 mb-4">Popularidad: {track.popularity}</p>
        <div className="flex gap-4">
          <a href={track.external_urls.spotify} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-full transition">Escuchar en Spotify</a>
          <button className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white font-bold rounded-full transition">Agregar a Playlist</button>
        </div>
        {track.preview_url && (
          <audio controls src={track.preview_url} className="mt-4">Tu navegador no soporta audio</audio>
        )}
      </div>
    </div>
  );
}
