import React, { useEffect, useState } from "react";
import { getArtist, getArtistTopTracks, getArtistAlbums } from "../services/spotifyApi";

export default function ArtistDetail({ artistId }) {
  const [artist, setArtist] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    if (artistId) {
      getArtist(artistId).then(setArtist);
      getArtistTopTracks(artistId).then(data => setTopTracks(data.tracks));
      getArtistAlbums(artistId).then(data => setAlbums(data.items));
    }
  }, [artistId]);

  if (!artist) return <div>Cargando artista...</div>;

  return (
    <div>
      <h2>{artist.name}</h2>
      <img src={artist.images[0]?.url} alt="Artista" width={200} />
      <p>Seguidores: {artist.followers.total.toLocaleString()}</p>
      <p>Géneros: {artist.genres.join(", ")}</p>
      <p>Popularidad: {artist.popularity}</p>
      <h3>Top Tracks</h3>
      <ul>
        {topTracks.map(track => (
          <li key={track.id}>{track.name}</li>
        ))}
      </ul>
      <h3>Álbumes</h3>
      <ul>
        {albums.map(album => (
          <li key={album.id}>{album.name} ({album.release_date})</li>
        ))}
      </ul>
    </div>
  );
}