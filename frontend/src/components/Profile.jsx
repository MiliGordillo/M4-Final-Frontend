import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import axios from "axios";

export default function Profile() {
  const { token } = useAuth();
  const { profile } = useProfile();
  const [favoriteArtists, setFavoriteArtists] = useState([]);
  const [favoriteAlbums, setFavoriteAlbums] = useState([]);

  // Refrescar favoritos desde el backend
  const fetchFavorites = async () => {
    if (profile?._id) {
      console.log("Usando profile._id para fetch:", profile._id);
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/profiles/${profile._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        console.log("Perfil desde backend:", data);
        setFavoriteArtists(data.favoriteArtists || []);
        setFavoriteAlbums(data.favoriteAlbums || []);
      } else {
        console.error("Error al obtener perfil", await res.text());
      }
    }
  };
  


  useEffect(() => {
    fetchFavorites();
  }, [profile, token]);

  return (
    <div className="max-w-5xl mx-auto px-2 md:px-0 py-8">
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar
        theme="dark"
      />
      <h2 className="text-3xl font-extrabold mb-10 text-center tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#1DB954] to-[#191414] dark:to-white">
        Favoritos del perfil
      </h2>

      {/* Artistas */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold mb-6 text-[#1DB954] text-center">
          Artistas favoritos
        </h3>
        {favoriteArtists.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {favoriteArtists.map((artist) => (
              <div
                key={artist.id}
                className="flex flex-col items-center p-2 transition duration-300 hover:scale-105"
              >
                <img
                  src={artist.images?.[0]?.url}
                  alt={artist.name}
                  className="w-28 h-28 object-cover rounded-full mb-4 border-4 border-[#1DB954] shadow"
                />
                <p className="text-lg font-bold text-center text-[#191414] dark:text-white">
                  {artist.name}
                </p>

              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic text-center">
            No tienes artistas favoritos.
          </p>
        )}
      </div>

      {/* Álbumes */}
      <div>
        <h3 className="text-2xl font-bold mb-6 text-[#1DB954] text-center">
          Álbumes favoritos
        </h3>
        {favoriteAlbums.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {favoriteAlbums.map((album) => (
              <div
                key={album.id}
                className="flex flex-col items-center p-2 transition duration-300 hover:scale-105"
              >
                <img
                  src={album.images?.[0]?.url}
                  alt={album.name}
                  className="w-full h-40 object-cover rounded-xl mb-4 border-4 border-[#1DB954] shadow"
                />
                <p className="text-lg font-bold text-center text-[#191414] dark:text-white line-clamp-2">
                  {album.name}
                </p>

              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic text-center">
            No tienes álbumes favoritos.
          </p>
        )}
      </div>
    </div>
  );
}
