import { useEffect, useState } from "react";
import { getRecommendations } from "../services/spotifyApi";

export default function Recommendations({ seed_artists, seed_tracks, seed_genres }) {
  const [recs, setRecs] = useState([]);

  useEffect(() => {
    if (seed_artists || seed_tracks || seed_genres) {
      getRecommendations({ seed_artists, seed_tracks, seed_genres }).then(data => setRecs(data.tracks));
    }
  }, [seed_artists, seed_tracks, seed_genres]);

  if (!recs.length) return <div>No hay recomendaciones.</div>;

  return (
    <div>
      <h3>Recomendaciones</h3>
      <ul>
        {recs.map(track => (
          <li key={track.id}>{track.name} - {track.artists.map(a => a.name).join(", ")}</li>
        ))}
      </ul>
    </div>
  );
}