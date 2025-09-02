import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useSearchParams } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import SongSearchBar from "./components/SongSearchBar";
import ProfileSelector from "./components/ProfileSelector";
import SongList from "./components/SongList";
import Playlist from "./components/Playlist";
import ProfileAdmin from "./components/ProfileAdmin";
import SongDetail from "./components/SongDetail";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";
import ArtistDetail from "./components/ArtistDetail";
import AlbumDetail from "./components/AlbumDetail";
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
      const term = getRandomTerm();
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/spotify/search?q=${term}&type=${type}`)
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

  return (
    <>
      <SongSearchBar onResults={handleResults} onTypeChange={handleTypeChange} />
      <SongList
        songs={
          type === "track"
            ? (songs.tracks?.items || [])
            : type === "artist"
            ? (songs.artists?.items || [])
            : type === "album"
            ? (songs.albums?.items || [])
            : []
        }
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
                <Route path="/song/:id" element={<PrivateRoute><SongDetail /></PrivateRoute>} />
                <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                <Route path="/reset-password" element={<ResetPasswordForm />} />
                <Route path="/track/:trackId" element={<SongDetailWrapper />} />
                <Route path="/artist/:artistId" element={<ArtistDetailWrapper />} />
                <Route path="/album/:albumId" element={<AlbumDetailWrapper />} />
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

// Wrappers para extraer params de la URL
function SongDetailWrapper() {
  const { trackId } = useParams();
  return <SongDetail trackId={trackId} />;
}

function ArtistDetailWrapper() {
  const { artistId } = useParams();
  return <ArtistDetail artistId={artistId} />;
}

function AlbumDetailWrapper() {
  const { albumId } = useParams();
  return <AlbumDetail albumId={albumId} />;
}

export default App;

// (Node.js backend code removed from frontend React file)
