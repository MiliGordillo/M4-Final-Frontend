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
import PlaylistDetail from "./components/PlaylistDetail";
import Recommendations from "./components/Recommendations";
import { AuthProvider } from "./context/AuthContext";
import { ProfileProvider } from "./context/ProfileContext";
import ForgotPasswordForm from "./components/ForgotPasswordForm";
import ResetPasswordForm from "./components/ResetPasswordForm";
import Profile from "./components/Profile";

// Contenedor para conectar búsqueda y lista
const SongCatalogContainer = () => {
  const [songs, setSongs] = useState([]);
  const [type, setType] = useState("track");
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(true);

  // Términos aleatorios para la búsqueda inicial
  const randomTerms = [
    "a", "e", "i", "o", "u", "love", "the", "la", "el", "mi", "yo", "you", "summer", "night", "sun"
  ];
  function getRandomTerm() {
    return randomTerms[Math.floor(Math.random() * randomTerms.length)];
  }

  useEffect(() => {
    if (!hasSearched) {
      setLoading(true);
      const term = getRandomTerm();
      fetch(`/api/spotify/search?q=${term}&type=${type}`)
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
  }, [hasSearched, type]); // <-- también depende de type

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
              <Route path="/playlist/:playlistId" element={<PlaylistDetailWrapper />} />
              <Route path="/recommendations" element={<RecommendationsPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </Layout>
        </Router>
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

function PlaylistDetailWrapper() {
  const { playlistId } = useParams();
  return <PlaylistDetail playlistId={playlistId} />;
}

function RecommendationsPage() {
  const [params] = useSearchParams();
  return (
    <Recommendations
      seed_artists={params.get("seed_artists")}
      seed_tracks={params.get("seed_tracks")}
      seed_genres={params.get("seed_genres")}
    />
  );
}

export default App;

// (Node.js backend code removed from frontend React file)
