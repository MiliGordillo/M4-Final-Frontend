import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";

export default function Profile() {
  const { token } = useAuth();
  const { profile } = useProfile();
  const [favoriteArtists, setFavoriteArtists] = useState([]);
  const [favoriteAlbums, setFavoriteAlbums] = useState([]);

  useEffect(() => {
    if (profile?._id) {
  fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profiles/${profile._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setFavoriteArtists(data.favoriteArtists || []);
          setFavoriteAlbums(data.favoriteAlbums || []);
        });
    }
  }, [profile, token]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">
        🎶 Favoritos del perfil
      </h2>

      {/* Artistas */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-4">Artistas favoritos</h3>
        {favoriteArtists.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {favoriteArtists.map((artist) => (
              <div
                key={artist.id}
                className="bg-white shadow-md rounded-2xl p-4 hover:shadow-lg transition duration-300 flex flex-col items-center"
              >
                <img
                  src={artist.images?.[0]?.url}
                  alt={artist.name}
                  className="w-32 h-32 object-cover rounded-full mb-4"
                />
                <p className="text-lg font-bold text-center text-gray-800">
                  {artist.name}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No tienes artistas favoritos.</p>
        )}
      </div>

      {/* Álbumes */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Álbumes favoritos</h3>
        {favoriteAlbums.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {favoriteAlbums.map((album) => (
              <div
                key={album.id}
                className="bg-white shadow-md rounded-2xl p-4 hover:shadow-lg transition duration-300 flex flex-col items-center"
              >
                <img
                  src={album.images?.[0]?.url}
                  alt={album.name}
                  className="w-full h-40 object-cover rounded-xl mb-4"
                />
                <p className="text-lg font-bold text-center text-gray-800 line-clamp-2">
                  {album.name}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No tienes álbumes favoritos.</p>
        )}
      </div>
    </div>
  );
}

