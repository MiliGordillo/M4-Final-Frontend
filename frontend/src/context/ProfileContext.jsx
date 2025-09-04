import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfileState] = useState(() => {
    const stored = localStorage.getItem("profile");
    return stored ? JSON.parse(stored) : null;
  });

  // Cuando cambia el perfil, lo guardamos en localStorage
  const setProfile = (p) => {
    setProfileState(p);
    if (p) {
      localStorage.setItem("profile", JSON.stringify(p));
    } else {
      localStorage.removeItem("profile");
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);

function useFavoriteActions(profile) {
  const { token } = useAuth();

  const saveFavoriteArtist = async (artist) => {
    const artistToSave = {
      id: artist.id,
      name: artist.name,
      images: artist.images
    };
    const res = await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/api/profiles/${profile._id}/favorite-artist`,
      { artist: artistToSave },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    // Puedes actualizar el estado aquí si lo necesitas
  };

  const saveFavoriteAlbum = async (albumId) => {
    const res = await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/api/profiles/${profile._id}/favorite-album`,
      { albumId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setProfileState((prev) => ({ ...prev, favoriteAlbum: albumId }));
  };

  return { saveFavoriteArtist, saveFavoriteAlbum };
}

export { useFavoriteActions };
