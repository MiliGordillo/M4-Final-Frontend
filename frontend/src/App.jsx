import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useSearchParams } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import SongSearchBar from "./components/SongSearchBar";
import ProfileSelector from "./components/ProfileSelector";
import SongList from "./components/SongList";
import Playlist from "./components/Playlist";
import ProfileAdmin from "./components/ProfileAdmin";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";
import { AuthProvider } from "./context/AuthContext";
import { ProfileProvider } from "./context/ProfileContext";
import { ThemeProvider } from "./context/ThemeContext";
import ForgotPasswordForm from "./components/ForgotPasswordForm";
import ResetPasswordForm from "./components/ResetPasswordForm";
import Profile from "./components/Profile";

// Términos aleatorios para la búsqueda inicial
const randomTerms = [
  "a", "e", "i", "o", "u", "love", "the", "la", "el", "mi", "yo", "you", "summer", "night", "sun"
];
function getRandomTerm() {
  return randomTerms[Math.floor(Math.random() * randomTerms.length)];
}

// Contenedor para conectar búsqueda y lista
const SongCatalogContainer = () => {
  const [songs, setSongs] = useState([]);
  const [type, setType] = useState("track");
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasSearched) {
      setLoading(true);
      const term = 'a'; // Término común para asegurar más resultados
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/spotify/search?q=${term}&type=${type}&limit=10`)
        .then(res => res.json())
        .then(data => {
          setSongs(data);
          setLoading(false);
        })
        .catch(() => {
          setSongs([]);
          setLoading(false);
        });
    }
  }, [hasSearched, type]);

  const handleResults = (results) => {
    setSongs(results);
    setHasSearched(true);
    setLoading(false);
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    setHasSearched(false); // Para que busque aleatorio al cambiar tipo
  };

  // Limitar a 10 resultados para todos los tipos
  let limitedSongs = [];
  if (type === "track") {
    limitedSongs = (songs.tracks?.items || []).slice(0, 10);
  } else if (type === "artist") {
    limitedSongs = (songs.artists?.items || []).slice(0, 10);
  } else if (type === "album") {
    limitedSongs = (songs.albums?.items || []).slice(0, 10);
  }
  return (
    <>
      <SongSearchBar onResults={handleResults} onTypeChange={handleTypeChange} />
      <SongList
        songs={limitedSongs}
        type={type}
        loading={loading}
      />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <ThemeProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/profiles" element={<ProfileSelector />} />
                <Route path="/songs" element={<PrivateRoute>
                  <SongCatalogContainer />
                </PrivateRoute>} />
                <Route path="/playlist" element={<PrivateRoute><Playlist /></PrivateRoute>} />
                <Route path="/admin/profiles" element={<PrivateRoute><ProfileAdmin /></PrivateRoute>} />
                <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                <Route path="/reset-password" element={<ResetPasswordForm />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </Routes>
            </Layout>
          </Router>
        </ThemeProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}

export default App;
