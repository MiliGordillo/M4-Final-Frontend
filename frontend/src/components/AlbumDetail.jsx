import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import axios from "axios";
import { getAlbum } from "../services/spotifyApi";

export default function AlbumDetail({ albumId }) {
  const [album, setAlbum] = useState(null);
  const { token } = useAuth();
  const { profile } = useProfile();

  useEffect(() => {
    if (albumId) {
      getAlbum(albumId).then(setAlbum);
    }
  }, [albumId]);

  const saveFavoriteAlbum = async () => {
    await axios.put(
      `/api/profiles/${profile._id}/favorite-album`,
      { albumId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert("¡Álbum guardado como favorito!");
  };

  if (!album) return <div>Cargando álbum...</div>;

  return (
    <div>
      <h2>{album.name}</h2>
      <img src={album.images[0]?.url} alt="Portada" width={200} />
      <p>Artista: {album.artists.map(a => a.name).join(", ")}</p>
      <p>Año: {album.release_date}</p>
      <h3>Canciones</h3>
      <ol>
        {album.tracks.items.map(track => (
          <li key={track.id}>{track.name}</li>
        ))}
      </ol>
      <button onClick={saveFavoriteAlbum} className="btn btn-primary">
        Guardar como favorito
      </button>
    </div>
  );
}